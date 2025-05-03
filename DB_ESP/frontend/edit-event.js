// Get event ID from URL
const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('id');

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
        eventCapacity: 200
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
        eventCapacity: 500
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
        eventCapacity: 300
    }
];

// Function to populate form with event data
function populateEventForm(event) {
    document.getElementById('eventName').value = event.eventName;
    document.getElementById('eventDescription').value = event.eventDescription;
    document.getElementById('eventDate').value = event.eventDate;
    document.getElementById('eventTime').value = event.eventTime;
    document.getElementById('eventLocation').value = event.eventLocation;
    document.getElementById('eventCapacity').value = event.eventCapacity;
    document.getElementById('currentEventImage').src = event.eventImage;
}

// Function to handle form submission
function handleSubmit(event) {
    event.preventDefault();

    // Get form data
    const formData = {
        eventName: document.getElementById('eventName').value,
        eventDescription: document.getElementById('eventDescription').value,
        eventDate: document.getElementById('eventDate').value,
        eventTime: document.getElementById('eventTime').value,
        eventLocation: document.getElementById('eventLocation').value,
        eventCapacity: document.getElementById('eventCapacity').value,
        eventImage: document.getElementById('currentEventImage').src
    };

    // Handle file upload if a new image is selected
    const imageFile = document.getElementById('eventImage').files[0];
    if (imageFile) {
        // In a real application, you would upload the file to a server
        // For demo purposes, we'll just create a local URL
        const reader = new FileReader();
        reader.onload = function(e) {
            formData.eventImage = e.target.result;
            // Save the updated event data
            saveEventData(formData);
        };
        reader.readAsDataURL(imageFile);
    } else {
        // Save the updated event data without changing the image
        saveEventData(formData);
    }
}

// Function to save event data
function saveEventData(formData) {
    // In a real application, you would send this data to a server
    console.log('Saving event data:', formData);
    // Redirect back to manage events page
    window.location.href = 'manage-events.html';
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Find the event to edit
    const event = demoEvents.find(e => e.eventId === parseInt(eventId));
    
    if (event) {
        // Populate form with event data
        populateEventForm(event);
    } else {
        // Handle event not found
        alert('Event not found');
        window.location.href = 'manage-events.html';
    }

    // Add form submit handler
    document.getElementById('editEventForm').addEventListener('submit', handleSubmit);

    // Add event listeners
    document.getElementById('logout-btn').addEventListener('click', () => {
        // Clear session and redirect to login
        sessionStorage.clear();
        window.location.href = 'login.html';
    });
}); 