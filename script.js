// Global variables
let map;
let service;
let businesses = [];
let dataQualityIssues = [];
let markers = []; // Track markers for cleanup

// Initialize the map - MUST be global for Google Maps callback
window.initMap = function() {
    console.log('🚀 Map initializing...');
    
    try {
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
        console.log('✅ Map initialized successfully!');
        
        // Auto-search Bangalore on load
        setTimeout(() => {
            searchBusinesses();
        }, 1000);
        
    } catch (error) {
        console.error('❌ Map initialization failed:', error);
        showError('Failed to initialize map: ' + error.message);
    }
};

// Search for businesses
function searchBusinesses() {
    const locationInput = document.getElementById('searchLocation');
    const location = locationInput.value.trim();
    
    if (!location) {
        alert('Please enter a location');
        return;
    }
    
    console.log('🔍 Searching for businesses in:', location);
    
    // Show loading state
    document.getElementById('totalCount').textContent = '...';
    document.getElementById('qualityScore').textContent = '...';
    document.getElementById('missingInfo').textContent = '...';
    
    const issuesList = document.getElementById('issuesList');
    issuesList.innerHTML = '<li>🔍 Searching for businesses...</li>';
    
    // Clear previous markers
    clearMarkers();
    
    // Use Geocoding API to get coordinates
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: location + ', India' }, (results, status) => {
        console.log('📍 Geocoding status:', status);
        
        if (status === 'OK' && results[0]) {
            const center = results[0].geometry.location;
            map.setCenter(center);
            map.setZoom(14);
            
            console.log('✅ Location found:', results[0].formatted_address);
            findNearbyBusinesses(center);
        } else {
            console.error('❌ Geocoding failed:', status);
            alert('Location not found. Please try a different search term.');
            resetDashboard();
        }
    });
}

// Find businesses near the location
function findNearbyBusinesses(location) {
    console.log('🏢 Finding nearby businesses...');
    
    const businessTypes = ['restaurant', 'store', 'bank', 'hospital', 'gas_station', 'pharmacy'];
    let allBusinesses = [];
    let completedSearches = 0;
    
    // Search for different types of businesses
    businessTypes.forEach((type, index) => {
        setTimeout(() => {
            const request = {
                location: location,
                radius: 2000,
                type: type  // ✅ FIXED: Remove array brackets
            };
            
            console.log(`🔎 Searching for ${type}...`, request);
            
            service.nearbySearch(request, (results, status) => {
                console.log(`📊 ${type} search status:`, status, '| Results:', results?.length || 0);
                
                completedSearches++;
                
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                    allBusinesses = allBusinesses.concat(results);
                    console.log(`✅ Found ${results.length} ${type}(s)`);
                } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                    console.log(`ℹ️ No ${type}s found in this area`);
                } else if (status === google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
                    console.error('❌ API quota exceeded');
                    showError('API quota exceeded. Please try again later or check your Google Cloud billing.');
                    return;
                } else if (status === google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
                    console.error('❌ Places API request denied');
                    showError('Places API access denied. Please check:<br>• API key is valid<br>• Places API is enabled<br>• Billing account is linked');
                    return;
                } else {
                    console.error(`❌ ${type} search failed:`, status);
                }
                
                // Update progress
                const progress = Math.round((completedSearches / businessTypes.length) * 100);
                document.getElementById('issuesList').innerHTML = `<li>🔍 Progress: ${progress}% (${allBusinesses.length} businesses found)</li>`;
                
                // When all searches complete
                if (completedSearches === businessTypes.length) {
                    console.log(`🎯 Total businesses found: ${allBusinesses.length}`);
                    
                    if (allBusinesses.length > 0) {
                        businesses = removeDuplicates(allBusinesses).slice(0, 50);
                        console.log(`📋 Final business count: ${businesses.length}`);
                        
                        analyzeDataQuality();
                        displayResults();
                        addMarkersToMap();
                    } else {
                        console.log('ℹ️ No businesses found');
                        showError('No businesses found in this area. Try a different location.');
                        resetDashboard();
                    }
                }
            });
        }, index * 300);
    });
}

