const { v4: uuidv4 } = require('uuid');

let requests = [];
let stats = {
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
      body: JSON.stringify(requests)
    };
  }

  if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body);
    const request = {
      id: uuidv4(),
      ...body,
      timestamp: new Date().toISOString(),
      status: 'active'
    };
    requests.push(request);
    
    if (request.phone) {
      stats.activeUsers.add(request.phone);
    }
    
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(request)
    };
  }

  if (event.httpMethod === 'PUT') {
    const id = event.path.split('/').pop();
    const body = JSON.parse(event.body);
    const index = requests.findIndex(r => r.id === id);
    
    if (index === -1) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Request not found' })
      };
    }
    
    requests[index] = { ...requests[index], ...body };
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(requests[index])
    };
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};
