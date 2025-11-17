const { connectToDatabase } = require('./utils/db');

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
    const stats = db.collection('stats');
    const pickups = db.collection('pickups');

    const globalStats = await stats.findOne({ _id: 'global' }) || {
      mealsRedistributed: 0,
      avgTimeToPickup: 0,
      repeatDonors: [],
      activeUsers: []
    };

    const completedPickups = await pickups.find({ status: 'completed' }).toArray();
    let totalHours = 0;
    completedPickups.forEach(pickup => {
      if (pickup.completedAt && pickup.createdAt) {
        const hours = (new Date(pickup.completedAt) - new Date(pickup.createdAt)) / (1000 * 60 * 60);
        totalHours += hours;
      }
    });

    const avgTime = completedPickups.length > 0 ? totalHours / completedPickups.length : 0;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        mealsRedistributed: globalStats.mealsRedistributed || 0,
        avgTimeToPickup: Math.round(avgTime * 10) / 10,
        repeatDonors: (globalStats.repeatDonors || []).length,
        activeUsers: (globalStats.activeUsers || []).length
      })
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
