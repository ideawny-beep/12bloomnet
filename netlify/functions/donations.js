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
    const donations = db.collection('donations');
    const stats = db.collection('stats');

    if (event.httpMethod === 'GET') {
      const allDonations = await donations.find({}).toArray();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(allDonations)
      };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      const donation = {
        id: uuidv4(),
        ...body,
        timestamp: new Date().toISOString(),
        status: 'active'
      };
      
      await donations.insertOne(donation);
      
      if (donation.phone) {
        await stats.updateOne(
          { _id: 'global' },
          { 
            $addToSet: { repeatDonors: donation.phone, activeUsers: donation.phone }
          },
          { upsert: true }
        );
      }
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(donation)
      };
    }

    if (event.httpMethod === 'PUT') {
      const pathParts = event.path.split('/');
      const id = pathParts[pathParts.length - 1];
      const body = JSON.parse(event.body);
      
      const result = await donations.findOneAndUpdate(
        { id },
        { $set: body },
        { returnDocument: 'after' }
      );
      
      if (!result.value) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Donation not found' })
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
