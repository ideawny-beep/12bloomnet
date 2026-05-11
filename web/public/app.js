// BloomNet - Food Sharing & Surplus Redistribution
// Frontend application with API integration

const API_BASE = window.location.origin + '/api';

class BloomNet {
    constructor() {
        this.map = null;
        this.markers = [];
        this.donations = [];
        this.requests = [];
        this.userLocation = null;
        this.userMarker = null;
        
        this.init();
    }

    init() {
        this.initMap();
        this.initNavigation();
        this.initForms();
        this.loadData();
        this.startRealTimeMatching();
        // Auto-load demo data on first load
        setTimeout(() => {
            this.loadDemoData();
        }, 1000);
    }

    // Initialize Leaflet Map
    initMap() {
        const mapElement = document.getElementById('map');
        if (!mapElement) {
            console.error('Map element not found');
            return;
        }

        try {
            this.map = L.map('map').setView([40.7128, -74.0060], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(this.map);

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        this.userLocation = [position.coords.latitude, position.coords.longitude];
                        this.map.setView(this.userLocation, 13);
                        this.addUserMarker();
                    },
                    (error) => {
                        console.log('Geolocation error:', error);
                        // Don't show error toast on homepage load
                        if (document.getElementById('map-view').classList.contains('active')) {
                            this.showToast('Unable to get your location. Using default map view.', 'error');
                        }
                    }
                );
            }
        } catch (error) {
            console.error('Error initializing map:', error);
        }
    }

    addUserMarker() {
        if (this.userLocation) {
            if (this.userMarker) {
                this.map.removeLayer(this.userMarker);
            }
            this.userMarker = L.marker(this.userLocation, {
                icon: L.divIcon({
                    className: 'user-location-marker',
                    html: '<div style="background: #4285f4; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
                    iconSize: [20, 20]
                })
            }).addTo(this.map);
        }
    }

    // Navigation
    initNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const views = document.querySelectorAll('.view');

        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetView = btn.dataset.view;

                navButtons.forEach(b => {
                    b.classList.remove('active', 'bg-gradient-to-r', 'from-primary', 'to-primary-light', 'text-white', 'shadow-lg', 'shadow-xl');
                    b.classList.add('bg-gray-200', 'text-gray-700');
                });
                btn.classList.add('active', 'bg-gradient-to-r', 'from-primary', 'to-primary-light', 'text-white', 'shadow-lg');
                btn.classList.remove('bg-gray-200', 'text-gray-700');

                views.forEach(v => {
                    v.classList.add('hidden');
                    v.classList.remove('active');
                });
                const target = document.getElementById(`${targetView}-view`);
                target.classList.remove('hidden');
                target.classList.add('active');

                if (targetView === 'map' && this.map) {
                    setTimeout(() => {
                        if (this.map) {
                            this.map.invalidateSize();
                        }
                    }, 100);
                    this.updateMatches();
                }
            });
        });
    }

    // Form handlers
    initForms() {
        document.getElementById('donate-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleDonation();
        });

        document.getElementById('need-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRequest();
        });
    }

    async handleDonation() {
        const formData = {
            type: 'donor',
            name: document.getElementById('donor-name').value,
            phone: document.getElementById('donor-phone').value,
            foodType: document.getElementById('food-type').value,
            quantity: parseInt(document.getElementById('food-quantity').value),
            expiryTime: document.getElementById('expiry-time').value,
            address: document.getElementById('donor-address').value,
            notes: document.getElementById('donor-notes').value,
            location: this.userLocation || [40.7128, -74.0060]
        };

        // Geocode address if needed
        if (formData.address && !this.userLocation) {
            const coords = await this.geocodeAddress(formData.address);
            if (coords) formData.location = coords;
        }

        try {
            const response = await fetch(`${API_BASE}/donations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const donation = await response.json();
                this.showToast('Donation posted successfully!', 'success');
                document.getElementById('donate-form').reset();
                this.loadData();
                document.querySelector('[data-view="map"]').click();
            } else {
                this.showToast('Error posting donation', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showToast('Error posting donation', 'error');
        }
    }

    async handleRequest() {
        const formData = {
            type: document.getElementById('requester-type').value,
            name: document.getElementById('requester-name').value,
            phone: document.getElementById('requester-phone').value,
            foodType: document.getElementById('needed-food').value,
            quantity: parseInt(document.getElementById('needed-quantity').value),
            address: document.getElementById('requester-address').value,
            notes: document.getElementById('requester-notes').value,
            location: this.userLocation || [40.7128, -74.0060]
        };

        if (formData.address && !this.userLocation) {
            const coords = await this.geocodeAddress(formData.address);
            if (coords) formData.location = coords;
        }

        try {
            const response = await fetch(`${API_BASE}/requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const request = await response.json();
                this.showToast('Request posted successfully!', 'success');
                document.getElementById('need-form').reset();
                this.loadData();
                document.querySelector('[data-view="map"]').click();
            } else {
                this.showToast('Error posting request', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showToast('Error posting request', 'error');
        }
    }

    // Load data from API
    async loadData() {
        try {
            const [donationsRes, requestsRes] = await Promise.all([
                fetch(`${API_BASE}/donations`).catch(err => {
                    console.warn('Failed to fetch donations:', err);
                    return { ok: false, json: () => Promise.resolve([]) };
                }),
                fetch(`${API_BASE}/requests`).catch(err => {
                    console.warn('Failed to fetch requests:', err);
                    return { ok: false, json: () => Promise.resolve([]) };
                })
            ]);

            this.donations = donationsRes.ok ? await donationsRes.json() : [];
            this.requests = requestsRes.ok ? await requestsRes.json() : [];

            if (this.map) {
                this.clearMarkers();
                this.donations.forEach(d => {
                    if (d.status === 'active' && d.location) {
                        this.addMarkerToMap(d);
                    }
                });
                this.requests.forEach(r => {
                    if (r.status === 'active' && r.location) {
                        this.addMarkerToMap(r);
                    }
                });
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    clearMarkers() {
        if (!this.map) return;
        this.markers.forEach(({ marker }) => {
            try {
                this.map.removeLayer(marker);
            } catch (e) {
                console.warn('Error removing marker:', e);
            }
        });
        this.markers = [];
    }

    addMarkerToMap(item) {
        if (!this.map || !item.location) return;
        
        try {
            const isDonation = item.type === 'donor';
            const iconColor = isDonation ? '#2d8659' : 
                             item.type === 'ngo' ? '#f4a261' : '#e76f51';
            
            const icon = L.divIcon({
                className: 'custom-marker',
                html: `<div style="background: ${iconColor}; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
                        <div style="transform: rotate(45deg); color: white; font-size: 18px; text-align: center; line-height: 24px;">${isDonation ? '📍' : item.type === 'ngo' ? '🏢' : '🏠'}</div>
                       </div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 30]
            });

            const marker = L.marker(item.location, { icon }).addTo(this.map);
            const popupContent = this.createPopupContent(item);
            marker.bindPopup(popupContent);
            
            this.markers.push({ marker, item });
        } catch (error) {
            console.error('Error adding marker:', error);
        }
    }

    createPopupContent(item) {
        const isDonation = item.type === 'donor';
        const typeLabel = isDonation ? 'Donor' : 
                         item.type === 'ngo' ? 'NGO' : 'Shelter';
        
        return `
            <div style="min-width: 200px;">
                <h3 style="font-weight: bold; margin-bottom: 8px; color: #2d8659;">${item.name}</h3>
                <p><strong>Type:</strong> ${typeLabel}</p>
                <p><strong>Food:</strong> ${item.foodType || item.neededFood || 'N/A'}</p>
                <p><strong>Quantity:</strong> ${item.quantity} servings</p>
                ${item.expiryTime ? `<p><strong>Available until:</strong> ${new Date(item.expiryTime).toLocaleString()}</p>` : ''}
                <p><strong>Contact:</strong> ${item.phone}</p>
                ${item.notes ? `<p><strong>Notes:</strong> ${item.notes}</p>` : ''}
                <a href="contact.html" style="margin-top: 10px; padding: 8px 12px; background: #2d8659; color: white; border: none; border-radius: 4px; cursor: pointer; display: inline-block; text-decoration: none; text-align: center; font-weight: 500;">Contact Donor</a>
            </div>
        `;
    }

    // Real-time matching
    startRealTimeMatching() {
        setInterval(() => {
            this.updateMatches();
        }, 5000);
        this.updateMatches();
    }

    async updateMatches() {
        if (!this.userLocation) {
            const matchesList = document.getElementById('matches-list');
            if (matchesList) {
                matchesList.innerHTML = `
                    <div class="text-center py-8 text-gray-500">
                        <div class="text-4xl mb-2">📍</div>
                        <div>Enable location to see matches</div>
                    </div>
                `;
            }
            return;
        }

        const matchesList = document.getElementById('matches-list');
        if (!matchesList) return;
        
        try {
            const response = await fetch(
                `${API_BASE}/cross-matches?maxDistance=5&lat=${this.userLocation[0]}&lon=${this.userLocation[1]}`
            ).catch(err => {
                console.warn('Failed to fetch matches:', err);
                return { ok: false, json: () => Promise.resolve([]) };
            });

            const matches = response.ok ? await response.json() : [];

            matchesList.innerHTML = '';

            if (matches.length === 0) {
                matchesList.innerHTML = `
                    <div class="text-center py-8 text-gray-500">
                        <div class="text-4xl mb-2">🔍</div>
                        <div>No nearby matches found. Check back soon!</div>
                    </div>
                `;
            } else {
                matches.slice(0, 10).forEach(match => {
                    const card = this.createMatchCard(match);
                    matchesList.appendChild(card);
                });
            }
        } catch (error) {
            console.error('Error loading matches:', error);
            if (matchesList) {
                matchesList.innerHTML = `
                    <div class="text-center py-8 text-gray-500">
                        <div class="text-4xl mb-2">⚠️</div>
                        <div>Error loading matches</div>
                    </div>
                `;
            }
        }
    }

    createMatchCard(match) {
        const card = document.createElement('div');
        card.className = 'bg-gray-50 rounded-lg p-4 border-l-4 border-primary hover:shadow-md transition';
        
        const donation = match.donation;
        const request = match.request;
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div class="font-bold text-gray-800">${donation.name}</div>
                <span class="text-xs bg-primary text-white px-2 py-1 rounded">Donor</span>
            </div>
            <div class="text-sm text-gray-600 mb-2">
                <strong>Donating:</strong> ${donation.foodType}<br>
                <strong>Quantity:</strong> ${donation.quantity} servings<br>
                <strong>Matched with:</strong> ${request.name}
            </div>
            <div class="text-xs text-primary font-semibold mb-3">📍 ${match.distance.toFixed(1)} km away</div>
            <div class="flex gap-2">
                <a href="contact.html" class="flex-1 bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary-dark transition text-center no-underline inline-block">Contact</a>
                <button onclick="bloomNet.showOnMap([${donation.location[0]}, ${donation.location[1]}])" class="flex-1 bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300 transition">View Map</button>
            </div>
        `;
        
        return card;
    }

    // Demo data loader
    async loadDemoData() {
        const demoData = [
            {
                type: 'donor',
                name: 'Fresh Harvest Market',
                phone: '+1-555-0101',
                foodType: 'fresh',
                quantity: 25,
                expiryTime: new Date(Date.now() + 4*3600000).toISOString(),
                address: '123 Main St, Downtown',
                notes: 'Fresh organic vegetables and fruits',
                location: [40.7280, -74.0074]
            },
            {
                type: 'donor',
                name: 'Pizza Palace Restaurant',
                phone: '+1-555-0102',
                foodType: 'prepared',
                quantity: 30,
                expiryTime: new Date(Date.now() + 2*3600000).toISOString(),
                address: '456 Park Ave',
                notes: 'Leftover pizzas from lunch service',
                location: [40.7505, -73.9972]
            },
            {
                type: 'ngo',
                name: 'Hope Community Center',
                phone: '+1-555-0201',
                foodType: 'any',
                quantity: 50,
                address: '789 Church St',
                notes: 'Daily lunch for 50+ seniors',
                location: [40.7180, -74.0020]
            },
            {
                type: 'donor',
                name: 'Bakers Delight Bakery',
                phone: '+1-555-0103',
                foodType: 'bakery',
                quantity: 40,
                expiryTime: new Date(Date.now() + 3*3600000).toISOString(),
                address: '321 Baker Lane',
                notes: 'End of day fresh baked goods',
                location: [40.7489, -73.9680]
            },
            {
                type: 'shelter',
                name: 'Safe Harbor Shelter',
                phone: '+1-555-0202',
                foodType: 'any',
                quantity: 60,
                address: '555 Harbor Way',
                notes: 'Dinner for 60 residents tonight',
                location: [40.6892, -74.0445]
            }
        ];

        try {
            // Post all demo donations/requests to the server
            for (const item of demoData) {
                try {
                    const endpoint = item.type === 'donor' ? '/donations' : '/requests';
                    const response = await fetch(`${API_BASE}${endpoint}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(item)
                    });
                    if (!response.ok) {
                        console.warn(`Failed to post ${item.name}`);
                    }
                } catch (error) {
                    console.warn(`Error posting ${item.name}:`, error);
                }
            }

            // Reload data and show map
            await this.loadData();
            document.querySelector('[data-view="map"]').click();
            this.showToast('✅ Demo data loaded! See the map with sample donations & requests.', 'success');
        } catch (error) {
            console.error('Error loading demo data:', error);
            this.showToast('Error loading demo data', 'error');
        }
    }

    // Geocode address using Nominatim
    async geocodeAddress(address) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
            const data = await response.json();
            if (data.length > 0) {
                return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            }
        } catch (error) {
            console.error('Geocoding error:', error);
        }
        return null;
    }

    contactItem(id) {
        const item = [...this.donations, ...this.requests].find(i => i.id === id);
        if (item) {
            // Navigate to contact page
            window.location.href = 'contact.html';
        }
    }

    showOnMap(location) {
        this.map.setView(location, 15);
        document.querySelector('[data-view="map"]').click();
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transform translate-y-0 opacity-100 transition-all duration-300 z-50 ${
            type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white`;
        
        setTimeout(() => {
            toast.classList.add('translate-y-20', 'opacity-0');
        }, 3000);
    }
}

// Initialize the application
let bloomNet;
document.addEventListener('DOMContentLoaded', () => {
    bloomNet = new BloomNet();
});

