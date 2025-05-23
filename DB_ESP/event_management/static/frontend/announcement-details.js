// Ensure the global API_BASE_URL is loaded
if (!window.API_BASE_URL) {
    throw new Error('API_BASE_URL is not defined. Make sure config.js is loaded before this script.');
}

let currentAttendanceStatus = false;

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
async function addNewFeedback(rating, text) {
    const eventId = new URLSearchParams(window.location.search).get('id');
    
    try {
        const response = await fetch(`${window.API_BASE_URL}/events/${eventId}/comments/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({
                content: text,
                rating: parseInt(rating)
            })
        });

        if (!response.ok) throw new Error('Failed to add comment');

        // Reload comments to show the new one
        await loadFeedbacks(eventId);
        showSuccessMessage('Thank you for your feedback!');

    } catch (error) {
        showError('Failed to add feedback');
    }
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
    banner: document.getElementById('announcement-banner'),
    category: document.getElementById('category-badge'),
    postDate: document.getElementById('post-date'),
    metaInfo: document.querySelector('.meta-info'), // Added for animation
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

// Helper function to wrap letters in spans for animation
function wrapChars(element) {
    if (!element || !element.textContent) return;
    element.innerHTML = element.textContent.replace(/\S/g, "<span class='char'>$&</span>");
}

// Load announcement details
async function loadAnnouncementDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    
    if (!eventId) {
        showError('Event ID not found');
        return;
    }

    try {
        // First, fetch available categories
        const categoriesResponse = await fetch(`${window.API_BASE_URL}/events/categories/`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        const categories = await categoriesResponse.json();
        
        // Then fetch event details
        const response = await fetch(`${window.API_BASE_URL}/events/${eventId}/`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch event details');
        const event = await response.json();

        // Update UI with event details
        elements.title.textContent = event.name;
        
        // Set banner image if available
        if (event.banner) {
            document.getElementById('announcement-banner').style.backgroundImage = `url(${event.banner})`;
        } else {
            // Use a default banner if no image is provided
            document.getElementById('announcement-banner').style.backgroundImage = `url('static/images/placeholder.png')`;
        }
        
        // Set category badge text directly from the API response
        elements.category.textContent = event.category_name;
        elements.category.style.backgroundColor = '#002366';
        elements.category.style.color = 'white';
        elements.category.style.padding = '4px 12px';
        elements.category.style.borderRadius = '16px';
        elements.category.style.fontSize = '0.875rem';
        elements.category.style.fontWeight = '500';
        elements.category.style.fontFamily = 'Retro Floral';
        
          elements.postDate.textContent = `Posted on ${new Date(event.created_at).toLocaleDateString()}`;        // Make the host name clickable with selectable menu option
        if (event.host_id && event.host_username) {
            // Create a more interactive and obvious clickable host section
            elements.author.innerHTML = `by <div class="host-info">
                <span class="host-link">${event.host_username}</span>
                <div class="host-options">
                    <a href="society-details.html?id=${event.host_id}" class="view-host-btn">
                        <i class="fas fa-building"></i> View Society Profile
                    </a>
                    <a href="events.html?host=${event.host_id}" class="view-host-btn">
                        <i class="fas fa-calendar-alt"></i> View All Events
                    </a>
                </div>
            </div>`;
            
            console.log(`Created interactive host element for society ID: ${event.host_id}`);
            
            // Add click event to toggle options visibility
            setTimeout(() => {
                const hostLink = document.querySelector('.host-link');
                if (hostLink) {
                    hostLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const hostOptions = e.currentTarget.parentNode.querySelector('.host-options');
                        hostOptions.classList.toggle('active');
                    });
                }
            }, 100);
        } else if (event.host_username) {
            elements.author.textContent = `by ${event.host_username}`;
            console.log("Host username present but no ID available for link");
        } else {
            elements.author.textContent = `by Unknown Host`;
            console.log("No host information available");
        }        
        
        // Format and enhance the description content// Process the description to add better formatting
        let formattedContent = event.description;
        
        // Set start/end time if available
        const startTime = event.start_time ? event.start_time : '--:--';
        const endTime = event.end_time ? event.end_time : '--:--';
        document.getElementById('event-start-time').textContent = startTime;
        document.getElementById('event-end-time').textContent = endTime;
        
        // Convert line breaks to proper paragraphs if not already formatted as HTML
        if (!formattedContent.includes('<p>') && !formattedContent.includes('<h')) {
            // Split by double line breaks for paragraphs
            formattedContent = formattedContent
                .replace(/\n\n/g, '</p><p>')
                .replace(/\n/g, '<br>')
                .replace(/^(.+)$/m, '<p>$1</p>');
                
            // Basic pattern detection for headings (e.g., lines ending with colon or all caps lines)
            formattedContent = formattedContent
                .replace(/<p>([A-Z][^<>]{0,40}:)<\/p>/g, '<h2>$1</h2>')
                .replace(/<p>([A-Z][^a-z<>]{5,50})<\/p>/g, '<h2>$1</h2>');
                
            // Look for patterns that look like lists and format them properly
            formattedContent = formattedContent.replace(/<p>(\s*[-•*]\s+.+?)<\/p>/g, '<ul><li>$1</li></ul>');
            formattedContent = formattedContent.replace(/<\/ul>\s*<ul>/g, '');
            formattedContent = formattedContent.replace(/<li>([-•*]\s+)(.*?)(<br>[-•*]\s+.*?)*<\/li>/g, function(match) {
                return match.replace(/<br>[-•*]\s+/g, '</li><li>');
            });
        }
        
        const formattedDescription = `
            <div class="content-section visible">
                ${formattedContent}
            </div>
        `;
        elements.content.innerHTML = formattedDescription;
        elements.content.style.fontFamily = 'Retro Floral';

        // Show RSVP button only if category is NOT announcement
        elements.rsvpButton.style.display = 
            event.category_name?.toLowerCase() === 'announcement' ? 'none' : 'inline-block';

        // Update attendance count - ensuring it's a number
        const attendeeCount = typeof event.attendee_count === 'number' ? event.attendee_count : 0;
        document.getElementById('attending-count').textContent = attendeeCount;

        // Update attendance status
        updateAttendanceButton(event.is_attending);

        // Load comments
        await loadFeedbacks(eventId);

        // Trigger animations for title and meta info
        if (elements.title) {
            requestAnimationFrame(() => {
                elements.title.classList.add('in-view');
            });
        }
        if (elements.metaInfo) {
            elements.metaInfo.classList.add('in-view');
        }
        
    } catch (error) {
        showError('Failed to load event details');
        console.error(error);
    }
}

// Load feedbacks (comments)
async function loadFeedbacks(eventId) {
    try {
        const response = await fetch(`${window.API_BASE_URL}/events/${eventId}/comments/`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch comments');
        const comments = await response.json();

        elements.feedbacksList.innerHTML = '';
        comments.forEach(comment => {
            const feedbackElement = document.createElement('div');
            feedbackElement.className = 'comment-item';
            feedbackElement.innerHTML = `
                <div class="comment-header">
                    <div class="comment-author">${comment.user_username}</div>
                    <div class="comment-date">${new Date(comment.created_at).toLocaleDateString()}</div>
                </div>
                <div class="comment-rating">
                    ${formatRatingStars(comment.rating)}
                </div>
                <div class="comment-text">${comment.content}</div>
            `;
            elements.feedbacksList.appendChild(feedbackElement);
        });

        // Update overall rating
        const ratingResponse = await fetch(`${window.API_BASE_URL}/events/${eventId}/rating/`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (ratingResponse.ok) {
            const ratingData = await ratingResponse.json();
            elements.overallRating.textContent = formatRatingStars(ratingData.average_rating);
            elements.ratingCount.textContent = `(${ratingData.rating_count} reviews)`;
        }

    } catch (error) {
        showError('Failed to load comments');
    }
}

// Handle attendance
async function handleAttendance(action) {
    const eventId = new URLSearchParams(window.location.search).get('id');
    
    try {
        const response = await fetch(`${window.API_BASE_URL}/events/${eventId}/attendance/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({ action })
        });
        
        if (!response.ok) throw new Error('Failed to update attendance');
        
        const result = await response.json();
        updateAttendanceButton(action === 'attend');
        updateAttendeeCount(result.attendee_count);
        showRSVPSuccessMessage();
        
    } catch (error) {
        showError('Failed to update attendance');
    }
}

