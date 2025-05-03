// Demo data for upcoming events
const upcomingEvents = [
    {
        eventId: 1,
        eventName: "Tech Workshop 2024",
        eventDate: "2024-03-15",
        eventTime: "14:00",
        eventLocation: "Tech Building, Room 101",
        eventDescription: "Learn about the latest technologies and tools in software development.",
        eventImage: "https://via.placeholder.com/300x200",
        societyName: "Tech Society",
        registrationStatus: "registered"
    },
    {
        eventId: 2,
        eventName: "Cultural Festival",
        eventDate: "2024-03-20",
        eventTime: "18:00",
        eventLocation: "Main Auditorium",
        eventDescription: "Experience diverse cultures through performances and food.",
        eventImage: "https://via.placeholder.com/300x200",
        societyName: "Cultural Society",
        registrationStatus: "pending"
    }
];

// Demo data for recent activity
const recentActivity = [
    {
        type: "registration",
        eventName: "Tech Workshop 2024",
        timestamp: "2024-03-10T10:30:00",
        status: "confirmed"
    },
    {
        type: "society_join",
        societyName: "Cultural Society",
        timestamp: "2024-03-08T15:45:00",
        status: "active"
    },
    {
        type: "feedback",
        eventName: "Music Festival",
        timestamp: "2024-03-05T20:15:00",
        rating: 4
    }
];

// Demo data for latest feedback
const latestFeedback = {
    eventName: "Music Festival",
    eventDate: "2024-03-05",
    rating: 4,
    comment: "The event was well-organized with great performances. The sound system could have been better though.",
    timestamp: "2024-03-05T20:15:00"
};

// Demo data for joined societies
const demoSocieties = [
    {
        societyId: 1,
        name: "Computer Science Society",
        logo: "https://via.placeholder.com/150",
        memberCount: 150,
        role: "member",
        upcomingEvents: 2
    },
    {
        societyId: 2,
        name: "Cultural Society",
        logo: "https://via.placeholder.com/150",
        memberCount: 200,
        role: "member",
        upcomingEvents: 1
    },
    {
        societyId: 3,
        name: "Photography Club",
        logo: "https://via.placeholder.com/150",
        memberCount: 75,
        role: "member",
        upcomingEvents: 0
    }
];

// Demo data for pending feedback
const demoPendingFeedback = [
    {
        eventId: 1,
        eventName: "Tech Workshop 2024",
        eventDate: "2024-02-10",
        societyName: "Computer Science Society"
    },
    {
        eventId: 2,
        eventName: "Photography Exhibition",
        eventDate: "2024-02-12",
        societyName: "Photography Club"
    }
];

// Function to populate upcoming events
function populateUpcomingEvents() {
    const eventsGrid = document.getElementById('upcomingEvents');
    eventsGrid.innerHTML = '';

    upcomingEvents.forEach(event => {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        eventCard.innerHTML = `
            <div class="event-image">
                <img src="${event.eventImage}" alt="${event.eventName}">
            </div>
            <div class="event-details">
                <h3>${event.eventName}</h3>
                <p class="event-date">
                    <i class="fas fa-calendar"></i> ${formatDate(event.eventDate)}
                    <i class="fas fa-clock"></i> ${event.eventTime}
                </p>
                <p class="event-location">
                    <i class="fas fa-map-marker-alt"></i> ${event.eventLocation}
                </p>
                <p class="event-society">
                    <i class="fas fa-users"></i> ${event.societyName}
                </p>
                <div class="event-status ${event.registrationStatus}">
                    ${event.registrationStatus === 'registered' ? 'Registered' : 'Pending'}
                </div>
                <button class="btn btn-primary" onclick="viewEventDetails(${event.eventId})">
                    View Details
                </button>
            </div>
        `;
        eventsGrid.appendChild(eventCard);
    });
}

// Function to populate societies
function populateSocieties() {
    const societiesGrid = document.getElementById('mySocieties');
    societiesGrid.innerHTML = '';

    demoSocieties.forEach(society => {
        const societyCard = document.createElement('div');
        societyCard.className = 'society-card';
        societyCard.innerHTML = `
            <div class="society-logo">
                <img src="${society.logo}" alt="${society.name}">
            </div>
            <div class="society-details">
                <h3>${society.name}</h3>
                <p class="society-stats">
                    <span><i class="fas fa-users"></i> ${society.memberCount} members</span>
                    <span><i class="fas fa-calendar"></i> ${society.upcomingEvents} upcoming</span>
                </p>
                <div class="society-actions">
                    <button class="btn btn-primary" onclick="viewSociety(${society.societyId})">
                        <i class="fas fa-eye"></i> View
                    </button>
                </div>
            </div>
        `;
        societiesGrid.appendChild(societyCard);
    });
}

