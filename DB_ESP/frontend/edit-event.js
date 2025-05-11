// Get event ID from URL

const token = localStorage.getItem('access_token');
const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('id');

// API Configuration - You can adjust these to match your API
const API_CONFIG = {
    baseUrl: "http://localhost:8000/api", // Change this to your API base URL
    endpoints: {
        events: "/events/",
        eventDetails: (id) => `/events/${id}/`,
        eventBanner: (id) => `/events/${id}/banner/`
    },
    headers: {
        // Default headers for API requests
        "Content-Type": "application/json",
        // You may need to include auth headers here, for example:
        "Authorization": `Bearer ${token}`,
    }
};

// API Service
const api = {
    // Method to handle API requests
    async request(endpoint, method = 'GET', data = null, headers = {}) {
        try {
            const url = `${API_CONFIG.baseUrl}${endpoint}`;
            const requestHeaders = { ...API_CONFIG.headers, ...headers };
            
            // Configure request options
            const options = {
                method,
                headers: requestHeaders,
                credentials: 'include', // Include credentials for cross-origin requests if needed
            };

            // Add body to request if data is provided (and not a GET request)
            if (data && method !== 'GET') {
                if (data instanceof FormData) {
                    // For FormData, don't set Content-Type header - browser will set it with boundary
                    delete options.headers['Content-Type'];
                    options.body = data;
                } else {
                    options.body = JSON.stringify(data);
                }
            }

            const response = await fetch(url, options);
            
            // Handle 204 No Content response (for DELETE operations)
            if (response.status === 204) {
                return { success: true };
            }
            
            // Parse response
            let responseData;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }

            // Handle error responses
            if (!response.ok) {
                const error = new Error(responseData.message || 'API request failed');
                error.status = response.status;
                error.response = responseData;
                throw error;
            }

            return responseData;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    },

    events: {
        // Get all events
        async getAll() {
            return await api.request(API_CONFIG.endpoints.events);
        },
        
        // Get single event details
        async getEventDetails(eventId) {
            return await api.request(API_CONFIG.endpoints.eventDetails(eventId));
        },
        
        // Update an event
        async updateEvent(eventId, data) {
            return await api.request(
                API_CONFIG.endpoints.eventDetails(eventId), 
                'PATCH', // Using PATCH for partial updates
                data
            );
        },
        
        // Delete an event
        async deleteEvent(eventId) {
            return await api.request(
                API_CONFIG.endpoints.eventDetails(eventId),
                'DELETE'
            );
        },
        
        // Upload event banner image
        async uploadBanner(eventId, formData) {
            return await api.request(
                API_CONFIG.endpoints.eventBanner(eventId),
                'POST',
                formData
            );
        }
    }
};

// Function to populate form with event data
function populateEventForm(event) {
    // Basic info
    document.getElementById('eventName').value = event.name || '';
    document.getElementById('eventDescription').value = event.description || '';
    
    // Date and time
    document.getElementById('eventDate').value = event.date || '';
    document.getElementById('eventTime').value = event.start_time || '';
    document.getElementById('eventEndTime').value = event.end_time || '';
    
    // Location
    document.getElementById('eventLocation').value = event.location || '';
    
    // Set image if available
    const imagePreview = document.getElementById('currentEventImage');
    const noImageText = document.getElementById('no-image-text');
    
    if (event.banner) {
        imagePreview.src = event.banner;
        imagePreview.style.display = 'block';
        if (noImageText) noImageText.style.display = 'none';
    } else {
        imagePreview.style.display = 'none';
        if (noImageText) noImageText.style.display = 'block';
    }
}

// Function to fetch event data from API
async function fetchEventData() {
    try {
        showLoadingIndicator(true);
        const eventData = await api.events.getEventDetails(eventId);
        showLoadingIndicator(false);
        return eventData;
    } catch (error) {
        showLoadingIndicator(false);
        showErrorMessage(`Error loading event: ${error.message || 'Unknown error'}`);
        throw error;
    }
}

