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
 * Get user type (viewer/handler)
 * @returns {string|null} User type or null if not authenticated
 */
export function getUserType() {
    const user = getAuthUser();
    return user ? user.user_type : null;
}

/**
 * Check if user is a handler
 * @returns {boolean} True if user is a handler
 */
export function isHandler() {
    return getUserType() === 'handler';
}

/**
 * Check if user is a viewer
 * @returns {boolean} True if user is a viewer
 */
export function isViewer() {
    return getUserType() === 'viewer';
}

/**
 * Redirect user based on their role
 * @returns {void}
 */
export function redirectBasedOnRole() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    const userType = getUserType();
    if (userType === 'handler') {
        window.location.href = 'handler-dashboard.html';
    } else if (userType === 'viewer') {
        window.location.href = 'viewer-dashboard.html';
    } else {
        console.error('Unknown user type:', userType);
        window.location.href = 'login.html';
    }
}

/**
 * Check if current page matches user role
 * @param {string[]} allowedTypes - Array of allowed user types for this page
 * @returns {boolean} True if user is allowed to access the page
 */
export function checkPageAccess(allowedTypes) {
    const userType = getUserType();
    return allowedTypes.includes(userType);
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
 * Display success message
 * @param {string} message - Success message to display
 */
export function showSuccess(message) {
    const successElement = document.createElement('div');
    successElement.className = 'success-message';
    successElement.style.backgroundColor = '#4CAF50';
    successElement.style.color = 'white';
    successElement.style.padding = '10px';
    successElement.style.position = 'fixed';
    successElement.style.top = '20px';
    successElement.style.right = '20px';
    successElement.style.borderRadius = '4px';
    successElement.style.zIndex = '1000';
    successElement.textContent = message;
    
    document.body.appendChild(successElement);
    
    setTimeout(() => {
        if (successElement.parentNode) {
            successElement.remove();
        }
    }, 3000);
}

/**
 * Logout user - clear storage and redirect
 * @param {string} redirectUrl - URL to redirect to after logout
 */
export function logout(redirectUrl = 'login.html') {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_tokens');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    showSuccess('Successfully logged out');
    setTimeout(() => {
        window.location.href = redirectUrl;
    }, 1500);
}

// Export auth object for compatibility
export const auth = {
    storeUserData,
    getAuthUser,
    getAuthTokens,
    isAuthenticated,
    initAuth,
    showError,
    showSuccess,
    logout,
    getUserType,
    isHandler,
    isViewer,
    redirectBasedOnRole,
    checkPageAccess
};