document.addEventListener('DOMContentLoaded', function() {
    // In a real application, you would fetch this data from your backend
    // For now, we'll use static data for demonstration
    
    // Check if user is logged in (for demonstration purposes)
    const isLoggedIn = localStorage.getItem('authToken') !== null;
    const userType = localStorage.getItem('userType'); // This would be set during login
    
    // Update navigation based on login status
    updateNavigation(isLoggedIn, userType);
    
    // Load featured events (in a real app, this would come from your backend)
    // loadFeaturedEvents();
    
    // Load latest announcements (in a real app, this would come from your backend)
    // loadLatestAnnouncements();
});

function updateNavigation(isLoggedIn, userType) {
    const navLinks = document.querySelector('.nav-links');
    
    if (isLoggedIn) {
        // Remove login and register links
        const loginLink = document.querySelector('.nav-links li a[href="login.html"]').parentNode;
        const registerLink = document.querySelector('.nav-links li a[href="register.html"]').parentNode;
        
        if (loginLink) loginLink.remove();
        if (registerLink) registerLink.remove();
        
        // Add dashboard and logout links
        const dashboardLi = document.createElement('li');
        const dashboardLink = document.createElement('a');
        dashboardLink.href = userType === 'handler' ? 'handler-dashboard.html' : 'viewer-dashboard.html';
        dashboardLink.textContent = 'Dashboard';
        dashboardLi.appendChild(dashboardLink);
        
        const logoutLi = document.createElement('li');
        const logoutLink = document.createElement('a');
        logoutLink.href = '#';
        logoutLink.textContent = 'Logout';
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            // Clear auth data
            localStorage.removeItem('authToken');
            localStorage.removeItem('userType');
            // Redirect to home page
            window.location.href = 'index.html';
        });
        logoutLi.appendChild(logoutLink);
        
        navLinks.appendChild(dashboardLi);
        navLinks.appendChild(logoutLi);
    }
}

// Below functions would typically fetch data from your backend
// For now, they're commented out but would be implemented in a real application

/*
function loadFeaturedEvents() {
    fetch('/api/events/featured')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('featuredEventsContainer');
            container.innerHTML = ''; // Clear placeholder content
            
            data.forEach(event => {
                const eventCard = createEventCard(event);
                container.appendChild(eventCard);
            });
        })
        .catch(error => {
            console.error('Error loading featured events:', error);
        });
}

function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';
    
    card.innerHTML = `
        <div class="event-image">
            <img src="${event.imageUrl || 'https://via.placeholder.com/300x200'}" alt="${event.title}">
        </div>
        <div class="event-details">
            <h3>${event.title}</h3>
            <p class="event-date">${formatDate(event.date)}</p>
            <p class="event-location">${event.location}</p>
            <p class="event-description">${event.description.substring(0, 100)}${event.description.length > 100 ? '...' : ''}</p>
            <a href="event-details.html?id=${event.id}" class="btn-small">Learn More</a>
        </div>
    `;
    
    return card;
}

function loadLatestAnnouncements() {
    fetch('/api/announcements/latest')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('latestAnnouncementsContainer');
            container.innerHTML = ''; // Clear placeholder content
            
            data.forEach(announcement => {
                const announcementCard = createAnnouncementCard(announcement);
                container.appendChild(announcementCard);
            });
        })
        .catch(error => {
            console.error('Error loading latest announcements:', error);
        });
}

function createAnnouncementCard(announcement) {
    const card = document.createElement('div');
    card.className = 'announcement-card';
    
    card.innerHTML = `
        <h3>${announcement.title}</h3>
        <p class="announcement-date">${formatDate(announcement.date)}</p>
        <p class="announcement-excerpt">${announcement.content.substring(0, 120)}${announcement.content.length > 120 ? '...' : ''}</p>
        <a href="announcement-details.html?id=${announcement.id}" class="read-more">Read More</a>
    `;
    
    return card;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}
*/