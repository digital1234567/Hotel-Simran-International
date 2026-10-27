const { connectToDatabase } = require('../lib/mongodb');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('inventory');

    if (req.method === 'GET') {
      const items = await collection.find({}).toArray();
      return res.status(200).json({ success: true, count: items.length, data: items });
    }

    if (req.method === 'POST') {
      const item = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!item || !item.name) {
        return res.status(400).json({ success: false, error: 'Item name required' });
      }

      item.createdAt = new Date().toISOString();
      await collection.insertOne(item);
      return res.status(201).json({ success: true, message: 'Inventory item added', data: item });
    }

    if (req.method === 'PUT') {
      const { id, stock } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!id || stock === undefined) {
        return res.status(400).json({ success: false, error: 'Item ID and stock required' });
      }

      await collection.updateOne({ id }, { $set: { stock: parseInt(stock), updatedAt: new Date().toISOString() } });
      return res.status(200).json({ success: true, message: 'Stock updated' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('MongoDB inventory API error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
