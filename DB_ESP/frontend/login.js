import { API_BASE_URL } from './config.js';

document.addEventListener('DOMContentLoaded', function() {
    // Check and display logout message if needed
    if (localStorage.getItem('showLogoutMessage')) {
        showSuccessMessage('Successfully logged out');
        localStorage.removeItem('showLogoutMessage');
    }
    const loginForm = document.getElementById('loginForm');
    const submitButton = document.getElementById('submitBtn');
    const buttonText = submitButton.querySelector('.button-text');
    const loadingSpinner = submitButton.querySelector('.loading-spinner');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Show loading state
        submitButton.disabled = true;
        buttonText.style.display = 'none';
        loadingSpinner.style.display = 'inline-block';

        const formData = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };

        try {
            console.log('Sending login request:', {
                url: `${API_BASE_URL}/api/users/login/`,
                method: 'POST',
                body: { ...formData, password: '[HIDDEN]' }
            });

            const response = await fetch(`${API_BASE_URL}/api/users/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            console.log('Response status:', response.status);
            console.log('Response data:', {
                ...data,
                access: '[TOKEN HIDDEN]',
                refresh: '[TOKEN HIDDEN]'
            });

            if (response.ok) {
                // Clear any existing error messages
                const errorElement = document.querySelector('.error-message');
                if (errorElement) {
                    errorElement.style.display = 'none';
                }

                // Store auth data
                localStorage.setItem('access_token', data.access);
                localStorage.setItem('refresh_token', data.refresh);
                localStorage.setItem('user_type', data.user_type);

                console.log('User type:', data.user_type);

                // Redirect based on user type
                const redirectUrl = data.user_type === 'handler' 
                    ? 'handler-dashboard.html' 
                    : 'viewer-dashboard.html';

                console.log('Redirecting to:', redirectUrl);
                window.location.href = redirectUrl;
                return; // Important: stop execution after redirect
            } else {
                throw new Error(data.detail || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            const errorElement = document.querySelector('.error-message');
            if (errorElement) {
                errorElement.textContent = error.message || 'Login failed. Please try again.';
                errorElement.style.display = 'block';
            }
        } finally {
            // Reset button state
            submitButton.disabled = false;
            buttonText.style.display = 'inline-block';
            loadingSpinner.style.display = 'none';
        }
    });
});

// Function to show success message (can be shared or duplicated if not already in a global scope)
function showSuccessMessage(message) {
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message'; // Ensure this class is styled in your CSS
    successMessage.textContent = message;
    // Basic styling, can be enhanced via CSS file
    successMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745; /* Green for success */
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
            if (successMessage.parentNode) {
                document.body.removeChild(successMessage);
            }
        }, 300);
    }, 3000);
}