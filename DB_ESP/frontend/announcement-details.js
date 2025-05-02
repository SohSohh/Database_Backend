// Sample announcement data
const demoAnnouncement = {
    id: 123,
    title: "Annual Community Festival 2025",
    category: "Event",
    content: `
        <p>We're excited to announce our Annual Community Festival scheduled for May 15-17, 2025 at Central Park. This year's festival promises to be bigger and better than ever before!</p>
        
        <h2>Event Highlights</h2>
        <ul>
            <li>Live music performances from local artists</li>
            <li>Food stalls representing cuisines from around the world</li>
            <li>Art exhibitions and interactive workshops</li>
            <li>Activities for children and families</li>
            <li>Evening light shows and performances</li>
        </ul>
        
        <h2>Schedule</h2>
        <p><strong>Friday, May 15:</strong> Opening ceremony (4 PM), Evening concert (7 PM - 10 PM)</p>
        <p><strong>Saturday, May 16:</strong> Workshops and exhibitions (10 AM - 6 PM), Cultural performances (7 PM - 10 PM)</p>
        <p><strong>Sunday, May 17:</strong> Family day activities (10 AM - 5 PM), Closing celebration (6 PM - 8 PM)</p>
        
        <h2>Location & Parking</h2>
        <p>The event will take place at Central Park, with multiple entry points and designated parking areas. Shuttle services will be available from nearby parking lots.</p>
        
        <h2>Volunteer Opportunities</h2>
        <p>We're looking for enthusiastic volunteers to help make this event a success. Various roles are available, from event setup to guest assistance.</p>
    `,
    author: "Community Events Team",
    date: "April 5, 2025",
    feedbacks: [
        {
            id: 1,
            author: "Sarah Johnson",
            date: "April 6, 2025",
            rating: 5,
            text: "Looking forward to this! The lineup looks amazing, especially the evening performances. Will there be any vegan food options available?"
        },
        {
            id: 2,
            author: "Michael Chen",
            date: "April 7, 2025",
            rating: 4,
            text: "Great initiative! I attended last year's festival and it was fantastic. The art exhibitions were particularly impressive. Hoping for more interactive workshops this year."
        },
        {
            id: 3,
            author: "Emma Rodriguez",
            date: "April 8, 2025",
            rating: 5,
            text: "This is exactly what our community needs! I've already signed up to volunteer. The schedule looks well-planned, especially the family-friendly activities on Sunday."
        }
    ],
    attendeeCount: 2,
    rsvp: {
        attending: 3,
        pending: 2,
        notAttending: 1
    }
};

// Calculate average rating
function calculateAverageRating(feedbacks) {
    if (!feedbacks.length) return 0;
    const sum = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
    return sum / feedbacks.length;
}

// Format rating as stars
function formatRatingStars(rating) {
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
}

// Format current date
function formatCurrentDate() {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    const date = new Date();
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// Add new feedback
function addNewFeedback(rating, text) {
    const newFeedback = {
        id: demoAnnouncement.feedbacks.length + 1,
        author: "Current User", // In a real app, this would be the logged-in user's name
        date: formatCurrentDate(),
        rating: parseInt(rating),
        text: text
    };

    // Add to the feedbacks array
    demoAnnouncement.feedbacks.unshift(newFeedback); // Add to the beginning

    // Create and add the new feedback element
    const feedbackElement = document.createElement('div');
    feedbackElement.className = 'comment-item';
    feedbackElement.innerHTML = `
        <div class="comment-header">
            <div class="comment-author">${newFeedback.author}</div>
            <div class="comment-date">${newFeedback.date}</div>
        </div>
        <div class="comment-rating">
            ${formatRatingStars(newFeedback.rating)}
        </div>
        <div class="comment-text">${newFeedback.text}</div>
    `;

    // Add animation class
    feedbackElement.style.opacity = '0';
    feedbackElement.style.transform = 'translateY(20px)';

    // Insert at the beginning of the list
    elements.feedbacksList.insertBefore(feedbackElement, elements.feedbacksList.firstChild);

    // Trigger animation
    setTimeout(() => {
        feedbackElement.style.transition = 'all 0.5s ease';
        feedbackElement.style.opacity = '1';
        feedbackElement.style.transform = 'translateY(0)';
    }, 50);

    // Update overall rating
    const averageRating = calculateAverageRating(demoAnnouncement.feedbacks);
    elements.overallRating.textContent = formatRatingStars(averageRating);
    elements.ratingCount.textContent = `(${demoAnnouncement.feedbacks.length} reviews)`;

    // Show success message
    showSuccessMessage();
}

// Show success message
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

    // Animate in
    setTimeout(() => {
        successMessage.style.opacity = '1';
        successMessage.style.transform = 'translateY(0)';
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
        successMessage.style.opacity = '0';
        successMessage.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            document.body.removeChild(successMessage);
        }, 300);
    }, 3000);
}

