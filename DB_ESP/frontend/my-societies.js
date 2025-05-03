// Demo data for societies
const demoSocieties = [
    {
        societyId: 1,
        name: "Computer Science Society",
        logo: "https://via.placeholder.com/150",
        memberCount: 150,
        role: "member",
        upcomingEvents: 2,
        joinDate: "2024-01-15",
        description: "A society for computer science enthusiasts to learn and grow together."
    },
    {
        societyId: 2,
        name: "Cultural Society",
        logo: "https://via.placeholder.com/150",
        memberCount: 200,
        role: "member",
        upcomingEvents: 1,
        joinDate: "2024-02-01",
        description: "Celebrating diversity through cultural events and activities."
    },
    {
        societyId: 3,
        name: "Photography Club",
        logo: "https://via.placeholder.com/150",
        memberCount: 75,
        role: "member",
        upcomingEvents: 0,
        joinDate: "2024-02-10",
        description: "Capturing moments and learning photography techniques."
    },
    {
        societyId: 4,
        name: "Literature Society",
        logo: "https://via.placeholder.com/150",
        memberCount: 60,
        role: "member",
        upcomingEvents: 1,
        joinDate: "2024-03-01",
        description: "For lovers of books, poetry, and creative writing."
    }
];

// Demo: List of all societies (replace with real data if available)
const allSocieties = [
    { id: 1, name: "Computer Science Society" },
    { id: 2, name: "Cultural Society" },
    { id: 3, name: "Photography Club" }
];

// Function to populate societies
function populateSocieties() {
    const societiesGrid = document.getElementById('mySocieties');
    societiesGrid.innerHTML = '';

    if (demoSocieties.length === 0) {
        societiesGrid.innerHTML = `
            <div class="no-societies">
                <i class="fas fa-users"></i>
                <p>No societies joined yet</p>
                <button class="btn btn-primary" onclick="window.location.href='browse-societies.html'">
                    <i class="fas fa-plus"></i> Join a Society
                </button>
            </div>
        `;
        return;
    }

    demoSocieties.forEach(society => {
        const societyCard = document.createElement('div');
        societyCard.className = 'society-card';
        societyCard.innerHTML = `
            <div class="society-logo">
                <img src="${society.logo}" alt="${society.name}">
            </div>
            <div class="society-details">
                <h3>${society.name}</h3>
                <p class="society-description">${society.description}</p>
                <p class="society-stats">
                    <span><i class="fas fa-users"></i> ${society.memberCount} members</span>
                    <span><i class="fas fa-calendar"></i> ${society.upcomingEvents} upcoming events</span>
                </p>
                <div class="society-info">
                    <span class="join-date">
                        <i class="fas fa-calendar-check"></i>
                        Joined on ${new Date(society.joinDate).toLocaleDateString()}
                    </span>
                    <span class="member-role">
                        <i class="fas fa-user-tag"></i>
                        ${society.role.charAt(0).toUpperCase() + society.role.slice(1)}
                    </span>
                </div>
                <div class="society-actions">
                    <button class="btn btn-primary" onclick="viewSociety(${society.societyId})">
                        <i class="fas fa-eye"></i> View Society
                    </button>
                    <button class="btn btn-secondary" onclick="viewSocietyEvents(${society.societyId})">
                        <i class="fas fa-calendar"></i> View Events
                    </button>
                </div>
            </div>
        `;
        societiesGrid.appendChild(societyCard);
    });
}

// Navigation functions
function viewSociety(societyId) {
    window.location.href = `society-details.html?id=${societyId}`;
}

function viewSocietyEvents(societyId) {
    window.location.href = `society-events.html?id=${societyId}`;
}

// Open modal
document.getElementById('joinSocietyBtn').addEventListener('click', function() {
    // Populate dropdown
    const select = document.getElementById('selectSociety');
    select.innerHTML = '';
    allSocieties.forEach(soc => {
        const option = document.createElement('option');
        option.value = soc.id;
        option.textContent = soc.name;
        select.appendChild(option);
    });
    document.getElementById('joinSocietyModal').style.display = 'flex';
});

// Close modal
document.getElementById('closeJoinSocietyModal').addEventListener('click', function() {
    document.getElementById('joinSocietyModal').style.display = 'none';
});

// Handle form submit
document.getElementById('joinSocietyForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const societyId = document.getElementById('selectSociety').value;
    const referralCode = document.getElementById('referralCode').value.trim();
    const societyName = allSocieties.find(s => s.id == societyId)?.name || '';
    // Demo: Get viewer info (replace with real user info)
    const viewerInfo = {
        name: localStorage.getItem('viewerName') || 'Demo Viewer',
        email: localStorage.getItem('viewerEmail') || 'viewer@example.com'
    };
    // Save join request to localStorage (simulate sending to handler)
    const joinRequests = JSON.parse(localStorage.getItem('societyJoinRequests') || '[]');
    joinRequests.push({
        societyId,
        societyName,
        referralCode,
        viewerInfo,
        status: 'pending',
        requestedAt: new Date().toISOString()
    });
    localStorage.setItem('societyJoinRequests', JSON.stringify(joinRequests));
    showJoinSuccessMessage(societyName);
    document.getElementById('joinSocietyModal').style.display = 'none';
    this.reset();
});

// Optional: Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('joinSocietyModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

function showJoinSuccessMessage(societyName) {
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = `Your request to join ${societyName} has been sent!`;
    document.body.appendChild(successMessage);

    // Animate in
    setTimeout(() => {
        successMessage.style.opacity = '1';
        successMessage.style.transform = 'translateY(0)';
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
        successMessage.style.opacity = '0';
        successMessage.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            document.body.removeChild(successMessage);
        }, 300);
    }, 3000);
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    populateSocieties();

    // Add logout handler
    document.getElementById('logout-btn').addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = 'login.html';
    });
}); 