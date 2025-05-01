document.addEventListener('DOMContentLoaded', function() {
    // Check authentication status
    const authToken = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');
    
    updateNavigation(authToken, userType);
    
    // Filter functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    const announcementCards = document.querySelectorAll('.announcement-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get filter value
            const filterValue = button.getAttribute('data-filter');
            
            // Show/hide announcement cards based on filter
            announcementCards.forEach(card => {
                if (filterValue === 'all') {
                    card.style.display = 'flex';
                } else {
                    if (card.getAttribute('data-category') === filterValue) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        });
    });
    
    // Modal functionality
    const feedbackBtns = document.querySelectorAll('.feedback-btn');
    const rsvpBtns = document.querySelectorAll('.rsvp-btn');
    const feedbackModal = document.getElementById('feedbackModal');
    const rsvpModal = document.getElementById('rsvpModal');
    const closeButtons = document.querySelectorAll('.close-modal');
    
    // For feedback buttons
    feedbackBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const announcementTitle = this.closest('.card-content').querySelector('h3').textContent;
            const modalTitle = feedbackModal.querySelector('h2');
            modalTitle.textContent = `Provide Feedback for "${announcementTitle}"`;
            
            feedbackModal.style.display = 'flex';
        });
    });
    
    // For RSVP buttons
    rsvpBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const announcementTitle = this.closest('.card-content').querySelector('h3').textContent;
            const modalTitle = rsvpModal.querySelector('h2');
            modalTitle.textContent = `RSVP for "${announcementTitle}"`;
            
            rsvpModal.style.display = 'flex';
        });
    });
    
    // Close modals
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === feedbackModal) {
            feedbackModal.style.display = 'none';
        }
        if (event.target === rsvpModal) {
            rsvpModal.style.display = 'none';
        }
    });
    
    // Form submissions
    const feedbackForm = document.getElementById('feedbackForm');
    const rsvpForm = document.getElementById('rsvpForm');
    
    feedbackForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const feedback = document.getElementById('feedbackText').value;
        
        // In a real application, send this data to your backend
        console.log('Feedback submitted:', feedback);
        
        // Display success message
        alert('Thank you for your feedback!');
        
        // Reset form and close modal
        this.reset();
        feedbackModal.style.display = 'none';
    });
    
    rsvpForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const attendancePlan = document.getElementById('attendancePlan').value;
        const additionalComments = document.getElementById('additionalComments').value;
        
        // In a real application, send this data to your backend
        console.log('RSVP submitted:', { attendancePlan, additionalComments });
        
        // Display success message
        alert('Your RSVP has been recorded. Thank you!');
        
        // Reset form and close modal
        this.reset();
        rsvpModal.style.display = 'none';
    });
});

function updateNavigation(isLoggedIn, userType) {
    const navLinks = document.querySelector('.nav-links');
    
    if (isLoggedIn) {
        // Remove login and register links if they exist
        const loginLink = document.querySelector('.nav-links li a[href="login.html"]')?.parentNode;
        const registerLink = document.querySelector('.nav-links li a[href="register.html"]')?.parentNode;
        
        if (loginLink) loginLink.remove();
        if (registerLink) registerLink.remove();
        
        // Check if dashboard and logout links already exist before adding
        let dashboardLinkExists = document.querySelector('.nav-links li a[href*="dashboard.html"]');
        let logoutLinkExists = document.querySelector('.nav-links li a#logout-btn');
        
        if (!dashboardLinkExists) {
            // Add dashboard link
            const dashboardLi = document.createElement('li');
            const dashboardLink = document.createElement('a');
            dashboardLink.href = userType === 'handler' ? 'handler-dashboard.html' : 'viewer-dashboard.html';
            dashboardLink.textContent = 'Dashboard';
            dashboardLi.appendChild(dashboardLink);
            navLinks.appendChild(dashboardLi);
        }
        
        if (!logoutLinkExists) {
            // Add logout link
            const logoutLi = document.createElement('li');
            const logoutLink = document.createElement('a');
            logoutLink.href = '#';
            logoutLink.id = 'logout-btn';
            logoutLink.textContent = 'Logout';
            logoutLink.addEventListener('click', function(e) {
                e.preventDefault();
                // Clear auth data
                localStorage.removeItem('authToken');
                localStorage.removeItem('userType');
                localStorage.removeItem('userId');
                // Redirect to home page
                window.location.href = 'index.html';
            });
            logoutLi.appendChild(logoutLink);
            navLinks.appendChild(logoutLi);
        }
        
        // Add create announcement button for handlers
        if (userType === 'handler') {
            const handlerActions = document.createElement('div');
            handlerActions.id = 'handlerActions';
            handlerActions.classList.add('handler-actions');
            
            const addButton = document.createElement('button');
            addButton.id = 'addAnnouncementBtn';
            addButton.classList.add('btn-primary');
            addButton.innerHTML = '<i class="fas fa-plus"></i> Create Announcement';
            
            addButton.addEventListener('click', function() {
                window.location.href = 'create-announcement.html';
            });
            
            handlerActions.appendChiladdButton.addEventListener('click', function() {
                window.location.href = 'create-announcement.html';
            });
            
            handlerActions.appendChild(addButton);
            
            // Insert handler actions before the filter container
            const filterContainer = document.querySelector('.filter-container');
            const announcementsSection = document.querySelector('.announcements-section .container');
            
            if (filterContainer && announcementsSection) {
                announcementsSection.insertBefore(handlerActions, filterContainer);
                
                // Add some styling
                handlerActions.style.display = 'flex';
                handlerActions.style.justifyContent = 'flex-end';
                handlerActions.style.marginBottom = '20px';
            }
        }
    }
}

