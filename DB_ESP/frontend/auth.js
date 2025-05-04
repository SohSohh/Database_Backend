// auth.js - Common authentication functions
import api from './api.js';

// Store user data and tokens in localStorage
function storeUserData(userData, tokens) {
    const data = {
        ...userData,
        tokens: tokens
    };
    localStorage.setItem('eventHubUser', JSON.stringify(data));
}

// Get user data from localStorage
function getUserData() {
    const userData = localStorage.getItem('eventHubUser');
    return userData ? JSON.parse(userData) : null;
}

// Get access token
function getAccessToken() {
    const userData = getUserData();
    return userData?.tokens?.access || null;
}

// Get refresh token
function getRefreshToken() {
    const userData = getUserData();
    return userData?.tokens?.refresh || null;
}

// Check if user is logged in
function isLoggedIn() {
    return getUserData() !== null;
}

// Get user type (viewer or handler)
function getUserType() {
    const user = getUserData();
    return user ? user.userType : null;
}

// Log out the user
async function logoutUser() {
    try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
            await api.auth.logout(refreshToken);
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('eventHubUser');
        window.location.href = 'index.html';
    }
}

// Check authentication and redirect if necessary
async function checkAuth() {
    const user = getUserData();
    
    // Get current page path
    const currentPage = window.location.pathname.split('/').pop();
    
    // Pages that require authentication
    const authRequiredPages = [
        'viewer-dashboard.html', 
        'handler-dashboard.html',
        'profile.html',
        'create-event.html'
    ];
    
    // Pages accessible only to handlers
    const handlerOnlyPages = [
        'handler-dashboard.html',
        'create-event.html'
    ];
    
    // If on a page that requires auth but user is not logged in
    if (authRequiredPages.includes(currentPage) && !user) {
        window.location.href = 'login.html';
        return;
    }
    
    // If on a handler-only page but user is not a handler
    if (handlerOnlyPages.includes(currentPage) && user && user.userType !== 'handler') {
        window.location.href = 'viewer-dashboard.html';
        return;
    }
    
    // If on viewer dashboard but user is a handler
    if (currentPage === 'viewer-dashboard.html' && user && user.userType === 'handler') {
        window.location.href = 'handler-dashboard.html';
        return;
    }
    
    // If logged in and on login/register page, redirect to dashboard
    if (user && (currentPage === 'login.html' || currentPage === 'register.html')) {
        if (user.userType === 'handler') {
            window.location.href = 'handler-dashboard.html';
        } else {
            window.location.href = 'viewer-dashboard.html';
        }
        return;
    }
    
    // Update UI if user is logged in
    if (user) {
        updateLoggedInUI(user);
    }
}

// Update UI elements for logged-in user
function updateLoggedInUI(user) {
    // Try to update username display in nav
    const usernameDisplay = document.getElementById('username-display');
    if (usernameDisplay) {
        usernameDisplay.textContent = user.username || user.fullName;
    }
    
    // Try to update greeting on dashboard
    const userGreeting = document.getElementById('user-greeting');
    if (userGreeting) {
        userGreeting.textContent = user.fullName;
    }
    
    // Setup logout button
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logoutUser();
        });
    }
}

// Show error message in form
function showError(formElement, message) {
    // Check if error display already exists
    let errorElement = formElement.querySelector('.error-message');
    
    if (!errorElement) {
        // Create new error element
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.style.color = 'var(--danger-color)';
        errorElement.style.fontSize = '0.85rem';
        errorElement.style.marginTop = '5px';
        formElement.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Remove error after 5 seconds
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

// Initialize mobile menu functionality
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.getElementById('nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
}

// Initialize dropdown menus
function initDropdowns() {
    const dropdownTriggers = document.querySelectorAll('.dropdown-trigger');
    
    dropdownTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            const dropdown = this.nextElementSibling;
            dropdown.classList.toggle('active');
        });
    });
}

// Run on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    initMobileMenu();
    initDropdowns();
});

// Add this to your auth.js file or where you handle authentication
document.addEventListener('DOMContentLoaded', function() {
    const profileLink = document.getElementById('profileLink');
    
    // Check if user is logged in (you'll need to implement this check based on your auth system)
    function isUserLoggedIn() {
        // Return true if user is logged in, false otherwise
        // Example: return localStorage.getItem('userToken') !== null;
    }
    
    // Update profile link based on login status
    function updateProfileLink() {
        if (isUserLoggedIn()) {
            profileLink.href = 'profile.html';
        } else {
            profileLink.href = 'register.html';
        }
    }
    
    // Initial check
    updateProfileLink();
    
    // You might want to call updateProfileLink() whenever the login status changes
});

// Auth utilities
const auth = {
    // Clear all auth-related storage
    clearAuthData: function() {
        localStorage.removeItem('eventHubUser');
        sessionStorage.clear();
    },

    // Handle logout
    logout: async function() {
        await logoutUser();
    },

    // Initialize logout button
    initLogoutButton: function() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    },

    // Get current user data
    getCurrentUser: async function() {
        try {
            const userData = await api.auth.getCurrentUser();
            return userData;
        } catch (error) {
            console.error('Error fetching current user:', error);
            return null;
        }
    }
};

// Export auth utilities
export { auth, storeUserData, getUserData, getAccessToken, getRefreshToken, isLoggedIn, getUserType, logoutUser, checkAuth, showError };