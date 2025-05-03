document.addEventListener('DOMContentLoaded', function() {
    // Check authentication status
    const authToken = localStorage.getItem('authToken');
    const userType = localStorage.getItem('userType');
    
    updateNavigation(authToken, userType);
    
    // Filter functionality
    const filterBtns = document.querySelectorAll('.filter-btn');
    const announcementCards = document.querySelectorAll('.announcement-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filterValue = btn.getAttribute('data-filter');
            announcementCards.forEach(card => {
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
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
            document.getElementById('feedbackTitle').textContent = announcementTitle;
            feedbackModal.style.display = 'block';
        });
    });
    
    // For RSVP buttons
    rsvpBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const announcementTitle = this.closest('.card-content').querySelector('h3').textContent;
            document.getElementById('rsvpTitle').textContent = announcementTitle;
            rsvpModal.classList.add('show');
            
            // Reset RSVP options and form
            document.querySelectorAll('.rsvp-option').forEach(opt => opt.classList.remove('active'));
            document.getElementById('selectedAttendance').value = '';
            document.getElementById('additionalComments').value = '';
        });
    });
    
    // Star rating functionality
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = star.getAttribute('data-rating');
            document.getElementById('selectedRating').value = rating;
            
            // Update star display
            stars.forEach(s => {
                if (s.getAttribute('data-rating') <= rating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });
    
    // Close modals
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('show');
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('show');
        }
    });
    
    // RSVP options functionality
    const rsvpOptions = document.querySelectorAll('.rsvp-option');
    rsvpOptions.forEach(option => {
        option.addEventListener('click', () => {
            const value = option.getAttribute('data-value');
            document.getElementById('selectedAttendance').value = value;
            
            // Update option display
            rsvpOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });
    
    // Form submissions
    const feedbackForm = document.getElementById('feedbackForm');
    const rsvpForm = document.getElementById('rsvpForm');
    
    feedbackForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const rating = document.getElementById('selectedRating').value;
        const feedback = document.getElementById('feedbackText').value;
        
        if (!rating) {
            alert('Please select a rating');
            return;
        }
        
        // In a real application, send this data to your backend
        console.log('Feedback submitted:', {
            feedback,
            rating: parseInt(rating)
        });
        
        // Display success message (side notification)
        showFeedbackSuccessMessage();
        
        // Reset form and close modal
        this.reset();
        document.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
        feedbackModal.style.display = 'none';
    });
    
    rsvpForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const attendance = document.getElementById('selectedAttendance').value;
        const additionalComments = document.getElementById('additionalComments').value;
        
        if (!attendance) {
            alert('Please select whether you will attend');
            return;
        }
        
        // In a real application, send this data to your backend
        console.log('RSVP submitted:', { 
            attendance,
            additionalComments 
        });
        
        // Display success message
        alert('Thank you for your RSVP!');
        
        // Reset form and close modal
        this.reset();
        document.querySelectorAll('.rsvp-option').forEach(opt => opt.classList.remove('active'));
        rsvpModal.classList.remove('show');
    });

    const announcementsContainer = document.querySelector('.announcements-container');
    const paginationContainer = document.querySelector('.pagination');
    const announcements = document.querySelectorAll('.announcement-card');
    
    const itemsPerPage = 4; // Show 4 items per page (2 rows x 2 columns)
    const totalPages = Math.ceil(announcements.length / itemsPerPage);
    let currentPage = 1;

    function showPage(page) {
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        announcements.forEach((announcement, index) => {
            announcement.style.display = (index >= start && index < end) ? 'flex' : 'none';
        });

        // Scroll to the very top of the page instantly
        window.scrollTo({ top: 0, behavior: 'instant' });
    }

    function createPaginationButtons() {
        let html = '';
        
        // Previous button
        html += `<button class="pagination-prev" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>`;

        // Current page info
        html += `<div class="pagination-info">
            <span class="current-page">${currentPage}</span>
            <span>of</span>
            <span class="total-pages">${totalPages}</span>
        </div>`;

        // Next button
        html += `<button class="pagination-next" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>`;

        paginationContainer.innerHTML = html;

        // Previous button click
        const prevButton = document.querySelector('.pagination-prev');
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                if (currentPage > 1 && !prevButton.hasAttribute('disabled')) {
                    currentPage--;
                    showPage(currentPage);
                    createPaginationButtons();
                }
            });
        }

        // Next button click
        const nextButton = document.querySelector('.pagination-next');
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                if (currentPage < totalPages && !nextButton.hasAttribute('disabled')) {
                    currentPage++;
                    showPage(currentPage);
                    createPaginationButtons();
                }
            });
        }
    }

    // Initialize pagination
    if (announcements.length > 0) {
        showPage(1);
        createPaginationButtons();
    }

    // Profile icon functionality
    const profileIcon = document.querySelector(".profile-icon");
    if (profileIcon) {
        profileIcon.addEventListener("click", () => {
            // Check if user is logged in
            const isLoggedIn = localStorage.getItem("authToken") !== null;

            if (isLoggedIn) {
                // If logged in, go to profile page
                window.location.href = "profile.html";
            } else {
                // If not logged in, go to login page
                window.location.href = "login.html";
            }
        });
    }

    // Set the correct icon based on login state
    const iconElement = document.querySelector(".profile-icon i");
    const isLoggedIn = localStorage.getItem("authToken") !== null;
    if (iconElement) {
        iconElement.className = isLoggedIn ? "fas fa-user" : "fas fa-user-circle";
    }
});

