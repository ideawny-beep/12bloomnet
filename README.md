# BloomNet — Food Sharing & Surplus Redistribution

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
http://localhost:3000
```

### Development Mode (with auto-reload)
```bash
npm run dev
```

## 📁 Project Structure

```
bloomnet/
├── server.js              # Express backend server
├── package.json           # Dependencies and scripts
├── public/
│   ├── index.html        # Homepage
│   ├── about.html        # About page
│   ├── app.html          # Main application page
│   ├── app.js            # Frontend application logic
│   ├── features.html     # Features page
│   ├── guide.html        # Usage guide
│   ├── contact.html      # Contact page
│   ├── impact.html       # Impact metrics page
│   ├── partners.html     # Partners page
│   ├── js/contact.js     # Contact form handler
│   └── images/           # Static images (SVG)
└── README.md
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

## 📝 License

MIT License - feel free to use this project for your community food sharing initiatives.

## 💚 Made with ❤️

BloomNet is designed to fight hunger and reduce food waste in communities worldwide.

---

**Note**: This is currently using in-memory storage. For production use, integrate with a proper database (MongoDB, PostgreSQL, etc.).
you should respect