// Function to populate recent activity
function populateRecentActivity() {
    const activityList = document.getElementById('recentActivity');
    activityList.innerHTML = '';

    recentActivity.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        let icon, content;
        switch(activity.type) {
            case 'registration':
                icon = '<i class="fas fa-ticket-alt"></i>';
                content = `Registered for ${activity.eventName}`;
                break;
            case 'society_join':
                icon = '<i class="fas fa-users"></i>';
                content = `Joined ${activity.societyName}`;
                break;
            case 'feedback':
                icon = '<i class="fas fa-comment"></i>';
                content = `Gave ${activity.rating} star feedback for ${activity.eventName}`;
                break;
        }

        activityItem.innerHTML = `
            <div class="activity-icon">${icon}</div>
            <div class="activity-content">
                <p>${content}</p>
                <span class="activity-time">${formatTimeAgo(activity.timestamp)}</span>
            </div>
        `;
        activityList.appendChild(activityItem);
    });
}

// Function to populate pending feedback
function populatePendingFeedback() {
    const feedbackList = document.getElementById('pendingFeedback');
    feedbackList.innerHTML = '';

    if (demoPendingFeedback.length === 0) {
        feedbackList.innerHTML = `
            <div class="no-feedback">
                <i class="fas fa-check-circle"></i>
                <p>No pending feedback</p>
            </div>
        `;
        return;
    }

    demoPendingFeedback.forEach(feedback => {
        const feedbackItem = document.createElement('div');
        feedbackItem.className = 'feedback-item pending';
        feedbackItem.innerHTML = `
            <div class="feedback-header">
                <div class="feedback-event">
                    <h3>${feedback.eventName}</h3>
                    <span class="feedback-date">
                        <i class="fas fa-calendar"></i>
                        ${new Date(feedback.eventDate).toLocaleDateString()}
                    </span>
                </div>
                <span class="society-name">${feedback.societyName}</span>
            </div>
            <div class="feedback-actions">
                <button class="btn btn-primary" onclick="provideFeedback(${feedback.eventId})">
                    <i class="fas fa-star"></i> Rate Event
                </button>
            </div>
        `;
        feedbackList.appendChild(feedbackItem);
    });
}

// Function to populate latest feedback
function populateLatestFeedback() {
    const feedbackCard = document.getElementById('latestFeedback');
    feedbackCard.innerHTML = `
        <div class="feedback-header">
            <h3>${latestFeedback.eventName}</h3>
            <span class="feedback-date">${formatDate(latestFeedback.eventDate)}</span>
        </div>
        <div class="feedback-rating">
            ${generateStarRating(latestFeedback.rating)}
        </div>
        <div class="feedback-comment">
            <p>${latestFeedback.comment}</p>
        </div>
        <div class="feedback-footer">
            <span class="feedback-time">${formatTimeAgo(latestFeedback.timestamp)}</span>
        </div>
    `;
}

// Helper function to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Helper function to format time ago
function formatTimeAgo(timestamp) {
    const now = new Date();
    const then = new Date(timestamp);
    const diff = now - then;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
}

// Helper function to generate star rating
function generateStarRating(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<i class="fas fa-star${i <= rating ? '' : ' far'}"></i>`;
    }
    return stars;
}

// Navigation functions
function viewEventDetails(id) {
    // Redirect to the announcement details page with the given id
    window.location.href = `announcement-details.html?id=${id}`;
}

function viewSociety(societyId) {
    window.location.href = `society-details.html?id=${societyId}`;
}

function provideFeedback(eventId) {
    window.location.href = `provide-feedback.html?id=${eventId}`;
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Set viewer name
    const viewerName = sessionStorage.getItem('viewerName') || 'Viewer';
    document.getElementById('viewerName').textContent = viewerName;

    // Populate sections
    populateUpcomingEvents();
    populateSocieties();
    populateRecentActivity();
    populatePendingFeedback();
    populateLatestFeedback();

    // Add logout handler
    document.getElementById('logout-btn').addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = 'login.html';
    });
}); 