function updateNavigation(isLoggedIn, userType) {
    const navLinks = document.querySelector('.nav-links');
    const profileIcon = document.querySelector('.profile-icon i');

    // Get current page
    const currentPage = window.location.pathname;

    // List of pages where logout should appear
    const showLogoutOn = [
        '/viewer-dashboard.html',
        '/handler-dashboard.html',
        '/profile.html',
        '/my-feedback.html',
        '/my-societies.html',
        '/my-registrations.html',
        '/settings.html'
        // Add more dashboard pages as needed
    ];

    if (isLoggedIn) {
        // Remove login and register links if present
        const loginLink = document.querySelector('.nav-links li a[href="login.html"]')?.parentNode;
        const registerLink = document.querySelector('.nav-links li a[href="register.html"]')?.parentNode;

        if (loginLink) loginLink.remove();
        if (registerLink) registerLink.remove();

        // Remove any generic "Dashboard" link if present
        const dashboardLink = document.querySelector('.nav-links li a[href="dashboard.html"]')?.parentNode;
        if (dashboardLink) dashboardLink.remove();

        // Only add logout if on a dashboard page
        if (showLogoutOn.includes(currentPage)) {
            const logoutLi = document.createElement('li');
            const logoutLink = document.createElement('a');
            logoutLink.href = '#';
            logoutLink.textContent = 'Logout';
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                // Clear auth data
                localStorage.removeItem('authToken');
                localStorage.removeItem('userType');
                // Redirect to home page
                window.location.href = 'index.html';
            });
            logoutLi.appendChild(logoutLink);
            navLinks.appendChild(logoutLi);
        }

        // Update profile icon to indicate logged in state
        if (profileIcon) {
            profileIcon.className = 'fas fa-user'; // Solid user icon for logged in users
        }
    } else {
        // Ensure profile icon shows not logged in state
        if (profileIcon) {
            profileIcon.className = 'fas fa-user-circle'; // Outline user icon for guests
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
            
            document.getElementById('feedbackModal').style.display = 'block';
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

// RSVP Functionality
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

// RSVP Modal Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const rsvpModal = document.getElementById('rsvpModal');
    const rsvpForm = document.getElementById('rsvpForm');
    const closeModal = document.querySelector('.close-modal');
    let selectedOption = null;

    // Open RSVP modal
    document.querySelectorAll('.rsvp-btn').forEach(button => {
        button.addEventListener('click', () => {
            rsvpModal.style.display = 'block';
        });
    });

    // Close RSVP modal
    closeModal.addEventListener('click', () => {
        rsvpModal.style.display = 'none';
        selectedOption = null;
        document.querySelectorAll('.rsvp-option').forEach(option => {
            option.classList.remove('selected');
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === rsvpModal) {
            rsvpModal.style.display = 'none';
            selectedOption = null;
            document.querySelectorAll('.rsvp-option').forEach(option => {
                option.classList.remove('selected');
            });
        }
    });

    // RSVP option selection
    document.querySelectorAll('.rsvp-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.rsvp-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            option.classList.add('selected');
            selectedOption = option.getAttribute('data-value');
        });
    });

    // RSVP form submission
    rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!selectedOption) {
            alert('Please select an RSVP option');
            return;
        }

        // Here you would typically send the RSVP data to your backend
        console.log('RSVP submitted:', {
            attendance: selectedOption
        });

        // Show success message
        showRSVPSuccessMessage();

        // Close modal and reset
        rsvpModal.style.display = 'none';
        selectedOption = null;
        document.querySelectorAll('.rsvp-option').forEach(option => {
            option.classList.remove('selected');
        });
    });
});

// Feedback Modal Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Feedback Modal logic
    const feedbackModal = document.getElementById('feedbackModal');
    const feedbackForm = document.getElementById('feedbackForm');
    const feedbackCloseBtn = document.querySelector('#feedbackModal .close-modal');

    // Open Feedback modal
    document.querySelectorAll('.feedback-btn').forEach(button => {
        button.addEventListener('click', function() {
            const announcementTitle = this.closest('.card-content').querySelector('h3').textContent;
            document.getElementById('feedbackTitle').textContent = announcementTitle;
            feedbackModal.style.display = 'block';
        });
    });

    // Close Feedback modal
    feedbackCloseBtn.addEventListener('click', () => {
        feedbackModal.style.display = 'none';
        document.querySelectorAll('#feedbackModal .star').forEach(star => star.classList.remove('active'));
        feedbackForm.reset();
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === feedbackModal) {
            feedbackModal.style.display = 'none';
            document.querySelectorAll('#feedbackModal .star').forEach(star => star.classList.remove('active'));
            feedbackForm.reset();
        }
    });

    // Star rating logic (keep as is, but make sure it targets only feedback modal stars)
    document.querySelectorAll('#feedbackModal .star').forEach(star => {
        star.addEventListener('click', () => {
            const rating = star.getAttribute('data-rating');
            document.getElementById('selectedRating').value = rating;
            document.querySelectorAll('#feedbackModal .star').forEach(s => {
                if (s.getAttribute('data-rating') <= rating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });
});

function showFeedbackSuccessMessage() {
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