// Function to create announcement cards dynamically
function createAnnouncementCard(announcement) {
    const card = document.createElement('div');
    card.className = `announcement-card ${announcement.category}`;
    card.setAttribute('data-category', announcement.category);
    
    const categoryLabel = getCategoryLabel(announcement.category);
    
    // Format the date
    const date = new Date(announcement.date);
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Create card structure
    card.innerHTML = `
        <div class="category-tag ${announcement.category}-tag">${categoryLabel}</div>
        <div class="card-content">
            <h3>${announcement.title}</h3>
            <p class="post-date">Posted on ${formattedDate}</p>
            <p class="description">${announcement.description}</p>
            <div class="card-actions">
                <a href="announcement-details.html?id=${announcement.id}" class="read-more">Read More</a>
                ${announcement.category === 'event' ? '<button class="rsvp-btn"><i class="fas fa-calendar-check"></i> RSVP</button>' : ''}
                <button class="feedback-btn"><i class="fas fa-comment"></i> Feedback</button>
            </div>
        </div>
    `;
    
    // Add event listeners to the new buttons
    const feedbackBtn = card.querySelector('.feedback-btn');
    const rsvpBtn = card.querySelector('.rsvp-btn');
    
    if (feedbackBtn) {
        feedbackBtn.addEventListener('click', function() {
            const announcementTitle = this.closest('.card-content').querySelector('h3').textContent;
            const modalTitle = document.querySelector('#feedbackModal h2');
            modalTitle.textContent = `Provide Feedback for "${announcementTitle}"`;
            
            document.getElementById('feedbackModal').style.display = 'flex';
        });
    }
    
    if (rsvpBtn) {
        rsvpBtn.addEventListener('click', function() {
            const announcementTitle = this.closest('.card-content').querySelector('h3').textContent;
            const modalTitle = document.querySelector('#rsvpModal h2');
            modalTitle.textContent = `RSVP for "${announcementTitle}"`;
            
            document.getElementById('rsvpModal').style.display = 'flex';
        });
    }
    
    return card;
}

function getCategoryLabel(category) {
    switch(category) {
        case 'important':
            return 'Important';
        case 'educational':
            return 'Educational';
        case 'event':
            return 'Event';
        default:
            return 'General';
    }
}

// In a real application, you would fetch announcements from your backend
function loadAnnouncements() {
    fetch('/api/announcements')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('announcements-container');
            container.innerHTML = ''; // Clear existing content
            
            data.forEach(announcement => {
                const announcementCard = createAnnouncementCard(announcement);
                container.appendChild(announcementCard);
            });
        })
        .catch(error => {
            console.error('Error loading announcements:', error);
        });
}

// Add handler for pagination
document.querySelectorAll('.pagination-button, .pagination-next').forEach(button => {
    button.addEventListener('click', function() {
        if (!this.classList.contains('active')) {
            document.querySelectorAll('.pagination-button').forEach(btn => {
                btn.classList.remove('active');
            });
            
            if (this.classList.contains('pagination-button')) {
                this.classList.add('active');
            }
            
            // In a real application, this would load the appropriate page of announcements
            console.log('Loading page:', this.textContent.trim());
        }
    });
});