function populateSocietyEvents() {
    const eventsGrid = document.getElementById('societyEvents');
    eventsGrid.innerHTML = '';

    fetch(`${window.baseUrl}/api/events/handler?ordering=date/`,
        {
            method: "GET",
            headers: {
                'Content-Type': 'application/json', 
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjo0ODk5OTA2NDAxLCJpYXQiOjE3NDYzMDY0MDEsImp0aSI6ImNjZmEzZTFiMmU2YTRjZmU4YzU4M2FiYjAwYmNmMjcwIiwidXNlcl9pZCI6OX0.uolpG4ckeSk3iwSWG_GmxJShZ6tU5Eufgc1sEqmwe9c',
            }
        }
    ).then(response => response.json()).then(data => {
    data.forEach(event => {
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
                <p class="event-description">${event.description}</p>
                <div class="event-stats">
                    <span class="event-capacity">
                        <i class="fas fa-users"></i> ${event.attendee_count} attendees
                    </span>
                </div>
                <div class="event-actions">
                    <button class="btn btn-primary" onclick="window.location.href='manage-events.html?id=${event.id}'">
                        <i class="fas fa-edit"></i> Manage
                    </button>
                </div>
            </div>
        `;
        eventsGrid.appendChild(eventCard);
    });
})
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