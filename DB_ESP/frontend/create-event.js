document.addEventListener('DOMContentLoaded', function() {
    // For demo purposes, set test authentication data
    localStorage.setItem('authToken', 'demo-token');
    localStorage.setItem('userType', 'handler');
    localStorage.setItem('userId', 'demo-user');
    
    // Handle form submission
    const createEventForm = document.getElementById('createEventForm');
    if (createEventForm) {
        createEventForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Gather form data
            const formData = {
                title: document.getElementById('eventTitle').value,
                description: document.getElementById('eventDescription').value,
                category: document.getElementById('eventCategory').value,
                type: document.getElementById('eventType').value,
                startDate: document.getElementById('eventStartDate').value,
                startTime: document.getElementById('eventStartTime').value,
                endDate: document.getElementById('eventEndDate').value,
                endTime: document.getElementById('eventEndTime').value,
                venue: document.getElementById('eventVenue').value,
                address: document.getElementById('eventAddress').value,
                city: document.getElementById('eventCity').value,
                virtualLink: document.getElementById('eventLink')?.value || null,
                schedule: document.getElementById('eventSchedule').value,
                speakers: document.getElementById('eventSpeakers').value,
                notes: document.getElementById('eventNotes').value,
                createdBy: localStorage.getItem('userId') || 'unknown',
                createdAt: new Date().toISOString()
            };
            
            // Handle file uploads
            const bannerFile = document.getElementById('eventBanner').files[0];
            const additionalImages = document.getElementById('eventImages').files;
            
            if (bannerFile) {
                console.log('Banner image selected:', bannerFile.name);
            }
            
            if (additionalImages && additionalImages.length > 0) {
                console.log('Additional images selected:', additionalImages.length);
            }
            
            console.log('Event data to submit:', formData);
            
            // For demonstration, simulate a successful submission
            alert('Event created successfully!');
            
            // Store in localStorage for demo purposes
            saveEventToLocalStorage(formData);
            
            // Redirect to the events page
            window.location.href = 'handler-dashboard.html';
        });
    }
    
    // Handle event type change to show/hide virtual link
    const eventTypeSelect = document.getElementById('eventType');
    const virtualLinkGroup = document.querySelector('.virtual-link');
    
    if (eventTypeSelect && virtualLinkGroup) {
        eventTypeSelect.addEventListener('change', function() {
            if (this.value === 'virtual' || this.value === 'hybrid') {
                virtualLinkGroup.style.display = 'block';
            } else {
                virtualLinkGroup.style.display = 'none';
            }
        });
    }
    
    // Cancel button handling
    const cancelEventBtn = document.getElementById('cancelEventBtn');
    if (cancelEventBtn) {
        cancelEventBtn.addEventListener('click', function() {
            window.location.href = 'handler-dashboard.html';
        });
    }
    
    // Logout button handling
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('authToken');
            localStorage.removeItem('userType');
            localStorage.removeItem('userId');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userRole');
            sessionStorage.clear();
            window.location.href = 'login.html';
        });
    }
});

// Function to save event to localStorage (for demo purposes)
function saveEventToLocalStorage(eventData) {
    let events = JSON.parse(localStorage.getItem('events')) || [];
    eventData.id = generateEventId();
    events.push(eventData);
    localStorage.setItem('events', JSON.stringify(events));
}

// Generate a simple ID for the event
function generateEventId() {
    return 'evt_' + Math.random().toString(36).substr(2, 9);
}