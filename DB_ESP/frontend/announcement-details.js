// Sample announcement data - in a real application, this would come from an API
const demoAnnouncement = {
    id: 123,
    title: "Annual Community Festival 2025",
    category: "Community",
    content: `
        <p>We're excited to announce our Annual Community Festival scheduled for May 15-17, 2025 at Central Park.</p>
        
        <p>This year's festival will feature:</p>
        <ul>
            <li>Live music performances from local artists</li>
            <li>Food stalls representing cuisines from around the world</li>
            <li>Art exhibitions and interactive workshops</li>
            <li>Activities for children and families</li>
            <li>Evening light shows and performances</li>
        </ul>
        
        <p>The event aims to bring together community members of all ages and backgrounds for a weekend of fun, creativity, and connection.</p>
        
        <h3>Schedule Highlights:</h3>
        <p><strong>Friday, May 15:</strong> Opening ceremony (4 PM), Evening concert (7 PM - 10 PM)</p>
        <p><strong>Saturday, May 16:</strong> Workshops and exhibitions (10 AM - 6 PM), Cultural performances (7 PM - 10 PM)</p>
        <p><strong>Sunday, May 17:</strong> Family day activities (10 AM - 5 PM), Closing celebration (6 PM - 8 PM)</p>
        
        <p>We encourage everyone to RSVP to help us prepare adequately for the expected turnout. Volunteers are also welcome - please indicate your interest in the comments or reach out directly.</p>
        
        <p>Looking forward to celebrating with all of you!</p>
    `,
    author: "Community Events Team",
    date: "April 5, 2025",
    comments: [
        {
            id: 1,
            author: "Jane Doe",
            date: "April 6, 2025",
            text: "Looking forward to this! Will there be parking available nearby?"
        },
        {
            id: 2,
            author: "John Smith",
            date: "April 7, 2025",
            text: "I attended last year's festival and it was amazing. Can't wait for this one!"
        }
    ]
};

