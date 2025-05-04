import { auth, storeUserData, showError } from './auth.js';
import api from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Show loading state
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Logging in...';
        
        try {
            // Collect login data
            const formData = {
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            };
            
            // Call login API
            const response = await api.auth.login(formData);
            
            // Store user data and tokens
            storeUserData(response.user, response.tokens);
            
            // Redirect based on user type
            window.location.href = response.user.userType === 'handler' 
                ? 'handler-dashboard.html' 
                : 'viewer-dashboard.html';
                
        } catch (error) {
            console.error('Login error:', error);
            showError(loginForm, error.message || 'Login failed. Please check your credentials.');
        } finally {
            // Reset button state
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });
});