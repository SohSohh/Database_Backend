document.addEventListener("DOMContentLoaded", () => {
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
  
    // Newsletter form submission
    const newsletterForm = document.getElementById("newsletterForm")
    if (newsletterForm) {
      newsletterForm.addEventListener("submit", (e) => {
        e.preventDefault()
  
        // Get form data
        const name = document.getElementById("name").value
        const email = document.getElementById("email").value
        const interests = document.getElementById("interests").value
  
        // In a real app, you would send this data to your backend
        console.log("Newsletter signup:", { name, email, interests })
  
        // Show success message
        alert("Thank you for subscribing to our newsletter!")
  
        // Reset form
        newsletterForm.reset()
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
          window.location.href = "profile.html"
        } else {
          // If not logged in, go to login page
          window.location.href = "login.html"
        }
      })
    }
  
    // In a real application, you would fetch this data from your backend
    // For now, we'll use static data for demonstration
  
    // Check if user is logged in (for demonstration purposes)
    const isLoggedIn = localStorage.getItem("authToken") !== null
    const userType = localStorage.getItem("userType") // This would be set during login
  
    // Update navigation based on login status
    updateNavigation(isLoggedIn, userType)
  
    // Load featured events (in a real app, this would come from your backend)
    // loadFeaturedEvents();
  
    // Load latest announcements (in a real app, this would come from your backend)
    // loadLatestAnnouncements();
  
    // RSVP Modal Logic for Featured Events
    let selectedRsvp = null;
    let currentEventId = null;
  
    // Open modal on RSVP button click
    document.querySelectorAll('.rsvp-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            currentEventId = this.getAttribute('data-event-id');
            document.getElementById('rsvpModal').style.display = 'block';
            document.querySelectorAll('.rsvp-option').forEach(opt => opt.classList.remove('selected'));
            selectedRsvp = null;
        });
    });
  
    // RSVP option selection
    document.querySelectorAll('.rsvp-option').forEach(opt => {
        opt.addEventListener('click', function() {
            document.querySelectorAll('.rsvp-option').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            selectedRsvp = this.getAttribute('data-value');
        });
    });
  
    // RSVP form submission
    document.getElementById('rsvpForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const selectedOption = document.querySelector('.rsvp-option.selected');
        if (!selectedOption) {
            alert('Please select your attendance status');
            return;
        }
        // In a real app, send RSVP to backend here
        showRSVPSuccessMessage();
        document.getElementById('rsvpModal').style.display = 'none';
        document.querySelector('.rsvp-option.selected')?.classList.remove('selected');
    });
  
    // Close modal on close button
    document.getElementById('closeRsvpModal').onclick = function() {
        document.getElementById('rsvpModal').style.display = 'none';
        document.querySelector('.rsvp-option.selected')?.classList.remove('selected');
    };
  
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('rsvpModal');
        if (event.target === modal) {
            modal.style.display = 'none';
            document.querySelector('.rsvp-option.selected')?.classList.remove('selected');
        }
    });
  
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
  })
  
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
          // Redirect to home page
          window.location.href = "index.html"
        })
        logoutLi.appendChild(logoutLink)
        navLinks.appendChild(logoutLi)
      }
  
      // Update profile icon to indicate logged in state
      if (profileIcon) {
        profileIcon.className = "fas fa-user" // Solid user icon for logged in users
      }
    } else {
      // Ensure profile icon shows not logged in state
      if (profileIcon) {
        profileIcon.className = "fas fa-user-circle" // Outline user icon for guests
      }
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
  