const API_BASE_URL = 'http://127.0.0.1:8000/api';

document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
    loadEvents();
});

function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';
    
    card.innerHTML = `
        <div class="event-image">
            <img src="${event.banner || '/static/images/placeholder.png'}" 
                alt="${event.name}" 
                onerror="this.onerror=null;this.src='/static/images/placeholder.png';">
        </div>
        <div class="event-details">
            <div class="event-header">
                <span class="category-badge">${event.category_name || 'Event'}</span>
                <h3>${event.name}</h3>
            </div>
            <div class="event-meta">
                <p class="host"><i class="fas fa-user"></i> ${event.host_username}</p>
                <p class="event-date"><i class="fas fa-calendar"></i> ${new Date(event.date).toLocaleDateString()}</p>
                <p class="event-time"><i class="fas fa-clock"></i> ${event.start_time} - ${event.end_time}</p>
                <p class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
            </div>
            <p class="event-description">${event.description.substring(0, 150)}${event.description.length > 150 ? '...' : ''}</p>
            <div class="event-footer">
                <div class="event-stats">
                    <span class="attendees"><i class="fas fa-users"></i> ${event.attendee_count} attending</span>
                    <span class="rating"><i class="fas fa-star"></i> ${event.average_rating || 'N/A'}</span>
                </div>
                <div class="action-buttons">
                    <a href="event-details.html?id=${event.id}" class="btn btn-primary">View Details</a>
                    ${!event.is_attending ? `<button class="rsvp-btn" data-event-id="${event.id}">
                        <i class="fas fa-calendar-check"></i> RSVP
                    </button>` : `<button class="rsvp-btn attending" data-event-id="${event.id}">
                        <i class="fas fa-check"></i> Attending
                    </button>`}
                </div>
            </div>
        </div>
    `;

    const rsvpBtn = card.querySelector('.rsvp-btn');
    if (rsvpBtn) {
        rsvpBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleRSVP(event.id);
        });
    }

    return card;
}

async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/events/categories/`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        
        const categories = await response.json();
        const filterContainer = document.getElementById('category-filters');
        filterContainer.innerHTML = '';
        
        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'filter-btn';
            button.setAttribute('data-filter', category.id);
            button.textContent = category.name;
            button.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(btn => 
                    btn.classList.remove('active'));
                button.classList.add('active');
                loadEvents(category.id);
            });
            filterContainer.appendChild(button);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

async function loadEvents(categoryId = null) {
    const container = document.getElementById('events-container');
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading events...</div>';

    try {
        let url = `${API_BASE_URL}/events/?ordering=date`;
        if (categoryId && categoryId !== 'all') {
            url += `&category=${categoryId}`;
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch events');

        const events = await response.json();
        container.innerHTML = '';

        if (events.length === 0) {
            container.innerHTML = '<p class="no-results">No events found.</p>';
            return;
        }

        events.forEach(event => {
            container.appendChild(createEventCard(event));
        });
    } catch (error) {
        console.error('Error loading events:', error);
        container.innerHTML = '<p class="error">Failed to load events.</p>';
    }
}

async function handleRSVP(eventId) {
    try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}/attendance/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ action: 'attend' })
        });

        if (!response.ok) throw new Error('Failed to RSVP');

        const result = await response.json();
        showSuccessMessage('Successfully RSVP\'d to event!');
        loadEvents(); // Reload events to update the UI
    } catch (error) {
        console.error('Error RSVPing:', error);
        showErrorMessage('Failed to RSVP to event');
    }
}

function showSuccessMessage(message) {
    // Implementation of success message display
    alert(message); // Replace with better UI feedback
}

function showErrorMessage(message) {
    // Implementation of error message display
    alert(message); // Replace with better UI feedback
}
