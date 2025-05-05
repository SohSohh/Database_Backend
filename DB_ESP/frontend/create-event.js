document.addEventListener('DOMContentLoaded', function() {
    // Set your API base URL
    window.baseUrl = "http://localhost:8000";
    
    // Get auth token from localStorage, fallback to hardcoded token for development
    const token = localStorage.getItem('access_token');

    // Check if user is authenticated
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize UI elements
    initMobileMenu();
    initBannerPreview();
    fetchCategories();
    setupFormValidation();
    setupEventHandlers();

    // Mobile menu toggle
    function initMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', function() {
                sidebar.classList.toggle('active');
            });
        }
    }

    // Initialize banner image preview
    function initBannerPreview() {
        const bannerInput = document.getElementById('eventBanner');
        const previewContainer = document.getElementById('bannerPreview');
        
        if (bannerInput && previewContainer) {
            bannerInput.addEventListener('change', function() {
                previewContainer.innerHTML = '';
                
                if (this.files && this.files[0]) {
                    const file = this.files[0];
                    
                    // Validate file size (max 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                        showError('Banner image must be less than 5MB');
                        this.value = '';
                        return;
                    }
                    
                    // Validate file type
                    if (!file.type.match('image.*')) {
                        showError('Please select an image file');
                        this.value = '';
                        return;
                    }
                    
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.className = 'banner-preview';
                        previewContainer.appendChild(img);
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }

    // Fetch categories and populate the dropdown
    function fetchCategories() {
        const categorySelect = document.getElementById('eventCategory');
        
        showLoading();
        fetch(`${window.baseUrl}/api/events/categories/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        })
        .then(response => {
            hideLoading();
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            return response.json();
        })
        .then(data => {
            if (categorySelect) {
                categorySelect.innerHTML = '<option value="">Select a category</option>';
                data.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    categorySelect.appendChild(option);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching categories:', error);
            showError('Failed to load categories. Please try refreshing the page.');
            
            if (categorySelect) {
                categorySelect.innerHTML = '<option value="">Failed to load categories</option>';
            }
        });
    }

    // Form validation
    function setupFormValidation() {
        const form = document.getElementById('createEventForm');
        
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Validate form fields
                const requiredFields = form.querySelectorAll('[required]');
                let isValid = true;
                
                requiredFields.forEach(field => {
                    if (!field.value.trim()) {
                        isValid = false;
                        field.classList.add('error');
                        showError(`Please fill in all required fields`);
                    } else {
                        field.classList.remove('error');
                    }
                });

                // Validate times
                const startTime = document.getElementById('eventStartTime').value;
                const endTime = document.getElementById('eventEndTime').value;
                
                if (startTime && endTime && startTime >= endTime) {
                    isValid = false;
                    document.getElementById('eventEndTime').classList.add('error');
                    showError('End time must be after start time');
                }
                
                if (isValid) {
                    submitForm();
                }
            });
        }
    }

    // Submit the form
    function submitForm() {
        const form = document.getElementById('createEventForm');
        const submitBtn = document.getElementById('submitEventBtn');
        
        if (!form || !submitBtn) return;
        
        // Display loading state
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
        submitBtn.disabled = true;
        
        // Collect form data
        const formData = new FormData();
        formData.append('name', document.getElementById('eventTitle').value);
        formData.append('description', document.getElementById('eventDescription').value);
        formData.append('category', document.getElementById('eventCategory').value);
        formData.append('date', document.getElementById('eventDate').value);
        formData.append('start_time', document.getElementById('eventStartTime').value);
        formData.append('end_time', document.getElementById('eventEndTime').value);
        formData.append('location', document.getElementById('eventLocation').value);

        // Banner image (optional)
        const bannerInput = document.getElementById('eventBanner');
        if (bannerInput && bannerInput.files.length > 0) {
            formData.append('banner', bannerInput.files[0]);
        }

        // Send POST request to API
        fetch(`${window.baseUrl}/api/events/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                // Content-Type is automatically set by the browser for FormData
            },
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(
                        (typeof data === 'object' && data !== null)
                            ? Object.entries(data).map(([key, value]) => `${key}: ${value}`).join(', ')
                            : 'Failed to create event. Please try again.'
                    );
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Event created successfully:', data);
            showSuccess('Event created successfully!');
            
            // Redirect after a brief delay
            setTimeout(() => {
                window.location.href = 'manage-events.html';
            }, 1500);
        })
        .catch(error => {
            console.error('Error:', error);
            showError(`Error creating event: ${error.message}`);
            
            // Reset button state
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        });
    }

    // Set up event handlers
    function setupEventHandlers() {
        // Cancel button
        const cancelBtn = document.getElementById('cancelEventBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function() {
                if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
                    window.location.href = 'handler-dashboard.html';
                }
            });
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (confirm('Are you sure you want to log out?')) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('userType');
                    localStorage.removeItem('userId');
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('userRole');
                    sessionStorage.clear();
                    window.location.href = 'login.html';
                }
            });
        }
    }

    // Helper Functions
    function showSuccess(message) {
        const successEl = document.getElementById('success-message');
        if (successEl) {
            successEl.textContent = message;
            successEl.style.display = 'block';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                successEl.style.display = 'none';
            }, 5000);
        } else {
            alert(message);
        }
    }

    function showError(message) {
        const errorEl = document.getElementById('error-message');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                errorEl.style.display = 'none';
            }, 5000);
        } else {
            alert(message);
        }
    }

    function showLoading() {
        const loadingEl = document.getElementById('loading-indicator');
        if (loadingEl) {
            loadingEl.style.display = 'block';
        }
    }

    function hideLoading() {
        const loadingEl = document.getElementById('loading-indicator');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
    }
});