// Demo data for events (same as in handler-dashboard.js)
const demoEvents = [
    {
        eventId: 1,
        eventName: "Annual Tech Conference",
        eventDate: "2024-03-15",
        eventTime: "09:00",
        eventLocation: "Main Auditorium",
        eventDescription: "Join us for a day of cutting-edge technology discussions and networking opportunities.",
        eventImage: "https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        eventStatus: "active",
        eventCapacity: 200,
        eventPrice: 50.00
    },
    {
        eventId: 2,
        eventName: "Cultural Festival",
        eventDate: "2024-04-20",
        eventTime: "14:00",
        eventLocation: "University Grounds",
        eventDescription: "Experience diverse cultures through food, music, and performances.",
        eventImage: "https://images.unsplash.com/photo-1511795409834-432f31197ce6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        eventStatus: "active",
        eventCapacity: 500,
        eventPrice: 25.00
    },
    {
        eventId: 3,
        eventName: "Career Fair",
        eventDate: "2024-05-10",
        eventTime: "10:00",
        eventLocation: "Career Center",
        eventDescription: "Connect with top employers and explore career opportunities.",
        eventImage: "https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        eventStatus: "active",
        eventCapacity: 300,
        eventPrice: 0.00
    }
];

// Function to populate society events
function populateSocietyEvents() {
    const eventsGrid = document.getElementById('societyEvents');
    eventsGrid.innerHTML = '';

    demoEvents.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        eventCard.innerHTML = `
            <div class="event-image">
                <img src="${event.eventImage}" alt="${event.eventName}">
            </div>
            <div class="event-details">
                <h3>${event.eventName}</h3>
                <p class="event-date">
                    <i class="fas fa-calendar"></i> ${new Date(event.eventDate).toLocaleDateString()}
                    <i class="fas fa-clock"></i> ${event.eventTime}
                </p>
                <p class="event-location">
                    <i class="fas fa-map-marker-alt"></i> ${event.eventLocation}
                </p>
                <p class="event-description">${event.eventDescription}</p>
                <div class="event-stats">
                    <span class="event-capacity">
                        <i class="fas fa-users"></i> ${event.eventCapacity} spots
                    </span>
                </div>
                <div class="event-actions">
                    <button class="btn btn-primary" onclick="window.location.href='edit-event.html?id=${event.eventId}'">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </div>
            </div>
        `;
        eventsGrid.appendChild(eventCard);
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Populate events
    populateSocietyEvents();

    // Add event listeners
    document.getElementById('logout-btn').addEventListener('click', () => {
        // Clear session and redirect to login
        sessionStorage.clear();
        window.location.href = 'login.html';
    });
}); 