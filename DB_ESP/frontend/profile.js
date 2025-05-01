document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const profileNavLinks = document.querySelectorAll('.profile-nav a');
    const profileSections = document.querySelectorAll('.profile-section');
    const bioDisplay = document.getElementById('bioDisplay');
    const bioEdit = document.getElementById('bioEdit');
    const editBioBtn = document.querySelector('.edit-bio-btn');
    const saveBioBtn = document.querySelector('.save-bio-btn');
    const cancelBioBtn = document.querySelector('.cancel-bio-btn');
    const bioText = document.getElementById('bioText');
    const bioTextarea = document.getElementById('bioTextarea');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    const deleteAccountModal = document.getElementById('deleteAccountModal');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const addTeamMemberBtn = document.getElementById('addTeamMemberBtn');
    const addTeamMemberModal = document.getElementById('addTeamMemberModal');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const passwordInput = document.getElementById('newPassword');
    const strengthMeter = document.getElementById('strengthMeter');
    const strengthText = document.getElementById('strengthText');
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutButton = document.getElementById('logoutButton');
    
    // Check if current user is viewing their own profile or someone else's
    // In a real app, this would be determined from the server
    const isOwnProfile = true;
    
    // Get user type from URL params or local storage in a real app
    // For this example, we'll use local storage
    const userType = localStorage.getItem('userType') || 'viewer'; // Default to viewer if not set
    
    // Set data attributes on body for conditional display
    document.body.setAttribute('data-user-type', userType);
    document.body.setAttribute('data-profile-owner', isOwnProfile);
    
    // Apply visibility classes based on user type
    applyVisibilityClasses();
    
    // Initialize profile data
    initProfileData();
    
    // Navigation between profile sections
    profileNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            profileNavLinks.forEach(navLink => navLink.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Get target section ID
            const targetId = this.getAttribute('href').substring(1);
            
            // Hide all sections
            profileSections.forEach(section => section.classList.remove('active'));
            
            // Show target section
            document.getElementById(targetId).classList.add('active');
        });
    });
    
    // Bio editing
    if (editBioBtn) {
        editBioBtn.addEventListener('click', function() {
            const currentBio = bioText.textContent;
            bioTextarea.value = currentBio === 'Click to add a bio...' ? '' : currentBio;
            bioDisplay.style.display = 'none';
            bioEdit.style.display = 'block';
        });
    }
    
    if (saveBioBtn) {
        saveBioBtn.addEventListener('click', function() {
            const newBio = bioTextarea.value.trim();
            bioText.textContent = newBio || 'Click to add a bio...';
            bioDisplay.style.display = 'flex';
            bioEdit.style.display = 'none';
            
            // In a real app, save bio to server
            saveBioToServer(newBio);
        });
    }
    
    if (cancelBioBtn) {
        cancelBioBtn.addEventListener('click', function() {
            bioDisplay.style.display = 'flex';
            bioEdit.style.display = 'none';
        });
    }
    
    // Delete account modal
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', function() {
            deleteAccountModal.classList.add('show');
        });
    }
    
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', function() {
            deleteAccountModal.classList.remove('show');
        });
    }
    
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            const password = document.getElementById('deleteConfirmPassword').value;
            
            if (!password) {
                showModalError(deleteAccountModal, 'Please enter your password to confirm');
                return;
            }
            
            // In a real app, send delete request to server
            deleteAccount(password);
        });
    }
    
    // Add team member modal
    if (addTeamMemberBtn) {
        addTeamMemberBtn.addEventListener('click', function() {
            addTeamMemberModal.classList.add('show');
        });
    }
    
    // Add team member form submission
    const confirmAddMemberBtn = document.getElementById('confirmAddMemberBtn');
    if (confirmAddMemberBtn) {
        confirmAddMemberBtn.addEventListener('click', function() {
            const form = document.getElementById('addTeamMemberForm');
            const email = document.getElementById('memberEmail').value;
            const role = document.getElementById('memberRole').value;
            
            if (!email || !role) {
                alert('Please fill in all required fields');
                return;
            }
            
            // Get selected permissions
            const permissionCheckboxes = form.querySelectorAll('input[name="permissions[]"]:checked');
            const permissions = Array.from(permissionCheckboxes).map(cb => cb.value);
            
            // In a real app, send invitation to server
            addTeamMember(email, role, permissions)
                .then(response => {
                    // Add new member to UI
                    addTeamMemberToUI(response.member);
                    addTeamMemberModal.classList.remove('show');
                    form.reset();
                })
                .catch(error => {
                    console.error('Error adding team member:', error);
                    alert('Failed to add team member. Please try again.');
                });
        });
    }
    
    const cancelAddMemberBtn = document.getElementById('cancelAddMemberBtn');
    if (cancelAddMemberBtn) {
        cancelAddMemberBtn.addEventListener('click', function() {
            addTeamMemberModal.classList.remove('show');
        });
    }
    
    // Close modals
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.classList.remove('show');
        });
    });
    
    // Clicking outside modal closes it
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('show');
        }
    });
    
    // Filter events
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            const container = this.closest('.profile-section');
            
            // Update active button
            container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter events
            const events = container.querySelectorAll('.event-card');
            events.forEach(event => {
                const eventType = event.getAttribute('data-event-type');
                
                if (filter === 'all' || eventType === filter) {
                    event.style.display = 'block';
                } else {
                    event.style.display = 'none';
                }
            });
            
            // Show/hide empty state
            const eventsGrid = container.querySelector('.events-grid');
            const emptyState = container.querySelector('.empty-state');
            const visibleEvents = container.querySelectorAll('.event-card[style="display: block"]');
            
            if (visibleEvents.length === 0) {
                if (eventsGrid) eventsGrid.style.display = 'none';
                if (emptyState) emptyState.style.display = 'block';
            } else {
                if (eventsGrid) eventsGrid.style.display = 'grid';
                if (emptyState) emptyState.style.display = 'none';
            }
        });
    });
    
    // Password strength checker
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const strength = checkPasswordStrength(password);
            
            // Update strength meter
            strengthMeter.className = 'strength-meter ' + strength.class;
            strengthText.textContent = strength.text;
        });
    }
    
    // Cancel RSVP buttons
    const cancelRsvpBtns = document.querySelectorAll('.cancel-rsvp-btn');
    cancelRsvpBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const eventCard = this.closest('.event-card');
            const eventId = eventCard.getAttribute('data-event-id');
            const eventName = eventCard.querySelector('h3').textContent;
            
            if (confirm(`Are you sure you want to cancel your RSVP for "${eventName}"?`)) {
                // In a real app, send cancellation request to server
                cancelRsvp(eventId)
                    .then(() => {
                        // Remove card with animation
                        eventCard.style.opacity = '0';
                        setTimeout(() => {
                            eventCard.remove();
                            
                            // Check if we need to show empty state
                            const eventsGrid = document.getElementById('rsvpEvents');
                            if (eventsGrid && eventsGrid.children.length === 0) {
                                eventsGrid.style.display = 'none';
                                document.getElementById('noRsvpEvents').style.display = 'block';
                            }
                        }, 300);
                    })
                    .catch(error => {
                        console.error('Error cancelling RSVP:', error);
                        alert('Failed to cancel RSVP. Please try again.');
                    });
            }
        });
    });
    
    // Delete event buttons
    const deleteEventBtns = document.querySelectorAll('.delete-event-btn');
    deleteEventBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const eventCard = this.closest('.event-card');
            const eventId = eventCard.getAttribute('data-event-id');
            const eventName = eventCard.querySelector('h3').textContent;
            
            if (confirm(`Are you sure you want to delete the event "${eventName}"? This action cannot be undone.`)) {
                // In a real app, send delete request to server
                deleteEvent(eventId)
                    .then(() => {
                        // Remove card with animation
                        eventCard.style.opacity = '0';
                        setTimeout(() => {
                            eventCard.remove();
                            
                            // Check if we need to show empty state
                            const eventsGrid = document.getElementById('createdEvents');
                            if (eventsGrid && eventsGrid.children.length === 0) {
                                eventsGrid.style.display = 'none';
                                document.getElementById('noCreatedEvents').style.display = 'block';
                            }
                        }, 300);
                    })
                    .catch(error => {
                        console.error('Error deleting event:', error);
                        alert('Failed to delete event. Please try again.');
                    });
            }
        });
    });
    
    // Form submissions
    const personalInfoForm = document.getElementById('personalInfoForm');
    if (personalInfoForm) {
        personalInfoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const userData = {};
            
            // Convert FormData to object
            for (const [key, value] of formData.entries()) {
                userData[key] = value;
            }
            
            // In a real app, send data to server
            updatePersonalInfo(userData)
                .then(response => {
                    // Update UI with new data
                    document.getElementById('profileUsername').textContent = userData.username;
                    document.getElementById('usernameValue').textContent = userData.username;
                    document.getElementById('emailValue').textContent = userData.email;
                    document.getElementById('currentUser').textContent = userData.username;
                    
                    if (userType === 'handler' && userData.societyName) {
                        document.getElementById('profileUsername').textContent = userData.societyName;
                        document.getElementById('currentUser').textContent = userData.societyName;
                    }
                    
                    if (userType === 'handler' && userData.societyDescription) {
                        document.getElementById('handlerDescription').textContent = userData.societyDescription;
                    }
                    
                    alert('Personal information updated successfully!');
                })
                .catch(error => {
                    console.error('Error updating personal info:', error);
                    alert('Failed to update personal information. Please try again.');
                });
        });
    }
    
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmNewPassword').value;
            
            // Validate passwords
            if (!currentPassword || !newPassword || !confirmPassword) {
                alert('Please fill all password fields');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                alert('New passwords do not match');
                return;
            }
            
            const strength = checkPasswordStrength(newPassword);
            if (strength.class === 'weak') {
                alert('Please choose a stronger password');
                return;
            }
            
            // In a real app, send password update request to server
            updatePassword(currentPassword, newPassword)
                .then(response => {
                    alert('Password updated successfully!');
                    this.reset();
                    strengthMeter.className = 'strength-meter';
                    strengthText.textContent = 'Password strength';
                })
                .catch(error => {
                    console.error('Error updating password:', error);
                    alert('Failed to update password. Please check your current password and try again.');
                });
        });
    }
    
    const notificationsForm = document.getElementById('notificationsForm');
    if (notificationsForm) {
        notificationsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const notificationPrefs = {
                emailNotifications: formData.get('emailNotifications') === 'on',
                rsvpReminders: formData.get('rsvpReminders') === 'on',
                attendeeNotifications: formData.get('attendeeNotifications') === 'on'
            };
            
            // In a real app, send data to server
            updateNotificationPreferences(notificationPrefs)
                .then(response => {
                    alert('Notification preferences updated successfully!');
                })
                .catch(error => {
                    console.error('Error updating notification preferences:', error);
                    alert('Failed to update notification preferences. Please try again.');
                });
        });
    }
    
    // Avatar upload
    const avatarUpload = document.getElementById('avatarUpload');
    if (avatarUpload) {
        avatarUpload.addEventListener('change', function() {
            const file = this.files[0];
            
            if (file) {
                // Check file type
                const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
                if (!validTypes.includes(file.type)) {
                    alert('Please select a valid image file (JPEG, PNG, or GIF)');
                    return;
                }
                
                // Check file size (max 2MB)
                if (file.size > 2 * 1024 * 1024) {
                    alert('Image size should be less than 2MB');
                    return;
                }
                
                // Create preview
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('profileAvatar').src = e.target.result;
                };
                reader.readAsDataURL(file);
                
                // In a real app, upload image to server
                uploadAvatar(file);
            }
        });
    }
    
    // Create event button
    const createEventBtn = document.getElementById('createEventBtn');
    if (createEventBtn) {
        createEventBtn.addEventListener('click', function() {
            window.location.href = 'create-event.html';
        });
    }
    
    const createFirstEventBtn = document.getElementById('createFirstEventBtn');
    if (createFirstEventBtn) {
        createFirstEventBtn.addEventListener('click', function() {
            window.location.href = 'create-event.html';
        });
    }
    
    // Logout buttons
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            logout();
        });
    }
    
    // Add team member buttons
    const addFirstTeamMemberBtn = document.getElementById('addFirstTeamMemberBtn');
    if (addFirstTeamMemberBtn) {
        addFirstTeamMemberBtn.addEventListener('click', function() {
            addTeamMemberModal.classList.add('show');
        });
    }
    
    // Remove team member buttons
    const removeMemberBtns = document.querySelectorAll('.remove-member-btn');
    removeMemberBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const memberCard = this.closest('.team-member-card');
            const memberName = memberCard.querySelector('h3').textContent;
            const memberEmail = memberCard.querySelector('.member-email').textContent;
            
            if (confirm(`Are you sure you want to remove ${memberName} from your team?`)) {
                // In a real app, send remove request to server
                removeTeamMember(memberEmail)
                    .then(() => {
                        // Remove card with animation
                        memberCard.style.opacity = '0';
                        setTimeout(() => {
                            memberCard.remove();
                            
                            // Check if we need to show empty state
                            const teamMembersGrid = document.getElementById('teamMembersGrid');
                            if (teamMembersGrid && teamMembersGrid.children.length === 0) {
                                teamMembersGrid.style.display = 'none';
                                document.getElementById('noTeamMembers').style.display = 'block';
                            }
                        }, 300);
                    })
                    .catch(error => {
                        console.error('Error removing team member:', error);
                        alert('Failed to remove team member. Please try again.');
                    });
            }
        });
    });
    
    // Edit team member buttons
    const editMemberBtns = document.querySelectorAll('.edit-member-btn');
    editMemberBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const memberCard = this.closest('.team-member-card');
            const memberName = memberCard.querySelector('h3').textContent;
            const memberEmail = memberCard.querySelector('.member-email').textContent;
            const memberRole = memberCard.querySelector('.member-role').textContent;
            
            // TODO: Create edit member modal
            alert(`Edit functionality for ${memberName} not implemented yet`);
        });
    });
    
    // Initialize data
    function initProfileData() {
        // This function would normally fetch data from the server
        // For demo purposes, we'll use mock data
        
        // Set user info
        const user = {
            username: userType === 'handler' ? 'Tech Society' : 'John Doe',
            email: userType === 'handler' ? 'techsociety@example.com' : 'john.doe@example.com',
            memberSince: 'January 15, 2023',
            handlerId: 'HND12345',
            eventsCreated: 15,
            eventsAttending: 8,
            bio: userType === 'handler' ? 
                'We are a society dedicated to technology events and workshops.' : 
                'Tech enthusiast who loves attending campus events.'
        };
        
        // Update DOM elements with user data
        document.getElementById('currentUser').textContent = user.username;
        document.getElementById('profileUsername').textContent = user.username;
        document.getElementById('profileType').textContent = userType === 'handler' ? 'Handler' : 'Viewer';
        document.getElementById('usernameValue').textContent = user.username;
        document.getElementById('emailValue').textContent = user.email;
        document.getElementById('memberSinceValue').textContent = user.memberSince;
        document.getElementById('eventsAttendingValue').textContent = user.eventsAttending;
        
        if (userType === 'handler') {
            const handlerIdValue = document.getElementById('handlerIdValue');
            const eventsCreatedValue = document.getElementById('eventsCreatedValue');
            const handlerDescription = document.getElementById('handlerDescription');
            
            if (handlerIdValue) handlerIdValue.textContent = user.handlerId;
            if (eventsCreatedValue) eventsCreatedValue.textContent = user.eventsCreated;
            if (handlerDescription) handlerDescription.textContent = user.bio;
        }
        
        // Check if the bio is empty
        if (bioText) {
            if (user.bio) {
                bioText.textContent = user.bio;
            } else {
                bioText.textContent = 'Click to add a bio...';
            }
        }
        
        // Populate form fields
        if (document.getElementById('updateUsername')) {
            document.getElementById('updateUsername').value = user.username;
        }
        
        if (document.getElementById('updateEmail')) {
            document.getElementById('updateEmail').value = user.email;
        }
        
        if (userType === 'handler' && document.getElementById('updateSocietyName')) {
            document.getElementById('updateSocietyName').value = user.username;
        }
        
        if (userType === 'handler' && document.getElementById('updateSocietyDescription')) {
            document.getElementById('updateSocietyDescription').value = user.bio;
        }
        
        // Check whether to show empty states
        checkEmptyStates();
    }
    
    // Apply visibility classes based on user type and profile ownership
    function applyVisibilityClasses() {
        // Show/hide handler-only elements
        const handlerOnlyElements = document.querySelectorAll('.handler-only');
        handlerOnlyElements.forEach(el => {
            if (userType === 'handler') {
                el.style.display = '';
            } else {
                el.style.display = 'none';
            }
        });
        
        // Show/hide viewer-only elements
        const viewerOnlyElements = document.querySelectorAll('.viewer-only');
        viewerOnlyElements.forEach(el => {
            if (userType === 'viewer') {
                el.style.display = '';
            } else {
                el.style.display = 'none';
            }
        });
        
        // Show/hide own-profile-only elements
        const ownProfileOnlyElements = document.querySelectorAll('.own-profile-only');
        ownProfileOnlyElements.forEach(el => {
            if (isOwnProfile) {
                el.style.display = '';
            } else {
                el.style.display = 'none';
            }
        });
        
        // Show/hide other-profile-only elements
        const otherProfileOnlyElements = document.querySelectorAll('.other-profile-only');
        otherProfileOnlyElements.forEach(el => {
            if (!isOwnProfile) {
                el.style.display = '';
            } else {
                el.style.display = 'none';
            }
        });
    }
    
    // Check if we need to show empty states
    function checkEmptyStates() {
        // Check RSVP events
        const rsvpEvents = document.getElementById('rsvpEvents');
        const noRsvpEvents = document.getElementById('noRsvpEvents');
        
        if (rsvpEvents && noRsvpEvents) {
            if (rsvpEvents.children.length === 0) {
                rsvpEvents.style.display = 'none';
                noRsvpEvents.style.display = 'block';
            } else {
                rsvpEvents.style.display = 'grid';
                noRsvpEvents.style.display = 'none';
            }
        }
        
        // Check created events
        const createdEvents = document.getElementById('createdEvents');
        const noCreatedEvents = document.getElementById('noCreatedEvents');
        
        if (createdEvents && noCreatedEvents) {
            if (createdEvents.children.length === 0) {
                createdEvents.style.display = 'none';
                noCreatedEvents.style.display = 'block';
            } else {
                createdEvents.style.display = 'grid';
                noCreatedEvents.style.display = 'none';
            }
        }
        
        // Check team members
        const teamMembersGrid = document.getElementById('teamMembersGrid');
        const noTeamMembers = document.getElementById('noTeamMembers');
        
        if (teamMembersGrid && noTeamMembers) {
            if (teamMembersGrid.children.length === 0) {
                teamMembersGrid.style.display = 'none';
                noTeamMembers.style.display = 'block';
            } else {
                teamMembersGrid.style.display = 'grid';
                noTeamMembers.style.display = 'none';
            }
        }
    }
});

