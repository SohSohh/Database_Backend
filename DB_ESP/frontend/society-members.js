// Demo data for society members
let members = [
    {
        memberId: 1,
        name: "John Smith",
        email: "john.smith@email.com",
        role: "coordinator",
        joinDate: "2024-01-15",
        status: "active"
    },
    {
        memberId: 2,
        name: "Emma Wilson",
        email: "emma.w@email.com",
        role: "member",
        joinDate: "2024-02-01",
        status: "active"
    },
    {
        memberId: 3,
        name: "Michael Brown",
        email: "michael.b@email.com",
        role: "executive",
        joinDate: "2024-01-10",
        status: "active"
    }
];

// Load join requests from localStorage
function getJoinRequests() {
    return JSON.parse(localStorage.getItem('societyJoinRequests') || '[]');
}
function setJoinRequests(requests) {
    localStorage.setItem('societyJoinRequests', JSON.stringify(requests));
}

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

// Function to populate members list
function populateMembersList() {
    const membersList = document.getElementById('membersList');
    membersList.innerHTML = '';

    if (members.length === 0) {
        membersList.innerHTML = `
            <tr>
                <td colspan="6" class="no-members">
                    <i class="fas fa-users"></i>
                    <p>No members found. Add your first member!</p>
                </td>
            </tr>
        `;
        return;
    }

    members.forEach(member => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${member.name}</td>
            <td>${member.email}</td>
            <td>
                <span class="role-badge ${member.role}">
                    ${member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                </span>
            </td>
            <td>${new Date(member.joinDate).toLocaleDateString()}</td>
            <td>
                <span class="status-badge ${member.status}">
                    ${member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                </span>
            </td>
            <td class="actions-cell">
                <button class="btn btn-icon edit-btn" onclick="editMember(${member.memberId})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-icon delete-btn" onclick="removeMember(${member.memberId})" title="Remove">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        membersList.appendChild(row);
    });
}

// Function to show add member form
function showAddMemberForm() {
    document.getElementById('addMemberForm').style.display = 'block';
    document.getElementById('memberForm').reset();
}

// Function to hide add member form
function hideAddMemberForm() {
    document.getElementById('addMemberForm').style.display = 'none';
    document.getElementById('memberForm').reset();
}

// Function to handle form submission
function handleSubmit(event) {
    event.preventDefault();

    // Get form data
    const formData = {
        memberId: members.length + 1, // Generate new ID
        name: document.getElementById('memberName').value,
        email: document.getElementById('memberEmail').value,
        role: document.getElementById('memberRole').value,
        joinDate: new Date().toISOString().split('T')[0],
        status: 'active'
    };

    // Add new member
    members.push(formData);
    
    // Show success notification
    showNotification('Member added successfully!');
    
    // Hide form and refresh list
    hideAddMemberForm();
    populateMembersList();
}

// Function to edit member
function editMember(memberId) {
    const member = members.find(m => m.memberId === memberId);
    if (member) {
        // Show edit form with member data
        document.getElementById('addMemberForm').style.display = 'block';
        document.getElementById('memberName').value = member.name;
        document.getElementById('memberEmail').value = member.email;
        document.getElementById('memberRole').value = member.role;
        
        // Change form title and submit button
        document.querySelector('#addMemberForm .section-header h3').textContent = 'Edit Member';
        document.querySelector('#memberForm button[type="submit"]').textContent = 'Update Member';
        
        // Store memberId for update
        document.getElementById('memberForm').dataset.memberId = memberId;
    }
}

// Function to remove member
function removeMember(memberId) {
    if (confirm('Are you sure you want to remove this member?')) {
        // Remove member from array
        members = members.filter(member => member.memberId !== memberId);
        
        // Show success notification
        showNotification('Member removed successfully!');
        
        // Refresh the list
        populateMembersList();
    }
}

// Populate join requests table
function populateJoinRequests() {
    const joinRequests = getJoinRequests();
    const tbody = document.getElementById('joinRequestsList');
    tbody.innerHTML = '';

    if (joinRequests.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#888;">No pending join requests</td></tr>`;
        return;
    }

    joinRequests.forEach((req, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${req.viewerInfo.name}</td>
            <td>${req.viewerInfo.email}</td>
            <td>${req.societyName}</td>
            <td>${req.referralCode}</td>
            <td>${new Date(req.requestedAt).toLocaleString()}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="approveJoinRequest(${idx})">Approve</button>
                <button class="btn btn-secondary btn-sm" onclick="denyJoinRequest(${idx})">Deny</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Approve/Deny logic
window.approveJoinRequest = function(idx) {
    const joinRequests = getJoinRequests();
    const req = joinRequests[idx];
    // Add to members
    members.push({
        memberId: members.length + 1,
        name: req.viewerInfo.name,
        email: req.viewerInfo.email,
        role: "member",
        joinDate: new Date().toISOString().split('T')[0],
        status: "active"
    });
    // Remove request
    joinRequests.splice(idx, 1);
    setJoinRequests(joinRequests);
    showNotification(`Approved ${req.viewerInfo.name} for ${req.societyName}`);
    populateJoinRequests();
    populateMembersList();
};

window.denyJoinRequest = function(idx) {
    const joinRequests = getJoinRequests();
    const req = joinRequests[idx];
    joinRequests.splice(idx, 1);
    setJoinRequests(joinRequests);
    showNotification(`Denied join request from ${req.viewerInfo.name}`);
    populateJoinRequests();
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Populate members list
    populateMembersList();
    populateJoinRequests();

    // Add form submit handler
    document.getElementById('memberForm').addEventListener('submit', handleSubmit);

    // Add logout handler
    document.getElementById('logout-btn').addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = 'login.html';
    });

    // --- Demo: Add multiple pending join requests if none exist ---
    if (!localStorage.getItem('societyJoinRequests')) {
        const demoJoinRequests = [
            {
                societyId: 1,
                societyName: "Computer Science Society",
                referralCode: "CS2024",
                viewerInfo: { name: "Alice Johnson", email: "alice.johnson@email.com" },
                status: "pending",
                requestedAt: new Date().toISOString()
            },
            {
                societyId: 2,
                societyName: "Cultural Society",
                referralCode: "CULTURE2024",
                viewerInfo: { name: "Bob Lee", email: "bob.lee@email.com" },
                status: "pending",
                requestedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString()
            },
            {
                societyId: 3,
                societyName: "Photography Club",
                referralCode: "PHOTO2024",
                viewerInfo: { name: "Priya Patel", email: "priya.patel@email.com" },
                status: "pending",
                requestedAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString()
            }
        ];
        localStorage.setItem('societyJoinRequests', JSON.stringify(demoJoinRequests));
    }
}); 