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
document.addEventListener('DOMContentLoaded', () => {
    // Load saved settings
    loadSettings();
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup password strength meter
    setupPasswordStrengthMeter();
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

// Logout handler
document.getElementById('logout-btn').addEventListener('click', (e) => {
    e.preventDefault();
    // In a real app, this would clear the session and redirect to login
    window.location.href = 'login.html';
}); 