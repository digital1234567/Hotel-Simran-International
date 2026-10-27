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
    const collection = db.collection('inroom_orders');

    if (req.method === 'GET') {
      const orders = await collection.find({}).sort({ createdAt: -1 }).toArray();
      return res.status(200).json({ success: true, count: orders.length, data: orders });
    }

    if (req.method === 'POST') {
      const order = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!order || !order.room) {
        return res.status(400).json({ success: false, error: 'Room number and order items required' });
      }

      order.id = order.id || 'ORD-' + Math.floor(100 + Math.random() * 900);
      order.status = order.status || 'Preparing';
      order.createdAt = order.createdAt || new Date().toISOString();

      await collection.insertOne(order);
      return res.status(201).json({ success: true, message: 'Order submitted to kitchen', data: order });
    }

    if (req.method === 'PUT') {
      const { id, status } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!id || !status) {
        return res.status(400).json({ success: false, error: 'Order ID and status required' });
      }

      await collection.updateOne({ id }, { $set: { status, updatedAt: new Date().toISOString() } });
      return res.status(200).json({ success: true, message: 'Order status updated' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('MongoDB inroom-orders API error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