/**
 * Check password strength
 * @param {string} password - Password to check
 * @returns {Object} - Strength class and description
 */
function checkPasswordStrength(password) {
    if (!password) {
        return { class: 'empty', text: 'No password' };
    }
    
    // Calculate score based on various criteria
    let score = 0;
    
    // Length check
    if (password.length < 8) {
        return { class: 'weak', text: 'Too short' };
    } else if (password.length >= 12) {
        score += 2;
    } else {
        score += 1;
    }
    
    // Character type checks
    if (/[A-Z]/.test(password)) score += 1; // Uppercase
    if (/[a-z]/.test(password)) score += 1; // Lowercase
    if (/[0-9]/.test(password)) score += 1; // Numbers
    if (/[^A-Za-z0-9]/.test(password)) score += 1; // Special characters
    
    // Common patterns and dictionary words check
    const commonPatterns = [
        /^[a-z]+$/i, // All letters
        /^[0-9]+$/, // All numbers
        /^[a-z0-9]+$/i, // Only letters and numbers
        /^[a-z]+[0-9]+$/i, // Letters followed by numbers
        /^[0-9]+[a-z]+$/i, // Numbers followed by letters
        /password/i, /123456/, /qwerty/i, /abc123/i // Common passwords
    ];
    
    for (const pattern of commonPatterns) {
        if (pattern.test(password)) {
            score -= 1;
            break;
        }
    }
    
    // Sequential characters check
    const sequences = [
        'abcdefghijklmnopqrstuvwxyz',
        '0123456789',
        'qwertyuiop',
        'asdfghjkl',
        'zxcvbnm'
    ];
    
    for (const sequence of sequences) {
        for (let i = 0; i < sequence.length - 2; i++) {
            const fragment = sequence.substring(i, i + 3);
            if (password.toLowerCase().includes(fragment)) {
                score -= 1;
                break;
            }
        }
    }
    
    // Repeated characters check
    if (/(.)\1{2,}/.test(password)) { // Same character repeated 3+ times
        score -= 1;
    }
    
    // Determine strength class and text based on score
    if (score <= 1) {
        return { class: 'weak', text: 'Weak' };
    } else if (score <= 3) {
        return { class: 'medium', text: 'Medium' };
    } else {
        return { class: 'strong', text: 'Strong' };
    }
}

