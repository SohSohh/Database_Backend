// Global variables
window.baseUrl = "http://localhost:8000";
const token = localStorage.getItem('access_token');

// Demo data for tasks
const demoTasks = [
    {
        taskId: 1,
        taskName: "Finalize Tech Conference Speakers",
        taskDueDate: "2024-03-01",
        taskPriority: "high",
        taskStatus: "pending"
    },
    {
        taskId: 2,
        taskName: "Order Festival Supplies",
        taskDueDate: "2024-04-10",
        taskPriority: "medium",
        taskStatus: "pending"
    },
    {
        taskId: 3,
        taskName: "Send Career Fair Invitations",
        taskDueDate: "2024-04-25",
        taskPriority: "high",
        taskStatus: "pending"
    }
];

// Demo data for feedback
const demoFeedback = [
    {
        feedbackId: 1,
        eventId: 1,
        eventName: "Annual Tech Conference",
        rating: 4.5,
        comment: "Great speakers and well-organized event. Would love to see more hands-on workshops next time.",
        timestamp: "2024-02-15T14:30:00Z"
    },
    {
        feedbackId: 2,
        eventId: 2,
        eventName: "Cultural Festival",
        rating: 5.0,
        comment: "Amazing experience! The food was delicious and the performances were outstanding.",
        timestamp: "2024-02-10T09:15:00Z"
    }
];

// Demo society data - In production, this would come from your backend
const societyData = {
    name: "Computer Science Society",
    id: "CS001"
};

// Function to populate all hosted events
function populateRecentEvent() {
    const eventsGrid = document.getElementById('recentEvents');
    eventsGrid.innerHTML = '<p>Loading events...</p>';

    // Get all events for the handler
    fetch(`${window.baseUrl}/api/events/handler?ordering=date/`,
        {
            method: "GET",
            headers: {
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}`,
            }
        }
    ).then(response => response.json())
    .then(data => {
        eventsGrid.innerHTML = '';
        
        if (data.length === 0) {
            eventsGrid.innerHTML = '<p>No events found. Create your first event!</p>';
            return;
        }
        
        // Loop through all events and create cards for each
        data.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            // Make the entire card clickable
            eventCard.style.cursor = 'pointer';
            eventCard.addEventListener('click', () => {
                window.location.href = `event-details.html?id=${event.id}`;
            });
            
            eventCard.innerHTML = `
                <div class="event-image">
                    <img src="${event.banner || '/static/images/placeholder.png'}" 
                        alt="${event.name}" 
                        onerror="this.onerror=null;this.src='/static/images/placeholder.png';">
                </div>
                <div class="event-details">
                    <h3>${event.name}</h3>
                    <p class="event-date">
                        <i class="fas fa-calendar"></i> ${formatEventDateTime(event.date, event.start_time)}
                    </p>
                    <p class="event-location">
                        <i class="fas fa-map-marker-alt"></i> ${event.location || 'TBD'}
                    </p>
                    <p class="event-description">${truncateText(event.description, 120)}</p>
                    <div class="event-stats">
                        <span class="event-capacity">
                            <i class="fas fa-users"></i> ${event.attendee_count || 0} attendees
                        </span>
                        ${event.average_rating ? 
                          `<span class="event-rating">
                              <i class="fas fa-star"></i> ${parseFloat(event.average_rating).toFixed(1)}
                           </span>` : ''}
                    </div>
                    <div class="event-actions">
                        <button class="btn btn-primary event-manage-btn" data-event-id="${event.id}">
                            <i class="fas fa-edit"></i> Manage
                        </button>
                    </div>
                </div>
            `;
            eventsGrid.appendChild(eventCard);
        });
    })
    .catch(error => {
        console.error('Error fetching events:', error);
        eventsGrid.innerHTML = '<p>Failed to load events. Please try again later.</p>';
    });
}

// Helper function to format date and time for event display
function formatEventDateTime(date, time) {
    if (!date) return 'TBD';
    
    const eventDate = new Date(date);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    return time ? `${formattedDate} at ${time}` : formattedDate;
}

// Helper function to truncate text if it's too long
function truncateText(text, maxLength) {
    if (!text) return 'No description available';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Function to populate upcoming tasks
function populateUpcomingTasks() {
    const tasksList = document.getElementById('upcomingTasks');
    if (tasksList) {
        tasksList.innerHTML = '';

        demoTasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
            taskItem.innerHTML = `
                <div class="task-info">
                    <h3>${task.taskName}</h3>
                    <p class="task-due-date">
                        <i class="fas fa-calendar"></i> Due: ${new Date(task.taskDueDate).toLocaleDateString()}
                    </p>
                </div>
                <div class="task-meta">
                    <span class="task-priority ${task.taskPriority}">
                        <i class="fas fa-flag"></i> ${task.taskPriority}
                    </span>
                    <span class="task-status ${task.taskStatus}">
                        <i class="fas fa-circle"></i> ${task.taskStatus}
                    </span>
                </div>
            `;
            tasksList.appendChild(taskItem);
        });
    }
}

// Function to populate recent feedback
function populateRecentFeedback() {
    const feedbackList = document.getElementById('recentFeedback');
    feedbackList.innerHTML = '';

    demoFeedback.forEach(feedback => {
        const feedbackItem = document.createElement('div');
        feedbackItem.className = 'feedback-item';
        feedbackItem.innerHTML = `
            <div class="feedback-header">
                <h3>${feedback.eventName}</h3>
                <div class="feedback-rating">
                    ${generateStarRating(feedback.rating)}
                </div>
            </div>
            <p class="feedback-comment">${feedback.comment}</p>
            <p class="feedback-date">
                <i class="fas fa-clock"></i> ${new Date(feedback.timestamp).toLocaleDateString()}
            </p>
        `;
        feedbackList.appendChild(feedbackItem);
    });
}

// Helper function to generate star rating
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    return stars;
}

// Function to handle managing a specific event
function handleEventManage(eventId) {
    window.location.href = `edit-event.html?id=${eventId}`;
}

// Function to handle viewing event details
function viewEventDetails(eventId) {
    window.location.href = `event-details.html?id=${eventId}`;
}

// Function to initialize the dashboard
function initializeDashboard() {
    // Set society name in the welcome message
    fetch(`${window.baseUrl}/api/users/me/`,
        {
            method: "GET",
            headers: {
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}`,
            }
        }
    ).then(response => response.json()).then(data => {
    document.getElementById('handlerName').textContent = data.username;
})
}

