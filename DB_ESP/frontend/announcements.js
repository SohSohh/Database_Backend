// Global Constants
const API_BASE_URL = "http://127.0.0.1:8000/api";

document.addEventListener("DOMContentLoaded", () => {
      // Initial Setup
    const accessToken = localStorage.getItem("access_token");  
    console.log("Initial access token:", accessToken ? "Present" : "Not found"); // Debug log
  
    // Initialize
    updateNavigation(accessToken)
    loadCategories()
    console.log("Loading events and setting up listeners..."); // Debug log
    
    // Load events first, then initialize everything else
    loadEvents().then(() => {
      initializeHorizontalScroll()
      addCarouselNavigation();

      console.log("Event loading complete. Delegated RSVP listener is active.");
    }).catch(error => {
      console.error("Error during initialization:", error);
    });
  
    // Sticky Header
    const header = document.querySelector("header")
    if (header) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 50) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }
        });
    }  
    // Mobile Navigation
    const hamburger = document.getElementById("hamburger-menu")
    const navLinks = document.querySelector(".nav-links")
  
    if (hamburger && navLinks) {
      hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("open")
        navLinks.classList.toggle("active");
      });

      // Close mobile menu when clicking a link
      document.querySelectorAll(".nav-links a").forEach((link) => {
        link.addEventListener("click", () => {
          hamburger.classList.remove("open");
          navLinks.classList.remove("active");
        });
      });
    }

    // Feedback Modal logic (moved from separate DOMContentLoaded)
    const feedbackModal = document.getElementById("feedbackModal");
    const feedbackForm = document.getElementById("feedbackForm");
    const feedbackCloseBtn = document.querySelector("#feedbackModal .close-modal");

    if (feedbackModal && feedbackForm && feedbackCloseBtn) {
        document.querySelectorAll(".feedback-btn").forEach((button) => {
            button.addEventListener("click", function () {
                const cardContent = this.closest(".card-content") || this.closest(".event-details"); // Adjust for event cards
                if (cardContent) {
                    const announcementTitleElement = cardContent.querySelector("h3");
                    if (announcementTitleElement) {
                        document.getElementById("feedbackTitle").textContent = announcementTitleElement.textContent;
                    }
                }
                feedbackModal.style.display = "block";
            });
        });

        feedbackCloseBtn.addEventListener("click", () => {
            feedbackModal.style.display = "none";
            document.querySelectorAll("#feedbackModal .star").forEach((star) => star.classList.remove("active"));
            feedbackForm.reset();
        });

        window.addEventListener("click", (e) => {
            if (e.target === feedbackModal) {
                feedbackModal.style.display = "none";
                document.querySelectorAll("#feedbackModal .star").forEach((star) => star.classList.remove("active"));
                feedbackForm.reset();
            }
        });

        document.querySelectorAll("#feedbackModal .star").forEach((star) => {
            star.addEventListener("click", () => {
                const rating = star.getAttribute("data-rating");
                document.getElementById("selectedRating").value = rating;
                document.querySelectorAll("#feedbackModal .star").forEach((s) => {
                    s.classList.toggle("active", parseInt(s.getAttribute("data-rating")) <= parseInt(rating));
                });
            });
        });
    }

    // Delegated RSVP listener (moved from separate DOMContentLoaded)
    const eventsContainer = document.getElementById('events-container');
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
                if (rsvpButton) {
                     rsvpButton.disabled = false;
                     rsvpButton.style.opacity = '1';
                }
            }
        });
    } else {
        console.error('Events container not found for RSVP delegation. RSVP functionality might not work.');
    }    // Add SourceSans3 font to event action buttons
    const style = document.createElement('style');
    style.textContent = `
      .details-btn, .rsvp-btn, .btn-primary, .btn-hero-primary {
        font-family: 'SourceSans3', sans-serif !important;
        letter-spacing: 0.2px;
      }
    `;
    document.head.appendChild(style);
}); // End of main DOMContentLoaded

  
  function updateNavigation(accessToken) {
    const navLinks = document.querySelector(".nav-links")
    const profileIcon = document.querySelector(".profile-icon i")
  
    if (!navLinks || !profileIcon) return
  
    // Get current page
    const currentPage = window.location.pathname
  
    if (accessToken) {
      // User is logged in
      // profileIcon.classList.remove("fa-user") // Keep as fa-user
      // profileIcon.classList.add("fa-user-circle") // Do not change to user-circle
  
      // Update profile icon link to dashboard
      const profileLink = profileIcon.closest("a")
      if (profileLink) {
        profileLink.href = "dashboard.html"
      }
    }
  }
  
  // Function to create announcement cards dynamically
  function createAnnouncementCard(announcement) {
    const card = document.createElement("div")
    card.className = "announcement-card"
  
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
      `
    return card
  }
  
  function getCategoryLabel(category) {
    switch (category) {
      case "important":
        return "Important"
      case "educational":
        return "Educational"
      case "event":
        return "Event"
      default:
        return "General"
    }
  }
  
  // In a real application, you would fetch announcements from your backend
  async function loadAnnouncements() {
    const container = document.getElementById("announcements-container")
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading announcements...</div>'
  
    try {
      const url = `${API_BASE_URL}/events/?ordering=date&category=announcement`
      const options = {
        method: "GET",
      }
      console.log("Request:", {
        method: options.method,
        url: url,
        headers: options.headers,
      })
      const response = await fetch(url, options)
      const announcements = await response.json()
      console.log("Response:", {
        status: response.status,
        data: announcements,
      })
  
      container.innerHTML = ""
  
      if (announcements.length === 0) {
        container.innerHTML = '<p class="no-results">No announcements found.</p>'
        return
      }
  
      announcements.forEach((announcement) => {
        container.appendChild(createAnnouncementCard(announcement))
      })
    } catch (error) {
      console.error("Error loading announcements:", error)
      container.innerHTML = '<p class="error">Failed to load announcements.</p>'
    }
  }
  
  // RSVP Functionality
  function showRSVPSuccessMessage() {
    const successMessage = document.createElement("div")
    successMessage.className = "success-message"
    successMessage.textContent = "Thank you for your RSVP!"
    successMessage.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: var(--glow-color);
          color: white;
          padding: 15px 25px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          opacity: 0;
          transform: translateY(-10px);
          transition: all 0.3s ease;
          z-index: 1000;
      `
  
    document.body.appendChild(successMessage)
  
    // Animate in
    setTimeout(() => {
      successMessage.style.opacity = "1"
      successMessage.style.transform = "translateY(0)"
    }, 100)
  
    // Remove after 3 seconds
    setTimeout(() => {
      successMessage.style.opacity = "0"
      successMessage.style.transform = "translateY(-10px)"
      setTimeout(() => {
        document.body.removeChild(successMessage)
      }, 300)
    }, 3000)
  }
  
  // RSVP Button Functionality
  function setupRSVPListeners() {
    console.log("Running setupRSVPListeners (ensure RSVP click handling is removed if using delegation)");
    const buttons = document.querySelectorAll(".rsvp-btn");
    
    if (buttons.length === 0) {
      return;
    }
    
    buttons.forEach(button => {
      // Remove existing listeners and set up new one
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
      // The event listener that was here has been removed.
      // Clicks are now handled by the delegated listener on 'eventsContainer'.
      // This function can be further simplified or removed if it has no other purpose.
    });
  }
  

  function showFeedbackSuccessMessage() {
    const successMessage = document.createElement("div")
    successMessage.className = "success-message"
    successMessage.textContent = "Thank you for your feedback!"
    successMessage.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: var(--glow-color);
          color: white;
          padding: 15px 25px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          opacity: 0;
          transform: translateY(-10px);
          transition: all 0.3s ease;
          z-index: 1000;
      `
  
    document.body.appendChild(successMessage)
  
    // Animate in
    setTimeout(() => {
      successMessage.style.opacity = "1"
      successMessage.style.transform = "translateY(0)"
    }, 100)
  
    // Remove after 3 seconds
    setTimeout(() => {
      successMessage.style.opacity = "0"
      successMessage.style.transform = "translateY(-10px)"
      setTimeout(() => {
        document.body.removeChild(successMessage)
      }, 300)
    }, 3000)
  }
    // Improved event card creation with smaller, more modern design
  function createEventCard(event) {
    const card = document.createElement("div")
    card.className = "event-card"
  
    // Format date for better display
    const eventDate = new Date(event.date)
    const formattedDate = eventDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  
    // Truncate description for cleaner cards
    const shortDescription =
      event.description.length > 120 ? event.description.substring(0, 120) + "..." : event.description
  
    // Use /images/placeholder.png if event.banner is missing or empty
    const bannerUrl = event.banner && event.banner.trim() !== "" ? event.banner : "static/images/placeholder.png"
  
    card.innerHTML = `
      <div class="event-image">
        <img src="${bannerUrl}" 
          alt="${event.name}" 
          onerror="this.onerror=null;this.src='/images/placeholder.png';">
      </div>
      <span class="category-badge">${event.category_name || "Event"}</span>
      <div class="event-details">
        <h3>${event.name}</h3>
        <div class="event-meta">
          <p><i class="fas fa-user"></i> ${event.host_username}</p>
          <p><i class="fas fa-calendar"></i> ${formattedDate}</p>
          <p><i class="fas fa-clock"></i> ${event.start_time || "19:00"} - ${event.end_time || "22:00"}</p>
          <p><i class="fas fa-map-marker-alt"></i> ${event.location || "Event Location"}</p>
        </div>
        <p class="event-description">${shortDescription}</p>
        <div class="event-footer">
          <div class="event-stats">
            <span><i class="fas fa-users"></i> <span class="count">${event.attendee_count || 0}</span> attending</span>
            ${event.average_rating ? `<span><i class="fas fa-star"></i> ${event.average_rating} rating</span>` : ""}
          </div>
          <div class="action-buttons">
            <a href="announcement-details.html?id=${event.id}" class="details-btn"><i class="fas fa-info-circle"></i> Details</a>
            ${(() => {              if (event.is_attending) {
                return `<button class="rsvp-btn rsvp-active" data-event-id="${event.id}" data-event-name="${event.name}">
                          <i class="fas fa-check-circle"></i>
                          <span>RSVP'd</span>
                        </button>`
              } else {
                return `<button class="rsvp-btn" data-event-id="${event.id}" data-event-name="${event.name}">
                          <i class="fas fa-calendar-check"></i>
                          <span>RSVP</span>
                        </button>`
              }
            })()}
          </div>
        </div>
      </div>
    `
  
    return card
  }
  
  async function loadCategories() {
    try {
      const url = `${API_BASE_URL}/events/categories/`
      const options = {
        method: "GET",
        headers: {
          Authorization: localStorage.getItem("access_token") ? `Bearer ${localStorage.getItem("access_token")}` : "",
        },
      }
  
      const response = await fetch(url, options)
      const categories = await response.json()
  
      const filterContainer = document.getElementById("category-filters")
      if (!filterContainer) return
  
      filterContainer.innerHTML = "" // Clear existing filters
  
      // Add "All" filter first
      const allButton = document.createElement("button")
      allButton.className = "filter-btn active"
      allButton.setAttribute("data-filter", "all")
      allButton.textContent = "All Events"
      allButton.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.remove("active"))
        allButton.classList.add("active")
        loadEvents()
      })
      filterContainer.appendChild(allButton)
  
      // Add category filters
      categories.forEach((category) => {
        const button = document.createElement("button")
        button.className = "filter-btn"
        button.setAttribute("data-filter", category.id)
        button.textContent = category.name
        button.addEventListener("click", () => {
          document.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.remove("active"))
          button.classList.add("active")
          loadEvents(category.id)
        })
        filterContainer.appendChild(button)
      })
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }
  
  async function fetchWithLogs(url, options = {}) {
    const accessToken = localStorage.getItem("access_token")
    const defaultOptions = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  
    const finalOptions = { ...defaultOptions, ...options }
  
    console.log("Request:", {
      method: finalOptions.method || "GET",
      url: url,
      headers: finalOptions.headers,
      body: finalOptions.body ? JSON.parse(finalOptions.body) : undefined,
    })
  
    const response = await fetch(url, finalOptions)
    let data
    try {
      data = await response.json()
    } catch (e) {
      data = null
    }
  
    console.log("Response:", {
      status: response.status,
      data: data,
    })
  
    if (!response.ok) {
      throw new Error("Request failed")
    }
  
    return data
  }
  
  // Load events and return a promise
  async function loadEvents(categoryId = null) {
    const container = document.getElementById("events-container");
    if (!container) {
        console.error("Fatal: Events container ('events-container') not found in loadEvents. Cannot load events.");
        return Promise.reject("Events container not found");
    }
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading events...</div>'
  
    try {
      console.log("Started loading events..."); // Debug log
      let url = `${API_BASE_URL}/events/?ordering=date`
      const accessToken = localStorage.getItem("access_token")
      if (categoryId && categoryId !== "all") {
        url += `&category=${categoryId}`
      }
  
      const options = {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
  
      console.log("Request:", {
        method: options.method,
        url: url,
        headers: options.headers,
      })
  
      const response = await fetch(url, options)
      const events = await response.json()
  
      console.log("Response:", {
        status: response.status,
        data: events,
      })
  
      container.innerHTML = ""
  
      // Use events.data if present, otherwise use events directly
      const eventList = Array.isArray(events) ? events : Array.isArray(events.data) ? events.data : []
      if (eventList.length === 0) {
        container.innerHTML = '<p class="no-results">No events found.</p>'
        return Promise.resolve(); // Return resolved promise
      }
  
      eventList.forEach((event) => {
        const card = createEventCard(event);
        container.appendChild(card);
        
        // Find and update RSVP button state
        const rsvpButton = card.querySelector('.rsvp-btn');
        if (rsvpButton) {
          updateRSVPButton(rsvpButton, event.is_attending);
        }
      });

      // Horizontal scroll and carousel navigation are initialized in the .then()
      // block of the initial loadEvents call in DOMContentLoaded after this promise resolves.
      // If loadEvents is called again (e.g., after RSVP or filter change), these might need re-initialization.
      return Promise.resolve(); // Return resolved promise when successful
    } catch (error) {
      console.error("Error loading events:", error);
      container.innerHTML = '<p class="error">Failed to load events.</p>';
      return Promise.reject(error); // Return rejected promise on error
    }
  }
    // Helper function to handle RSVP button state changes
  function updateRSVPButton(button, isAttending) {
    console.log('Updating button state:', { buttonId: button.getAttribute('data-event-id'), isAttending });
    
    if (isAttending) {
      button.classList.add('rsvp-active');
      button.innerHTML = '<i class="fas fa-check-circle"></i><span>RSVP\'d</span>';
    } else {
      button.classList.remove('rsvp-active');
      button.innerHTML = '<i class="fas fa-calendar-check"></i><span>RSVP</span>';
    }
  }

  // Simple and reliable toast notification function
function showSuccessToast(message, isUnattend = false, isError = false) {
    // Remove any existing toasts first
    const existingToasts = document.querySelectorAll('.success-message');
    existingToasts.forEach(toast => {
        if (document.body.contains(toast)) {
            document.body.removeChild(toast);
        }
    });
    
    // Create new toast element
    const toast = document.createElement('div');
    toast.className = 'success-message';
    
    // Determine the toast type and set properties accordingly
    let icon, title, bgColor;
    
    if (isError === true) {
        // Error toast
        icon = 'fa-exclamation-circle';
        title = 'Notification';
        bgColor = '#e74c3c'; // Red
    } else if (isUnattend === true) {
        // Unattend toast (navy blue)
        icon = 'fa-calendar-minus';
        title = 'RSVP Canceled';
        bgColor = '#002366'; // Navy blue (matching glow-color)
    } else {
        // Attend toast (green)
        icon = 'fa-calendar-check';
        title = 'Success!';
        bgColor = '#117a00'; // Green
    }
    
    // Set the toast HTML content
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <div class="message-content">
            <div class="message-title">${title}</div>
            <div class="message-text">${message}</div>
        </div>
        <button class="close-toast" aria-label="Close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Set background color explicitly
    toast.style.backgroundColor = bgColor;
    
    // Add to DOM
    document.body.appendChild(toast);
    
    // Show toast with animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Add close button functionality
    const closeBtn = toast.querySelector('.close-toast');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            toast.classList.add('hide');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 400);
        });
    }
    
    // Auto-hide after delay
    setTimeout(() => {
        if (document.body.contains(toast)) {
            toast.classList.add('hide');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 400);
        }
    }, 3000);
}

// Update the handleRSVP function to correctly use the toast function
async function handleRSVP(eventId, eventName, unattend = false) {
    const button = document.querySelector(`.rsvp-btn[data-event-id="${eventId}"]`);
    
    try {
        const accessToken = localStorage.getItem("access_token");
        if (!accessToken) {
            // Error case - not logged in
            showSuccessToast("Please log in to RSVP.", false, true);
            if (button) {
                button.disabled = false;
                button.style.opacity = '1';
            }
            return;
        }

        const url = `${API_BASE_URL}/events/${eventId}/attendance/`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                action: unattend ? "unattend" : "attend"
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Success case - show correct message with color based on action
            if (unattend) {
                // Navy blue toast for cancellation
                showSuccessToast(`You have canceled your RSVP for ${eventName}.`, true, false);
            } else {
                // Green toast for attending
                showSuccessToast(`You have successfully RSVP'd to ${eventName}!`, false, false);
            }

            if (button) {
                updateRSVPButton(button, !unattend);
                
                const countElement = button.closest('.event-footer')?.querySelector('.count');
                if (countElement) {
                    let currentCount = parseInt(countElement.textContent);
                    countElement.textContent = unattend ? Math.max(0, currentCount - 1) : currentCount + 1;
                }
            }
        } else {
            // Error case - API returned an error
            const errorMsg = data.detail || data.message || "Failed to update RSVP status.";
            showSuccessToast(errorMsg, false, true);
        }
    } catch (error) {
        // Error case - exception occurred
        console.error("Error updating RSVP:", error);
        showSuccessToast("Failed to update RSVP status. Please try again.", false, true);
    } finally {
        // Always re-enable the button
        if (button) {
            button.disabled = false;
            button.style.opacity = '1';
        }
    }
}
