// POST /api/subscribe – save push subscription for a user (called when they enable notifications)
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
    const { userId, subscription } = req.body || {};
    if (!userId || !subscription || !subscription.endpoint) {
      res.status(400).json({ error: 'Missing userId or subscription' });
      return;
    }

    const id = String(userId).replace(/[^a-zA-Z0-9-_]/g, '').slice(0, 128);
    if (!id) {
      res.status(400).json({ error: 'Invalid userId' });
      return;
    }

    const userKey = `user:${id}`;
    const existing = await kv.get(userKey);
    let data = typeof existing === 'string' ? (() => { try { return JSON.parse(existing); } catch (_) { return null; } })() : existing;
    data = data && typeof data === 'object' ? data : { scheduled: [] };
    data.subscription = subscription;
    data.updatedAt = new Date().toISOString();
    await kv.set(userKey, JSON.stringify(data));

    let ids = await kv.get('user:ids');
    if (!Array.isArray(ids)) ids = [];
    if (!ids.includes(id)) {
      ids.push(id);
      await kv.set('user:ids', JSON.stringify(ids));
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('subscribe error', e);
    res.status(500).json({ error: e.message || 'Server error' });
  }
};