// Function to fetch and update dashboard stats
async function updateDashboardStats() {
    console.log('Starting updateDashboardStats...');
    try {
        // Double check that the elements exist before we try to fetch data
        const activeEventsEl = document.getElementById('activeEventsCount');
        const totalAttendeesEl = document.getElementById('totalAttendeesCount');
        const avgRatingEl = document.getElementById('averageRatingValue');
        
        if (!activeEventsEl) console.error('activeEventsCount element not found');
        if (!totalAttendeesEl) console.error('totalAttendeesCount element not found');
        if (!avgRatingEl) console.error('averageRatingValue element not found');
        
        // Get token and verify it exists
        const token = localStorage.getItem('access_token');
        console.log('Using token:', token ? 'Token exists' : 'Token missing');
        
        const response = await fetch(`${window.baseUrl}/api/events/handler/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('API Response status:', response.status);
        if (!response.ok) throw new Error(`Failed to fetch stats: ${response.status}`);
        
        const events = await response.json();
        console.log(`Got ${events.length} events from API`);
        
        // Update the stats in the UI
        if (activeEventsEl) {
            activeEventsEl.textContent = events.length;
            console.log(`Updated active events count to ${events.length}`);
        }
        
        // Calculate total attendees
        const totalAttendees = events.reduce((sum, event) => {
            console.log(`Event ${event.name}: ${event.attendee_count || 0} attendees`);
            return sum + (event.attendee_count || 0);
        }, 0);
        
        if (totalAttendeesEl) {
            totalAttendeesEl.textContent = totalAttendees;
            console.log(`Updated total attendees to ${totalAttendees}`);
        }
        
        // Calculate average rating if available
        let avgRating = 0;
        let ratedEvents = 0;
        events.forEach(event => {
            if (event.average_rating) {
                avgRating += parseFloat(event.average_rating);
                ratedEvents++;
                console.log(`Event ${event.name} rating: ${event.average_rating}`);
            }
        });
        
        const finalRating = ratedEvents > 0 ? (avgRating / ratedEvents).toFixed(1) : 'N/A';
        if (avgRatingEl) {
            avgRatingEl.textContent = finalRating;
            console.log(`Updated average rating to ${finalRating}`);
        }
        
    } catch (error) {
        console.error('Failed to update stats:', error);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Test direct DOM update
    
    // Load user data and initialize the dashboard
    initializeDashboard();    // Populate sections with dynamic data
    populateRecentEvent(); // Now shows all hosted events
    populateUpcomingTasks();
    updateDashboardStats(); // Updates the stats dynamically
    // Add event listeners for the manage buttons after content is loaded
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('event-manage-btn') || e.target.parentElement.classList.contains('event-manage-btn')) {
            const button = e.target.classList.contains('event-manage-btn') ? e.target : e.target.parentElement;
            const eventId = button.dataset.eventId;
            window.location.href = `edit-event.html?id=${eventId}`;
            e.stopPropagation(); // Prevent the card click from triggering
        }
    });

    // Add logout handler
    document.getElementById('logout-btn').addEventListener('click', () => {
        // Clear any stored auth data
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_type');
        localStorage.removeItem('user_id');
        
        // Redirect to login page
        window.location.href = 'login.html';
    }
    
    );
});