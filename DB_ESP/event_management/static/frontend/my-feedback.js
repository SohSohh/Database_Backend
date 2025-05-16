// Demo data for pending feedback
const demoPendingFeedback = [
    {
        eventId: 1,
        eventName: "Tech Workshop 2024",
        eventDate: "2024-02-10",
        societyName: "Computer Science Society"
    },
    {
        eventId: 2,
        eventName: "Photography Exhibition",
        eventDate: "2024-02-12",
        societyName: "Photography Club"
    }
];

// Demo data for given feedback
const demoGivenFeedback = [
    {
        eventId: 3,
        eventName: "Web Development Seminar",
        eventDate: "2024-01-15",
        societyName: "Computer Science Society",
        rating: 5,
        comment: "Great workshop with practical examples!",
        feedbackDate: "2024-01-16"
    },
    {
        eventId: 4,
        eventName: "Cultural Night",
        eventDate: "2024-01-20",
        societyName: "Cultural Society",
        rating: 4,
        comment: "Amazing performances and food!",
        feedbackDate: "2024-01-21"
    }
];

// Function to populate pending feedback
function populatePendingFeedback() {
    const feedbackList = document.getElementById('pendingFeedback');
    feedbackList.innerHTML = '';

    if (demoPendingFeedback.length === 0) {
        feedbackList.innerHTML = `
            <div class="no-feedback">
                <i class="fas fa-check-circle"></i>
                <p>No pending feedback</p>
            </div>
        `;
        return;
    }

    demoPendingFeedback.forEach(feedback => {
        const feedbackItem = document.createElement('div');
        feedbackItem.className = 'feedback-item pending';
        feedbackItem.innerHTML = `
            <div class="feedback-header">
                <div class="feedback-event">
                    <h3>${feedback.eventName}</h3>
                    <span class="feedback-date">
                        <i class="fas fa-calendar"></i>
                        ${new Date(feedback.eventDate).toLocaleDateString()}
                    </span>
                </div>
                <span class="society-name">${feedback.societyName}</span>
            </div>
            <div class="feedback-actions">
                <button class="btn btn-primary">
                    <i class="fas fa-star"></i> Rate Event
                </button>
            </div>
        `;
        feedbackList.appendChild(feedbackItem);
    });
}

// Open modal when "Rate Event" is clicked
function openFeedbackModal(eventTitle) {
    document.getElementById('feedbackModal').style.display = 'block';
    document.getElementById('feedbackModalTitle').textContent = eventTitle;

    // Reset stars and textarea
    document.querySelectorAll('#feedbackModal .star').forEach(star => star.classList.remove('active'));
    document.getElementById('selectedRating').value = '';
    document.getElementById('feedbackComment').value = '';
}

// Close modal logic
function closeFeedbackModal() {
    document.getElementById('feedbackModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target === document.getElementById('feedbackModal')) {
        closeFeedbackModal();
    }
}

// Handle feedback form submission
document.getElementById('feedbackForm').onsubmit = function(e) {
  e.preventDefault();
  const rating = document.getElementById('selectedRating').value;
  const comment = document.getElementById('feedbackComment').value.trim();
  if (!rating) {
    alert('Please select a rating');
    return;
  }
  if (!comment) {
    alert('Please enter your feedback');
    return;
  }
  // TODO: Save feedback (e.g., send to backend or localStorage)
  showSuccessMessage('Thank you for your feedback!');
  document.getElementById('feedbackModal').style.display = 'none';
  this.reset();
  // Optionally, update the UI to remove the pending feedback
};

// Show success message (like in announcements)
function showSuccessMessage(msg) {
  const successMessage = document.createElement('div');
  successMessage.className = 'success-message';
  successMessage.textContent = msg || 'Thank you for your feedback!';
  successMessage.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--primary-color, #430b0b);
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
  setTimeout(() => {
    successMessage.style.opacity = '1';
    successMessage.style.transform = 'translateY(0)';
  }, 100);
  setTimeout(() => {
    successMessage.style.opacity = '0';
    successMessage.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      document.body.removeChild(successMessage);
    }, 300);
  }, 3000);
}

// Function to populate given feedback
function populateGivenFeedback() {
    const feedbackList = document.getElementById('givenFeedback');
    feedbackList.innerHTML = '';

    if (demoGivenFeedback.length === 0) {
        feedbackList.innerHTML = `
            <div class="no-feedback">
                <i class="fas fa-comment-slash"></i>
                <p>No feedback given yet</p>
            </div>
        `;
        return;
    }

    demoGivenFeedback.forEach(feedback => {
        const feedbackItem = document.createElement('div');
        feedbackItem.className = 'feedback-item given';
        feedbackItem.innerHTML = `
            <div class="feedback-header">
                <div class="feedback-event">
                    <h3>${feedback.eventName}</h3>
                    <span class="feedback-date">
                        <i class="fas fa-calendar"></i>
                        ${new Date(feedback.eventDate).toLocaleDateString()}
                    </span>
                </div>
                <span class="society-name">${feedback.societyName}</span>
            </div>
            <div class="feedback-content">
                <div class="feedback-rating">
                    ${generateStarRating(feedback.rating)}
                </div>
                <p class="feedback-comment">${feedback.comment}</p>
                <span class="feedback-submitted">
                    <i class="fas fa-clock"></i>
                    Submitted on ${new Date(feedback.feedbackDate).toLocaleDateString()}
                </span>
            </div>
        `;
        feedbackList.appendChild(feedbackItem);
    });
}

// Helper function to generate star rating
function generateStarRating(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    populatePendingFeedback();
    populateGivenFeedback();

    // Add logout handler
    document.getElementById('logout-btn').addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = 'login.html';
    });

    // Attach modal openers
    document.querySelectorAll('.btn.btn-primary').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const eventTitle = this.closest('.feedback-item').querySelector('h3').textContent;
            openFeedbackModal(eventTitle);
        });
    });

    // Modal close logic
    document.querySelector('#feedbackModal .close-modal').onclick = function() {
        document.getElementById('feedbackModal').style.display = 'none';
    };
    window.onclick = function(event) {
        if (event.target === document.getElementById('feedbackModal')) {
            document.getElementById('feedbackModal').style.display = 'none';
        }
    };

    // Star rating logic
    document.querySelectorAll('#feedbackModal .star').forEach(star => {
        star.addEventListener('click', function() {
            const rating = this.getAttribute('data-rating');
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

    // Feedback form submission
    document.getElementById('feedbackForm').onsubmit = function(e) {
        e.preventDefault();
        const rating = document.getElementById('selectedRating').value;
        const comment = document.getElementById('feedbackComment').value.trim();
        if (!rating) {
            alert('Please select a rating');
            return;
        }
        if (!comment) {
            alert('Please enter your feedback');
            return;
        }
        // Save feedback logic here if needed
        showSuccessMessage('Thank you for your feedback!');
        document.getElementById('feedbackModal').style.display = 'none';
        this.reset();
    };
}); 