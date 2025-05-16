// Ensure the global API_BASE_URL is loaded
if (!window.API_BASE_URL) {
    throw new Error('API_BASE_URL is not defined. Make sure config.js is loaded before this script.');
}

// Function to get auth token from localStorage
function getAuthToken() {
    return localStorage.getItem('access_token');
}

// Function to generate event status badge based on date
function getEventStatusBadge(eventDate, eventTime) {
    const now = new Date();
    const eventDateTime = new Date(`${eventDate}T${eventTime}`);
    
    if (eventDateTime < now) {
        return '<span class="event-status past">Event Completed</span>';
    } else {
        const timeDiff = eventDateTime - now;
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= 1) {
            return '<span class="event-status upcoming">Upcoming Soon</span>';
        } else {
            return '<span class="event-status active">Registration Active</span>';
        }
    }
}

// Function to check if registration can be canceled
function canCancelRegistration(eventDate) {
    const now = new Date();
    const eventDateTime = new Date(eventDate);
    
    // Allow cancellation if event is in the future
    return eventDateTime > now;
}

// Function to handle registration cancellation
async function cancelRegistration(eventId, e) {
    if (!confirm("Are you sure you want to cancel your registration for this event?")) {
        return;
    }
    
    // Find the cancel button and show loading state
    const cancelButton = e.target.closest('.btn-cancel');
    const originalContent = cancelButton.innerHTML;
    cancelButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cancelling...';
    cancelButton.disabled = true;
    
    try {
        const response = await fetch(`${window.API_BASE_URL}/events/${eventId}/unregister/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to cancel registration');
        }

        // Show success message
        const messageElement = document.createElement('div');
        messageElement.className = 'success-message';
        messageElement.innerHTML = '<i class="fas fa-check-circle"></i> Registration cancelled successfully';
        document.querySelector('.dashboard-container').prepend(messageElement);
        
        // Reload registrations after a short delay
        setTimeout(() => {
            messageElement.remove();
            populateRegistrations();
        }, 2000);
    } catch (error) {
        // Restore button state
        cancelButton.innerHTML = originalContent;
        cancelButton.disabled = false;
        
        // Show error message
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${error.message}`;
        document.querySelector('.dashboard-container').prepend(errorElement);
        
        // Remove error message after a delay
        setTimeout(() => {
            errorElement.remove();
        }, 3000);
    }
}

// Function to populate registrations
async function populateRegistrations() {
    const registrationsGrid = document.getElementById('myRegistrations');
    registrationsGrid.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading events...</div>';

    try {
        const response = await fetch(`${window.API_BASE_URL}/events/attending/`, {
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
                    <p class="event-description">${event.description}</p>                    <div class="event-stats">
                        <span class="attendee-count">
                            <i class="fas fa-users"></i> ${event.attendee_count} attending
                        </span>
                        <span class="event-rating">
                            <i class="fas fa-star"></i> Rating: ${event.average_rating || 'N/A'}
                        </span>
                    </div>
                    <div class="event-actions">                        <div class="event-meta">
                            ${getEventStatusBadge(event.date, event.start_time)}
                        </div>
                        <div class="event-button">
                            <div class="button-group">
                                <button class="btn btn-primary" onclick="viewEventDetails(${event.id})">
                                    <i class="fas fa-info-circle"></i> View Details
                                </button>                                ${canCancelRegistration(event.date) ? 
                                  `<button class="btn btn-cancel" onclick="cancelRegistration(${event.id}, event)">
                                    <i class="fas fa-times-circle"></i> Cancel
                                   </button>` : ''}
                            </div>
                        </div>
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