// Show success message for RSVP
function showRSVPSuccessMessage() {
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = 'Thank you for your RSVP!';
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

    // Animate in
    setTimeout(() => {
        successMessage.style.opacity = '1';
        successMessage.style.transform = 'translateY(0)';
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
        successMessage.style.opacity = '0';
        successMessage.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            document.body.removeChild(successMessage);
        }, 300);
    }, 3000);
}

// Sample related announcements
const relatedAnnouncements = [
    {
        id: 124,
        title: "Volunteer Sign-up for Annual Festival",
        category: "Event",
        date: "April 8, 2025",
        excerpt: "We're looking for volunteers to help with various aspects of the upcoming Annual Community Festival."
    },
    {
        id: 125,
        title: "Art Submissions for Festival Exhibition",
        category: "Arts",
        date: "April 7, 2025",
        excerpt: "Local artists are invited to submit their work for display at the Annual Community Festival's art exhibition."
    },
    {
        id: 126,
        title: "Food Vendor Applications Open",
        category: "Business",
        date: "April 6, 2025",
        excerpt: "Food vendors can now apply for a booth at this year's Annual Community Festival."
    }
];

// DOM elements
const elements = {
    title: document.getElementById('announcement-title'),
    category: document.getElementById('category-badge'),
    postDate: document.getElementById('post-date'),
    author: document.getElementById('author'),
    content: document.getElementById('announcement-content'),
    feedbacksList: document.getElementById('comments-list'),
    feedbackForm: document.getElementById('comment-form'),
    feedbackText: document.getElementById('comment-text'),
    relatedAnnouncements: document.getElementById('related-announcements'),
    rsvpButton: document.getElementById('rsvp-button'),
    shareButton: document.getElementById('share-button'),
    overallRating: document.querySelector('.stars'),
    ratingCount: document.querySelector('.rating-count'),
    
    // Share Modal
    shareModal: document.getElementById('shareModal'),
    shareLink: document.getElementById('shareLink'),
    copyLinkBtn: document.getElementById('copyLinkBtn'),
    
    // RSVP Modal
    rsvpModal: document.getElementById('rsvpModal'),
    rsvpForm: document.getElementById('rsvpForm'),
    rsvpOptions: document.querySelectorAll('.rsvp-option')
};

