document.addEventListener("DOMContentLoaded", () => {
  // Configuration
  const BASE_URL = "http://localhost:8000" // Replace with your actual base URL
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjo0ODk5OTA2NDAxLCJpYXQiOjE3NDYzMDY0MDEsImp0aSI6ImNjZmEzZTFiMmU2YTRjZmU4YzU4M2FiYjAwYmNmMjcwIiwidXNlcl9pZCI6OX0.uolpG4ckeSk3iwSWG_GmxJShZ6tU5Eufgc1sEqmwe9c"

  // Elements
  const loadingIndicator = document.getElementById("loading-indicator")
  const eventDetailsSection = document.getElementById("event-details-section")
  const commentsContainer = document.getElementById("comments-container")
  const errorMessage = document.getElementById("error-message")
  const successMessage = document.getElementById("success-message")
  const deleteModal = document.getElementById("delete-modal")
  const deleteEventBtn = document.getElementById("delete-event-btn")
  const cancelDeleteBtn = document.getElementById("cancel-delete")
  const confirmDeleteBtn = document.getElementById("confirm-delete")
  const closeModalBtn = document.querySelector(".close-modal")
  const editEventBtn = document.getElementById("edit-event-btn")
  const menuToggle = document.querySelector(".menu-toggle")
  const sidebar = document.querySelector(".sidebar")

  // Get event ID from URL
  const urlParams = new URLSearchParams(window.location.search)
  const eventId = urlParams.get("id")

  // Check if event ID exists
  if (!eventId) {
    showError("No event ID provided")
    loadingIndicator.style.display = "none"
    return
  }

  // Initialize the page
  initPage()

  // Function to initialize the page
  function initPage() {
    // Toggle mobile menu
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("show")
    })

    // Load event details
    loadEventDetails()

    // Set up event listeners
    setupEventListeners()

    // Set up comment form
    setupCommentForm()
  }

  // Function to load event details
  function loadEventDetails() {
    loadingIndicator.style.display = "flex"
    eventDetailsSection.style.display = "none"

    fetch(`${BASE_URL}/api/events/${eventId}/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        displayEventDetails(data)
        loadEventComments()
      })
      .catch((error) => {
        showError(`Failed to load event details: ${error.message}`)
        loadingIndicator.style.display = "none"
      })
  }

  // Function to display event details
  function displayEventDetails(event) {
    // Update breadcrumb
    document.getElementById("event-title-breadcrumb").textContent = event.name

    // Update event details
    document.getElementById("event-title").textContent = event.name
    document.getElementById("event-host").textContent = event.host_username
    document.getElementById("event-rating").textContent = event.average_rating
      ? `${event.average_rating.toFixed(1)} / 5`
      : "N/A"
    document.getElementById("event-attendees").textContent = event.attendee_count
    document.getElementById("event-date").textContent = formatDate(event.date)
    document.getElementById("event-time").textContent =
      `${formatTime(event.start_time)} - ${formatTime(event.end_time)}`
    document.getElementById("event-location").textContent = event.location
    document.getElementById("event-created").textContent = formatDateTime(event.created_at)
    // Enhanced: Render event description with modern container and typography
    const descContainer = document.getElementById("event-description")
    descContainer.innerHTML = event.description || "<em>No description provided.</em>"

    // Set banner image
    const bannerImg = document.getElementById("event-banner")
    if (event.banner) {
      bannerImg.src = event.banner
    } else {
      bannerImg.src = "/static/images/placeholder.png"
    }

    // Show event details section
    loadingIndicator.style.display = "none"
    eventDetailsSection.style.display = "block"
  }

  function setupCommentForm() {
    const commentForm = document.getElementById("comment-form")
    const commentText = document.getElementById("comment-text")
    const submitCommentBtn = document.getElementById("submit-comment-btn")
    const ratingInputs = document.querySelectorAll('input[name="rating"]')
    const ratingValue = document.getElementById("rating-value")

    // Set up star rating
    ratingInputs.forEach((input) => {
      input.addEventListener("change", function () {
        ratingValue.textContent = `${this.value} Star${this.value > 1 ? "s" : ""}`

        // Update star appearance
        ratingInputs.forEach((star, index) => {
          const starLabel = star.nextElementSibling.querySelector("i")
          if (index < input.value) {
            starLabel.className = "fas fa-star" // Filled star
          } else {
            starLabel.className = "far fa-star" // Empty star
          }
        })
      })
    })

    // Handle form submission
    commentForm.addEventListener("submit", (e) => {
      e.preventDefault()

      // Disable submit button and show loading
      submitCommentBtn.disabled = true
      submitCommentBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...'

      // Get selected rating (if any)
      const selectedRating = document.querySelector('input[name="rating"]:checked')

      // Create comment data
      const commentData = {
        content: commentText.value,
      }

      // Add rating if selected
      if (selectedRating) {
        commentData.rating = Number.parseInt(selectedRating.value)
      }

      // Submit comment
      submitComment(commentData, submitCommentBtn, commentForm)
    })
  }

  // Function to submit a comment
  function submitComment(commentData, submitButton, form) {
    fetch(`${BASE_URL}/api/events/${eventId}/comments/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(commentData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        // Reset form
        form.reset()

        // Reset star display
        const ratingLabels = document.querySelectorAll(".star-rating label i")
        ratingLabels.forEach((label) => {
          label.className = "far fa-star"
        })
        document.getElementById("rating-value").textContent = "No Rating"

        // Show success message
        showSuccess("Comment posted successfully!")

        // Reload comments
        loadEventComments()

        // Reset submit button
        submitButton.disabled = false
        submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Comment'
      })
      .catch((error) => {
        showError(`Failed to post comment: ${error.message}`)

        // Reset submit button
        submitButton.disabled = false
        submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Comment'
      })
  }

  // Function to load event comments
  function loadEventComments() {
    commentsContainer.innerHTML =
      '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading comments...</div>'

    fetch(`${BASE_URL}/api/events/${eventId}/comments/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        displayComments(data)
      })
      .catch((error) => {
        commentsContainer.innerHTML = `<div class="error-message">Failed to load comments: ${error.message}</div>`
      })
  }

  // Function to display comments
  function displayComments(comments) {
    if (!comments || comments.length === 0) {
      commentsContainer.innerHTML = '<div class="no-comments">No comments available for this event.</div>'
      return
    }

    let commentsHTML = ""
    comments.forEach((comment) => {
      commentsHTML += `
                <div class="comment">
                    <div class="comment-header">
                        <div class="comment-user">
                            <i class="fas fa-user-circle"></i>
                            <span class="username">${comment.username}</span>
                        </div>
                        <div class="comment-date">${formatDateTime(comment.created_at)}</div>
                    </div>
                    <div class="comment-body">
                        ${comment.content}
                    </div>
                    ${
                      comment.rating
                        ? `
                    <div class="comment-rating">
                        Rating: ${displayStars(comment.rating)}
                    </div>
                    `
                        : ""
                    }
                </div>
            `
    })

    commentsContainer.innerHTML = commentsHTML
  }

  // Function to display star rating
  function displayStars(rating) {
    const fullStar = '<i class="fas fa-star"></i>'
    const emptyStar = '<i class="far fa-star"></i>'
    let stars = ""

    for (let i = 1; i <= 5; i++) {
      stars += i <= rating ? fullStar : emptyStar
    }

    return stars
  }

  // Function to set up event listeners
  function setupEventListeners() {
    // Delete event button
    deleteEventBtn.addEventListener("click", () => {
      deleteModal.style.display = "block"
    })

    // Cancel delete button
    cancelDeleteBtn.addEventListener("click", () => {
      deleteModal.style.display = "none"
    })

    // Close modal button
    closeModalBtn.addEventListener("click", () => {
      deleteModal.style.display = "none"
    })

    // Confirm delete button
    confirmDeleteBtn.addEventListener("click", () => {
      deleteEvent()
    })

    // Edit event button
    editEventBtn.addEventListener("click", () => {
      window.location.href = `edit-event.html?id=${eventId}`
    })

    // Close modal when clicking outside
    window.addEventListener("click", (event) => {
      if (event.target === deleteModal) {
        deleteModal.style.display = "none"
      }
    })
  }

  // Function to delete event
  function deleteEvent() {
    confirmDeleteBtn.disabled = true
    confirmDeleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...'

    fetch(`${BASE_URL}/api/events/${eventId}/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        showSuccess("Event deleted successfully")
        setTimeout(() => {
          window.location.href = "manage-events.html"
        }, 1500)
      })
      .catch((error) => {
        showError(`Failed to delete event: ${error.message}`)
        deleteModal.style.display = "none"
        confirmDeleteBtn.disabled = false
        confirmDeleteBtn.innerHTML = "Delete Event"
      })
  }

  // Helper functions
  function formatDate(dateString) {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  function formatTime(timeString) {
    // Parse the timeString (format: "HH:MM:SS")
    const parts = timeString.split(":")
    const hours = Number.parseInt(parts[0], 10)
    const minutes = parts[1]

    // Convert to 12-hour format
    const period = hours >= 12 ? "PM" : "AM"
    const hour12 = hours % 12 || 12

    return `${hour12}:${minutes} ${period}`
  }

  function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString)
    const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
    return date.toLocaleDateString(undefined, options)
  }

  function getToken() {
    // Retrieve auth token from localStorage
    const token = localStorage.getItem("authToken")
    if (!token) {
      // Redirect to login if no token found
      window.location.href = "login.html"
      return null
    }
    return token
  }

  function showError(message) {
    errorMessage.textContent = message
    errorMessage.style.display = "block"

    // Hide after 5 seconds
    setTimeout(() => {
      errorMessage.style.display = "none"
    }, 5000)
  }

  function showSuccess(message) {
    successMessage.textContent = message
    successMessage.style.display = "block"

    // Hide after 5 seconds
    setTimeout(() => {
      successMessage.style.display = "none"
    }, 5000)
  }
})