/**
 * Shows an error message in a modal
 * @param {HTMLElement} modal - Modal element
 * @param {string} message - Error message
 */
function showModalError(modal, message) {
    const errorDiv = modal.querySelector('.error-message') || document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const modalBody = modal.querySelector('.modal-body');
    if (!modal.querySelector('.error-message')) {
        modalBody.insertBefore(errorDiv, modalBody.firstChild);
    }
    
    // Highlight error field
    const passwordField = modal.querySelector('input[type="password"]');
    if (passwordField) {
        passwordField.classList.add('error');
        passwordField.addEventListener('input', function() {
            this.classList.remove('error');
            errorDiv.style.display = 'none';
        });
    }
}

/**
 * Add a team member to the UI
 * @param {Object} member - Member data
 */
function addTeamMemberToUI(member) {
    const teamMembersGrid = document.getElementById('teamMembersGrid');
    const noTeamMembers = document.getElementById('noTeamMembers');
    
    if (!teamMembersGrid) return;
    
    // Create new member card
    const memberCard = document.createElement('div');
    memberCard.className = 'team-member-card';
    memberCard.innerHTML = `
        <div class="team-member-avatar">
            <img src="${member.avatar || 'https://via.placeholder.com/100'}" alt="Team Member">
        </div>
        <div class="team-member-info">
            <h3>${member.name}</h3>
            <p class="member-role">${member.role}</p>
            <p class="member-email">${member.email}</p>
        </div>
        <div class="team-member-actions own-profile-only">
            <button class="btn btn-sm btn-outline edit-member-btn">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger remove-member-btn">
                <i class="fas fa-user-minus"></i>
            </button>
        </div>
    `;
    
    // Add event listeners to new buttons
    const editBtn = memberCard.querySelector('.edit-member-btn');
    if (editBtn) {
        editBtn.addEventListener('click', function() {
            alert(`Edit functionality for ${member.name} not implemented yet`);
        });
    }
    
    removeBtn.addEventListener('click', function() {
        const memberCard = this.closest('.team-member-card');
        const memberName = memberCard.querySelector('h3').textContent;
        const memberEmail = memberCard.querySelector('.member-email').textContent;
        
        if (confirm(`Are you sure you want to remove ${memberName} from your team?`)) {
            // In a real app, send remove request to server
            removeTeamMember(memberEmail)
                .then(() => {
                    // Remove card with animation
                    memberCard.style.opacity = '0';
                    setTimeout(() => {
                        memberCard.remove();
                        
                        // Check if we need to show empty state
                        if (teamMembersGrid.children.length === 0) {
                            teamMembersGrid.style.display = 'none';
                            if (noTeamMembers) noTeamMembers.style.display = 'block';
                        }
                    }, 300);
                })
                .catch(error => {
                    console.error('Error removing team member:', error);
                    alert('Failed to remove team member. Please try again.');
                });
        }
    });
}

