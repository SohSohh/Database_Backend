document.addEventListener('DOMContentLoaded', function() {
    // Notification Dropdown
    const notificationDropdown = document.querySelector('.notification-dropdown');
    const notificationMenu = document.querySelector('.notification-menu');

    if (notificationDropdown && notificationMenu) {
        // Toggle menu on notification icon click
        notificationDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
            notificationDropdown.classList.toggle('active');
        });

        // Prevent menu from closing when clicking inside it
        notificationMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // Close menus when clicking outside
    document.addEventListener('click', function(e) {
        if (notificationDropdown && !notificationDropdown.contains(e.target)) {
            notificationDropdown.classList.remove('active');
        }
    });

    // Mobile sidebar toggle
    const toggleSidebar = document.querySelector('.toggle-sidebar');
    const sidebar = document.querySelector('.handler-sidebar');

    if (toggleSidebar && sidebar) {
        toggleSidebar.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }

    // Update current date
    const currentDateElement = document.getElementById('current-date');
    if (currentDateElement) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const currentDate = new Date().toLocaleDateString('en-US', options);
        currentDateElement.textContent = currentDate;
    }

    // Handle logout
    const logoutBtn = document.getElementById('sidebar-logout-btn');
    const userMenuLogout = document.getElementById('user-menu-logout');

    function handleLogout(e) {
        e.preventDefault();
        localStorage.setItem('showLogoutMessage', 'true'); // Set flag for success message
        // Clear authentication tokens (using keys consistent with viewer-dashboard.js)
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // Redirect to login page
        window.location.href = 'login.html';
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    if (userMenuLogout) {
        userMenuLogout.addEventListener('click', handleLogout);
    }

    // Handle filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Here you would typically filter the events based on the data-filter attribute
            const filterType = this.getAttribute('data-filter');
            console.log('Filtering by:', filterType);
            // Add your filtering logic here
        });
    });

    // Handle task checkboxes
    const taskCheckboxes = document.querySelectorAll('.task-checkbox input[type="checkbox"]');
    
    taskCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const taskItem = this.closest('.task-item');
            if (this.checked) {
                taskItem.style.opacity = '0.6';
            } else {
                taskItem.style.opacity = '1';
            }
        });
    });
}); 