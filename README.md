# BloomNet — Food Sharing & Surplus Redistribution

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node-%3E%3D14-brightgreen.svg)](https://nodejs.org/)
[![GitHub last commit](https://img.shields.io/github/last-commit/Rajvardhan-Vajpai/BloomNet_main)](https://github.com/Rajvardhan-Vajpai/BloomNet_main/commits/main)
[![GitHub stars](https://img.shields.io/github/stars/Rajvardhan-Vajpai/BloomNet_main)](https://github.com/Rajvardhan-Vajpai/BloomNet_main/stargazers)
[![CI](https://github.com/ideawny-beep/12BloomNet/actions/workflows/ci.yml/badge.svg)](https://github.com/ideawny-beep/12BloomNet/actions/workflows/ci.yml)

A community food exchange web application connecting donors, NGOs, and local shelters using geolocation-based coordination.

## 🌟 Features

- **Live Map**: Real-time visualization of all food donations and requests
- **Smart Matching Engine**: Automated geospatial matching connects donors with nearby shelters
- **Pickup Scheduling**: Coordinate pickup times efficiently with queue management
- **Messaging System**: Direct communication between donors and recipients
- **Safety & Hygiene Checks**: Built-in verification workflows
- **Real-time Updates**: Live synchronization across the platform

## 🚀 Tech Stack

- **Frontend**: HTML5, Tailwind CSS, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Mapping**: Leaflet.js with OpenStreetMap
- **Geolocation**: Browser Geolocation API + Nominatim Geocoding

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Start the server:**
```bash
npm start
```

3. **Open in browser:**
```
http://localhost:5000
```

> Tip: The server port is configurable via `PORT`. Example: `PORT=4000 npm start`

### Development Mode (with auto-reload)
```bash
npm run dev
```

## 📁 Project Structure

```
bloomnet/
├── .gitattributes         # Line ending and text normalization
├── .gitignore             # Files and folders excluded from Git
├── NETLIFY_DEPLOYMENT.md  # Netlify deployment notes
├── netlify.toml           # Netlify configuration
├── package.json           # Dependencies and scripts
├── package-lock.json      # Exact dependency tree
├── README.md              # Project documentation
├── server.js              # Express backend server
├── public/                # Root web app frontend
│   ├── index.html         # Homepage
│   ├── about.html         # About page
│   ├── app.html           # Main application page
│   ├── app.js             # Frontend application logic
│   ├── features.html      # Features page
│   ├── guide.html         # Usage guide
│   ├── contact.html       # Contact page
│   ├── impact.html        # Impact metrics page
│   ├── partners.html      # Partners page
│   ├── js/contact.js      # Contact form handler
│   ├── shared.js          # Shared site utilities
│   └── images/            # Static images (SVG)
└── web/                   # Alternative web deployment or legacy app copy
    ├── README.md
    ├── package.json
    ├── server.js
    └── public/
```

## 🎯 API Endpoints

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

## 🎨 Features in Detail

### Live Map
- Real-time visualization of all food donations and requests
- Color-coded markers: Green (Donors), Orange (NGOs), Red (Shelters)
- Click markers to see details and contact information
- Automatic geolocation detection

### Real-time Matching
- Automatically matches donors with nearby requesters
- Calculates distances between locations
- Updates every 5 seconds
- Shows matches within configurable radius

### Simple Flow
- Clean, intuitive forms built with Tailwind CSS
- Minimal required fields
- Instant feedback with toast notifications
- Automatic form reset after submission

## 📊 Success Metrics

The platform tracks:
- **Meals Redistributed**: Total number of meals successfully redistributed
- **Average Time to Pickup**: Average hours from offer to pickup
- **Repeat Donors**: Number of users who have donated multiple times
- **Active Users**: Total number of active users on the platform

## 🔮 Future Enhancements

- User authentication and profiles
- Real-time notifications (WebSocket)
- Photo uploads for food items
- Rating/review system
- Email/SMS notifications
- Database integration (MongoDB/PostgreSQL)
- Mobile app (React Native)
- Admin dashboard

## 🤝 Contributing

This is an open-source project. Contributions are welcome!

### Maintenance and updates

- Keep dependencies up to date with `npm audit fix` and review breaking changes before upgrading.
- Keep the README aligned with the app by verifying the port and the deployed frontend path.
- Remove the `web/` folder if it is no longer used or clearly document it as an alternate deployment target.
- Add tests and linting as the project evolves.

## 📝 License

MIT License - feel free to use this project for your community food sharing initiatives.

## 💚 Made with ❤️

BloomNet is designed to fight hunger and reduce food waste in communities worldwide.

---

**Note**: This is currently using in-memory storage. For production use, integrate with a proper database (MongoDB, PostgreSQL, etc.).