// Add the new member card to the grid
teamMembersGrid.appendChild(memberCard);

// Hide empty state if it was showing
if (noTeamMembers) {
    noTeamMembers.style.display = 'none';
}

// Show grid if it was hidden
teamMembersGrid.style.display = 'grid';

// Apply visibility classes to new elements
applyVisibilityClasses();


// Mock API calls (in a real app, these would call your backend API)

/**
* Save bio to server
* @param {string} bio - User bio
* @returns {Promise} - API response
*/
function saveBioToServer(bio) {
return new Promise((resolve, reject) => {
    // Simulate API call
    setTimeout(() => {
        console.log('Bio saved:', bio);
        resolve({ success: true });
    }, 500);
});
}

/**
* Delete user account
* @param {string} password - User password
* @returns {Promise} - API response
*/
function deleteAccount(password) {
return new Promise((resolve, reject) => {
    // Simulate API call
    setTimeout(() => {
        console.log('Account deleted');
        // Redirect to login page
        window.location.href = 'login.html';
        resolve({ success: true });
    }, 1000);
});
}

/**
* Add team member
* @param {string} email - Member email
* @param {string} role - Member role
* @param {Array} permissions - Member permissions
* @returns {Promise} - API response with member data
*/
function addTeamMember(email, role, permissions) {
return new Promise((resolve, reject) => {
    // Simulate API call
    setTimeout(() => {
        // Generate random name from email
        const name = email.split('@')[0].split('.').map(part => 
            part.charAt(0).toUpperCase() + part.slice(1)
        ).join(' ');
        
        const member = {
            id: 'mem_' + Math.random().toString(36).substr(2, 9),
            name: name,
            email: email,
            role: role,
            permissions: permissions,
            avatar: 'https://via.placeholder.com/100'
        };
        
        console.log('Team member added:', member);
        resolve({ success: true, member: member });
    }, 800);
});
}