// Initialize page
function initPage() {
    loadAnnouncementDetails();
    loadRelatedAnnouncements();
    setupEventListeners();
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

// Load feedbacks
function loadFeedbacks() {
    elements.feedbacksList.innerHTML = '';
    
    demoAnnouncement.feedbacks.forEach(feedback => {
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
        elements.feedbacksList.appendChild(feedbackElement);
    });
}

// Load related announcements
function loadRelatedAnnouncements() {
    elements.relatedAnnouncements.innerHTML = '';
    
    relatedAnnouncements.forEach(announcement => {
        const announcementElement = document.createElement('div');
        announcementElement.className = 'related-announcement-card';
        announcementElement.innerHTML = `
            <div class="card-category">${announcement.category}</div>
            <h4><a href="announcement-details.html?id=${announcement.id}">${announcement.title}</a></h4>
            <p class="card-date">${announcement.date}</p>
            <p class="card-excerpt">${announcement.excerpt}</p>
            <a href="announcement-details.html?id=${announcement.id}" class="read-more">Read more <i class="fas fa-arrow-right"></i></a>
        `;
        elements.relatedAnnouncements.appendChild(announcementElement);
    });
}

// Setup event listeners
function setupEventListeners() {
    // RSVP button click
    elements.rsvpButton.addEventListener('click', function() {
        if (demoAnnouncement.category.toLowerCase() === 'event') {
            // Show RSVP modal
            elements.rsvpModal.style.display = 'block';
        } else {
            showSuccessMessage('Thank you for your interest!');
        }
    });
    
    // RSVP option selection
    elements.rsvpOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from all options
            elements.rsvpOptions.forEach(opt => opt.classList.remove('selected'));
            // Add selected class to clicked option
            this.classList.add('selected');
        });
    });

    // RSVP form submission
    elements.rsvpForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const selectedOption = document.querySelector('.rsvp-option.selected');
        if (!selectedOption) {
            alert('Please select your attendance status');
            return;
        }
        const value = selectedOption.dataset.value;
        if (value === 'yes') {
            demoAnnouncement.rsvp.attending += 1;
        } else if (value === 'maybe') {
            demoAnnouncement.rsvp.pending += 1;
        } else if (value === 'no') {
            demoAnnouncement.rsvp.notAttending += 1;
        }
        updateRSVPCounters();
        showRSVPSuccessMessage();
        elements.rsvpModal.style.display = 'none';
        document.querySelector('.rsvp-option.selected')?.classList.remove('selected');
    });

    // Feedback form submission
    elements.feedbackForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const rating = document.querySelector('input[name="rating"]:checked')?.value;
        const feedbackText = elements.feedbackText.value.trim();
        
        if (!rating) {
            alert('Please select a rating');
            return;
        }
        
        if (!feedbackText) {
            alert('Please enter your feedback');
            return;
        }
        
        // Add the new feedback
        addNewFeedback(rating, feedbackText);
        
        // Clear form
        elements.feedbackText.value = '';
        document.querySelector('input[name="rating"]:checked').checked = false;
    });

    // Share button click
    elements.shareButton.addEventListener('click', function() {
        elements.shareModal.style.display = 'block';
        elements.shareLink.value = window.location.href;
    });

    // Share options click handlers
    document.querySelectorAll('.share-option').forEach(button => {
        button.addEventListener('click', function() {
            const platform = this.classList[1];
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent(demoAnnouncement.title);
            
            let shareUrl;
            switch (platform) {
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                    break;
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                    break;
                case 'linkedin':
                    shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                    break;
                case 'email':
                    shareUrl = `mailto:?subject=${title}&body=Check out this event: ${window.location.href}`;
                    break;
            }
            
            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
            }
        });
    });

    // Copy link button click
    elements.copyLinkBtn.addEventListener('click', function() {
        elements.shareLink.select();
        document.execCommand('copy');
        
        // Show copy success message
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            this.innerHTML = originalText;
        }, 2000);
        
        showSuccessMessage('Link copied to clipboard!');
    });

    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
            // Reset RSVP form if it's the RSVP modal
            if (event.target === elements.rsvpModal) {
                elements.rsvpForm.reset();
                document.querySelector('.rsvp-option.selected')?.classList.remove('selected');
            }
        }
    });

    // Close modal when clicking close button
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
            // Reset RSVP form if it's the RSVP modal
            if (modal === elements.rsvpModal) {
                elements.rsvpForm.reset();
                document.querySelector('.rsvp-option.selected')?.classList.remove('selected');
            }
        });
    });
}

// On page load or after RSVP, update the UI:
function updateRSVPCounters() {
    document.getElementById('attending-count').textContent = demoAnnouncement.rsvp.attending;
    document.getElementById('pending-count').textContent = demoAnnouncement.rsvp.pending;
    document.getElementById('not-attending-count').textContent = demoAnnouncement.rsvp.notAttending;
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', initPage);