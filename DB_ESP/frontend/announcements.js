const accessToken = localStorage.getItem('access_token');
document.addEventListener('DOMContentLoaded', function() {
    const userType = localStorage.getItem('userType');
    
    updateNavigation(accessToken, userType);
    loadCategories();
    loadEvents();

    // Remove or comment out the following lines if not implemented
    // initializeModals();
    // initializePagination();
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
    }
}

// Function to create announcement cards dynamically
function createAnnouncementCard(announcement) {
    const card = document.createElement('div');
    card.className = 'announcement-card';
    
    card.innerHTML = `
        <div class="announcement-content">
            <h3>${announcement.name}</h3>
            <p class="announcement-meta">
                <span class="host"><i class="fas fa-user"></i> ${announcement.host_username}</span>
                <span class="date"><i class="fas fa-calendar"></i> ${new Date(announcement.date).toLocaleDateString()}</span>
            </p>
            <p class="description">${announcement.description}</p>
            <a href="announcement-details.html?id=${announcement.id}" class="read-more">
                Read More <i class="fas fa-arrow-right"></i>
            </a>
        </div>
    `;
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
async function loadAnnouncements() {
    const container = document.getElementById('announcements-container');
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading announcements...</div>';

    try {
        const url = `${API_BASE_URL}/events/?ordering=date&category=announcement`;
        const options = {
            method: 'GET'
        };
        console.log('Request:', {
            method: options.method,
            url: url,
            headers: options.headers
        });
        const response = await fetch(url, options);
        const announcements = await response.json();
        console.log('Response:', {
            status: response.status,
            data: announcements
        });

        container.innerHTML = '';

        if (announcements.length === 0) {
            container.innerHTML = '<p class="no-results">No announcements found.</p>';
            return;
        }

        announcements.forEach(announcement => {
            container.appendChild(createAnnouncementCard(announcement));
        });
    } catch (error) {
        console.error('Error loading announcements:', error);
        container.innerHTML = '<p class="error">Failed to load announcements.</p>';
    }
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

// Configuration
const API_BASE_URL = 'http://127.0.0.1:8000/api';

function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';
    
    card.innerHTML = `
        <div class="event-image">
            <img src="${event.banner || '/static/images/placeholder.png'}" 
                alt="${event.name}" 
                onerror="this.onerror=null;this.src='/static/images/placeholder.png';">
        </div>
        <div class="event-details">
            <div class="event-header">
                <span class="category-badge">${event.category_name || 'Event'}</span>
                <h3>${event.name}</h3>
            </div>
            <div class="event-meta">
                <p class="host"><i class="fas fa-user"></i> ${event.host_username}</p>
                <p class="event-date"><i class="fas fa-calendar"></i> ${new Date(event.date).toLocaleDateString()}</p>
                <p class="event-time"><i class="fas fa-clock"></i> ${event.start_time} - ${event.end_time}</p>
                <p class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
            </div>
            <p class="event-description">${event.description.substring(0, 150)}${event.description.length > 150 ? '...' : ''}</p>
            <div class="event-footer">
                <div class="event-stats">
                    <span class="attendees"><i class="fas fa-users"></i> ${event.attendee_count} attending</span>
                    <span class="rating"><i class="fas fa-star"></i> ${event.average_rating || 'N/A'}</span>
                </div>
                <div class="action-buttons">
                    <a href="announcement-details.html?id=${event.id}" class="btn btn-primary">View Details</a>
                    ${!event.is_attending ? `<button class="rsvp-btn" data-event-id="${event.id}">
                        <i class="fas fa-calendar-check"></i> RSVP
                    </button>` : `<button class="rsvp-btn attending" data-event-id="${event.id}">
                        <i class="fas fa-check"></i> Attending
                    </button>`}
                </div>
            </div>
        </div>
    `;

    // Add RSVP button click handler
    const rsvpBtn = card.querySelector('.rsvp-btn');
    if (rsvpBtn) {
        rsvpBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const eventId = rsvpBtn.getAttribute('data-event-id');
            openRSVPModal(eventId, event.name);
        });
    }

    return card;
}