/**
* Remove team member
* @param {string} email - Member email
* @returns {Promise} - API response
*/
function removeTeamMember(email) {
return new Promise((resolve, reject) => {
    // Simulate API call
    setTimeout(() => {
        console.log('Team member removed:', email);
        resolve({ success: true });
    }, 500);
});
}

/**
* Update personal info
* @param {Object} userData - User data
* @returns {Promise} - API response
*/
function updatePersonalInfo(userData) {
return new Promise((resolve, reject) => {
    // Simulate API call
    setTimeout(() => {
        console.log('Personal info updated:', userData);
        resolve({ success: true, user: userData });
    }, 800);
});
}

/**
* Update password
* @param {string} currentPassword - Current password
* @param {string} newPassword - New password
* @returns {Promise} - API response
*/
function updatePassword(currentPassword, newPassword) {
return new Promise((resolve, reject) => {
    // Simulate API call
    setTimeout(() => {
        // In a real app, you would verify the current password on the server
        console.log('Password updated');
        resolve({ success: true });
    }, 800);
});
}

/**
* Update notification preferences
* @param {Object} preferences - Notification preferences
* @returns {Promise} - API response
*/
function updateNotificationPreferences(preferences) {
return new Promise((resolve, reject) => {
    // Simulate API call
    setTimeout(() => {
        console.log('Notification preferences updated:', preferences);
        resolve({ success: true });
    }, 500);
});
}

