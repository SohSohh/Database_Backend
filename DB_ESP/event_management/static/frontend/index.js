// API Base URL
const API_BASE_URL = "http://127.0.0.1:8000/api";

document.addEventListener("DOMContentLoaded", () => {
  // Check and display logout message if needed
  if (localStorage.getItem('showLogoutMessage')) {
    showSuccessMessage('Successfully logged out');
    localStorage.removeItem('showLogoutMessage');
  }
  // Mobile menu toggle
  const hamburger = document.querySelector(".hamburger")
  const navMenu = document.querySelector("#nav-menu")

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active")
      navMenu.classList.toggle("active")
    })
  }

  // Announcement filtering
  const filterBtns = document.querySelectorAll(".announcements-filter .filter-btn")
  const announcementCards = document.querySelectorAll("#latestAnnouncementsContainer .project-card")

  if (filterBtns.length && announcementCards.length) {
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        // Remove active class from all buttons
        filterBtns.forEach((b) => b.classList.remove("active"))

        // Add active class to clicked button
        btn.classList.add("active")

        // Get filter value
        const filterValue = btn.getAttribute("data-filter")

        // Filter announcements
        announcementCards.forEach((card) => {
          if (filterValue === "all" || card.getAttribute("data-category") === filterValue) {
            card.style.display = "block"
          } else {
            card.style.display = "none"
          }
        })
      })
    })
  }


  // Profile icon functionality
  const profileIcon = document.querySelector(".profile-icon")
  if (profileIcon) {
    profileIcon.addEventListener("click", () => {
      // Check if user is logged in
      const isLoggedIn = localStorage.getItem("authToken") !== null

      if (isLoggedIn) {
        // If logged in, go to profile page
        window.location.href = "viewer-dashboard.html"
      } else {
        // If not logged in, go to login page
        window.location.href = "login.html"
      }
    })
  }

  // Check if user is logged in
  const isLoggedIn = localStorage.getItem("access_token") !== null;
  const userType = localStorage.getItem("userType");

  // Update navigation based on login status
  updateNavigation(isLoggedIn, userType);

  // Load featured events from the backend
  loadFeaturedEvents();

  // Handle RSVP button clicks with event delegation
  const eventsContainer = document.querySelector('.events-row');
  if (eventsContainer) {
    eventsContainer.addEventListener('click', async function(e) {
      const rsvpButton = e.target.closest('.rsvp-btn');
      if (!rsvpButton || rsvpButton.disabled) return;

      rsvpButton.disabled = true;
      rsvpButton.style.opacity = '0.7';
      
      const eventId = rsvpButton.getAttribute('data-event-id');
      const eventName = rsvpButton.getAttribute('data-event-name');
      
      if (!eventId || !eventName) {
        console.error('Missing event data attributes');
        rsvpButton.disabled = false;
        rsvpButton.style.opacity = '1';
        return;
      }

      const isCurrentlyAttending = rsvpButton.classList.contains('rsvp-active');

      try {
        await handleRSVP(eventId, eventName, isCurrentlyAttending);
      } catch (error) {
        console.error('RSVP action failed:', error);
        showSuccessToast('Failed to update RSVP status. Please try again.', true);
      } finally {
        rsvpButton.disabled = false;
        rsvpButton.style.opacity = '1';
      }
    });
  }
          document.querySelectorAll('.rsvp-option').forEach(opt => opt.classList.remove('selected'));
      });

  // RSVP Form Submission
  document.getElementById('rsvpForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const selectedOption = document.querySelector('.rsvp-option.selected');
      if (!selectedOption) {
          alert('Please select your attendance status');
          return;
      }
      
      const eventId = document.querySelector('.rsvp-btn').getAttribute('data-event-id');
      const attendance = selectedOption.getAttribute('data-value');
      
      // Make API call to submit RSVP
      fetch(`/api/events/${eventId}/rsvp/`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': getCookie('csrftoken')
          },
          body: JSON.stringify({
              attendance: attendance
          })
      })
      .then(response => {
          if (!response.ok) throw new Error('Failed to submit RSVP');
          return response.json();
      })
      .then(data => {
          // Update UI
          const rsvpBtn = document.querySelector(`.rsvp-btn[data-event-id="${eventId}"]`);
          rsvpBtn.classList.add('rsvp-active');
          rsvpBtn.innerHTML = '<i class="fas fa-check-circle"></i> RSVP\'d';
          
          // Show success message
          showSuccessMessage('Successfully RSVP\'d to event!');
          
          // Close modal
          document.getElementById('rsvpModal').style.display = 'none';
      })
      .catch(error => {
          console.error('Error submitting RSVP:', error);
          alert('Failed to submit RSVP. Please try again.');
      });
  });

  // RSVP Option Selection
  document.querySelectorAll('.rsvp-option').forEach(option => {
      option.addEventListener('click', function() {
          document.querySelectorAll('.rsvp-option').forEach(opt => opt.classList.remove('selected'));
          this.classList.add('selected');
      });
  });

  // Close Modal Handlers
  document.querySelector('.close-modal').addEventListener('click', function() {
      document.getElementById('rsvpModal').style.display = 'none';
  });

  window.addEventListener('click', function(event) {
      if (event.target === document.getElementById('rsvpModal')) {
          document.getElementById('rsvpModal').style.display = 'none';
      }
  });

  // Helper function to get CSRF token
  function getCookie(name) {
      let cookieValue = null;
      if (document.cookie && document.cookie !== '') {
          const cookies = document.cookie.split(';');
          for (let i = 0; i < cookies.length; i++) {
              const cookie = cookies[i].trim();
              if (cookie.substring(0, name.length + 1) === (name + '=')) {
                  cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                  break;
              }
          }
      }
      return cookieValue;
  }

  // Show success message
  function showSuccessMessage(message) {
      const successMessage = document.createElement('div');
      successMessage.className = 'success-message';
      successMessage.textContent = message;
      successMessage.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: var(--primary-color, #800000);
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
              if (successMessage.parentNode) {
                  document.body.removeChild(successMessage);
              }
          }, 300);
      }, 3000);
  }

