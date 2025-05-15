// Ensure the global API_BASE_URL is loaded
if (!window.API_BASE_URL) {
    throw new Error('API_BASE_URL is not defined. Make sure config.js is loaded before this script.');
}

// Get token from localStorage
const token = localStorage.getItem('access_token');
if (!token) {
    console.error('Missing access token. Redirecting to login...');
    window.location.href = 'login.html';
}

// Debug function to log API calls and responses
function debugApiCall(method, url, response, data) {
    console.group(`API ${method}: ${url}`);
    console.log('Status:', response.status);
    console.log('Response:', data);
    console.groupEnd();
}

// Function to fetch current user data
async function fetchCurrentUser() {
    try {
        const response = await fetch(`${window.API_BASE_URL}/users/me/`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        debugApiCall('GET', '/users/me/', response, data);
        
        if (!response.ok) throw new Error(data.detail || 'Failed to fetch user data');
        
        // Update user name in the welcome section
        document.getElementById('viewerName').textContent = data.username || 'Viewer';
        
        return data;
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}

// Function to populate attending events (upcoming events)
async function populateUpcomingEvents() {
    const eventsGrid = document.getElementById('upcomingEvents');
    eventsGrid.innerHTML = '<p>Loading events...</p>';

    try {
        const response = await fetch(`${window.API_BASE_URL}/events/attending/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch attending events');
        
        const events = await response.json();
        if (events.length === 0) {
            eventsGrid.innerHTML = '<p>No upcoming events found. Browse events to join some!</p>';
            return;
        }
        
        // Clear loading message
        eventsGrid.innerHTML = '';
        
        // Render each event card
        events.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            // Make the entire card clickable
            eventCard.style.cursor = 'pointer';
            eventCard.addEventListener('click', () => {
                window.location.href = `announcement-details.html?id=${event.id}`;
            });
            
            eventCard.innerHTML = `
                <div class="event-image">
                    <img src="${event.banner || '/static/images/placeholder.png'}" 
                        alt="${event.name}" 
                        onerror="this.onerror=null;this.src='/static/images/placeholder.png';">
                </div>
                <div class="event-details">
                    <div class="event-header">
                        <span class="event-category">${event.category_name}</span>
                        <h3>${event.name}</h3>
                    </div>
                    <p class="event-date">
                        <i class="fas fa-calendar"></i> ${new Date(event.date).toLocaleDateString()}
                        <i class="fas fa-clock"></i> ${event.start_time}
                    </p>
                    <p class="event-location">
                        <i class="fas fa-map-marker-alt"></i> ${event.location}
                    </p>
                    <p class="event-description">${event.description}</p>
                    <div class="event-stats">
                        <span class="event-attendees">
                            <i class="fas fa-users"></i> ${event.attendee_count} attending
                        </span>
                        <span class="event-rating">
                            <i class="fas fa-star"></i> ${event.average_rating || 'N/A'}
                        </span>
                    </div>
                    <div class="event-actions">
                        <a href="announcement-details.html?id=${event.id}" class="btn btn-primary">
                            <i class="fas fa-info-circle"></i> View Details
                        </a>
                    </div>
                </div>
            `;
            eventsGrid.appendChild(eventCard);
        });
        
    } catch (error) {
        console.error('Error:', error);
        eventsGrid.innerHTML = '<p class="error">Failed to load events</p>';
    }
}

// Function to get joined societies count
async function getSocietiesCount() {
    try {
        // This is a placeholder - replace with actual endpoint when available
        // For now we'll just return a dummy value
        return 3;
    } catch (error) {
        console.error('Error fetching societies count:', error);
        return 0;
    }
}

// Function to get events attended count
async function getEventsAttendedCount() {
    try {
        // This is a placeholder - replace with actual endpoint when available
        // For now we'll just return a dummy value
        return 8;
    } catch (error) {
        console.error('Error fetching events attended count:', error);
        return 0;
    }
}

// Function to get feedback given count
async function getFeedbackCount() {
    try {
        // This is a placeholder - replace with actual endpoint when available
        // For now we'll just return a dummy value
        return 6;
    } catch (error) {
        console.error('Error fetching feedback count:', error);
        return 0;
    }
}

// Function to update stats
async function updateStats() {
    try {
        // Fetch all required stats in parallel
        const [eventsResponse, societiesResponse, commentsResponse] = await Promise.all([
            fetch(`${window.API_BASE_URL}/events/attending/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch(`${window.API_BASE_URL}/users/my-societies/`, {  // Changed endpoint to my-societies
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            // Assuming there's an endpoint for user's comments, if not, remove this
            fetch(`${window.API_BASE_URL}/users/me/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);

        if (!eventsResponse.ok || !societiesResponse.ok) 
            throw new Error('Failed to fetch stats');

        const [events, societies, comments] = await Promise.all([
            eventsResponse.json(),
            societiesResponse.json(),
            commentsResponse.ok ? commentsResponse.json() : []
        ]);

        // Update stat cards
        const statCards = document.querySelectorAll('.stat-number');
        statCards[0].textContent = events.length; // Registered Events
        statCards[1].textContent = societies.length; // Societies Joined - now using my-societies endpoint
        statCards[2].textContent = events.filter(e => new Date(e.date) < new Date()).length; // Past Events (attended)
        statCards[3].textContent = comments.total_comments; // Feedback Given

    } catch (error) {
        console.error('Failed to update stats:', error);
        document.querySelectorAll('.stat-number').forEach(stat => {
            stat.textContent = '-';
        });
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch user data
        await fetchCurrentUser();
        
        // Update stats
        await updateStats();
        
        // Populate upcoming events
        await populateUpcomingEvents();
        
        // Add logout handler
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.setItem('showLogoutMessage', 'true'); // Set flag for success message
            // Clear authentication tokens
            localStorage.removeItem('auth_tokens');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = 'index.html';
        });
        
        // Add mobile menu toggle functionality
        const menuToggle = document.querySelector('.menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }
    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
});