// Function to handle form submission
async function handleSubmit(event) {
    event.preventDefault();

    showLoadingIndicator(true);
    clearStatusMessages();

    try {
        // Use FormData for PATCH if image is present
        const formData = new FormData();
        formData.append('name', document.getElementById('eventName').value);
        formData.append('description', document.getElementById('eventDescription').value);
        formData.append('date', document.getElementById('eventDate').value);
        formData.append('start_time', document.getElementById('eventTime').value);
        formData.append('end_time', document.getElementById('eventEndTime').value || '');
        formData.append('location', document.getElementById('eventLocation').value);

        // Add image if selected
        const imageFile = document.getElementById('eventImage').files[0];
        if (imageFile) {
            formData.append('banner', imageFile);
        }

        // Send PATCH request with FormData
        await api.request(
            API_CONFIG.endpoints.eventDetails(eventId),
            'PATCH',
            formData,
            {} // No need to set Content-Type, browser will set it
        );

        showSuccessMessage('Event updated successfully!');
        setTimeout(() => {
            window.location.href = 'manage-events.html';
        }, 1500);

    } catch (error) {
        showErrorMessage(`Error updating event: ${error.message || 'Unknown error'}`);
    } finally {
        showLoadingIndicator(false);
    }
}

// Function to handle event deletion
async function handleDeleteEvent() {
    showLoadingIndicator(true);
    clearStatusMessages();
    
    try {
        await api.events.deleteEvent(eventId);
        showSuccessMessage('Event successfully deleted!');
        setTimeout(() => {
            window.location.href = 'manage-events.html';
        }, 1500);
    } catch (error) {
        showErrorMessage(`Error deleting event: ${error.message || 'Unknown error'}`);
        hideDeleteModal();
    } finally {
        showLoadingIndicator(false);
    }
}

// Modal controls
function showDeleteModal() {
    document.getElementById('delete-modal').style.display = 'flex';
}

function hideDeleteModal() {
    document.getElementById('delete-modal').style.display = 'none';
}

// Helper functions for UI feedback
function showLoadingIndicator(show) {
    const indicator = document.getElementById('loading-indicator');
    if (indicator) {
        indicator.style.display = show ? 'block' : 'none';
    }
}

function showSuccessMessage(message) {
    const element = document.getElementById('success-message');
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

function showErrorMessage(message) {
    const element = document.getElementById('error-message');
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

function clearStatusMessages() {
    const successMsg = document.getElementById('success-message');
    const errorMsg = document.getElementById('error-message');
    
    if (successMsg) successMsg.style.display = 'none';
    if (errorMsg) errorMsg.style.display = 'none';
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Check if event ID is provided
    if (!eventId) {
        showErrorMessage('No event ID provided');
        setTimeout(() => {
            window.location.href = 'manage-events.html';
        }, 1500);
        return;
    }

    // Fetch event data from API
    fetchEventData()
        .then(event => {
            // Populate form with event data
            populateEventForm(event);
        })
        .catch(error => {
            console.error('Error fetching event data:', error);
            showErrorMessage(`Failed to load event data: ${error.message}`);
            
            // Redirect after error
            setTimeout(() => {
                window.location.href = 'manage-events.html';
            }, 2000);
        });

    // Add form submit handler
    document.getElementById('editEventForm').addEventListener('submit', handleSubmit);

    // Add event listeners for cancel and logout
    document.getElementById('cancel-btn').addEventListener('click', () => {
        window.location.href = 'manage-events.html';
    });
    
    document.getElementById('logout-btn').addEventListener('click', () => {
        // Clear session and redirect to login
        sessionStorage.clear();
        window.location.href = 'login.html';
    });
    
    // Add event listeners for delete functionality
    document.getElementById('delete-event-btn').addEventListener('click', showDeleteModal);
    document.getElementById('cancel-delete').addEventListener('click', hideDeleteModal);
    document.getElementById('confirm-delete').addEventListener('click', handleDeleteEvent);
    document.querySelector('.close-modal').addEventListener('click', hideDeleteModal);
    
    // Close modal when clicking outside the modal content
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('delete-modal');
        if (event.target === modal) {
            hideDeleteModal();
        }
    });
});
