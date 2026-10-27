const { connectToDatabase } = require('../lib/mongodb');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('bookings');

    if (req.method === 'GET') {
      const bookings = await collection.find({}).sort({ createdAt: -1 }).toArray();
      return res.status(200).json({ success: true, count: bookings.length, data: bookings });
    }

    if (req.method === 'POST') {
      const bookingData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!bookingData || !bookingData.id) {
        return res.status(400).json({ success: false, error: 'Booking data and ID are required' });
      }

      bookingData.createdAt = bookingData.createdAt || new Date().toISOString();
      bookingData.updatedAt = new Date().toISOString();

      await collection.updateOne(
        { id: bookingData.id },
        { $set: bookingData },
        { upsert: true }
      );

      return res.status(201).json({ success: true, message: 'Booking saved to MongoDB', data: bookingData });
    }

    if (req.method === 'PUT') {
      const updateData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { id, ...fields } = updateData;
      if (!id) {
        return res.status(400).json({ success: false, error: 'Booking ID required for update' });
      }

      fields.updatedAt = new Date().toISOString();
      const result = await collection.updateOne({ id }, { $set: fields });

      return res.status(200).json({ success: true, message: 'Booking updated in MongoDB', modifiedCount: result.modifiedCount });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query || (typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
      if (!id) {
        return res.status(400).json({ success: false, error: 'Booking ID required for deletion' });
      }

      await collection.deleteOne({ id });
      return res.status(200).json({ success: true, message: 'Booking deleted from MongoDB' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('MongoDB bookings API error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