/**
* Upload avatar
* @param {File} file - Image file
* @returns {Promise} - API response with image URL
*/
function uploadAvatar(file) {
return new Promise((resolve, reject) => {
    // Simulate API call
    setTimeout(() => {
        // In a real app, you would upload the file to a server
        console.log('Avatar uploaded:', file.name);
        resolve({ success: true, url: URL.createObjectURL(file) });
    }, 1500);
});
}

/**
* Cancel RSVP
* @param {string} eventId - Event ID
* @returns {Promise} - API response
*/
function cancelRsvp(eventId) {
return new Promise((resolve, reject) => {
    // Simulate API call
    setTimeout(() => {
        console.log('RSVP cancelled for event:', eventId);
        resolve({ success: true });
    }, 500);
});
}

/**
* Delete event
* @param {string} eventId - Event ID
* @returns {Promise} - API response
*/
function deleteEvent(eventId) {
return new Promise((resolve, reject) => {
    // Simulate API call
    setTimeout(() => {
        console.log('Event deleted:', eventId);
        resolve({ success: true });
    }, 800);
});
}

/**
* Logout user
* Redirects to login page
*/
function logout() {
// Clear user session
localStorage.removeItem('userType');
localStorage.removeItem('userId');
localStorage.removeItem('token');

// Redirect to login page
window.location.href = 'login.html';
}

