// Global variables
window.baseUrl = "http://localhost:8000";



// Demo data for events

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

// Function to populate recent event (single)
function populateRecentEvent() {
    const eventsGrid = document.getElementById('recentEvents');
    eventsGrid.innerHTML = '';

    // Get the most recent event

    fetch(`${window.baseUrl}/api/events/handler?ordering=date/`,
        {
            method: "GET",
            headers: {
                'Content-Type': 'application/json', 
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjo0ODk5OTA2NDAxLCJpYXQiOjE3NDYzMDY0MDEsImp0aSI6ImNjZmEzZTFiMmU2YTRjZmU4YzU4M2FiYjAwYmNmMjcwIiwidXNlcl9pZCI6OX0.uolpG4ckeSk3iwSWG_GmxJShZ6tU5Eufgc1sEqmwe9c',
            }
        }
    ).then(response => response.json()).then(data => {
        const recentEvent = data[0]; // For demo, using first event. In real app, sort by date
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        eventCard.innerHTML = `
            <div class="event-image">
                <img src="${recentEvent.banner || '/static/images/placeholder.png'}" 
                alt="${recentEvent.name}" 
                onerror="this.onerror=null;this.src='/static/images/placeholder.png';">

            </div>
            <div class="event-details">
                <h3>${recentEvent.name}</h3>
                <p class="event-date">
                    <i class="fas fa-calendar"></i> ${new Date(recentEvent.date).toLocaleDateString()}
                    <i class="fas fa-clock"></i> ${recentEvent.start_time}
                </p>
                <p class="event-location">
                    <i class="fas fa-map-marker-alt"></i> ${recentEvent.location}
                </p>
                <p class="event-description">${recentEvent.description}</p>
                <div class="event-stats">
                    <span class="event-capacity">
                        <i class="fas fa-users"></i> ${recentEvent.attendee_count} attendees
                    </span>
                </div>
                <div class="event-actions">
                    <button class="btn btn-primary" onclick="window.location.href='edit-event.html?id=${recentEvent.id}'">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </div>
            </div>
        `;
        eventsGrid.appendChild(eventCard);
            
        })
    
    
}

// Function to populate all events
function populateAllEvents() {
    const eventsGrid = document.getElementById('allEvents');
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

// Function to toggle all events section
function toggleAllEvents() {
    const allEventsSection = document.getElementById('allEventsSection');
    if (allEventsSection.style.display === 'none') {
        allEventsSection.style.display = 'block';
        populateAllEvents();
    } else {
        allEventsSection.style.display = 'none';
    }
}

// Function to populate upcoming tasks
function populateUpcomingTasks() {
    const tasksList = document.getElementById('upcomingTasks');
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

// Function to populate society events
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

// Function to show society events section
function showSocietyEvents() {
    const societyEventsSection = document.getElementById('societyEventsSection');
    societyEventsSection.style.display = 'block'; // Make sure this is working
    populateSocietyEvents();
    
    // Scroll to the section
    societyEventsSection.scrollIntoView({ behavior: 'smooth' });
}

// Function to initialize the dashboard
function initializeDashboard() {
    // Set society name in the welcome message
    fetch(`${window.baseUrl}/api/users/me/`,
        {
            method: "GET",
            headers: {
                'Content-Type': 'application/json', 
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjo0ODk5OTA2NDAxLCJpYXQiOjE3NDYzMDY0MDEsImp0aSI6ImNjZmEzZTFiMmU2YTRjZmU4YzU4M2FiYjAwYmNmMjcwIiwidXNlcl9pZCI6OX0.uolpG4ckeSk3iwSWG_GmxJShZ6tU5Eufgc1sEqmwe9c',
            }
        }
    ).then(response => response.json()).then(data => {
    document.getElementById('handlerName').textContent = data.username;
})
}

// Function to fetch and update dashboard stats
function updateDashboardStats() {
    // Get references to stat number elements
    const activeEventsElement = document.querySelector('.stat-card:nth-child(1) .stat-number');
    const totalAttendeesElement = document.querySelector('.stat-card:nth-child(2) .stat-number');
    const averageRatingElement = document.querySelector('.stat-card:nth-child(3) .stat-number');
    
    // Fetch events data to calculate stats
    fetch(`${window.baseUrl}/api/events/handler?ordering=date/`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json', 
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjo0ODk5OTA2NDAxLCJpYXQiOjE3NDYzMDY0MDEsImp0aSI6ImNjZmEzZTFiMmU2YTRjZmU4YzU4M2FiYjAwYmNmMjcwIiwidXNlcl9pZCI6OX0.uolpG4ckeSk3iwSWG_GmxJShZ6tU5Eufgc1sEqmwe9c',
        }
    })
    .then(response => response.json())
    .then(events => {
        // Calculate active events (events with dates >= today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const activeEvents = events.filter(event => new Date(event.date) >= today);
        activeEventsElement.textContent = activeEvents.length;
        
        // Calculate total attendees across all events
        const totalAttendees = events.reduce((sum, event) => sum + (event.attendee_count || 0), 0);
        totalAttendeesElement.textContent = totalAttendees;

        averageRatingElement.textContent = events[0].average_rating;
    })
    .catch(error => {
        console.error('Error fetching events data:', error);
        activeEventsElement.textContent = "Error";
        totalAttendeesElement.textContent = "Error";
        averageRatingElement.textContent = "Error";
    });
}


/*
Backend Integration Steps:
1. Replace societyData with an API call:
   
   async function fetchSocietyData() {
       try {
           const response = await fetch('/api/society/current', {
               headers: {
                   'Authorization': `Bearer ${getAuthToken()}`
               }
           });
           const data = await response.json();
           return data;
       } catch (error) {
           console.error('Error fetching society data:', error);
           return null;
       }
   }

2. Update the initialization:

   async function initializeDashboard() {
       const society = await fetchSocietyData();
       if (society) {
           document.getElementById('handlerName').textContent = society.name;
       }
   }

3. Add error handling for failed API calls:
   - Show appropriate error messages
   - Implement retry logic if needed
   - Handle session expiration
*/

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();

    // Populate sections
    populateSocietyEvents();
    populateRecentEvent();
    populateUpcomingTasks();
    populateRecentFeedback();
    updateDashboardStats();
    
    // Add this line to populate society events by default


    // Add logout handler
    document.getElementById('logout-btn').addEventListener('click', () => {
        // Clear any stored auth data
        sessionStorage.clear();
        // Redirect to login page
        window.location.href = 'login.html';
    });

    // Check if we need to show society events
    if (window.location.hash === '#society-events') {
        showSocietyEvents();
    }
});