const { v4: uuidv4 } = require('uuid');
const { connectToDatabase } = require('./utils/db');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const db = await connectToDatabase();
    const pickups = db.collection('pickups');
    const donations = db.collection('donations');
    const stats = db.collection('stats');

    if (event.httpMethod === 'GET') {
      const queryParams = new URLSearchParams(event.queryStringParameters || {});
      const itemId = queryParams.get('itemId');
      const type = queryParams.get('type');
      
      let query = {};
      
      if (itemId) {
        query = { $or: [{ donationId: itemId }, { requestId: itemId }] };
      }
      
      if (type) {
        query.type = type;
      }
      
      const allPickups = await pickups.find(query).toArray();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(allPickups)
      };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      const pickup = {
        id: uuidv4(),
        ...body,
        status: 'scheduled',
        createdAt: new Date().toISOString()
      };
      
      await pickups.insertOne(pickup);
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(pickup)
      };
    }

    if (event.httpMethod === 'PUT') {
      const pathParts = event.path.split('/');
      const id = pathParts[pathParts.length - 1];
      const body = JSON.parse(event.body);
      
      const updateData = {
        ...body,
        updatedAt: new Date().toISOString()
      };

      if (body.status === 'completed') {
        updateData.completedAt = new Date().toISOString();
        
        const pickup = await pickups.findOne({ id });
        if (pickup && pickup.donationId) {
          const donation = await donations.findOne({ id: pickup.donationId });
          if (donation && donation.quantity) {
            await stats.updateOne(
              { _id: 'global' },
              { $inc: { mealsRedistributed: donation.quantity } },
              { upsert: true }
            );
          }
        }
      }
      
      const result = await pickups.findOneAndUpdate(
        { id },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      
      if (!result.value) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Pickup not found' })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.value)
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
