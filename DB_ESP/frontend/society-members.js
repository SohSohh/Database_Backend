// API configuration
const token = localStorage.getItem('access_token');

const API_CONFIG = {
    baseUrl: 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
};

// Store for the current join code
let currentJoinCode = null;

// Function to show notification
function showNotification(message, type = 'success') {
    // Get or create notification container
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '10px';
        container.style.pointerEvents = 'none'; // Let clicks pass through the container
        document.body.appendChild(container);
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="close-btn" aria-label="Close notification">
            <i class="fas fa-times"></i>
        </button>
    `;
      // Set appropriate styles based on notification type
    let bgColor, textColor, borderColor, icon;
    
    switch(type) {
        case 'success':
            bgColor = '#d4edda';
            textColor = '#155724';
            borderColor = '#c3e6cb';
            icon = 'check-circle';
            break;
        case 'error':
            bgColor = '#f8d7da';
            textColor = '#721c24';
            borderColor = '#f5c6cb';
            icon = 'exclamation-circle';
            break;
        case 'info':
            bgColor = '#d1ecf1';
            textColor = '#0c5460';
            borderColor = '#bee5eb';
            icon = 'info-circle';
            break;
        case 'warning':
            bgColor = '#fff3cd';
            textColor = '#856404';
            borderColor = '#ffeeba';
            icon = 'exclamation-triangle';
            break;
        default:
            bgColor = '#d4edda';
            textColor = '#155724';
            borderColor = '#c3e6cb';
            icon = 'check-circle';
    }
    
    // Add icon to notification message
    notification.innerHTML = `
        <div style="display: flex; align-items: center;">
            <i class="fas fa-${icon}" style="margin-right: 10px;"></i>
            <span>${message}</span>
        </div>
        <button class="close-btn" aria-label="Close notification">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles to notification
    notification.style.backgroundColor = bgColor;
    notification.style.color = textColor;
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    notification.style.display = 'flex';
    notification.style.justifyContent = 'space-between';
    notification.style.alignItems = 'center';
    notification.style.width = '300px';
    notification.style.maxWidth = '100%';
    notification.style.marginBottom = '10px';
    notification.style.animation = 'fadeIn 0.3s ease';
    notification.style.position = 'relative';
    notification.style.border = `1px solid ${borderColor}`;
    notification.style.pointerEvents = 'auto'; // Enable interactions with the notification itself
    
    // Style close button
    const closeBtn = notification.querySelector('.close-btn');
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.fontSize = '16px';
    closeBtn.style.color = type === 'success' ? '#155724' : '#721c24';
    closeBtn.style.padding = '0 0 0 10px';
    
    // Add click handler to close button
    closeBtn.addEventListener('click', function() {
        fadeOutNotification(notification);
    });
    
    // Add to container
    container.appendChild(notification);
      // Auto-remove after delay
    setTimeout(() => {
        fadeOutNotification(notification);
    }, 3000);
}

// Helper function to fade out and remove notifications
function fadeOutNotification(notification) {
    if (notification && notification.parentNode) {
        // Add the closing class for the CSS animation
        notification.classList.add('closing');
        
        // Wait for animation to complete before removing from DOM
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
                
                // Clean up notification container if it's empty
                const container = document.getElementById('notification-container');
                if (container && container.children.length === 0 && container.parentNode) {
                    // No need to remove the container as we want to reuse it
                }
            }
        }, 500);
    }
}

// Function to make API calls
async function apiCall(endpoint, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: API_CONFIG.headers,
        };

        if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
            options.body = JSON.stringify(body);
        }

        // Remove leading slash from endpoint if present
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
        const url = `${API_CONFIG.baseUrl}/${cleanEndpoint}`;
        
        console.log(`${method} ${url}`, options);
        
        const response = await fetch(url, options);
        
        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log('Response:', data);
            
            if (!response.ok) {
                throw new Error(data.detail || `API call failed with status ${response.status}`);
            }
            
            return data;
        } else {
            // Handle non-JSON response (like HTML error pages)
            const text = await response.text();
            console.log('Non-JSON Response:', text.substring(0, 100) + '...');
            
            if (!response.ok) {
                throw new Error(`API call failed with status ${response.status}`);
            }
            
            return { message: text };
        }
    } catch (error) {
        console.error('API Error:', error);
        showNotification(error.message, 'error');
        throw error;
    }
}