// Remove duplicate businesses
function removeDuplicates(businessArray) {
    const seen = new Set();
    return businessArray.filter(business => {
        const key = business.place_id || business.name + business.vicinity;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

// Basic data quality analysis
function analyzeDataQuality() {
    console.log('🔍 Analyzing data quality for', businesses.length, 'businesses');
    
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
        
        // Check if permanently closed
        if (business.business_status === 'CLOSED_PERMANENTLY') {
            dataQualityIssues.push(`🚫 ${business.name}: Marked as permanently closed`);
        }
        
        qualityScore += businessScore;
        totalChecks += businessChecks;
    });
    
    const overallQuality = totalChecks > 0 ? Math.round((qualityScore / totalChecks) * 100) : 0;
    
    console.log('📊 Quality analysis complete:', {
        businesses: businesses.length,
        qualityScore: overallQuality,
        issues: dataQualityIssues.length
    });
    
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
        li.style.color = '#137333';
        issuesList.appendChild(li);
    } else {
        // Show first 15 issues
        const issuesToShow = dataQualityIssues.slice(0, 15);
        issuesToShow.forEach(issue => {
            const li = document.createElement('li');
            li.textContent = issue;
            issuesList.appendChild(li);
        });
        
        if (dataQualityIssues.length > 15) {
            const li = document.createElement('li');
            li.innerHTML = `<strong>📋 + ${dataQualityIssues.length - 15} more issues found...</strong>`;
            li.style.background = '#fff3e0';
            li.style.borderLeftColor = '#ff9800';
            li.style.color = '#e65100';
            issuesList.appendChild(li);
        }
    }
}

// Add markers to the map
function addMarkersToMap() {
    console.log('📍 Adding', businesses.length, 'markers to map...');
    
    businesses.forEach((business, index) => {
        // Determine marker color based on data quality
        let markerColor = 'green'; // Default: good data
        let issueCount = 0;
        
        if (!business.rating) issueCount++;
        if (!business.vicinity) issueCount++;
        if (!business.photos || business.photos.length === 0) issueCount++;
        if (business.business_status === 'CLOSED_PERMANENTLY') issueCount++;
        
        if (issueCount >= 3) markerColor = 'red';
        else if (issueCount >= 1) markerColor = 'orange';
        
        const marker = new google.maps.Marker({
            position: business.geometry.location,
            map: map,
            title: business.name,
            animation: google.maps.Animation.DROP,
            icon: {
                url: `https://maps.google.com/mapfiles/ms/icons/${markerColor}-dot.png`,
                scaledSize: new google.maps.Size(32, 32)
            }
        });
        
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 10px; max-width: 280px;">
                    <h4 style="margin: 0 0 8px 0; color: #202124;">${business.name}</h4>
                    <p><strong>Rating:</strong> ${business.rating ? business.rating + '⭐ (' + (business.user_ratings_total || 0) + ' reviews)' : '❌ Not rated'}</p>
                    <p><strong>Address:</strong> ${business.vicinity || '❌ Address not available'}</p>
                    <p><strong>Type:</strong> ${business.types ? business.types[0].replace(/_/g, ' ') : 'Unknown'}</p>
                    <p><strong>Photos:</strong> ${business.photos ? '✅ ' + business.photos.length + ' available' : '❌ None'}</p>
                    <p><strong>Status:</strong> ${business.business_status || 'Unknown'}</p>
                    <p style="margin-top: 8px; color: ${markerColor === 'green' ? '#137333' : markerColor === 'orange' ? '#e65100' : '#d32f2f'};">
                        <strong>Quality:</strong> ${issueCount === 0 ? '✅ Good' : issueCount === 1 ? '⚠️ Fair' : '❌ Poor'}
                    </p>
                </div>
            `
        });
        
        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
        
        markers.push(marker);
    });
    
    console.log('✅ Markers added successfully!');
}

// Clear all markers from map
function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
}

// Reset dashboard to initial state
function resetDashboard() {
    document.getElementById('totalCount').textContent = '0';
    document.getElementById('qualityScore').textContent = '0%';
    document.getElementById('missingInfo').textContent = '0';
    document.getElementById('issuesList').innerHTML = '<li>Click "Analyze Area" to start assessment</li>';
}

// Show error message
function showError(message) {
    const issuesList = document.getElementById('issuesList');
    issuesList.innerHTML = `<li style="color: #d32f2f; background: #ffebee; border-left-color: #f44336;">${message}</li>`;
}

// Handle Google Maps authentication failures
window.gm_authFailure = function() {
    console.error('❌ Google Maps authentication failed!');
    showError('🔑 Google Maps API authentication failed. Please check your API key and billing settings.');
};

// Error handling
window.addEventListener('error', function(e) {
    console.error('❌ JavaScript error:', e.error);
    showError('JavaScript error occurred: ' + e.message);
});

console.log('📄 Script loaded successfully');
