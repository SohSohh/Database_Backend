// DB_ESP/frontend/announcement-educational.js

// Share Modal Logic
const shareBtn = document.getElementById('share-button');
const shareModal = document.getElementById('shareModal');
const closeShareModal = document.querySelector('.close-modal');
const shareLink = document.getElementById('shareLink');
const copyLinkBtn = document.getElementById('copyLinkBtn');

shareBtn.addEventListener('click', function() {
    shareModal.style.display = 'block';
    shareLink.value = window.location.href;
});

closeShareModal.addEventListener('click', function() {
    shareModal.style.display = 'none';
});

window.addEventListener('click', function(event) {
    if (event.target === shareModal) {
        shareModal.style.display = 'none';
    }
});

copyLinkBtn.addEventListener('click', function() {
    shareLink.select();
    document.execCommand('copy');
    copyLinkBtn.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => {
        copyLinkBtn.innerHTML = '<i class="fas fa-copy"></i>';
    }, 1500);
});

// Demo Feedbacks
const demoFeedbacks = [
    {
        author: "Alice Williams",
        date: "May 11, 2025",
        rating: 5,
        text: "The new course registration process was smooth and easy to follow. Great improvement over last year!"
    },
    {
        author: "Brian Lee",
        date: "May 12, 2025",
        rating: 4,
        text: "Appreciate the clear instructions. Would love to see more elective options in the future."
    },
    {
        author: "Priya Patel",
        date: "May 13, 2025",
        rating: 5,
        text: "Very user-friendly portal. I registered for all my courses in just a few minutes!"
    }
];

// Feedback Logic
let feedbacks = [...demoFeedbacks];

function calculateAverageRating(feedbacks) {
    if (!feedbacks.length) return 0;
    const sum = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
    return sum / feedbacks.length;
}

function formatRatingStars(rating) {
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
}

function formatCurrentDate() {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    const date = new Date();
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function addNewFeedback(rating, text) {
    const newFeedback = {
        author: "Current User",
        date: formatCurrentDate(),
        rating: parseInt(rating),
        text: text
    };
    feedbacks.unshift(newFeedback);
    loadFeedbacks();
    showSuccessMessage();
}

function loadFeedbacks() {
    const feedbacksList = document.getElementById('comments-list');
    feedbacksList.innerHTML = '';
    feedbacks.forEach(feedback => {
        const feedbackElement = document.createElement('div');
        feedbackElement.className = 'comment-item';
        feedbackElement.innerHTML = `
            <div class="comment-header">
                <div class="comment-author">${feedback.author}</div>
                <div class="comment-date">${feedback.date}</div>
            </div>
            <div class="comment-rating">
                ${formatRatingStars(feedback.rating)}
            </div>
            <div class="comment-text">${feedback.text}</div>
        `;
        feedbacksList.appendChild(feedbackElement);
    });
    // Update overall rating
    const averageRating = calculateAverageRating(feedbacks);
    document.getElementById('overall-stars').textContent = formatRatingStars(averageRating);
    document.getElementById('rating-count').textContent = `(${feedbacks.length} reviews)`;
}

function showSuccessMessage() {
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = 'Thank you for your feedback!';
    successMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary-color);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        opacity: 0;
        transform: translateY(-10px);
        transition: all 0.3s ease;
        z-index: 1000;
    `;
    document.body.appendChild(successMessage);
    setTimeout(() => {
        successMessage.style.opacity = '1';
        successMessage.style.transform = 'translateY(0)';
    }, 100);
    setTimeout(() => {
        successMessage.style.opacity = '0';
        successMessage.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            document.body.removeChild(successMessage);
        }, 300);
    }, 3000);
}

// Feedback Form Handler
document.getElementById('comment-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const rating = document.querySelector('input[name="rating"]:checked')?.value;
    const feedbackText = document.getElementById('comment-text').value.trim();
    if (!rating) {
        alert('Please select a rating');
        return;
    }
    if (!feedbackText) {
        alert('Please enter your feedback');
        return;
    }
    addNewFeedback(rating, feedbackText);
    // Clear form
    document.getElementById('comment-text').value = '';
    document.querySelector('input[name="rating"]:checked').checked = false;
});

// Initialize feedbacks on page load
document.addEventListener('DOMContentLoaded', function() {
    loadFeedbacks();
    loadRelatedAnnouncements();
});

// Load related announcements
function loadRelatedAnnouncements() {
    const container = document.getElementById('related-announcements');
    if (!container) return;
    container.innerHTML = '';
    relatedAnnouncements.forEach(announcement => {
        const announcementElement = document.createElement('div');
        announcementElement.className = 'related-announcement-card';
        announcementElement.innerHTML = `
            <div class="card-category">${announcement.category}</div>
            <h4><a href="announcement-educational.html?id=${announcement.id}">${announcement.title}</a></h4>
            <p class="card-date">${announcement.date}</p>
            <p class="card-excerpt">${announcement.excerpt}</p>
            <a href="announcement-educational.html?id=${announcement.id}" class="read-more">Read more <i class="fas fa-arrow-right"></i></a>
        `;
        container.appendChild(announcementElement);
    });
}

// Load announcement details
function loadAnnouncementDetails() {
    // Update announcement details
    elements.title.textContent = demoAnnouncement.title;
    elements.category.textContent = demoAnnouncement.category;
    elements.postDate.textContent = `Posted on ${demoAnnouncement.date}`;
    elements.author.textContent = `by ${demoAnnouncement.author}`;
    elements.content.innerHTML = demoAnnouncement.content;
    
    // Update overall rating
    const averageRating = calculateAverageRating(demoAnnouncement.feedbacks);
    elements.overallRating.textContent = formatRatingStars(averageRating);
    elements.ratingCount.textContent = `(${demoAnnouncement.feedbacks.length} reviews)`;
    
    // Load feedbacks
    loadFeedbacks();
    
    // Set share link
    elements.shareLink.value = window.location.href;

    if (demoAnnouncement.category.toLowerCase() === 'event') {
        document.getElementById('rsvp-counts').style.display = 'inline-flex';
        document.getElementById('attending-count').textContent = demoAnnouncement.rsvp.attending;
        document.getElementById('pending-count').textContent = demoAnnouncement.rsvp.pending;
        document.getElementById('not-attending-count').textContent = demoAnnouncement.rsvp.notAttending;
        elements.rsvpButton.textContent = 'RSVP for this Event';
    } else {
        document.getElementById('rsvp-counts').style.display = 'none';
        elements.rsvpButton.textContent = 'RSVP / Express Interest';
    }
}

// Demo Related Announcements
const relatedAnnouncements = [
    {
        id: 201,
        title: "Exam Schedule Released",
        category: "Educational",
        date: "May 8, 2025",
        excerpt: "The final exam schedule for the semester is now available. Check the portal for your exam dates."
    },
    {
        id: 202,
        title: "Guest Lecture: AI in Education",
        category: "Educational",
        date: "May 6, 2025",
        excerpt: "Join us for a special lecture on the impact of artificial intelligence in modern education."
    },
    {
        id: 203,
        title: "Library Hours Extended",
        category: "Campus",
        date: "May 4, 2025",
        excerpt: "The campus library will have extended hours during the exam period for your convenience."
    }
];