// Sample related announcements
const relatedAnnouncements = [
    {
        id: 124,
        title: "Volunteer Sign-up for Annual Festival",
        category: "Community",
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
    titleBreadcrumb: document.getElementById('announcement-title-breadcrumb'),
    category: document.getElementById('category-badge'),
    postDate: document.getElementById('post-date'),
    author: document.getElementById('author'),
    content: document.getElementById('announcement-content'),
    commentsList: document.getElementById('comments-list'),
    commentForm: document.getElementById('comment-form'),
    commentText: document.getElementById('comment-text'),
    relatedAnnouncements: document.getElementById('related-announcements'),
    rsvpButton: document.getElementById('rsvp-button'),
    feedbackButton: document.getElementById('feedback-button'),
    shareButton: document.getElementById('share-button'),
    
    // Modals
    rsvpModal: document.getElementById('rsvpModal'),
    feedbackModal: document.getElementById('feedbackModal'),
    shareModal: document.getElementById('shareModal'),
    
    // Forms
    rsvpForm: document.getElementById('rsvpForm'),
    feedbackForm: document.getElementById('feedbackForm'),
    
    // Share link elements
    shareLink: document.getElementById('shareLink'),
    copyLinkBtn: document.getElementById('copyLinkBtn')
};

// Initialize page
function initPage() {
    loadAnnouncementDetails();
    loadRelatedAnnouncements();
    setupEventListeners();
}

// Load announcement details
function loadAnnouncementDetails() {
    // In a real app, you would fetch data using the announcement ID from the URL
    // For demo purposes, we're using the sample data
    
    // Update announcement details
    elements.title.textContent = demoAnnouncement.title;
    elements.titleBreadcrumb.textContent = demoAnnouncement.title;
    elements.category.textContent = demoAnnouncement.category;
    elements.postDate.textContent = `Posted on ${demoAnnouncement.date}`;
    elements.author.textContent = `by ${demoAnnouncement.author}`;
    elements.content.innerHTML = demoAnnouncement.content;
    
    // Load comments
    loadComments();
    
    // Set share link
    elements.shareLink.value = window.location.href;
}

// Load comments
function loadComments() {
    elements.commentsList.innerHTML = '';
    
    if (demoAnnouncement.comments.length === 0) {
        elements.commentsList.innerHTML = '<p class="no-comments">No comments yet. Be the first to comment!</p>';
        return;
    }
    
    demoAnnouncement.comments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        commentElement.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">${comment.author}</span>
                <span class="comment-date">${comment.date}</span>
            </div>
            <div class="comment-content">
                <p>${comment.text}</p>
            </div>
            <div class="comment-actions">
                <button class="comment-reply-btn">Reply</button>
                <button class="comment-like-btn">Like</button>
            </div>
        `;
        elements.commentsList.appendChild(commentElement);
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
            <a href="announcement-details.html?id=${announcement.id}" class="read-more">Read more</a>
        `;
        elements.relatedAnnouncements.appendChild(announcementElement);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Close buttons for modals
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });
    
    // When the user clicks anywhere outside of the modal, close it
    window.addEventListener('click', function(event) {
        document.querySelectorAll('.modal').forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Open modals
    elements.rsvpButton.addEventListener('click', function() {
        elements.rsvpModal.style.display = 'block';
    });
    
    elements.feedbackButton.addEventListener('click', function() {
        elements.feedbackModal.style.display = 'block';
    });
    
    elements.shareButton.addEventListener('click', function() {
        elements.shareModal.style.display = 'block';
    });
    
    // Form submissions
    elements.commentForm.addEventListener('submit', handleCommentSubmission);
    elements.rsvpForm.addEventListener('submit', handleRsvpSubmission);
    elements.feedbackForm.addEventListener('submit', handleFeedbackSubmission);
    
    // Copy link button
    elements.copyLinkBtn.addEventListener('click', copyShareLink);
    
    // Social share buttons
    document.querySelectorAll('.share-option').forEach(button => {
        button.addEventListener('click', handleSocialShare);
    });
}

// Handle comment submission
function handleCommentSubmission(event) {
    event.preventDefault();
    
    const commentText = elements.commentText.value.trim();
    
    if (!commentText) {
        alert('Please enter a comment.');
        return;
    }
    
    // In a real app, you would send this data to the server
    // For demo purposes, we'll just add it to our local data
    
    const newComment = {
        id: demoAnnouncement.comments.length + 1,
        author: 'Current User', // In a real app, this would be the logged-in user
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        text: commentText
    };
    
    demoAnnouncement.comments.push(newComment);
    loadComments();
    
    // Clear the form
    elements.commentText.value = '';
    
    // Show confirmation
    alert('Your comment has been posted.');
}

// Handle RSVP submission
function handleRsvpSubmission(event) {
    event.preventDefault();
    
    const attendancePlan = document.getElementById('attendancePlan').value;
    const additionalComments = document.getElementById('additionalComments').value;
    
    if (!attendancePlan) {
        alert('Please select whether you plan to attend.');
        return;
    }
    
    // In a real app, you would send this data to the server
    // For demo purposes, we'll just show an alert
    
    alert(`Thank you for your RSVP! Your response (${attendancePlan}) has been recorded.`);
    
    // Close the modal
    elements.rsvpModal.style.display = 'none';
    
    // Reset form
    event.target.reset();
}

// Handle feedback submission
function handleFeedbackSubmission(event) {
    event.preventDefault();
    
    const feedbackText = document.getElementById('feedbackText').value.trim();
    
    if (!feedbackText) {
        alert('Please enter your feedback.');
        return;
    }
    
    // In a real app, you would send this data to the server
    // For demo purposes, we'll just show an alert
    
    alert('Thank you for your feedback! We appreciate your input.');
    
    // Close the modal
    elements.feedbackModal.style.display = 'none';
    
    // Reset form
    event.target.reset();
}

// Copy share link
function copyShareLink() {
    elements.shareLink.select();
    document.execCommand('copy');
    
    // Show feedback
    const originalText = elements.copyLinkBtn.innerHTML;
    elements.copyLinkBtn.innerHTML = '<i class="fas fa-check"></i>';
    
    setTimeout(() => {
        elements.copyLinkBtn.innerHTML = originalText;
    }, 2000);
}

// Handle social sharing
function handleSocialShare(event) {
    const platform = event.currentTarget.classList[1]; // Get platform from class
    const shareUrl = encodeURIComponent(window.location.href);
    const shareTitle = encodeURIComponent(demoAnnouncement.title);
    
    let shareLink;
    
    switch (platform) {
        case 'facebook':
            shareLink = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
            break;
        case 'twitter':
            shareLink = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`;
            break;
        case 'linkedin':
            shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
            break;
        case 'email':
            shareLink = `mailto:?subject=${shareTitle}&body=Check out this announcement: ${window.location.href}`;
            break;
    }
    
    if (shareLink) {
        window.open(shareLink, '_blank');
    }
}

// Get announcement ID from URL
function getAnnouncementIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', initPage);