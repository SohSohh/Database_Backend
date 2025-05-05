import { API_BASE_URL } from './config.js';

document.addEventListener('DOMContentLoaded', function() {
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