function updateNavigation(isLoggedIn, userType) {
  const navLinks = document.querySelector(".nav-links")
  const profileIcon = document.querySelector(".profile-icon i")

  // Get current page
  const currentPage = window.location.pathname

  // List of pages where logout should appear
  const showLogoutOn = [
    "/viewer-dashboard.html",
    "/handler-dashboard.html",
    "/profile.html",
    "/my-feedback.html",
    "/my-societies.html",
    "/my-registrations.html",
    "/settings.html"
    // Add more dashboard pages as needed
  ]

  if (isLoggedIn) {
    // Remove login and register links if present
    const loginLink = document.querySelector('.nav-links li a[href="login.html"]')?.parentNode
    const registerLink = document.querySelector('.nav-links li a[href="register.html"]')?.parentNode

    if (loginLink) loginLink.remove()
    if (registerLink) registerLink.remove()

    // Remove any generic "Dashboard" link if present
    const dashboardLink = document.querySelector('.nav-links li a[href="dashboard.html"]')?.parentNode
    if (dashboardLink) dashboardLink.remove()

    // (No need to add a generic dashboard link!)

    // Only add logout if on a dashboard page
    if (showLogoutOn.includes(currentPage)) {
      const logoutLi = document.createElement("li")
      const logoutLink = document.createElement("a")
      logoutLink.href = "#"
      logoutLink.textContent = "Logout"
      logoutLink.addEventListener("click", (e) => {
        e.preventDefault()
        // Clear auth data
        localStorage.removeItem("authToken")
        localStorage.removeItem("userType")
        localStorage.setItem('showLogoutMessage', 'true'); // Flag to show message on home page
        // Redirect to home page
        window.location.href = "index.html"
      })
      logoutLi.appendChild(logoutLink)
      navLinks.appendChild(logoutLi)
    }

    // Update profile icon to indicate logged in state
    // if (profileIcon) {
    //   profileIcon.className = "fas fa-user" // Solid user icon for logged in users
    // }
  } else {
    // Ensure profile icon shows not logged in state
    // if (profileIcon) {
    //   profileIcon.className = "fas fa-user-circle" // Outline user icon for guests
    // }
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
    card.className = 'project-card';
    card.setAttribute('data-category', announcement.category.toLowerCase());
    
    card.innerHTML = `
        <div class="project-image">
            <img src="${announcement.imageUrl || 'https://via.placeholder.com/300x200'}" alt="${announcement.title}">
        </div>
        <div class="project-details">
            <span class="announcement-category">${announcement.category}</span>
            <h3>${announcement.title}</h3>
            <p class="announcement-date">${formatDate(announcement.date)}</p>
            <p class="project-description">${announcement.content.substring(0, 120)}${announcement.content.length > 120 ? '...' : ''}</p>
            <a href="announcement-details.html?id=${announcement.id}" class="read-more">Read More</a>
        </div>
    `;
    
    return card;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}
*/

// FAQ Accordion
window.addEventListener('DOMContentLoaded', function() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    btn.addEventListener('click', function() {
      // Close other open items
      faqItems.forEach(i => { if(i !== item) i.classList.remove('open'); });
      // Toggle this one
      item.classList.toggle('open');
    });
  });
});