// Load related announcements
async function loadRelatedAnnouncements() {
    try {
        const currentEventId = new URLSearchParams(window.location.search).get('id');
        const response = await fetch(`${window.API_BASE_URL}/events/?ordering=date`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch related events');
        
        const events = await response.json();
        const relatedEvents = events
            .filter(event => event.id !== parseInt(currentEventId))
            .slice(0, 3);

        elements.relatedAnnouncements.innerHTML = '';

        // Create and append the grid container
        const gridContainer = document.createElement('div');
        gridContainer.className = 'related-grid';
        elements.relatedAnnouncements.appendChild(gridContainer);

        relatedEvents.forEach((event, index) => {
            const announcementElement = document.createElement('div');
            announcementElement.className = 'event-card'; // Use 'event-card' to match CSS
            // Set CSS custom property for staggered animation
            announcementElement.style.setProperty('--animation-order', index + 1);
            
            const eventName = event.name || 'Untitled Event';
            const categoryName = event.category_name || 'General';
            // Assuming 'event.date' is provided by the API as per 'ordering=date'.
            // Fallback to 'event.created_at' or a default string if 'event.date' is not available.
            const displayDate = event.date 
                ? new Date(event.date).toLocaleDateString() 
                : (event.created_at ? new Date(event.created_at).toLocaleDateString() : 'Date N/A');
            
            let excerpt = 'No description available.';
            if (event.description) {
                excerpt = event.description.length > 100 ? event.description.substring(0, 97) + '...' : event.description;
            }

            // Updated innerHTML to match the CSS structure for .event-card and its children
            // This ensures .event-content provides padding and other styles apply correctly.
            announcementElement.innerHTML = `
                <div class="event-category">${categoryName}</div>
                <div class="event-content">
                    <h5 class="event-title"><a href="announcement-details.html?id=${event.id}">${eventName}</a></h5>
                    <p class="event-date"><i class="fas fa-calendar-alt"></i> ${displayDate}</p>
                    <p class="event-description">${excerpt}</p>
                    <div class="event-footer">
                         <a href="announcement-details.html?id=${event.id}" class="read-more-btn">Read More <i class="fas fa-arrow-right"></i></a>
                    </div>
                </div>
            `;
            gridContainer.appendChild(announcementElement); // Append cards to the grid container
            // Add the 'visible' class to trigger the CSS animation and make the card appear
            requestAnimationFrame(() => {
                announcementElement.classList.add('visible');
            });
        });
    } catch (error) {
        showError('Failed to load related events');
    }
}

// Show error message
function showError(message) {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;
    errorMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--error-color, #ff4444);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 1000;
    `;
    document.body.appendChild(errorMessage);
    setTimeout(() => errorMessage.remove(), 3000);
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
    elements.rsvpForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const selectedOption = document.querySelector('.rsvp-option.selected');
        if (!selectedOption) {
            alert('Please select your attendance status');
            return;
        }

        const value = selectedOption.dataset.value;
        try {
            // Only send attendance request if user selects "yes"
            if (value === 'yes') {
                await handleAttendance('attend');
            } else if (currentAttendanceStatus) {
                // If user was attending and now selects "no" or "maybe", unattend
                await handleAttendance('unattend');
            }
            
            elements.rsvpModal.style.display = 'none';
            document.querySelector('.rsvp-option.selected')?.classList.remove('selected');
            showRSVPSuccessMessage();
        } catch (error) {
            showError('Failed to update attendance status');
        }
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
    });    // Close host options and modals when clicking outside
    window.addEventListener('click', function(event) {
        // Close host options dropdown when clicking elsewhere
        const hostOptions = document.querySelector('.host-options.active');
        if (hostOptions && !event.target.closest('.host-info')) {
            hostOptions.classList.remove('active');
        }
        
        // Close modals when clicking outside
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

function updateAttendanceButton(isAttending) {
    currentAttendanceStatus = isAttending;
    const rsvpButton = elements.rsvpButton;
    if (isAttending) {
        rsvpButton.innerHTML = '<i class="fas fa-calendar-check"></i> Attending';
        rsvpButton.classList.add('attending');
    } else {
        rsvpButton.innerHTML = '<i class="fas fa-calendar-check"></i> RSVP';
        rsvpButton.classList.remove('attending');
    }
}

function updateAttendeeCount(count) {
    document.getElementById('attending-count').textContent = count;
}