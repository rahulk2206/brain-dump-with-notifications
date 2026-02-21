// POST /api/schedule – schedule a push notification (due date reminder)
const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { userId, at, title, body, itemId } = req.body || {};
    if (!userId || !at) {
      res.status(400).json({ error: 'Missing userId or at (ISO time)' });
      return;
    }

    const id = String(userId).replace(/[^a-zA-Z0-9-_]/g, '').slice(0, 128);
    if (!id) {
      res.status(400).json({ error: 'Invalid userId' });
      return;
    }

    const userKey = `user:${id}`;
    const raw = await kv.get(userKey);
    let data = typeof raw === 'string' ? (() => { try { return JSON.parse(raw); } catch (_) { return null; } })() : raw;
    data = data && typeof data === 'object' ? data : { subscription: null, scheduled: [] };
    if (!Array.isArray(data.scheduled)) data.scheduled = [];

    const atTime = new Date(at).getTime();
    if (isNaN(atTime) || atTime < Date.now()) {
      res.status(400).json({ error: 'Invalid or past time' });
      return;
    }

    if (itemId != null) {
      data.scheduled = data.scheduled.filter(s => s.itemId !== itemId);
    }
    data.scheduled.push({
      at: new Date(at).toISOString(),
      title: title || 'Brain Dump reminder',
      body: body || '',
      itemId: itemId ?? null
    });
    await kv.set(userKey, JSON.stringify(data));

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('schedule error', e);
    res.status(500).json({ error: e.message || 'Server error' });
  }
};
