// Global variables
let map;
let service;
let businesses = [];
let dataQualityIssues = [];

// Initialize the map
function initMap() {
    console.log('Map initializing...');
    
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 12.9716, lng: 77.5946 }, // Bangalore coordinates
        zoom: 12,
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'on' }]
            }
        ]
    });
    
    service = new google.maps.places.PlacesService(map);
    console.log('Map initialized successfully!');
}

// Search for businesses
function searchBusinesses() {
    const locationInput = document.getElementById('searchLocation');
    const location = locationInput.value.trim();
    
    if (!location) {
        alert('Please enter a location');
        return;
    }
    
    // Show loading state
    document.getElementById('totalCount').textContent = '...';
    document.getElementById('qualityScore').textContent = '...';
    document.getElementById('missingInfo').textContent = '...';
    
    const issuesList = document.getElementById('issuesList');
    issuesList.innerHTML = '<li>🔍 Searching for businesses...</li>';
    
    console.log('Searching for businesses in:', location);
    
    // Use Geocoding API to get coordinates
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: location }, (results, status) => {
        if (status === 'OK' && results[0]) {
            const center = results[0].geometry.location;
            map.setCenter(center);
            map.setZoom(14);
            
            console.log('Location found:', results[0].formatted_address);
            findNearbyBusinesses(center);
        } else {
            alert('Location not found. Please try a different search term.');
            resetDashboard();
        }
    });
}

// Find businesses near the location
function findNearbyBusinesses(location) {
    const request = {
        location: location,
        radius: 1500, // 1.5km radius
        type: ['restaurant', 'store', 'bank', 'hospital', 'gas_station', 'pharmacy']
    };
    
    service.nearbySearch(request, (results, status) => {
    console.log('Places API response:', status, results);
    
    if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
        console.log('Found', results.length, 'businesses');
        businesses = results.slice(0, 20);
        
        analyzeDataQuality();
        displayResults();
        addMarkersToMap();
    } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        console.log('No businesses found in this area');
        alert('No businesses found in this area. Try a different location or expand search radius.');
        resetDashboard();
    } else if (status === google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
        console.log('API quota exceeded');
        alert('API quota exceeded. Please try again later or check your Google Cloud billing.');
        resetDashboard();
    } else if (status === google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
        console.log('Places API request denied');
        alert('Places API access denied. Please check your API key permissions.');
        resetDashboard();
    } else {
        console.error('Places search failed:', status);
        alert(`Search failed: ${status}. Please check your API configuration.`);
        resetDashboard();
    }
});

        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            console.log('Found', results.length, 'businesses');
            businesses = results.slice(0, 20); // Limit to first 20 for demo
            
            analyzeDataQuality();
            displayResults();
            addMarkersToMap();
        } else {
            console.error('Places search failed:', status);
            alert('Failed to find businesses in this area. Please try another location.');
            resetDashboard();
        }
    };


// Basic data quality analysis
function analyzeDataQuality() {
    console.log('Analyzing data quality for', businesses.length, 'businesses');
    
    dataQualityIssues = [];
    let qualityScore = 0;
    let totalChecks = 0;
    
    businesses.forEach((business, index) => {
        let businessScore = 0;
        let businessChecks = 0;
        
        // Check business name
        if (!business.name || business.name.trim() === '') {
            dataQualityIssues.push(`❌ Business #${index + 1}: Missing business name`);
        } else {
            businessScore++;
        }
        businessChecks++;
        
        // Check rating
        if (!business.rating || business.rating < 1 || business.rating > 5) {
            dataQualityIssues.push(`⭐ ${business.name}: Missing or invalid rating`);
        } else {
            businessScore++;
        }
        businessChecks++;
        
        // Check address
        if (!business.vicinity || business.vicinity.trim() === '') {
            dataQualityIssues.push(`📍 ${business.name}: Missing address information`);
        } else {
            businessScore++;
        }
        businessChecks++;
        
        // Check photos
        if (!business.photos || business.photos.length === 0) {
            dataQualityIssues.push(`📷 ${business.name}: No photos available`);
        } else {
            businessScore++;
        }
        businessChecks++;
        
        qualityScore += businessScore;
        totalChecks += businessChecks;
    });
    
    const overallQuality = totalChecks > 0 ? Math.round((qualityScore / totalChecks) * 100) : 0;
    
    // Update dashboard
    document.getElementById('totalCount').textContent = businesses.length;
    document.getElementById('qualityScore').textContent = overallQuality + '%';
    document.getElementById('missingInfo').textContent = dataQualityIssues.length;
}

// Display analysis results
function displayResults() {
    const issuesList = document.getElementById('issuesList');
    issuesList.innerHTML = '';
    
    if (dataQualityIssues.length === 0) {
        const li = document.createElement('li');
        li.innerHTML = '✅ <strong>Excellent!</strong> No major data quality issues found in this area.';
        li.style.background = '#e8f5e8';
        li.style.borderLeftColor = '#34a853';
        issuesList.appendChild(li);
    } else {
        // Show first 10 issues
        const issuesToShow = dataQualityIssues.slice(0, 10);
        issuesToShow.forEach(issue => {
            const li = document.createElement('li');
            li.textContent = issue;
            issuesList.appendChild(li);
        });
        
        if (dataQualityIssues.length > 10) {
            const li = document.createElement('li');
            li.innerHTML = `<strong>+ ${dataQualityIssues.length - 10} more issues found...</strong>`;
            li.style.background = '#fff3e0';
            li.style.borderLeftColor = '#ff9800';
            issuesList.appendChild(li);
        }
    }
}

// Add markers to the map
function addMarkersToMap() {
    businesses.forEach((business, index) => {
        const marker = new google.maps.Marker({
            position: business.geometry.location,
            map: map,
            title: business.name,
            animation: google.maps.Animation.DROP
        });
        
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 10px; max-width: 250px;">
                    <h4 style="margin: 0 0 8px 0; color: #202124;">${business.name}</h4>
                    <p><strong>Rating:</strong> ${business.rating ? business.rating + '⭐' : 'Not rated'}</p>
                    <p><strong>Address:</strong> ${business.vicinity || 'Address not available'}</p>
                    <p><strong>Type:</strong> ${business.types ? business.types[0].replace(/_/g, ' ') : 'Unknown'}</p>
                    <p><strong>Photos:</strong> ${business.photos ? business.photos.length + ' available' : 'None'}</p>
                </div>
            `
        });
        
        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
    });
}

// Reset dashboard to initial state
function resetDashboard() {
    document.getElementById('totalCount').textContent = '0';
    document.getElementById('qualityScore').textContent = '0%';
    document.getElementById('missingInfo').textContent = '0';
    document.getElementById('issuesList').innerHTML = '<li>Click "Analyze Area" to start assessment</li>';
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
});
