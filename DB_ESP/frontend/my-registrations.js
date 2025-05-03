// Demo data for registrations
const demoRegistrations = [
    {
        eventId: 1,
        eventName: "Tech Workshop 2024",
        eventDate: "2024-03-15",
        eventTime: "09:00",
        eventLocation: "Main Auditorium",
        eventDescription: "Learn about the latest technologies and development practices.",
        eventImage: "https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        societyName: "Computer Science Society",
        registrationStatus: "registered",
        registrationDate: "2024-02-15"
    },
    {
        eventId: 2,
        eventName: "Cultural Festival",
        eventDate: "2024-04-20",
        eventTime: "14:00",
        eventLocation: "University Grounds",
        eventDescription: "Experience diverse cultures through food, music, and performances.",
        eventImage: "https://images.unsplash.com/photo-1511795409834-432f31197ce6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        societyName: "Cultural Society",
        registrationStatus: "pending",
        registrationDate: "2024-02-16"
    }
];

// Function to populate registrations
function populateRegistrations() {
    const registrationsGrid = document.getElementById('myRegistrations');
    registrationsGrid.innerHTML = '';

    if (demoRegistrations.length === 0) {
        registrationsGrid.innerHTML = `
            <div class="no-registrations">
                <i class="fas fa-calendar-plus"></i>
                <p>No registrations found</p>
                <button class="btn btn-primary" onclick="window.location.href='browse-events.html'">
                    <i class="fas fa-plus"></i> Register for an Event
                </button>
            </div>
        `;
        return;
    }

    demoRegistrations.forEach(registration => {
        const registrationCard = document.createElement('div');
        registrationCard.className = 'event-card';
        registrationCard.innerHTML = `
            <div class="event-image">
                <img src="${registration.eventImage}" alt="${registration.eventName}">
            </div>
            <div class="event-details">
                <h3>${registration.eventName}</h3>
                <p class="event-date">
                    <i class="fas fa-calendar"></i> ${new Date(registration.eventDate).toLocaleDateString()}
                    <i class="fas fa-clock"></i> ${registration.eventTime}
                </p>
                <p class="event-location">
                    <i class="fas fa-map-marker-alt"></i> ${registration.eventLocation}
                </p>
                <p class="society-name">
                    <i class="fas fa-users"></i> ${registration.societyName}
                </p>
                <p class="event-description">${registration.eventDescription}</p>
                <div class="event-actions">
                    <span class="registration-status ${registration.registrationStatus}">
                        <i class="fas fa-${registration.registrationStatus === 'registered' ? 'check-circle' : 'clock'}"></i>
                        ${registration.registrationStatus.charAt(0).toUpperCase() + registration.registrationStatus.slice(1)}
                    </span>
                    <span class="registration-date">
                        <i class="fas fa-calendar-check"></i>
                        Registered on ${new Date(registration.registrationDate).toLocaleDateString()}
                    </span>
                    <button class="btn btn-primary" onclick="viewEventDetails(${registration.eventId})">
                        <i class="fas fa-info-circle"></i> View Details
                    </button>
                </div>
            </div>
        `;
        registrationsGrid.appendChild(registrationCard);
    });
}

// Navigation functions
function viewEventDetails(eventId) {
    window.location.href = `event-details.html?id=${eventId}`;
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    populateRegistrations();

    // Add logout handler
    document.getElementById('logout-btn').addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = 'login.html';
    });
}); 