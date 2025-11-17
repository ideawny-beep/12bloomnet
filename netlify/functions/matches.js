const { connectToDatabase } = require('./utils/db');

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const db = await connectToDatabase();
    const donations = db.collection('donations');
    const requests = db.collection('requests');

    const queryParams = new URLSearchParams(event.queryStringParameters || {});
    const lat = queryParams.get('lat');
    const lon = queryParams.get('lon');
    const type = queryParams.get('type');
    const maxDistance = parseFloat(queryParams.get('maxDistance') || '10');

    if (!lat || !lon) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Latitude and longitude required' })
      };
    }

    const userLat = parseFloat(lat);
    const userLon = parseFloat(lon);
    const matches = [];

    if (type === 'donor' || !type) {
      const allRequests = await requests.find({ status: 'active' }).toArray();
      allRequests.forEach(request => {
        if (request.location) {
          const distance = calculateDistance(
            userLat, userLon,
            request.location[0], request.location[1]
          );
          
          if (distance <= maxDistance) {
            matches.push({
              ...request,
              distance: distance,
              matchType: 'request'
            });
          }
        }
      });
    }

    if (type === 'requester' || !type) {
      const allDonations = await donations.find({ status: 'active' }).toArray();
      allDonations.forEach(donation => {
        if (donation.location) {
          const distance = calculateDistance(
            userLat, userLon,
            donation.location[0], donation.location[1]
          );
          
          if (distance <= maxDistance) {
            matches.push({
              ...donation,
              distance: distance,
              matchType: 'donation'
            });
          }
        }
      });
    }

    matches.sort((a, b) => a.distance - b.distance);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(matches)
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
