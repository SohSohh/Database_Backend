document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements for profile information
    const userNameHeader = document.getElementById('userNameHeader');
    const userEmail = document.getElementById('userEmail');
    const joinDate = document.getElementById('joinDate');
    const userName = document.getElementById('userName');
    const fullName = document.getElementById('fullName');
    const email = document.getElementById('email');
    const userType = document.getElementById('userType');
    const logoutBtn = document.getElementById('logout-btn');
    
    // Add event listener for logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Handle mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
        });
    }
    
    /**
     * Fetch current user data from API
     */
    function fetchCurrentUser() {
        const token = localStorage.getItem('access_token');
        
        if (!token) {
            window.location.href = 'login.html';
            return;
        }
        
        fetch('http://localhost:8000/api/users/me/', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch user data');
            return response.json();
        })
        .then(data => {
            updateProfileUI(data);
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
            showErrorMessage('Failed to load profile data');
        });
    }
    
    function updateProfileUI(userData) {
        if (userData) {
            // Update profile header
            userNameHeader.textContent = userData.username;
            userEmail.textContent = userData.email;
            
            // Update profile details
            userName.textContent = userData.username;
            fullName.textContent = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Not set';
            email.textContent = userData.email;
            userType.textContent = userData.user_type === 'viewer' ? 'Event Viewer' : 'Society Handler';

            // Hide optional fields that don't exist in the API
            document.getElementById('phoneField')?.classList.add('hidden');
            document.getElementById('departmentField')?.classList.add('hidden');

            // Remove loading text from all fields
            document.querySelectorAll('.detail-value').forEach(el => {
                el.classList.remove('loading-state');
            });
        }
    }
    
    function showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message show';
        errorDiv.textContent = message;
        document.querySelector('.dashboard-container').prepend(errorDiv);
        
        setTimeout(() => errorDiv.remove(), 5000);
    }
    
    function logout() {
        localStorage.removeItem('access_token');
        window.location.href = 'login.html';
    }

    // Initialize page
    fetchCurrentUser();
});