// Generate join code
async function generateJoinCode() {
    try {
        // Show loading notification
        showNotification('Generating new join code...', 'info');
        
        // Make API call to generate code
        const data = await apiCall('/users/society/join-code/', 'POST');
        currentJoinCode = data.join_code;
        
        // Display the join code
        const codeDisplay = document.getElementById('joinCodeDisplay');
        if (!codeDisplay) {
            const container = document.createElement('div');
            container.className = 'content-section';
            container.id = 'joinCodeContainer';
            container.innerHTML = `
                <div class="section-header">
                    <h3><i class="fas fa-key"></i> Society Join Code</h3>
                </div>
                <div class="join-code-display">
                    <p>Share this code with viewers who want to join your society:</p>
                    <div class="code-box" id="joinCodeDisplay">${currentJoinCode}</div>
                    <p class="code-note">This code will expire after use or when a new code is generated.</p>
                </div>
            `;              // Insert the join code section above the current members section
            const dashboardContainer = document.querySelector('.dashboard-container');
            // Find the section that contains the members table (should be the second content-section)
            const contentSections = document.querySelectorAll('.content-section');
            const membersSection = Array.from(contentSections).find(section => 
                section.querySelector('.members-table') || 
                section.innerHTML.includes('Current Members')
            );
            
            if (membersSection && membersSection.parentNode) {
                // If members section exists, insert before it
                membersSection.parentNode.insertBefore(container, membersSection);
            } else if (dashboardContainer) {
                // If we can't find members section but dashboard exists, insert it as first child after header
                const headerSection = document.querySelector('.content-section');
                if (headerSection && headerSection.nextElementSibling) {
                    dashboardContainer.insertBefore(container, headerSection.nextElementSibling);
                } else {
                    dashboardContainer.appendChild(container);
                }
            } else {
                // Fallback - append to body
                document.body.appendChild(container);
            }
        } else {
            document.getElementById('joinCodeDisplay').textContent = currentJoinCode;
            document.getElementById('joinCodeContainer').style.display = 'block';
            
            // Add highlight effect to the code box to draw attention
            const codeBox = document.getElementById('joinCodeDisplay');
            codeBox.style.transition = 'background-color 0.5s ease';
            codeBox.style.backgroundColor = '#fff3cd';
            setTimeout(() => {
                codeBox.style.backgroundColor = '#e9ecef';
            }, 1500);
        }
        
        showNotification(`Join code generated: ${currentJoinCode}`, 'success');
    } catch (error) {
        showNotification(`Failed to generate join code: ${error.message || 'Unknown error'}`, 'error');
    }
}

// Fetch all society members
async function fetchMembers() {
    try {
        const members = await apiCall('/users/society/members/');
        populateMembersList(members);
    } catch (error) {
        showNotification('Failed to fetch society members', 'error');
    }
}

