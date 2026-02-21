// POST /api/unschedule – remove scheduled reminder for an item (e.g. completed or due date removed)
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
    const { userId, itemId } = req.body || {};
    if (!userId || itemId == null) {
      res.status(400).json({ error: 'Missing userId or itemId' });
      return;
    }

    const id = String(userId).replace(/[^a-zA-Z0-9-_]/g, '').slice(0, 128);
    const userKey = `user:${id}`;
    const raw = await kv.get(userKey);
    let data = typeof raw === 'string' ? (() => { try { return JSON.parse(raw); } catch (_) { return null; } })() : raw;
    if (!data || !Array.isArray(data.scheduled)) {
      res.status(200).json({ ok: true });
      return;
    }
    data.scheduled = data.scheduled.filter(s => s.itemId !== itemId);
    await kv.set(userKey, JSON.stringify(data));
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('unschedule error', e);
    res.status(500).json({ error: e.message || 'Server error' });
  }
};
