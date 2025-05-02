document.addEventListener('DOMContentLoaded', function() {
    // Hide all sections first
    const contentSections = document.querySelectorAll('.content-section');
    contentSections.forEach(section => {
        section.classList.remove('active');
    });

    // Show dashboard by default
    const dashboardSection = document.getElementById('dashboard-section');
    if (dashboardSection) {
        dashboardSection.classList.add('active');
    }

    // Profile Dropdown Functionality
    const sidebarProfileLink = document.getElementById('sidebar-profile-link');
    const userDropdown = document.querySelector('.user-dropdown');
    const userMenu = document.querySelector('.user-menu');

    // Function to close dropdowns
    function closeDropdowns() {
        if (userDropdown) {
            userDropdown.classList.remove('active');
        }
        // Close other dropdowns if any
        const notificationDropdown = document.querySelector('.notification-dropdown');
        if (notificationDropdown) {
            notificationDropdown.classList.remove('active');
        }
    }

    // Toggle profile dropdown when clicking the sidebar profile link
    if (sidebarProfileLink) {
        sidebarProfileLink.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });
    }

    // Toggle profile dropdown when clicking the user image
    if (userDropdown) {
        userDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
            
            // Close notification menu if open
            const notificationDropdown = document.querySelector('.notification-dropdown');
            if (notificationDropdown) {
                notificationDropdown.classList.remove('active');
            }
        });
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!userDropdown.contains(e.target) && !sidebarProfileLink.contains(e.target)) {
            closeDropdowns();
        }
    });

    // Notification Dropdown
    const notificationBtn = document.querySelector('.notification-dropdown .icon-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const notificationDropdown = this.closest('.notification-dropdown');
            notificationDropdown.classList.toggle('active');
            
            // Close user menu if open
            if (userDropdown) {
                userDropdown.classList.remove('active');
            }
        });
    }

    // Toggle Sidebar
    const toggleSidebar = document.querySelector('.toggle-sidebar');
    const sidebar = document.querySelector('.sidebar');
    
    if (toggleSidebar && sidebar) {
        toggleSidebar.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    const userMenuLogout = document.getElementById('user-menu-logout');

    function handleLogout() {
        // Add your logout logic here
        window.location.href = 'index.html';
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }

    if (userMenuLogout) {
        userMenuLogout.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }

    // Navigation Links
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // If it's a section link (starts with #)
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetSection = this.getAttribute('data-section');
                
                // Hide all sections
                contentSections.forEach(section => {
                    section.classList.remove('active');
                });
                
                // Show target section
                const targetElement = document.getElementById(targetSection);
                if (targetElement) {
                    targetElement.classList.add('active');
                }

                // Update active states in navigation
                navLinks.forEach(link => link.classList.remove('active'));
                this.classList.add('active');
                
                // Close sidebar on mobile after navigation
                if (window.innerWidth <= 992) {
                    sidebar.classList.remove('active');
                }
                
                // Close user menu after clicking a link
                if (userDropdown) {
                    userDropdown.classList.remove('active');
                }
            }
        });
    });

    // Handle sidebar links
    const sidebarLinks = document.querySelectorAll('.sidebar-menu .nav-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') {
                e.preventDefault();
                
                // Hide all sections
                contentSections.forEach(section => {
                    section.classList.remove('active');
                });
                
                // Show appropriate section based on link ID
                if (this.id === 'sidebar-profile-link') {
                    const profileSection = document.getElementById('profile-section');
                    if (profileSection) {
                        profileSection.classList.add('active');
                    }
                } else if (this.id === 'sidebar-settings-link') {
                    const settingsSection = document.getElementById('settings-section');
                    if (settingsSection) {
                        settingsSection.classList.add('active');
                    }
                }
                
                // Update active states
                sidebarLinks.forEach(link => link.classList.remove('active'));
                this.classList.add('active');
                
                // Close sidebar on mobile after navigation
                if (window.innerWidth <= 992) {
                    sidebar.classList.remove('active');
                }
            }
        });
    });

    // Profile Tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active states
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });

    // Handle Profile Picture Change
    const changeAvatarBtn = document.getElementById('change-avatar-btn');
    const profilePicture = document.getElementById('profile-picture');

    if (changeAvatarBtn) {
        changeAvatarBtn.addEventListener('click', function() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            
            input.onchange = function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        profilePicture.src = e.target.result;
                        // Here you would typically upload the file to your server
                    };
                    reader.readAsDataURL(file);
                }
            };
            
            input.click();
        });
    }

    // Handle Cover Image Change
    const changeCoverBtn = document.getElementById('change-cover-btn');
    const profileCover = document.querySelector('.profile-cover');

    if (changeCoverBtn) {
        changeCoverBtn.addEventListener('click', function() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            
            input.onchange = function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        profileCover.style.backgroundImage = `url(${e.target.result})`;
                        // Here you would typically upload the file to your server
                    };
                    reader.readAsDataURL(file);
                }
            };
            
            input.click();
        });
    }

    // Handle Form Submission
    const accountForm = document.getElementById('account-form');
    if (accountForm) {
        accountForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Here you would typically send the form data to your server
            const formData = new FormData(this);
            console.log('Form submitted:', Object.fromEntries(formData));
            // Show success message
            alert('Profile updated successfully!');
        });
    }

    // Delete Account Modal
    const deleteAccountModal = document.createElement('div');
    deleteAccountModal.className = 'modal';
    deleteAccountModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Delete Account</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                <p>All your data, including events and RSVPs, will be permanently deleted.</p>
                <form id="deleteAccountConfirmForm">
                    <div class="form-group">
                        <label for="deleteConfirmPassword">Enter your password to confirm:</label>
                        <input type="password" id="deleteConfirmPassword" name="password" required>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" id="cancelDeleteBtn">Cancel</button>
                <button class="btn btn-danger" id="confirmDeleteBtn">Yes, Delete My Account</button>
            </div>
        </div>
    `;

    // Add modal to body
    document.body.appendChild(deleteAccountModal);

    // Handle delete account button click
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', function() {
            deleteAccountModal.classList.add('show');
        });
    }

    // Handle cancel delete button
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', function() {
            deleteAccountModal.classList.remove('show');
        });
    }

    // Handle close modal button
    const closeModalBtn = deleteAccountModal.querySelector('.close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            deleteAccountModal.classList.remove('show');
        });
    }

    // Handle confirm delete button
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            const password = document.getElementById('deleteConfirmPassword').value;
            
            if (!password) {
                alert('Please enter your password to confirm');
                return;
            }
            
            // In a real app, you would send a request to delete the account
            console.log('Account deletion requested with password');
            // After successful deletion, you would redirect to login page
            // window.location.href = 'login.html';
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === deleteAccountModal) {
            deleteAccountModal.classList.remove('show');
        }
    });
}); 