/**
* View other user profiles
* @param {string} userId - User ID to view
*/
function viewUserProfile(userId) {
// In a real app, you would fetch the user data from the server
// and redirect to their profile page
window.location.href = `profile.html?userId=${userId}`;
}

/**
* Handle visiting another user's profile
* This function would be called on page load to check if we're viewing
* another user's profile and set up the page accordingly
*/
function handleProfileView() {
// Get userId from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('userId');

if (userId) {
    // We're viewing someone else's profile
    isOwnProfile = false;
    document.body.setAttribute('data-profile-owner', 'false');
    
    // Fetch user data from server
    fetchUserProfile(userId)
        .then(userData => {
            // Update page with user data
            document.getElementById('profileUsername').textContent = userData.username;
            document.getElementById('profileType').textContent = userData.type === 'handler' ? 'Handler' : 'Viewer';
            
            if (userData.type === 'handler') {
                document.getElementById('handlerDescription').textContent = userData.bio || 'No description available';
            }
            
            if (bioText) {
                bioText.textContent = userData.bio || 'No bio available';
            }
            
            // Show appropriate sections based on user type
            if (userData.type === 'handler') {
                // For handlers, show their events and team members
                document.getElementById('eventsSection').classList.add('active');
                document.querySelector('.profile-nav a[href="#eventsSection"]').classList.add('active');
            } else {
                // For viewers, show their RSVPs
                document.getElementById('eventsSection').classList.add('active');
                document.querySelector('.profile-nav a[href="#eventsSection"]').classList.add('active');
            }
            
            // Apply visibility classes
            applyVisibilityClasses();
        })
        .catch(error => {
            console.error('Error fetching user profile:', error);
            alert('Failed to load user profile. Please try again.');
        });
} else {
    // We're viewing our own profile
    isOwnProfile = true;
    document.body.setAttribute('data-profile-owner', 'true');
}
}

