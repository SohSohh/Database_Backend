// Check if user is logged in
if (!localStorage.getItem('access_token')) {
    window.location.href = 'login.html';
}

// Base URL for API requests
const baseUrl = "http://localhost:8000";

// Get access token
const token = localStorage.getItem('access_token');

// Function to fetch current user data
async function fetchCurrentUser() {
    try {
        const response = await fetch(`${baseUrl}/api/users/me/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch user data');
        
        const data = await response.json();
        
        // Store user type in localStorage if not already there
        if (!localStorage.getItem('user_type') && data.user_type) {
            localStorage.setItem('user_type', data.user_type);
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}

// Demo settings data
const settingsData = {
    notifications: {
        eventReminders: true,
        registrationUpdates: true,
        societyUpdates: true,
        feedbackReminders: true
    },
    privacy: {
        showEmail: false,
        showRegistrations: true,
        showFeedback: true
    }
};

// Initialize settings page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Determine user type and configure the UI accordingly
        await setupSidebar();
        
        // Load saved settings
        loadSettings();
        
        // Setup event listeners
        setupEventListeners();
        
        // Setup password strength meter
        setupPasswordStrengthMeter();
    } catch (error) {
        console.error('Error initializing settings page:', error);
        showNotification('Failed to load settings. Please try again.', 'error');
    }
});

// Load saved settings
function loadSettings() {
    // Load notification settings
    Object.keys(settingsData.notifications).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.checked = settingsData.notifications[key];
        }
    });

    // Load privacy settings
    Object.keys(settingsData.privacy).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.checked = settingsData.privacy[key];
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Password form submission
    document.getElementById('passwordForm').addEventListener('submit', handlePasswordUpdate);

    // Notification form submission
    document.getElementById('notificationForm').addEventListener('submit', handleNotificationUpdate);

    // Privacy form submission
    document.getElementById('privacyForm').addEventListener('submit', handlePrivacyUpdate);

    // Delete account button
    document.getElementById('deleteAccountBtn').addEventListener('click', handleDeleteAccount);
}

// Handle password update
function handlePasswordUpdate(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate passwords
    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match!', 'error');
        return;
    }

    if (newPassword.length < 8) {
        showNotification('Password must be at least 8 characters long!', 'error');
        return;
    }

    // In a real app, this would be an API call
    showNotification('Password updated successfully!', 'success');
    e.target.reset();
}

// Handle notification settings update
function handleNotificationUpdate(e) {
    e.preventDefault();

    // Update notification settings
    Object.keys(settingsData.notifications).forEach(key => {
        settingsData.notifications[key] = document.getElementById(key).checked;
    });

    // In a real app, this would be an API call
    showNotification('Notification preferences saved!', 'success');
}

// Handle privacy settings update
function handlePrivacyUpdate(e) {
    e.preventDefault();

    // Update privacy settings
    Object.keys(settingsData.privacy).forEach(key => {
        settingsData.privacy[key] = document.getElementById(key).checked;
    });

    // In a real app, this would be an API call
    showNotification('Privacy settings saved!', 'success');
}

// Handle account deletion
function handleDeleteAccount() {
    const confirmed = confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
    );

    if (confirmed) {
        // In a real app, this would be an API call
        showNotification('Account deleted successfully!', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    }
}

// Setup password strength meter
function setupPasswordStrengthMeter() {
    const passwordInput = document.getElementById('newPassword');
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');

    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const strength = calculatePasswordStrength(password);
        updateStrengthIndicator(strength);
    });

    function calculatePasswordStrength(password) {
        let strength = 0;
        
        // Length check
        if (password.length >= 8) strength += 25;
        
        // Contains number
        if (/\d/.test(password)) strength += 25;
        
        // Contains lowercase
        if (/[a-z]/.test(password)) strength += 25;
        
        // Contains uppercase
        if (/[A-Z]/.test(password)) strength += 25;

        return strength;
    }

    function updateStrengthIndicator(strength) {
        strengthBar.style.width = `${strength}%`;
        
        if (strength < 25) {
            strengthBar.style.backgroundColor = '#ff4444';
            strengthText.textContent = 'Weak';
        } else if (strength < 50) {
            strengthBar.style.backgroundColor = '#ffbb33';
            strengthText.textContent = 'Fair';
        } else if (strength < 75) {
            strengthBar.style.backgroundColor = '#00C851';
            strengthText.textContent = 'Good';
        } else {
            strengthBar.style.backgroundColor = '#007E33';
            strengthText.textContent = 'Strong';
        }
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Set up the correct sidebar based on user type
async function setupSidebar() {
    // First try to get user data from API
    const userData = await fetchCurrentUser();
    
    // Use user type from API response if available, otherwise fallback to localStorage
    let userType = userData?.user_type || localStorage.getItem('user_type');
    
    // If still no user type, default to viewer
    if (!userType) {
        console.warn('Could not determine user type, defaulting to viewer');
        userType = 'viewer';
    }
    
    // Get sidebar elements
    const sidebarHeader = document.querySelector('.sidebar-header h2');
    const sidebarNav = document.querySelector('.nav-menu ul');
    const stylesheetLink = document.getElementById('dashboard-style');
    
    if (!sidebarHeader || !sidebarNav) {
        console.error('Sidebar elements not found');
        return;
    }
      // Set the appropriate base stylesheet for sidebar navigation
    if (userType === 'handler') {
        stylesheetLink.href = 'handler-dashboard.css';
    } else {
        stylesheetLink.href = 'viewer-dashboard.css';
    }
    
    // Note: The settings.css file provides consistent form styling for both user types
    
    // Update sidebar based on user type
    if (userType === 'handler') {
        // Set header
        sidebarHeader.textContent = 'Event Handler';
        
        // Set navigation menu for handler
        sidebarNav.innerHTML = `
            <li class="nav-item">
                <a href="handler-dashboard.html" class="nav-link">
                    <i class="fas fa-home"></i>
                    Dashboard
                </a>
            </li>
            <li class="nav-item">
                <a href="manage-events.html" class="nav-link">
                    <i class="fas fa-calendar-alt"></i>
                    Manage Events
                </a>
            </li>
            <li class="nav-item">
                <a href="create-event.html" class="nav-link">
                    <i class="fas fa-plus-circle"></i>
                    Create Event
                </a>
            </li>
            <li class="nav-item">
                <a href="event-analytics.html" class="nav-link">
                    <i class="fas fa-chart-bar"></i>
                    Analytics
                </a>
            </li>
            <li class="nav-item">
                <a href="society-members.html" class="nav-link">
                    <i class="fas fa-users"></i>
                    Members
                </a>
            </li>
            <li class="nav-item">
                <a href="settings.html" class="nav-link active">
                    <i class="fas fa-cog"></i>
                    Settings
                </a>
            </li>
            <li class="nav-item">
                <a href="#" id="logout-btn" class="nav-link">
                    <i class="fas fa-sign-out-alt"></i>
                    Logout
                </a>
            </li>
        `;
    } else {
        // Default to viewer
        sidebarHeader.textContent = 'Event Viewer';
        
        // Set navigation menu for viewer
        sidebarNav.innerHTML = `
            <li class="nav-item">
                <a href="viewer-dashboard.html" class="nav-link">
                    <i class="fas fa-home"></i>
                    Dashboard
                </a>
            </li>
            <li class="nav-item">
                <a href="profile.html" class="nav-link">
                    <i class="fas fa-user"></i>
                    My Profile
                </a>
            </li>
            <li class="nav-item">
                <a href="my-societies.html" class="nav-link">
                    <i class="fas fa-users"></i>
                    My Societies
                </a>
            </li>
            <li class="nav-item">
                <a href="my-registrations.html" class="nav-link">
                    <i class="fas fa-ticket-alt"></i>
                    My Registrations
                </a>
            </li>
            <li class="nav-item">
                <a href="settings.html" class="nav-link active">
                    <i class="fas fa-cog"></i>
                    Settings
                </a>
            </li>
            <li class="nav-item">
                <a href="#" id="logout-btn" class="nav-link">
                    <i class="fas fa-sign-out-alt"></i>
                    Logout
                </a>
            </li>
        `;
    }
    
    // Add logout event listener after the sidebar is created
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
}

// Handle logout
function handleLogout(e) {
    e.preventDefault();
    
    // Set flag to show logout message on login page
    localStorage.setItem('showLogoutMessage', 'true');
    
    // Remove auth data
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_type');
    localStorage.removeItem('user_id');
    
    // Redirect to login page
    window.location.href = 'login.html';
}