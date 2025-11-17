let map;
let userLocation = null;
let markers = [];

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function initMap() {
    map = L.map('map').setView([40.7128, -74.0060], 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = [position.coords.latitude, position.coords.longitude];
                map.setView(userLocation, 13);
                
                L.marker(userLocation, {
                    icon: L.divIcon({
                        className: 'custom-div-icon',
                        html: '<div style="background-color: blue; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white;"></div>',
                        iconSize: [20, 20]
                    })
                }).addTo(map).bindPopup('Your Location');
            },
            (error) => {
                console.error('Geolocation error:', error);
                showToast('Could not get your location. Using default.', 'error');
            }
        );
    }
    
    loadMapData();
    setInterval(loadMapData, 5000);
}

async function loadMapData() {
    try {
        const [donationsRes, requestsRes] = await Promise.all([
            fetch('/api/donations'),
            fetch('/api/requests')
        ]);
        
        const donations = await donationsRes.json();
        const requests = await requestsRes.json();
        
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
        
        donations.forEach(donation => {
            if (donation.location && donation.status === 'active') {
                const marker = L.marker(donation.location, {
                    icon: L.divIcon({
                        className: 'custom-div-icon',
                        html: '<div style="background-color: #10b981; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-size: 18px;">🍽️</div>',
                        iconSize: [30, 30]
                    })
                }).addTo(map);
                
                marker.bindPopup(`
                    <div class="p-2">
                        <h4 class="font-bold text-green-600">Donation</h4>
                        <p class="text-sm"><strong>From:</strong> ${donation.name}</p>
                        <p class="text-sm"><strong>Food:</strong> ${donation.description}</p>
                        <p class="text-sm"><strong>Quantity:</strong> ${donation.quantity} meals</p>
                        <p class="text-sm"><strong>Phone:</strong> ${donation.phone}</p>
                        <p class="text-sm"><strong>Until:</strong> ${new Date(donation.availableUntil).toLocaleString()}</p>
                    </div>
                `);
                
                markers.push(marker);
            }
        });
        
        requests.forEach(request => {
            if (request.location && request.status === 'active') {
                const marker = L.marker(request.location, {
                    icon: L.divIcon({
                        className: 'custom-div-icon',
                        html: '<div style="background-color: #f59e0b; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-size: 18px;">🏠</div>',
                        iconSize: [30, 30]
                    })
                }).addTo(map);
                
                marker.bindPopup(`
                    <div class="p-2">
                        <h4 class="font-bold text-orange-600">Request</h4>
                        <p class="text-sm"><strong>Organization:</strong> ${request.name}</p>
                        <p class="text-sm"><strong>Type:</strong> ${request.type}</p>
                        <p class="text-sm"><strong>People:</strong> ${request.peopleCount}</p>
                        <p class="text-sm"><strong>Phone:</strong> ${request.phone}</p>
                        ${request.notes ? `<p class="text-sm"><strong>Notes:</strong> ${request.notes}</p>` : ''}
                    </div>
                `);
                
                markers.push(marker);
            }
        });
    } catch (error) {
        console.error('Error loading map data:', error);
    }
}

async function loadStats() {
    try {
        const res = await fetch('/api/stats');
        const stats = await res.json();
        
        document.getElementById('statMeals').textContent = stats.mealsRedistributed;
        document.getElementById('statTime').textContent = stats.avgTimeToPickup.toFixed(1);
        document.getElementById('statDonors').textContent = stats.repeatDonors;
        document.getElementById('statUsers').textContent = stats.activeUsers;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

document.getElementById('donationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!userLocation) {
        showToast('Please enable location services', 'error');
        return;
    }
    
    const donation = {
        name: document.getElementById('donorName').value,
        description: document.getElementById('foodDescription').value,
        quantity: parseInt(document.getElementById('quantity').value),
        phone: document.getElementById('donorPhone').value,
        availableUntil: document.getElementById('availableUntil').value,
        location: userLocation
    };
    
    try {
        const res = await fetch('/api/donations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(donation)
        });
        
        if (res.ok) {
            showToast('Donation posted successfully! 🎉');
            e.target.reset();
            loadMapData();
            loadStats();
        } else {
            throw new Error('Failed to post donation');
        }
    } catch (error) {
        console.error('Error posting donation:', error);
        showToast('Failed to post donation', 'error');
    }
});

document.getElementById('requestForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!userLocation) {
        showToast('Please enable location services', 'error');
        return;
    }
    
    const request = {
        name: document.getElementById('requesterName').value,
        type: document.getElementById('orgType').value,
        peopleCount: parseInt(document.getElementById('peopleCount').value),
        phone: document.getElementById('requesterPhone').value,
        notes: document.getElementById('notes').value,
        location: userLocation
    };
    
    try {
        const res = await fetch('/api/requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        });
        
        if (res.ok) {
            showToast('Request posted successfully! 🎉');
            e.target.reset();
            loadMapData();
            loadStats();
        } else {
            throw new Error('Failed to post request');
        }
    } catch (error) {
        console.error('Error posting request:', error);
        showToast('Failed to post request', 'error');
    }
});

initMap();
loadStats();
setInterval(loadStats, 10000);
