const { connectToDatabase } = require('../lib/mongodb');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('cms_config');

    if (req.method === 'GET') {
      const config = await collection.findOne({ key: 'global_cms' });
      return res.status(200).json({ success: true, data: config ? config.data : null });
    }

    if (req.method === 'POST') {
      const cmsData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!cmsData) {
        return res.status(400).json({ success: false, error: 'CMS payload required' });
      }

      await collection.updateOne(
        { key: 'global_cms' },
        {
          $set: {
            key: 'global_cms',
            data: cmsData,
            updatedAt: new Date().toISOString()
          }
        },
        { upsert: true }
      );

      return res.status(200).json({ success: true, message: 'CMS updated in MongoDB' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('MongoDB cms API error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
