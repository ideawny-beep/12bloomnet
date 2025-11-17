const { v4: uuidv4 } = require('uuid');
const { connectToDatabase } = require('./utils/db');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const db = await connectToDatabase();
    const messages = db.collection('messages');

    if (event.httpMethod === 'GET') {
      const pathParts = event.path.split('/').filter(p => p);
      const itemId = pathParts[pathParts.length - 1];
      
      if (!itemId || itemId === 'messages') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Item ID required in path' })
        };
      }
      
      const itemMessages = await messages.find({
        $or: [{ donationId: itemId }, { requestId: itemId }]
      }).toArray();
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(itemMessages)
      };
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      const message = {
        id: uuidv4(),
        ...body,
        timestamp: new Date().toISOString()
      };
      
      await messages.insertOne(message);
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(message)
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
