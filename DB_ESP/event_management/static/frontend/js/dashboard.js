document.addEventListener('DOMContentLoaded', function() {
    // User Profile Dropdown
    const userDropdown = document.querySelector('.user-dropdown');
    const userMenu = document.querySelector('.user-menu');

    if (userDropdown && userMenu) {
        // Toggle menu on user profile click
        userDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
            
            // Close notification menu if open
            if (notificationDropdown) {
                notificationDropdown.classList.remove('active');
            }
        });

        // Prevent menu from closing when clicking inside it
        userMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // Notification Dropdown
    const notificationDropdown = document.querySelector('.notification-dropdown');
    const notificationMenu = document.querySelector('.notification-menu');

    if (notificationDropdown && notificationMenu) {
        // Toggle menu on notification icon click
        notificationDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
            notificationDropdown.classList.toggle('active');
            
            // Close user menu if open
            if (userDropdown) {
                userDropdown.classList.remove('active');
            }
        });

        // Prevent menu from closing when clicking inside it
        notificationMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // Close menus when clicking outside
    document.addEventListener('click', function(e) {
        if (userDropdown && !userDropdown.contains(e.target)) {
            userDropdown.classList.remove('active');
        }
        if (notificationDropdown && !notificationDropdown.contains(e.target)) {
            notificationDropdown.classList.remove('active');
        }
    });
}); 