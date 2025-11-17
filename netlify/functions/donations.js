const { v4: uuidv4 } = require('uuid');

let donations = [];
let stats = {
  mealsRedistributed: 0,
  avgTimeToPickup: 0,
  repeatDonors: new Set(),
  activeUsers: new Set()
};

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(donations)
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
    donations.push(donation);
    
    if (donation.phone) {
      stats.repeatDonors.add(donation.phone);
      stats.activeUsers.add(donation.phone);
    }
    
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(donation)
    };
  }

  if (event.httpMethod === 'PUT') {
    const id = event.path.split('/').pop();
    const body = JSON.parse(event.body);
    const index = donations.findIndex(d => d.id === id);
    
    if (index === -1) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Donation not found' })
      };
    }
    
    donations[index] = { ...donations[index], ...body };
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(donations[index])
    };
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};
