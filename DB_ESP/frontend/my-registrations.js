// Base URL for API calls
const API_BASE_URL = 'http://localhost:8000/api';

// Function to get auth token from localStorage
function getAuthToken() {
    return localStorage.getItem('access_token');
}

// Function to populate registrations
async function populateRegistrations() {
    const registrationsGrid = document.getElementById('myRegistrations');
    registrationsGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading events...</div>';

    try {
        const response = await fetch(`${API_BASE_URL}/events/attending/`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }

        const events = await response.json();

        if (events.length === 0) {
            registrationsGrid.innerHTML = `
                <div class="no-registrations">
                    <i class="fas fa-calendar-plus"></i>
                    <p>No events registered</p>
                    <button class="btn btn-primary" onclick="window.location.href='browse-events.html'">
                        <i class="fas fa-plus"></i> Register for an Event
                    </button>
                </div>
            `;
            return;
        }

        registrationsGrid.innerHTML = '';
        events.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            eventCard.innerHTML = `
                <div class="event-image">
                    <img src="${event.banner || '/static/images/placeholder.png'}" 
                         alt="${event.name}"
                         onerror="this.onerror=null;this.src='/static/images/placeholder.png';">
                </div>
                <div class="event-details">
                    <h3>${event.name}</h3>
                    <p class="event-date">
                        <i class="fas fa-calendar"></i> ${new Date(event.date).toLocaleDateString()}
                        <i class="fas fa-clock"></i> ${event.start_time}
                    </p>
                    <p class="event-location">
                        <i class="fas fa-map-marker-alt"></i> ${event.location}
                    </p>
                    <p class="society-name">
                        <i class="fas fa-users"></i> ${event.host_username}
                    </p>
                    <p class="event-description">${event.description}</p>
                    <div class="event-actions">
                        <span class="attendee-count">
                            <i class="fas fa-users"></i> ${event.attendee_count} attending
                        </span>
                        <span class="event-rating">
                            <i class="fas fa-star"></i> Rating: ${event.average_rating || 'N/A'}
                        </span>
                        <button class="btn btn-primary" onclick="viewEventDetails(${event.id})">
                            <i class="fas fa-info-circle"></i> View Details
                        </button>
                    </div>
                </div>
            `;
            registrationsGrid.appendChild(eventCard);
        });
    } catch (error) {
        registrationsGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                ${error.message}
            </div>
        `;
    }
}

// Navigation functions
function viewEventDetails(eventId) {
    window.location.href = `announcement-details.html?id=${eventId}`;
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Check for auth token
    if (!getAuthToken()) {
        window.location.href = 'login.html';
        return;
    }

    populateRegistrations();

    // Add logout handler
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('access_token');
        window.location.href = 'login.html';
    });
});