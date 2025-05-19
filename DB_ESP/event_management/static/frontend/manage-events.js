// Ensure the global API_BASE_URL is loaded
if (!window.API_BASE_URL) {
  throw new Error('API_BASE_URL is not defined. Make sure config.js is loaded before this script.');
}
const token = localStorage.getItem("access_token")
if (!token) {
  console.error("Missing access token. Redirecting to login...")
  window.location.href = "login.html"
}

function populateSocietyEvents() {
  const eventsGrid = document.getElementById("societyEvents")
  eventsGrid.innerHTML = "<p>Loading events...</p>"

  fetch(`${window.API_BASE_URL}/events/handler?ordering=date/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) throw new Error("Failed to fetch events")
      return response.json()
    })
    .then((data) => {
      // The API returns an array of events directly
      const events = Array.isArray(data) ? data : []
      eventsGrid.innerHTML = ""
      if (events.length === 0) {
        eventsGrid.innerHTML = "<p>No events found.</p>"
        return
      }
      events.forEach((event) => {
        const eventCard = document.createElement("div")
        eventCard.className = "event-card"
        // Make the entire card clickable
        eventCard.style.cursor = "pointer"
        eventCard.addEventListener("click", () => {
          window.location.href = `announcement-details.html?id=${event.id}`
        })

        eventCard.innerHTML = `
                <div class="event-image">
                    <img src="${event.banner || "/static/images/placeholder.png"}" 
                        alt="${event.name}" 
                        onerror="this.onerror=null;this.src='/static/images/placeholder.png';">
                </div>
                <div class="event-details">
                    <h3>${event.name}</h3>
                    <p class="event-date">
                        <i class="fas fa-calendar"></i> ${new Date(event.date).toLocaleDateString()}
                        <i class="fas fa-clock"></i> ${event.start_time}
                    </p>
                    <p class="event-location">
                        <i class="fas fa-map-marker-alt"></i> ${event.location}
                    </p>
                    <p class="event-description">${event.description}</p>
                    <div class="event-stats">
                        <span class="event-capacity">
                            <i class="fas fa-users"></i> ${event.attendee_count} attendees
                        </span>
                    </div>
                    <div class="event-actions">
                        <button class="btn btn-primary event-details-btn" data-event-id="${event.id}">
                            <i class="fas fa-eye"></i> Details
                        </button>
                        <button class="btn btn-primary event-manage-btn" data-event-id="${event.id}">
                            <i class="fas fa-edit"></i> Manage
                        </button>
                    </div>
                </div>
            `
        eventsGrid.appendChild(eventCard)
      })

      // Add event listeners to manage buttons to prevent event bubbling
      document.querySelectorAll(".event-manage-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
          e.stopPropagation() // Prevent the card click event from firing
          const eventId = button.getAttribute("data-event-id")
          window.location.href = `edit-event.html?id=${eventId}`
        })
      })

      // Add event listeners to details buttons
      document.querySelectorAll(".event-details-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
          e.stopPropagation() // Prevent the card click event from firing
          const eventId = button.getAttribute("data-event-id")
          window.location.href = `event-details.html?id=${eventId}`
        })
      })
    })
    .catch((error) => {
      eventsGrid.innerHTML = `<p style="color:red;">Error loading events: ${error.message}</p>`
    })
}

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  // Populate events
  populateSocietyEvents()

  // Add event listeners
  document.getElementById("logout-btn").addEventListener("click", () => {
    // Clear session and redirect to login
    sessionStorage.clear()
    window.location.href = "login.html"
  })
})
