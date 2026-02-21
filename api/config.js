// GET /api/config – public config for the app (e.g. VAPID public key)
module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  res.setHeader('Access-Control-Allow-Origin', '*');
  const publicKey = process.env.VAPID_PUBLIC_KEY || '';
  res.status(200).json({ vapidPublicKey: publicKey });
};