// Populate members list
function populateMembersList(members) {
    const membersList = document.getElementById('membersList');
    membersList.innerHTML = '';

    if (!members || members.length === 0) {
        membersList.innerHTML = `
            <tr>
                <td colspan="5" class="no-members">
                    <i class="fas fa-users"></i>
                    <p>No members found. Generate a join code to invite members!</p>
                </td>
            </tr>
        `;
        return;
    }

    members.forEach(member => {
        const row = document.createElement('tr');
        
        // Make sure we have a valid member ID
        const memberId = member.id || member.user_id || member._id;
        
        row.innerHTML = `
            <td>${member.username || 'N/A'}</td>
            <td>${member.email || 'N/A'}</td>
            <td>
                <select class="role-select" data-member-id="${memberId}" onchange="updateMemberRole('${memberId}', this.value)">
                    <option value="other" ${member.role === 'other' ? 'selected' : ''}>Other</option>
                    <option value="deputy_director" ${member.role === 'deputy_director' ? 'selected' : ''}>Deputy Director</option>
                    <option value="executive" ${member.role === 'executive' ? 'selected' : ''}>Executive</option>
                    <option value="director" ${member.role === 'director' ? 'selected' : ''}>Director</option>
                    <option value="vice_president" ${member.role === 'vice_president' ? 'selected' : ''}>Vice President</option>
                    <option value="president" ${member.role === 'president' ? 'selected' : ''}>President</option>
                </select>
            </td>
            <td>${new Date(member.join_date || Date.now()).toLocaleDateString()}</td>
            <td class="actions-cell">
                <button class="btn btn-icon delete-btn" onclick="removeMember('${memberId}')" title="Remove">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        membersList.appendChild(row);
    });
}

// Update member role
async function updateMemberRole(memberId, newRole) {
    try {
        // Store the select element to refer to it later
        const selectElement = document.querySelector(`.role-select[data-member-id="${memberId}"]`);
        const originalValue = selectElement.value;
        const userName = selectElement.closest('tr').querySelector('td:first-child').textContent;
        
        // Disable the select element during the update
        if (selectElement) {
            selectElement.disabled = true;
        }
        
        // Make API call to update role
        await apiCall(`/users/society/members/${memberId}/`, 'PATCH', { role: newRole });
        
        // Re-enable the select element
        if (selectElement) {
            selectElement.disabled = false;
        }
        
        // Show success notification with member name
        showNotification(`Updated ${userName}'s role to ${newRole.replace('_', ' ')}`, 'success');
    } catch (error) {
        showNotification(`Failed to update member role: ${error.message}`, 'error');
        
        // Reset the select to its original value and refresh the members list
        const selectElement = document.querySelector(`.role-select[data-member-id="${memberId}"]`);
        if (selectElement) {
            selectElement.disabled = false;
        }
        
        fetchMembers(); // Refresh the list
    }
}

// Remove member
async function removeMember(memberId) {
    // Find the member's name to include in confirmation and notification
    const memberRow = document.querySelector(`.role-select[data-member-id="${memberId}"]`).closest('tr');
    const memberName = memberRow ? memberRow.querySelector('td:first-child').textContent : 'this member';
    
    if (confirm(`Are you sure you want to remove ${memberName} from your society?`)) {
        try {
            // Add visual indication that removal is in progress
            if (memberRow) {
                memberRow.style.opacity = '0.5';
                memberRow.style.transition = 'opacity 0.3s ease';
            }
            
            // Call API to remove member
            await apiCall(`/users/society/members/${memberId}/`, 'DELETE');
            
            // Show success notification
            showNotification(`${memberName} has been removed from your society`, 'success');
            
            // Refresh members list
            fetchMembers();
        } catch (error) {
            // Restore the row if there was an error
            if (memberRow) {
                memberRow.style.opacity = '1';
            }
            showNotification(`Failed to remove ${memberName}: ${error.message}`, 'error');
        }
    }
}

// Process join requests
async function fetchJoinRequests() {
    // In a real app, this would be an API call
    // For now, we'll use localStorage to simulate pending requests
    return JSON.parse(localStorage.getItem('societyJoinRequests') || '[]');
}

// Populate join requests table
async function populateJoinRequests() {
    const joinRequests = await fetchJoinRequests();
    const tbody = document.getElementById('joinRequestsList');
    tbody.innerHTML = '';

    if (joinRequests.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#888;">No pending join requests</td></tr>`;
        return;
    }

    joinRequests.forEach((req, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${req.viewerInfo.name}</td>
            <td>${req.viewerInfo.email}</td>
            <td>${new Date(req.requestedAt).toLocaleString()}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="approveJoinRequest(${idx})">Approve</button>
                <button class="btn btn-secondary btn-sm" onclick="denyJoinRequest(${idx})">Deny</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Approve join request
async function approveJoinRequest(idx) {
    const joinRequests = JSON.parse(localStorage.getItem('societyJoinRequests') || '[]');
    const req = joinRequests[idx];
    
    // Find the request row and add visual indication
    const requestRows = document.querySelectorAll('#joinRequestsList tr');
    const requestRow = requestRows[idx];
    
    if (requestRow) {
        requestRow.style.transition = 'background-color 0.3s ease';
        requestRow.style.backgroundColor = '#e8f4f8';
        
        // Disable buttons to prevent double-clicks
        const buttons = requestRow.querySelectorAll('button');
        buttons.forEach(btn => btn.disabled = true);
    }
    
    try {
        // Show process notification
        showNotification(`Approving ${req.viewerInfo.name}'s request...`, 'info');
        
        // This would be the API call to add the member
        // For demo, we'll simulate the success with a small delay
        console.log('Adding member via API:', {
            email: req.viewerInfo.email,
            role: 'member'
        });
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Remove request
        joinRequests.splice(idx, 1);
        localStorage.setItem('societyJoinRequests', JSON.stringify(joinRequests));
        
        showNotification(`${req.viewerInfo.name} has been added to your society`, 'success');
        populateJoinRequests();
        fetchMembers(); // Refresh members list
    } catch (error) {
        // Re-enable buttons on error
        if (requestRow) {
            const buttons = requestRow.querySelectorAll('button');
            buttons.forEach(btn => btn.disabled = false);
            requestRow.style.backgroundColor = '';
        }
        
        showNotification(`Failed to approve join request: ${error.message || 'Unknown error'}`, 'error');
    }
}

// Deny join request
async function denyJoinRequest(idx) {
    const joinRequests = JSON.parse(localStorage.getItem('societyJoinRequests') || '[]');
    const req = joinRequests[idx];
    
    // Find the request row and add visual indication
    const requestRows = document.querySelectorAll('#joinRequestsList tr');
    const requestRow = requestRows[idx];
    
    if (requestRow) {
        requestRow.style.transition = 'background-color 0.3s ease';
        requestRow.style.backgroundColor = '#feeaea';
        
        // Disable buttons to prevent double-clicks
        const buttons = requestRow.querySelectorAll('button');
        buttons.forEach(btn => btn.disabled = true);
    }
    
    try {
        // Show process notification
        showNotification(`Denying ${req.viewerInfo.name}'s request...`, 'info');
        
        // In a real implementation, you might want to call an API here
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Remove request
        joinRequests.splice(idx, 1);
        localStorage.setItem('societyJoinRequests', JSON.stringify(joinRequests));
        
        showNotification(`${req.viewerInfo.name}'s join request has been denied`, 'success');
        populateJoinRequests();
    } catch (error) {
        // Re-enable buttons on error
        if (requestRow) {
            const buttons = requestRow.querySelectorAll('button');
            buttons.forEach(btn => btn.disabled = false);
            requestRow.style.backgroundColor = '';
        }
        
        showNotification(`Failed to deny join request: ${error.message || 'Unknown error'}`, 'error');
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {    // Create notification container with enhanced positioning and styling
    if (!document.getElementById('notification-container')) {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'flex-end';
        container.style.gap = '10px';
        container.style.pointerEvents = 'none';
        container.style.maxWidth = '320px';
        container.style.width = '100%';
        document.body.appendChild(container);
        
        // Add a startup notification to show the system is working
        setTimeout(() => {
            showNotification('Society members page loaded successfully', 'info');
        }, 500);
    }
    
    // Fetch and display members
    fetchMembers();
    
    // Display join requests
    populateJoinRequests();
    
    // Change the "Add Member" button to "Generate Code"
    const generateCodeBtn = document.getElementById('generateCodeBtn');
    if (generateCodeBtn) {
        generateCodeBtn.onclick = generateJoinCode;
    }
    
    // Remove the form section as we no longer need it
    const addMemberForm = document.getElementById('addMemberForm');
    if (addMemberForm) {
        addMemberForm.remove();
    }

    // Add logout handler
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('access_token'); // Clear token
        sessionStorage.clear();
        window.location.href = 'login.html';
    });

    // --- Demo: Add multiple pending join requests if none exist ---
    if (!localStorage.getItem('societyJoinRequests')) {
        const demoJoinRequests = [
            {
                viewerInfo: { name: "Alice Johnson", email: "alice.johnson@email.com" },
                status: "pending",
                requestedAt: new Date().toISOString()
            },
            {
                viewerInfo: { name: "Bob Lee", email: "bob.lee@email.com" },
                status: "pending",
                requestedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString()
            },
            {
                viewerInfo: { name: "Priya Patel", email: "priya.patel@email.com" },
                status: "pending",
                requestedAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString()
            }
        ];
        localStorage.setItem('societyJoinRequests', JSON.stringify(demoJoinRequests));
        populateJoinRequests();
    }
});