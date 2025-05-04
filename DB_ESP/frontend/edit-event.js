// Get event ID from URL
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
        "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjo0ODk5OTA2NDAxLCJpYXQiOjE3NDYzMDY0MDEsImp0aSI6ImNjZmEzZTFiMmU2YTRjZmU4YzU4M2FiYjAwYmNmMjcwIiwidXNlcl9pZCI6OX0.uolpG4ckeSk3iwSWG_GmxJShZ6tU5Eufgc1sEqmwe9c`
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
    
    // Location and capacity
    document.getElementById('eventLocation').value = event.location || '';
    document.getElementById('eventCapacity').value = event.attendees || '';
    
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
    
    // Show loading indicator
    showLoadingIndicator(true);
    clearStatusMessages();

    try {
        // Create the form data object for the API request
        const formData = {
            name: document.getElementById('eventName').value,
            description: document.getElementById('eventDescription').value,
            date: document.getElementById('eventDate').value,
            start_time: document.getElementById('eventTime').value,
            end_time: document.getElementById('eventEndTime').value || null,
            location: document.getElementById('eventLocation').value,
            capacity: parseInt(document.getElementById('eventCapacity').value)
        };

        // Handle file upload if a new image is selected
        const imageFile = document.getElementById('eventImage').files[0];
        if (imageFile) {
            // Create FormData for file upload
            const fileFormData = new FormData();
            fileFormData.append('banner', imageFile);
            
            // Upload the image first
            try {
                const uploadResponse = await api.events.uploadBanner(eventId, fileFormData);
                if (uploadResponse.banner) {
                    formData.banner = uploadResponse.banner;
                }
            } catch (uploadError) {
                throw new Error(`Image upload failed: ${uploadError.message}`);
            }
        }

        // Save the updated event data
        await api.events.updateEvent(eventId, formData);
        
        // Show success message
        showSuccessMessage('Event updated successfully!');
        
        // Redirect after a short delay
        setTimeout(() => {
            window.location.href = 'manage-events.html';
        }, 1500);
        
    } catch (error) {
        showErrorMessage(`Error updating event: ${error.message || 'Unknown error'}`);
    } finally {
        showLoadingIndicator(false);
    }
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
    
    // Add preview handler for image upload
    document.getElementById('eventImage').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imagePreview = document.getElementById('currentEventImage');
                const noImageText = document.getElementById('no-image-text');
                
                imagePreview.src = event.target.result;
                imagePreview.style.display = 'block';
                if (noImageText) noImageText.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });
});