/**
* Fetch user profile
* @param {string} userId - User ID
* @returns {Promise} - API response with user data
*/
function fetchUserProfile(userId) {
return new Promise((resolve, reject) => {
    // Simulate API call
    setTimeout(() => {
        // Mock user data
        const userData = {
            id: userId,
            username: userId === 'handler123' ? 'Tech Society' : 'John Doe',
            email: userId === 'handler123' ? 'techsociety@example.com' : 'john.doe@example.com',
            type: userId === 'handler123' ? 'handler' : 'viewer',
            bio: userId === 'handler123' ? 
                'We are a society dedicated to technology events and workshops.' : 
                'Tech enthusiast who loves attending campus events.',
            memberSince: 'January 15, 2023',
            handlerId: userId === 'handler123' ? 'HND12345' : null,
            eventsCreated: userId === 'handler123' ? 15 : 0,
            eventsAttending: userId === 'handler123' ? 0 : 8
        };
        
        resolve(userData);
    }, 800);
});
}

/**
* Follow/Unfollow handler
* @param {string} handlerId - Handler ID
* @param {boolean} isFollowing - Current follow status
* @returns {Promise} - API response
*/
function toggleFollowHandler(handlerId, isFollowing) {
return new Promise((resolve, reject) => {
    // Simulate API call
    setTimeout(() => {
        console.log(isFollowing ? 'Unfollowed handler:' : 'Followed handler:', handlerId);
        resolve({ success: true, isFollowing: !isFollowing });
    }, 500);
});
}

// Add event listener for follow/unfollow button
const followBtn = document.getElementById('followHandlerBtn');
if (followBtn) {
followBtn.addEventListener('click', function() {
    const handlerId = this.getAttribute('data-handler-id');
    const isFollowing = this.classList.contains('following');
    
    toggleFollowHandler(handlerId, isFollowing)
        .then(response => {
            if (response.isFollowing) {
                this.classList.add('following');
                this.innerHTML = '<i class="fas fa-user-check"></i> Following';
            } else {
                this.classList.remove('following');
                this.innerHTML = '<i class="fas fa-user-plus"></i> Follow';
            }
        })
        .catch(error => {
            console.error('Error toggling follow status:', error);
            alert('Failed to update follow status. Please try again.');
        });
});
}

// Initialize user type switch for testing
const userTypeSwitch = document.getElementById('userTypeSwitch');
if (userTypeSwitch) {
userTypeSwitch.addEventListener('change', function() {
    const newUserType = this.checked ? 'handler' : 'viewer';
    localStorage.setItem('userType', newUserType);
    window.location.reload();
});

// Set initial state
if (userType === 'handler') {
    userTypeSwitch.checked = true;
}
}

// Call handleProfileView on page load
window.addEventListener('DOMContentLoaded', function() {
handleProfileView();
});

// Reuse createEvent function for viewing event details
// In a real app, you would navigate to an event details page
function viewEventDetails(eventId) {
window.location.href = `event-details.html?eventId=${eventId}`;
}

// Add click event to event cards for viewing details
const eventCards = document.querySelectorAll('.event-card');
eventCards.forEach(card => {
card.addEventListener('click', function(e) {
    // Don't trigger if clicking on a button inside the card
    if (!e.target.closest('button')) {
        const eventId = this.getAttribute('data-event-id');
        viewEventDetails(eventId);
    }
});
});

// Handle profile visibility for public profiles
function setupPublicProfileView() {
// Get userId from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('userId');

if (userId) {
    // Show public profile tabs
    const publicTabs = ['aboutSection', 'eventsSection'];
    
    // Hide private profile tabs
    const privateTabs = ['settingsSection', 'securitySection', 'teamSection'];
    
    // Update navigation links
    const navLinks = document.querySelectorAll('.profile-nav a');
    navLinks.forEach(link => {
        const targetId = link.getAttribute('href').substring(1);
        
        if (privateTabs.includes(targetId)) {
            link.style.display = 'none';
        }
    });
    
    // Set events section as default active section for public profiles
    document.getElementById('eventsSection').classList.add('active');
    const eventsNavLink = document.querySelector('.profile-nav a[href="#eventsSection"]');
    if (eventsNavLink) {
        eventsNavLink.classList.add('active');
    }
}
}

// Call setupPublicProfileView after handleProfileView
window.addEventListener('DOMContentLoaded', function() {
handleProfileView();
setupPublicProfileView();
});