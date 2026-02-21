// Called by Vercel Cron every 15 min. Sends due push notifications.
const { kv } = require('@vercel/kv');
const webpush = require('web-push');

function parseUser(data) {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (_) {
      return null;
    }
  }
  return data && typeof data === 'object' ? data : null;
}

module.exports = async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const authHeader = req.headers.authorization || '';
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    res.status(500).json({ error: 'Missing VAPID keys' });
    return;
  }

  webpush.setVapidDetails('mailto:brain-dump@localhost', publicKey, privateKey);

  try {
    const idsRaw = await kv.get('user:ids');
    const ids = Array.isArray(idsRaw) ? idsRaw : (typeof idsRaw === 'string' ? JSON.parse(idsRaw) : []);
    const now = Date.now();
    let sent = 0;

    for (const id of ids) {
      const userKey = `user:${id}`;
      const raw = await kv.get(userKey);
      const data = parseUser(raw);
          if (!data || !data.subscription || !Array.isArray(data.scheduled)) continue;

      const due = data.scheduled.filter(s => new Date(s.at).getTime() <= now);
      const remaining = data.scheduled.filter(s => new Date(s.at).getTime() > now);

      for (const s of due) {
        try {
          const payload = JSON.stringify({
            title: s.title || 'Brain Dump',
            body: s.body || ''
          });
          await webpush.sendNotification(data.subscription, payload);
          sent++;
        } catch (err) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            data.subscription = null;
          }
        }
      }

      if (due.length > 0) {
        data.scheduled = remaining;
        await kv.set(userKey, JSON.stringify(data));
      }
    }

    res.status(200).json({ ok: true, sent });
  } catch (e) {
    console.error('cron error', e);
    res.status(500).json({ error: e.message || 'Server error' });
  }
};
