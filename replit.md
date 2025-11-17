# BloomNet - Food Sharing & Surplus Redistribution Platform

## Project Overview
BloomNet is a community food exchange web application that connects food donors (restaurants, grocery stores, caterers) with organizations that serve those in need (NGOs, shelters, community centers). The platform uses geolocation-based coordination to enable efficient food redistribution and reduce food waste.

## Current State
- **Status**: Fully functional and ready for use
- **Environment**: Configured for Replit deployment
- **Last Updated**: November 17, 2025

## Tech Stack
- **Backend**: Node.js with Express.js
- **Frontend**: HTML5, Tailwind CSS (via CDN), Vanilla JavaScript
- **Mapping**: Leaflet.js with OpenStreetMap tiles
- **Geolocation**: Browser Geolocation API + Nominatim Geocoding
- **Data Storage**: In-memory (production should use a database)

## Project Structure
```
bloomnet/
├── server.js              # Express backend server (binds to 0.0.0.0:5000)
├── package.json           # Dependencies and scripts
├── public/                # Frontend static files
│   ├── index.html        # Homepage
│   ├── app.html          # Main application page with map
│   ├── app.js            # Frontend application logic
│   ├── about.html        # About page
│   ├── features.html     # Features page
│   ├── guide.html        # Usage guide
│   ├── contact.html      # Contact page
│   ├── impact.html       # Impact metrics page
│   ├── partners.html     # Partners page
│   └── js/
│       └── contact.js    # Contact form handler
└── README.md             # Project documentation
```

## Key Features
- **Live Map**: Real-time visualization of donations and requests using Leaflet.js
- **Smart Matching**: Geospatial matching connects donors with nearby recipients
- **Pickup Scheduling**: Coordinate pickup times with queue management
- **Messaging System**: Direct communication between donors and recipients
- **Real-time Updates**: Live synchronization with 5-second refresh intervals
- **Analytics**: Track meals redistributed, avg pickup time, repeat donors, active users

## API Endpoints

### Donations
- `GET /api/donations` - Get all donations
- `POST /api/donations` - Create a new donation
- `PUT /api/donations/:id` - Update a donation

### Requests
- `GET /api/requests` - Get all requests
- `POST /api/requests` - Create a new request
- `PUT /api/requests/:id` - Update a request

### Matching
- `GET /api/matches` - Get matches based on location
- `GET /api/cross-matches` - Get cross-matches (donations matched with requests)

### Messaging
- `GET /api/messages/:itemId` - Get messages for an item
- `POST /api/messages` - Send a message

### Pickups
- `GET /api/pickups` - Get all pickups
- `POST /api/pickups` - Schedule a pickup
- `PUT /api/pickups/:id` - Update pickup status

### Statistics
- `GET /api/stats` - Get platform statistics

## Development Setup
1. Dependencies are already installed via npm
2. Server runs on port 5000 (0.0.0.0:5000 for Replit)
3. Workflow configured to run `npm run dev` (uses nodemon for auto-reload)

## Deployment
- **Target**: Autoscale deployment
- **Command**: `node server.js`
- **Port**: 5000
- Ready to publish via Replit's deployment system

## Important Notes
- **Data Storage**: Currently uses in-memory storage. For production, integrate with PostgreSQL or MongoDB
- **Tailwind CSS**: Uses CDN version (shows warning). For production, install as PostCSS plugin
- **Geolocation**: Requires users to enable browser location permissions
- **HTTPS**: Map features and geolocation work best over HTTPS (Replit provides this)

## Future Enhancements
- User authentication and profiles
- Real-time notifications (WebSocket)
- Photo uploads for food items
- Rating/review system
- Email/SMS notifications
- Database integration (PostgreSQL recommended)
- Mobile app (React Native)
- Admin dashboard

## Recent Changes
- **Nov 17, 2025**: Initial project import and setup for Replit
  - Created all missing frontend files (HTML pages and JavaScript)
  - Configured server to bind to 0.0.0.0:5000
  - Set up workflow for development
  - Configured deployment settings
  - Verified application functionality with map and forms

## User Preferences
- None specified yet

## Architecture Notes
- **In-memory storage**: All data (donations, requests, messages, pickups, stats) stored in memory
  - Data is lost on server restart
  - Sets are used for tracking unique donors/users
  - Distance calculations use Haversine formula for accuracy
- **CORS enabled**: Allows cross-origin requests
- **Static file serving**: Express serves public directory
- **RESTful API**: Standard REST endpoints for all resources
