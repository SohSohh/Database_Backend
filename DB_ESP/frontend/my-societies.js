// Base URL for API calls
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Debug utilities
// const debugUtils = {
//     lastRequest: null,
//     lastResponse: null,
    
//     updateRequestDebug(method, url, headers, body) {
//         this.lastRequest = {
//             method,
//             url,
//             headers,
//             body: body || null,
//             timestamp: new Date().toISOString()
//         };
        
//         document.getElementById('lastRequest').textContent = 
//             JSON.stringify(this.lastRequest, null, 2);
//     },
    
//     updateResponseDebug(status, data) {
//         this.lastResponse = {
//             status,
//             data,
//             timestamp: new Date().toISOString()
//         };
        
//         document.getElementById('lastResponse').textContent = 
//             JSON.stringify(this.lastResponse, null, 2);
//     },
    
//     clearDebug() {
//         this.lastRequest = null;
//         this.lastResponse = null;
//         document.getElementById('lastRequest').textContent = 'None';
//         document.getElementById('lastResponse').textContent = 'None';
//     }
// };

// Society join codes (in a real app, these would come from the backend)
const societyJoinCodes = {
    1: 'CS2024',
    2: 'CULTURE2024',
    3: 'PHOTO2024',
    4: 'LIT2024',
    5: 'DRAMA2024',
    6: 'SPORTS2024',
    7: 'MUSIC2024',
    8: 'ARTS2024'
};

// Function to get auth token from localStorage
function getAuthToken() {
    return localStorage.getItem('access_token');
}

// Function to make authenticated API requests
async function apiRequest(endpoint, method = 'GET', body = null) {
    const token = getAuthToken();
    
    if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
    }
    
    // Remove leading slash from endpoint if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    
    const requestOptions = {
        method,
        headers
    };
    
    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        requestOptions.body = JSON.stringify(body);
    }
    
    // Update debug info for request
    //debugUtils.updateRequestDebug(method, `${API_BASE_URL}/${cleanEndpoint}`, headers, body);
    
    try {
        const response = await fetch(`${API_BASE_URL}/${cleanEndpoint}`, requestOptions);
        let data;
        
        try {
            data = await response.json();
        } catch (e) {
            data = { message: 'No JSON response body' };
        }
        
        // Update debug info for response
       // debugUtils.updateResponseDebug(response.status, data);
        
        if (!response.ok) {
            throw new Error(data.message || `API request failed with status ${response.status}`);
        }
        
        return data;
    } catch (error) {
        //debugUtils.updateResponseDebug('ERROR', { error: error.message });
        throw error;
    }
}

