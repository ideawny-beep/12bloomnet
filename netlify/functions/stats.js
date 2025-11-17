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
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        mealsRedistributed: stats.mealsRedistributed,
        avgTimeToPickup: Math.round(stats.avgTimeToPickup * 10) / 10,
        repeatDonors: stats.repeatDonors.size,
        activeUsers: stats.activeUsers.size
      })
    };
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};
