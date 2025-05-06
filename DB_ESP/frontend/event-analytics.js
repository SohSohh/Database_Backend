const token = localStorage.getItem('access_token');
const API_CONFIG = {
    baseUrl: 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
};

// Helper function for API calls
async function apiCall(endpoint, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: API_CONFIG.headers,
        };
        if (body) options.body = JSON.stringify(body);
        const response = await fetch(`${API_CONFIG.baseUrl}/${endpoint}`, options);
        if (!response.ok) throw new Error('API call failed');
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Function to initialize category distribution chart (replacing attendance trend)
async function initCategoryDistributionChart() {
    const events = await apiCall('events/handler/');
    const categories = await apiCall('events/categories/');
    
    // Count events per category
    const categoryCount = {};
    categories.forEach(cat => categoryCount[cat.name] = 0);
    
    events.forEach(event => {
        const catName = event.category_name;
        categoryCount[catName] = (categoryCount[catName] || 0) + 1;
    });

    const ctx = document.getElementById('categoryDistributionChart').getContext('2d');
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: Object.keys(categoryCount),
            datasets: [{
                label: 'Events per Category',
                data: Object.values(categoryCount),
                backgroundColor: 'rgba(92, 0, 0, 0.2)',
                borderColor: '#5C0000',
                borderWidth: 2,
                pointBackgroundColor: '#5C0000',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Function to initialize event performance chart
async function initEventPerformanceChart() {
    const events = await apiCall('events/handler/');
    
    const ctx = document.getElementById('eventPerformanceChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: events.map(event => event.name),
            datasets: [{
                label: 'Number of Attendees',
                data: events.map(event => event.attendee_count),
                backgroundColor: '#5C0000'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Attendees'
                    }
                }
            }
        }
    });
}

// Function to initialize demographics chart
async function initDemographicsChart() {
    const members = await apiCall('users/society/members/');
    const roleCount = members.reduce((acc, member) => {
        const role = member.role_display || member.role;
        acc[role] = (acc[role] || 0) + 1;
        return acc;
    }, {});

    const ctx = document.getElementById('demographicsChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(roleCount),
            datasets: [{
                data: Object.values(roleCount),
                backgroundColor: [
                    '#5C0000',
                    '#8B0000',
                    '#B22222',
                    '#DC143C',
                    '#FF0000',
                    '#FF4500'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

// Function to initialize feedback chart
async function initFeedbackChart() {
    const events = await apiCall('events/handler/');
    const allComments = await Promise.all(
        events.map(event => apiCall(`events/${event.id}/comments/`))
    );

    const ratingDistribution = {
        5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };

    allComments.flat().forEach(comment => {
        ratingDistribution[comment.rating]++;
    });

    const ctx = document.getElementById('feedbackChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
            datasets: [{
                label: 'Rating Distribution',
                data: Object.values(ratingDistribution),
                backgroundColor: [
                    '#dc3545',
                    '#ffc107',
                    '#6c757d',
                    '#28a745',
                    '#5C0000'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Ratings'
                    }
                }
            }
        }
    });
}

// Function to update quick stats
async function updateQuickStats() {
    try {
        const members = await apiCall('users/society/members/');
        const events = await apiCall('events/handler/');
        const allComments = await Promise.all(
            events.map(event => apiCall(`events/${event.id}/comments/`))
        );

        const totalMembers = members.length;
        const totalEvents = events.length;

        // Calculate average rating
        const ratings = allComments.flat().map(comment => comment.rating);
        const averageRating = ratings.length > 0 
            ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
            : 'N/A';

        // Calculate growth rate
        const membersByMonth = {};
        members.forEach(member => {
            const date = new Date(member.created_at);
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
            membersByMonth[monthKey] = (membersByMonth[monthKey] || 0) + 1;
        });
        
        const monthKeys = Object.keys(membersByMonth).sort();
        const currentMonth = membersByMonth[monthKeys[monthKeys.length - 1]] || 0;
        const previousMonth = membersByMonth[monthKeys[monthKeys.length - 2]] || 0;
        const growthRate = previousMonth > 0 
            ? (((currentMonth - previousMonth) / previousMonth) * 100).toFixed(0)
            : 'N/A';

        // Update DOM
        document.querySelectorAll('.stat-number')[0].textContent = totalMembers;
        document.querySelectorAll('.stat-number')[1].textContent = totalEvents;
        document.querySelectorAll('.stat-number')[2].textContent = averageRating;
        document.querySelectorAll('.stat-number')[3].textContent = 
            growthRate !== 'N/A' ? `${growthRate}%` : growthRate;

    } catch (error) {
        console.error('Failed to update quick stats:', error);
    }
}

// Initialize all charts and stats when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await updateQuickStats();
        await initCategoryDistributionChart(); // Replace initAttendanceTrendChart
        await initEventPerformanceChart();
        await initDemographicsChart();
        await initFeedbackChart();
    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
    }
});