// DEMO DATA FOR FEATURED EVENTS
const demoFeaturedEvents = [
  {
    title: "Annual Tech Conference",
    imageUrl: "images/tech-conference.jpg",
    category: "Workshop",
    date: "APR 25",
    location: "Convention Center",
    time: "9:00 AM",
    description: "Join industry leaders and innovators for a day of tech talks and networking.",
    id: 1
  },
  {
    title: "Spring Music Festival",
    imageUrl: "images/music-festival.jpg",
    category: "Event",
    date: "MAY 10",
    location: "City Park",
    time: "All Day",
    description: "Three days of amazing performances from top artists and local talents.",
    id: 2
  },
  {
    title: "Charity Marathon",
    imageUrl: "images/charity-run.jpg",
    category: "Community",
    date: "MAY 18",
    location: "Riverside Park",
    time: "7:00 AM",
    description: "Run for a cause! Join us for our annual charity marathon.",
    id: 3
  }
];

const demoAnnouncements = [
  {
    title: "Annual Tech Conference",
    imageUrl: "images/tech-conference.jpg",
    category: "Workshop",
    description: "Join industry leaders and innovators for a day of tech talks and networking.",
    id: 101
  },
  {
    title: "Charity Marathon",
    imageUrl: "images/charity-run.jpg",
    category: "Event",
    description: "Run for a cause! Join us for our annual charity marathon.",
    id: 102
  },
  {
    title: "Spring Music Festival",
    imageUrl: "images/music-festival.jpg",
    category: "Community",
    description: "Three days of amazing performances from top artists and local talents.",
    id: 103
  }
];

// --- RSVP/Attending State ---
// This object tracks which events the user is attending.
// The keys are event IDs, and the values are true (attending) or false (not attending).
// In a real app, this would be loaded from/saved to the backend.
let attendingStatus = JSON.parse(localStorage.getItem('attendingStatus') || '{}');

// --- Render Featured Events ---
// This function renders the event cards and sets the RSVP button state
function renderFeaturedEvents(events) {
  const container = document.querySelector('.events-row');
  if (!container) return;
  container.innerHTML = '';
  events.forEach(event => {
    const isAttending = attendingStatus[event.id];
    const card = document.createElement('div');
    card.className = 'event-card';
    card.innerHTML = `
      <div class="event-image">
        <img src="${event.imageUrl}" alt="${event.title}">
      </div>
      <div class="card-content">
        <div class="headline-row">
          <h3>${event.title}</h3>
          <span class="category-badge event">${event.category}</span>
        </div>
        <div class="event-meta-col">
          <div class="event-date"><i class="fas fa-calendar-alt"></i> ${event.date}</div>
          <div class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</div>
          <div class="event-time"><i class="fas fa-clock"></i> ${event.time}</div>
        </div>
        <p>${event.description}</p>
        <div class="card-actions">
          <button class="btn-outline">Details</button>
          <button class="rsvp-btn${isAttending ? ' rsvp-active' : ''}" data-event-id="${event.id}">
            <i class="fas fa-check-circle"></i> ${isAttending ? "Attending" : "RSVP"}
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderLatestAnnouncements(announcements) {
  const container = document.querySelector('.announcements-row');
  if (!container) return;
  container.innerHTML = '';
  announcements.forEach(announcement => {
    const card = document.createElement('div');
    card.className = 'announcement-card';
    card.innerHTML = `
      <div class="announcement-image">
        <img src="${announcement.imageUrl}" alt="..." />
      </div>
      <div class="card-content">
        <div class="headline-row">
          <h3>${announcement.title}</h3>
          <span class="category-badge event">${announcement.category}</span>
        </div>
        <p>${announcement.description}</p>
        <div class="card-actions">
          <button class="btn-outline">Details</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// --- RSVP Button Logic ---
// This function attaches click handlers to RSVP buttons.
// When clicked, it toggles the attending state for the event and updates the UI and localStorage.
function setupRSVPButtons() {
  document.querySelectorAll('.rsvp-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const eventId = this.getAttribute('data-event-id');
      if (attendingStatus[eventId]) {
        attendingStatus[eventId] = false;
        this.classList.remove('rsvp-active');
        this.innerHTML = '<i class="fas fa-check-circle"></i> RSVP';
        showSuccessMessage('You are no longer attending this event.');
      } else {
        attendingStatus[eventId] = true;
        this.classList.add('rsvp-active');
        this.innerHTML = '<i class="fas fa-check-circle"></i> Attending';
        showSuccessMessage('You are now attending this event!');
      }
      localStorage.setItem('attendingStatus', JSON.stringify(attendingStatus));
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  renderFeaturedEvents(demoFeaturedEvents);
  setupRSVPButtons();
  renderLatestAnnouncements(demoAnnouncements);
});