async function loadCategories() {
    try {
        const url = `${API_BASE_URL}/events/categories/`;
        const options = { 
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        };
        console.log('Request:', {
            method: options.method,
            url: url,
            headers: options.headers
        });
        const response = await fetch(url, options);
        const categories = await response.json();
        console.log('Response:', {
            status: response.status,
            data: categories
        });
        const filterContainer = document.getElementById('category-filters');
        
        filterContainer.innerHTML = ''; // Clear existing filters
        
        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'filter-btn';
            button.setAttribute('data-filter', category.id);
            button.textContent = category.name;
            button.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(btn => 
                    btn.classList.remove('active'));
                button.classList.add('active');
                loadEvents(category.id);
            });
            filterContainer.appendChild(button);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

async function fetchWithLogs(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    };

    const finalOptions = { ...defaultOptions, ...options };

    console.log('Request:', {
        method: finalOptions.method || 'GET',
        url: url,
        headers: finalOptions.headers,
        body: finalOptions.body ? JSON.parse(finalOptions.body) : undefined
    });

    const response = await fetch(url, finalOptions);
    let data;
    try {
        data = await response.json();
    } catch (e) {
        data = null;
    }

    console.log('Response:', {
        status: response.status,
        data: data
    });

    if (!response.ok) {
        throw new Error('Request failed');
    }

    return data;
}

async function loadEvents(categoryId = null) {
    const container = document.getElementById('events-container');
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading events...</div>';

    try {
        let url = `${API_BASE_URL}/events/?ordering=date`;
        const accessToken = localStorage.getItem('access_token');
        if (categoryId && categoryId !== 'all') {
            url += `&category=${categoryId}`;
        }

        const options = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        };

        console.log('Request:', {
            method: options.method,
            url: url,
            headers: options.headers
        });

        const response = await fetch(url, options);
        const events = await response.json();

        console.log('Response:', {
            status: response.status,
            data: events
        });

        container.innerHTML = '';

        // Use events.data if present, otherwise use events directly
        const eventList = Array.isArray(events) ? events : (Array.isArray(events.data) ? events.data : []);
        if (eventList.length === 0) {
            container.innerHTML = '<p class="no-results">No events found.</p>';
            return;
        }

        eventList.forEach(event => {
            container.appendChild(createEventCard(event));
        });

        // Update pagination
        updatePagination(eventList.length);
    } catch (error) {
        console.error('Error loading events:', error);
        container.innerHTML = '<p class="error">Failed to load events.</p>';
    }
}

async function handleRSVP(eventId) {
    try {
        const url = `${API_BASE_URL}/events/${eventId}/attendance/`;
        const body = JSON.stringify({ action: 'attend' });
        console.log('Request:', {
            method: 'POST',
            url: url,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.parse(body)
        });
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body
        });
        const data = await response.json();
        console.log('Response:', {
            status: response.status,
            data: data
        });

        showRSVPSuccessMessage();
        loadEvents();
    } catch (error) {
        console.error('Error submitting RSVP:', error);
        alert('Failed to submit RSVP. Please try again.');
    }
}

async function submitFeedback(eventId, rating, content) {
    try {
        const url = `${API_BASE_URL}/events/${eventId}/comments/`;
        const body = JSON.stringify({
            content: content,
            rating: rating
        });
        console.log('Request:', {
            method: 'POST',
            url: url,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.parse(body)
        });
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body
        });
        const data = await response.json();
        console.log('Response:', {
            status: response.status,
            data: data
        });

        showFeedbackSuccessMessage();
    } catch (error) {
        console.error('Error submitting feedback:', error);
        alert('Failed to submit feedback. Please try again.');
    }
}

// Add this dummy function to prevent errors if you want to keep the call
function updatePagination(/* count */) {
    // No-op or implement pagination logic here if needed
}