// Function to fetch user's societies
async function fetchMySocieties() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorMessage = document.getElementById('apiErrorMessage');
    const errorText = document.getElementById('errorText');
    const societiesGrid = document.getElementById('mySocieties');
    
    loadingIndicator.style.display = 'flex';
    errorMessage.style.display = 'none';
    societiesGrid.innerHTML = '';
    
    try {
        const societies = await apiRequest('/users/my-societies/');
        populateSocieties(societies);
    } catch (error) {
        errorText.textContent = error.message || 'Failed to load societies';
        errorMessage.style.display = 'block';
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

// Function to fetch all available societies
async function fetchAllSocieties() {
    const modalLoading = document.getElementById('modalLoadingIndicator');
    const modalError = document.getElementById('modalErrorMessage');
    const modalErrorText = document.getElementById('modalErrorText');
    const selectSociety = document.getElementById('selectSociety');
    
    modalLoading.style.display = 'flex';
    modalError.style.display = 'none';
    
    // Clear select options except the first one
    while (selectSociety.options.length > 1) {
        selectSociety.remove(1);
    }
    
    try {
        // Get all societies
        const allSocieties = await apiRequest('/users/societies/');
        // Get user's societies
        const mySocieties = await apiRequest('/users/my-societies/');
        
        // Filter out societies the user is already a member of
        const mySocietiesIds = mySocieties.map(soc => soc.id);
        const availableSocieties = allSocieties.filter(soc => !mySocietiesIds.includes(soc.id));
        
        availableSocieties.forEach(society => {
            const option = document.createElement('option');
            option.value = society.id;
            option.textContent = society.society_name;
            selectSociety.appendChild(option);
        });
        
        if (availableSocieties.length === 0) {
            const option = document.createElement('option');
            option.disabled = true;
            option.textContent = 'No available societies to join';
            selectSociety.appendChild(option);
        }
    } catch (error) {
        modalErrorText.textContent = error.message || 'Failed to load societies';
        modalError.style.display = 'block';
    } finally {
        modalLoading.style.display = 'none';
    }
}

// Function to populate societies
function populateSocieties(societies) {
    const societiesGrid = document.getElementById('mySocieties');
    societiesGrid.innerHTML = '';

    if (!societies || societies.length === 0) {
        societiesGrid.innerHTML = `
            <div class="no-societies">
                <i class="fas fa-users"></i>
                <p>No societies joined yet</p>
            </div>
        `;
        // Add event listener to the "Join a Society" button
        document.getElementById('noSocietiesJoinBtn').addEventListener('click', () => {
            document.getElementById('joinSocietyBtn').click();
        });
        return;
    }

    societies.forEach(society => {
        const societyCard = document.createElement('div');
        societyCard.className = 'society-card';
        societyCard.innerHTML = `
            <div class="society-details">
                <h3>${society.society_name}</h3>
                <p class="society-stats">
                    <span><i class="fas fa-users"></i> ${society.member_count || 0} members</span>
                </p>
                <div class="society-info">
                    <span class="member-role">
                        <i class="fas fa-user-tag"></i>
                        ${society.role_display}
                    </span>
                </div>
                <div class="society-actions">
                    <button class="btn btn-primary" onclick="viewSociety(${society.id})">
                        <i class="fas fa-eye"></i> View Society
                    </button>
                </div>
            </div>
        `;
        societiesGrid.appendChild(societyCard);
    });
}

// Function to join a society
async function joinSociety(societyId, joinCode) {
    const submitBtn = document.getElementById('submitJoinBtn');
    const submitBtnText = document.getElementById('submitBtnText');
    const submitSpinner = document.getElementById('submitSpinner');
    
    // Disable button and show spinner
    submitBtn.disabled = true;
    submitBtnText.style.display = 'none';
    submitSpinner.style.display = 'inline-block';
    
    try {
        const requestBody = {
            handler_id: societyId,
            join_code: joinCode
        };
        
        await apiRequest('/users/membership/', 'POST', requestBody);
        
        // Close modal and show success message
        document.getElementById('joinSocietyModal').style.display = 'none';
        showNotification('Successfully joined society!', 'success');
        
        // Refresh societies list
        fetchMySocieties();
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        // Re-enable button and hide spinner
        submitBtn.disabled = false;
        submitBtnText.style.display = 'inline';
        submitSpinner.style.display = 'none';
    }
}

// Helper function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Function to show notification messages
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}-notification`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Navigation functions
function viewSociety(societyId) {
    window.location.href = `society-details.html?id=${societyId}`;
}

function viewSocietyEvents(societyId) {
    window.location.href = `society-events.html?id=${societyId}`;
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Fetch societies on page load
    fetchMySocieties();

    // Set up debug panel toggle
//     document.getElementById('toggleDebug').addEventListener('click', function() {
//         const debugContent = document.getElementById('debugContent');
//         const chevron = this.querySelector('.fa-chevron-down, .fa-chevron-up');
        
//         if (debugContent.style.display === 'none' || !debugContent.style.display) {
//             debugContent.style.display = 'block';
//             chevron.classList.replace('fa-chevron-down', 'fa-chevron-up');
//         } else {
//             debugContent.style.display = 'none';
//             chevron.classList.replace('fa-chevron-up', 'fa-chevron-down');
//         }
//     }
// );

    // Open join society modal
    document.getElementById('joinSocietyBtn').addEventListener('click', function() {
        fetchAllSocieties();
        document.getElementById('joinSocietyForm').reset();
        document.getElementById('joinSocietyModal').style.display = 'flex';
    });

    // Close join society modal
    document.getElementById('closeJoinSocietyModal').addEventListener('click', function() {
        document.getElementById('joinSocietyModal').style.display = 'none';
    });

    // Handle join society form submit
    document.getElementById('joinSocietyForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const societyId = document.getElementById('selectSociety').value;
        const joinCode = document.getElementById('joinCode').value.trim();
        
        if (!societyId) {
            showNotification('Please select a society', 'error');
            return;
        }
        
        joinSociety(societyId, joinCode);
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('joinSocietyModal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Add logout handler
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('access_token');
        window.location.href = 'login.html';
    });
});