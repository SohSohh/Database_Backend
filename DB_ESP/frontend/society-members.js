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
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="close-btn" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
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
            `;
            
            // Insert after the join requests section
            const joinRequestsSection = document.getElementById('joinRequestsSection');
            joinRequestsSection.parentNode.insertBefore(container, joinRequestsSection);
        } else {
            document.getElementById('joinCodeDisplay').textContent = currentJoinCode;
            document.getElementById('joinCodeContainer').style.display = 'block';
        }
        
        showNotification('New join code generated successfully!');
    } catch (error) {
        showNotification('Failed to generate join code', 'error');
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
        await apiCall(`/users/society/members/${memberId}/`, 'PATCH', { role: newRole });
        showNotification('Member role updated successfully');
    } catch (error) {
        showNotification(`Failed to update member role: ${error.message}`, 'error');
        fetchMembers(); // Refresh the list
    }
}

// Remove member
async function removeMember(memberId) {
    if (confirm('Are you sure you want to remove this member from your society?')) {
        try {
            await apiCall(`/users/society/members/${memberId}/`, 'DELETE');
            showNotification('Member removed successfully');
            fetchMembers();
        } catch (error) {
            showNotification(`Failed to remove member: ${error.message}`, 'error');
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
    
    try {
        // This would be the API call to add the member
        // For demo, we'll simulate the success
        console.log('Adding member via API:', {
            email: req.viewerInfo.email,
            role: 'member'
        });
        
        // Remove request
        joinRequests.splice(idx, 1);
        localStorage.setItem('societyJoinRequests', JSON.stringify(joinRequests));
        
        showNotification(`Approved ${req.viewerInfo.name}`);
        populateJoinRequests();
        fetchMembers(); // Refresh members list
    } catch (error) {
        showNotification('Failed to approve join request', 'error');
    }
}

// Deny join request
async function denyJoinRequest(idx) {
    const joinRequests = JSON.parse(localStorage.getItem('societyJoinRequests') || '[]');
    const req = joinRequests[idx];
    
    // Remove request
    joinRequests.splice(idx, 1);
    localStorage.setItem('societyJoinRequests', JSON.stringify(joinRequests));
    
    showNotification(`Denied join request from ${req.viewerInfo.name}`);
    populateJoinRequests();
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Fetch and display members
    fetchMembers();
    
    // Display join requests
    populateJoinRequests();
    
    // Change the "Add Member" button to "Generate Code"
    const addMemberBtn = document.querySelector('.section-header .btn-primary');
    if (addMemberBtn) {
        addMemberBtn.innerHTML = '<i class="fas fa-key"></i> Generate Join Code';
        addMemberBtn.onclick = generateJoinCode;
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