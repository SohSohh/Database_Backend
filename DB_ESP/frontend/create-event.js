document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is a handler
    const authToken = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');
    
    // If not logged in or not a handler, redirect to login
    if (!authToken || userType !== 'handler') {
        window.location.href = 'login.html';
    }
    
    // Handle form submission
    const createEventForm = document.getElementById('createEventForm');
    if (createEventForm) {
        createEventForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Gather form data
            const formData = {
                title: document.getElementById('eventTitle').value,
                date: document.getElementById('eventDate').value,
                time: document.getElementById('eventTime').value,
                location: document.getElementById('eventLocation').value,
                category: document.getElementById('eventCategory').value,
                maxAttendees: document.getElementById('maxAttendees').value || null,
                description: document.getElementById('eventDescription').value,
                requireRegistration: document.getElementById('requireRegistration').checked,
                isImportant: document.getElementById('isImportant').checked,
                createdBy: localStorage.getItem('userId') || 'unknown',
                createdAt: new Date().toISOString()
            };
            
            // Image handling would normally be done with FormData and file upload
            // This is simplified for demonstration
            const imageFile = document.getElementById('eventImage').files[0];
            if (imageFile) {
                // In a real app, you'd upload this file to your server
                console.log('Image selected:', imageFile.name);
            }
            
            // In a real application, you would send this data to your backend
            console.log('Event data to submit:', formData);
            
            // For demonstration, simulate a successful submission
            alert('Event created successfully!');
            
            // Store in localStorage for demo purposes (In a real app, this would be sent to a backend)
            saveEventToLocalStorage(formData);
            
            // Redirect to the events page or dashboard
            window.location.href = 'handler-dashboard.html';
        });
    }
    
    // Cancel button handling
    const cancelEventBtn = document.getElementById('cancelEventBtn');
    if (cancelEventBtn) {
        cancelEventBtn.addEventListener('click', function() {
            // Redirect back to dashboard
            window.location.href = 'handler-dashboard.html';
        });
    }
    
    // Logout button handling
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Clear auth data
            localStorage.removeItem('authToken');
            localStorage.removeItem('userType');
            localStorage.removeItem('userId');
            // Redirect to home page
            window.location.href = 'index.html';
        });
    }
});

// Function to save event to localStorage (for demo purposes)
function saveEventToLocalStorage(eventData) {
    // Get existing events or initialize empty array
    let events = JSON.parse(localStorage.getItem('events')) || [];
    
    // Add an ID to the event
    eventData.id = generateEventId();
    
    // Add the new event
    events.push(eventData);
    
    // Save back to localStorage
    localStorage.setItem('events', JSON.stringify(events));
}

// Generate a simple ID for the event
function generateEventId() {
    return 'evt_' + Math.random().toString(36).substr(2, 9);
}