const API_BASE_URL = 'http://localhost:8000/api';

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    const societyId = new URLSearchParams(window.location.search).get('id');
    if (!societyId) {
        showError('Society ID not found');
        return;
    }

    loadSocietyDetails(societyId);
});

async function loadSocietyDetails(societyId) {
    try {
        // Fetch events for this society
        const eventsResponse = await fetch(`${API_BASE_URL}/events/handler/?user_id=${societyId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });

        if (!eventsResponse.ok) throw new Error('Failed to fetch events');
        const events = await eventsResponse.json();

        // First event should contain the host information we need
        if (events && events.length > 0) {
            const societyInfo = {
                name: events[0].host_username, // This should be the society name
                username: events[0].host_username,
                eventCount: events.length,
                averageRating: calculateAverageRating(events)
            };            // Update UI with society info
            const societyNameElement = document.getElementById('societyName');
            societyNameElement.textContent = societyInfo.name;
            societyNameElement.style.opacity = '0';
            setTimeout(() => {
                societyNameElement.style.opacity = '1';
                societyNameElement.style.transition = 'opacity 0.5s ease-in-out';
            }, 100);
            
            document.getElementById('societyUsername').textContent = societyInfo.username;
            document.getElementById('eventCount').textContent = societyInfo.eventCount;
            document.getElementById('averageRating').textContent = 
                societyInfo.averageRating > 0 ? societyInfo.averageRating.toFixed(1) : 'N/A';

            // Render events
            renderEvents(events);
        } else {
            throw new Error('No events or society information found');
        }

    } catch (error) {
        showError(error.message);
        console.error('Error:', error);
    }
}

// Helper function to calculate average rating
function calculateAverageRating(events) {
    const eventsWithRatings = events.filter(event => event.average_rating);
    if (eventsWithRatings.length === 0) return 0;
    
    const sum = eventsWithRatings.reduce((acc, event) => acc + event.average_rating, 0);
    return sum / eventsWithRatings.length;
}

function renderEvents(events) {
    const eventsGrid = document.getElementById('eventsGrid');
    eventsGrid.innerHTML = '';

    if (events.length === 0) {
        eventsGrid.innerHTML = '<p class="no-events">No events found</p>';
        return;
    }

    events.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        eventCard.onclick = () => window.location.href = `announcement-details.html?id=${event.id}`;
        
        eventCard.innerHTML = `
            <div class="event-image">
                <img src="${event.banner || '/static/images/placeholder.png'}" 
                    alt="${event.name}" 
                    onerror="this.onerror=null;this.src='/static/images/placeholder.png';">
            </div>
            <div class="event-details">
                <div class="event-header">
                    <span class="event-category">${event.category_name || 'Event'}</span>
                    <h3>${event.name}</h3>
                </div>
                <p class="event-date">
                    <i class="fas fa-calendar"></i> ${new Date(event.date).toLocaleDateString()}
                    <i class="fas fa-clock"></i> ${event.start_time}
                </p>
                <p class="event-location">
                    <i class="fas fa-map-marker-alt"></i> ${event.location}
                </p>
                <div class="event-footer">
                    <span class="event-stats">
                        <span class="attendee-count">
                            <i class="fas fa-users"></i> ${event.attendee_count} attending
                        </span>
                        <span class="event-rating">
                            <i class="fas fa-star"></i> ${event.average_rating || 'N/A'}
                        </span>
                    </span>
                </div>
            </div>
        `;
        eventsGrid.appendChild(eventCard);
    });
}

async function handleJoinSociety(societyId, joinCode) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/membership/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({
                handler_id: societyId,
                join_code: joinCode
            })
        });

        if (!response.ok) throw new Error('Invalid join code');

        showSuccess('Successfully joined society!');
        document.getElementById('joinModal').style.display = 'none';
        updateJoinButton(true);
        loadSocietyDetails(societyId);

    } catch (error) {
        showError(error.message);
    }
}

// Helper functions
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

function showSuccess(message) {
    // Implementation similar to other pages
}

function updateJoinButton(isMember) {
    const joinBtn = document.getElementById('joinSocietyBtn');
    if (isMember) {
        joinBtn.textContent = 'Joined';
        joinBtn.disabled = true;
        joinBtn.classList.add('btn-success');
    }
}
