// Demo feedback data
const demoFeedback = [
    {
        id: 1,
        eventId: 1,
        eventName: "Tech Workshop 2024",
        userName: "John Doe",
        rating: 5,
        comment: "Excellent workshop! The content was very informative and well-presented.",
        date: "2024-02-15",
        status: "new"
    },
    {
        id: 2,
        eventId: 1,
        eventName: "Tech Workshop 2024",
        userName: "Jane Smith",
        rating: 4,
        comment: "Great session, but could use more hands-on exercises.",
        date: "2024-02-15",
        status: "read"
    },
    {
        id: 3,
        eventId: 2,
        eventName: "Networking Mixer",
        userName: "Mike Johnson",
        rating: 5,
        comment: "Perfect networking opportunity. Met lots of interesting people!",
        date: "2024-02-10",
        status: "new"
    }
];

// Function to generate star rating HTML
function generateStarRating(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// Function to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Function to populate feedback list
function populateFeedbackList(filter = 'all') {
    const feedbackList = document.getElementById('feedbackList');
    feedbackList.innerHTML = '';

    let filteredFeedback = [...demoFeedback];
    
    // Apply filters
    if (filter === 'recent') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filteredFeedback = filteredFeedback.filter(feedback => 
            new Date(feedback.date) >= oneWeekAgo
        );
    } else if (filter === 'past') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filteredFeedback = filteredFeedback.filter(feedback => 
            new Date(feedback.date) < oneWeekAgo
        );
    }

    if (filteredFeedback.length === 0) {
        feedbackList.innerHTML = `
            <div class="no-feedback">
                <i class="fas fa-comment-slash"></i>
                <p>No feedback found</p>
            </div>
        `;
        return;
    }

    filteredFeedback.forEach(feedback => {
        const feedbackItem = document.createElement('div');
        feedbackItem.className = `feedback-item ${feedback.status}`;
        feedbackItem.innerHTML = `
            <div class="feedback-header">
                <div class="feedback-event">
                    <h3>${feedback.eventName}</h3>
                    <span class="feedback-date">
                        <i class="fas fa-calendar"></i>
                        ${formatDate(feedback.date)}
                    </span>
                </div>
                <div class="feedback-rating">
                    ${generateStarRating(feedback.rating)}
                </div>
            </div>
            <div class="feedback-content">
                <p class="feedback-user">
                    <i class="fas fa-user"></i>
                    ${feedback.userName}
                </p>
                <p class="feedback-comment">${feedback.comment}</p>
            </div>
            ${feedback.status === 'new' ? 
                `<div class="feedback-actions">
                    <button class="btn btn-text" onclick="markAsRead(${feedback.id})">
                        <i class="fas fa-check"></i> Mark as Read
                    </button>
                </div>` : 
                ''
            }
        `;
        feedbackList.appendChild(feedbackItem);
    });

    updateFeedbackStats();
}

// Function to update feedback statistics
function updateFeedbackStats() {
    const totalFeedback = demoFeedback.length;
    const averageRating = (demoFeedback.reduce((sum, feedback) => sum + feedback.rating, 0) / totalFeedback).toFixed(1);
    const uniqueEvents = new Set(demoFeedback.map(feedback => feedback.eventId)).size;

    document.querySelector('.stat-card:nth-child(1) .stat-number').textContent = averageRating;
    document.querySelector('.stat-card:nth-child(2) .stat-number').textContent = totalFeedback;
    document.querySelector('.stat-card:nth-child(3) .stat-number').textContent = uniqueEvents;
}

// Function to mark feedback as read
function markAsRead(feedbackId) {
    const feedback = demoFeedback.find(f => f.id === feedbackId);
    if (feedback) {
        feedback.status = 'read';
        populateFeedbackList(document.getElementById('eventFilter').value);
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Populate initial feedback list
    populateFeedbackList();

    // Add filter change handler
    document.getElementById('eventFilter').addEventListener('change', (e) => {
        populateFeedbackList(e.target.value);
    });

    // Add logout handler
    document.getElementById('logout-btn').addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = 'login.html';
    });
}); 