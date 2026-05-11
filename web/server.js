const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// In-memory data storage (in production, use a database)
let donations = [];
let requests = [];
let messages = [];
let pickups = [];
let stats = {
  mealsRedistributed: 0,
  avgTimeToPickup: 0,
  repeatDonors: new Set(),
  activeUsers: new Set()
};

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
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

// API Routes

// Get all donations
app.get('/api/donations', (req, res) => {
  res.json(donations);
});

// Get all requests
app.get('/api/requests', (req, res) => {
  res.json(requests);
});

// Create a donation
app.post('/api/donations', (req, res) => {
  const donation = {
    id: uuidv4(),
    ...req.body,
    timestamp: new Date().toISOString(),
    status: 'active'
  };
  donations.push(donation);
  
  // Track repeat donors
  if (donation.phone) {
    stats.repeatDonors.add(donation.phone);
    stats.activeUsers.add(donation.phone);
  }
  
  res.status(201).json(donation);
});

// Create a request
app.post('/api/requests', (req, res) => {
  const request = {
    id: uuidv4(),
    ...req.body,
    timestamp: new Date().toISOString(),
    status: 'active'
  };
  requests.push(request);
  
  if (request.phone) {
    stats.activeUsers.add(request.phone);
  }
  
  res.status(201).json(request);
});

// Get matches based on location
app.get('/api/matches', (req, res) => {
  const { lat, lon, type, maxDistance = 10 } = req.query;
  
  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude required' });
  }
  
  const userLat = parseFloat(lat);
  const userLon = parseFloat(lon);
  const maxDist = parseFloat(maxDistance);
  
  const matches = [];
  
  if (type === 'donor' || !type) {
    // Find requests near this location
    requests.forEach(request => {
      if (request.status !== 'active' || !request.location) return;
      
      const distance = calculateDistance(
        userLat, userLon,
        request.location[0], request.location[1]
      );
      
      if (distance <= maxDist) {
        matches.push({
          ...request,
          distance: distance,
          matchType: 'request'
        });
      }
    });
  }
  
  if (type === 'requester' || !type) {
    // Find donations near this location
    donations.forEach(donation => {
      if (donation.status !== 'active' || !donation.location) return;
      
      const distance = calculateDistance(
        userLat, userLon,
        donation.location[0], donation.location[1]
      );
      
      if (distance <= maxDist) {
        matches.push({
          ...donation,
          distance: distance,
          matchType: 'donation'
        });
      }
    });
  }
  
  // Sort by distance
  matches.sort((a, b) => a.distance - b.distance);
  
  res.json(matches);
});

// Get cross-matches (donations matched with requests)
app.get('/api/cross-matches', (req, res) => {
  const { maxDistance = 5 } = req.query;
  const maxDist = parseFloat(maxDistance);
  
  const crossMatches = [];
  
  donations.forEach(donation => {
    if (donation.status !== 'active' || !donation.location) return;
    
    requests.forEach(request => {
      if (request.status !== 'active' || !request.location) return;
      
      const distance = calculateDistance(
        donation.location[0], donation.location[1],
        request.location[0], request.location[1]
      );
      
      if (distance <= maxDist) {
        crossMatches.push({
          donation,
          request,
          distance: distance
        });
      }
    });
  });
  
  crossMatches.sort((a, b) => a.distance - b.distance);
  res.json(crossMatches);
});

// Messaging endpoints
app.get('/api/messages/:itemId', (req, res) => {
  const { itemId } = req.params;
  const itemMessages = messages.filter(m => 
    m.donationId === itemId || m.requestId === itemId
  );
  res.json(itemMessages);
});

app.post('/api/messages', (req, res) => {
  const message = {
    id: uuidv4(),
    ...req.body,
    timestamp: new Date().toISOString()
  };
  messages.push(message);
  res.status(201).json(message);
});

// Pickup scheduling endpoints
app.get('/api/pickups', (req, res) => {
  const { itemId } = req.query;
  if (itemId) {
    const itemPickups = pickups.filter(p => 
      p.donationId === itemId || p.requestId === itemId
    );
    return res.json(itemPickups);
  }
  res.json(pickups);
});

app.post('/api/pickups', (req, res) => {
  const pickup = {
    id: uuidv4(),
    ...req.body,
    status: 'scheduled',
    createdAt: new Date().toISOString()
  };
  pickups.push(pickup);
  res.status(201).json(pickup);
});

app.put('/api/pickups/:id', (req, res) => {
  const { id } = req.params;
  const pickupIndex = pickups.findIndex(p => p.id === id);
  
  if (pickupIndex === -1) {
    return res.status(404).json({ error: 'Pickup not found' });
  }
  
  pickups[pickupIndex] = {
    ...pickups[pickupIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  // If completed, update stats
  if (req.body.status === 'completed') {
    const pickup = pickups[pickupIndex];
    const donation = donations.find(d => d.id === pickup.donationId);
    if (donation) {
      stats.mealsRedistributed += donation.quantity || 0;
      
      // Calculate time to pickup
      const pickupTime = new Date(pickup.scheduledTime);
      const offerTime = new Date(donation.timestamp);
      const hoursDiff = (pickupTime - offerTime) / (1000 * 60 * 60);
      
      // Update average (simplified calculation)
      const totalPickups = pickups.filter(p => p.status === 'completed').length;
      stats.avgTimeToPickup = ((stats.avgTimeToPickup * (totalPickups - 1)) + hoursDiff) / totalPickups;
    }
  }
  
  res.json(pickups[pickupIndex]);
});

// Stats endpoint
app.get('/api/stats', (req, res) => {
  res.json({
    mealsRedistributed: stats.mealsRedistributed,
    avgTimeToPickup: Math.round(stats.avgTimeToPickup * 10) / 10,
    repeatDonors: stats.repeatDonors.size,
    activeUsers: stats.activeUsers.size
  });
});

// Update donation/request status
app.put('/api/donations/:id', (req, res) => {
  const { id } = req.params;
  const index = donations.findIndex(d => d.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Donation not found' });
  }
  donations[index] = { ...donations[index], ...req.body };
  res.json(donations[index]);
});

app.put('/api/requests/:id', (req, res) => {
  const { id } = req.params;
  const index = requests.findIndex(r => r.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Request not found' });
  }
  requests[index] = { ...requests[index], ...req.body };
  res.json(requests[index]);
});

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve app.html for /app route
app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'app.html'));
});

// Serve about.html for /about route
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

// Serve guide.html for /guide route
app.get('/guide', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'guide.html'));
});

// Serve contact.html for /contact route
app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

// Serve features.html for /features route
app.get('/features', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'features.html'));
});

// Serve impact.html for /impact route
app.get('/impact', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'impact.html'));
});

// Serve partners.html for /partners route
app.get('/partners', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'partners.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🌱 BloomNet server running on http://localhost:${PORT}`);
});

