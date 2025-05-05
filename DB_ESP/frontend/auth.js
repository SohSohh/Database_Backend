/**
 * Authentication utility functions for EventHub
 * Handles user authentication state and token management
 */

/**
 * Store user data and tokens in local storage
 * @param {Object} user - User information
 * @param {Object} tokens - Authentication tokens
 */
export function storeUserData(user, tokens = {}) {
    localStorage.setItem('auth_user', JSON.stringify(user));
    localStorage.setItem('auth_tokens', JSON.stringify(tokens));

    if (tokens.access && tokens.refresh) {
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
    } else {
        console.warn('Missing access or refresh token:', tokens);
    }
}


/**
 * Get the authenticated user
 * @returns {Object|null} User object or null if not authenticated
 */
export function getAuthUser() {
    const userData = localStorage.getItem('auth_user');
    return userData ? JSON.parse(userData) : null;
}

/**
 * Get the authentication tokens
 * @returns {Object|null} Token object or null if not available
 */
export function getAuthTokens() {
    const tokenData = localStorage.getItem('auth_tokens');
    return tokenData ? JSON.parse(tokenData) : null;
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated, false otherwise
 */
export function isAuthenticated() {
    return !!getAuthTokens()?.access;
}

/**
 * Initialize authentication - redirects if user is not logged in
 * Use on protected pages
 * @param {string} redirectUrl - URL to redirect to if not authenticated
 */
export function initAuth(redirectUrl = 'login.html') {
    if (!isAuthenticated()) {
        window.location.href = redirectUrl;
    }
    return getAuthUser();
}

/**
 * Display error message on the form
 * @param {HTMLElement} form - The form element
 * @param {string} message - Error message to display
 */
export function showError(form, message) {
    // Remove any existing error message
    const existingError = form.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Create and add new error message
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    // Insert at the top of the form
    form.insertBefore(errorElement, form.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (errorElement.parentNode) {
            errorElement.remove();
        }
    }, 5000);
}

/**
 * Logout user - clear storage and redirect
 * @param {string} redirectUrl - URL to redirect to after logout
 */
export function logout(redirectUrl = 'login.html') {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_tokens');
    window.location.href = redirectUrl;
}

// Export auth object for compatibility
export const auth = {
    storeUserData,
    getAuthUser,
    getAuthTokens,
    isAuthenticated,
    initAuth,
    showError,
    logout
};