// Ensure the global API_BASE_URL is loaded
if (!window.API_BASE_URL) {
    throw new Error('API_BASE_URL is not defined. Make sure config.js is loaded before this script.');
}
const token = localStorage.getItem('access_token');
const API_CONFIG = {
    baseUrl: window.API_BASE_URL,
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
        // Remove leading slash if present
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
        const response = await fetch(`${API_CONFIG.baseUrl}/${cleanEndpoint}`, options);
        if (!response.ok) throw new Error('API call failed');
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Function to initialize category distribution chart (replacing attendance trend)
async function initCategoryDistributionChart() {
    try {
        const events = await apiCall('events/handler/');
        const categories = await apiCall('events/categories/');
        
        // Count events per category
        const categoryCount = {};
        categories.forEach(cat => categoryCount[cat.name] = 0);
        
        events.forEach(event => {
            const catName = event.category_name;
            categoryCount[catName] = (categoryCount[catName] || 0) + 1;
        });
        
        // Sort categories by count for better visualization
        const sortedCategories = Object.keys(categoryCount).sort((a, b) => 
            categoryCount[b] - categoryCount[a]
        );
        
        const sortedData = sortedCategories.map(cat => categoryCount[cat]);
        
        const ctx = document.getElementById('categoryDistributionChart').getContext('2d');
        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: sortedCategories,
                datasets: [{
                    label: 'Events per Category',
                    data: sortedData,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: '#4bc0c0',
                    borderWidth: 2,
                    pointBackgroundColor: '#4bc0c0',
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
                            stepSize: 1,
                            color: '#6c757d'
                        },
                        pointLabels: {
                            color: '#2c3e50',
                            font: {
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        angleLines: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 14
                        },
                        padding: 10,
                        displayColors: false
                    }
                }
            }
        });
    } catch (error) {
        console.error('Failed to initialize category distribution chart:', error);
    }
}

// Function to initialize event performance chart
async function initEventPerformanceChart() {
    const events = await apiCall('events/handler/');
      const ctx = document.getElementById('eventPerformanceChart').getContext('2d');
    
    // Create a gradient for the bars
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, '#3498db');
    gradient.addColorStop(1, '#2980b9');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: events.map(event => event.name),
            datasets: [{
                label: 'Number of Attendees',
                data: events.map(event => event.attendee_count),
                backgroundColor: gradient,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: '#2980b9'
            }]
        },        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Attendees',
                        color: '#2c3e50',
                        font: {
                            weight: 'bold',
                            size: 14
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#6c757d',
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#2c3e50',
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            },
            plugins: {
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    callbacks: {
                        title: function(tooltipItems) {
                            return tooltipItems[0].label;
                        },
                        label: function(context) {
                            return `Attendees: ${context.parsed.y}`;
                        }
                    }
                },
                legend: {
                    labels: {
                        boxWidth: 12,
                        usePointStyle: true,
                        pointStyle: 'rectRounded'
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
    }, {});    const ctx = document.getElementById('demographicsChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(roleCount),
            datasets: [{
                data: Object.values(roleCount),
                backgroundColor: [
                    '#3498db',  // Blue
                    '#2ecc71',  // Green
                    '#9b59b6',  // Purple
                    '#f1c40f',  // Yellow
                    '#e74c3c',  // Red
                    '#1abc9c'   // Teal
                ],
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 10
            }]
        },        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12,
                            family: "'Poppins', sans-serif"
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    bodyFont: {
                        size: 14,
                        family: "'Poppins', sans-serif"
                    },
                    displayColors: true,
                    padding: 10
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true
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
    });    const ctx = document.getElementById('feedbackChart').getContext('2d');
    
    // Create a colorful gradient for each rating level
    const starColors = {
        1: { start: '#ff7675', end: '#d63031' },  // Red gradient
        2: '#fab1a0',                             // Salmon
        3: '#ffeaa7',                             // Light yellow
        4: '#55efc4',                             // Mint
        5: { start: '#74b9ff', end: '#0984e3' }   // Blue gradient
    };
    
    // Apply gradients where appropriate
    const backgroundColors = Object.keys(ratingDistribution).map(rating => {
        if (typeof starColors[rating] === 'object') {
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, starColors[rating].start);
            gradient.addColorStop(1, starColors[rating].end);
            return gradient;
        }
        return starColors[rating];
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
            datasets: [{
                label: 'Rating Distribution',
                data: Object.values(ratingDistribution),
                backgroundColor: backgroundColors,
                borderWidth: 1,
                borderRadius: 5,
                borderColor: ['#d63031', '#e17055', '#fdcb6e', '#00b894', '#0984e3']
            }]
        },        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Ratings',
                        color: '#2c3e50',
                        font: {
                            weight: 'bold',
                            size: 14
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#6c757d',
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#2c3e50',
                        font: {
                            weight: 'bold'
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    callbacks: {
                        title: function(tooltipItems) {
                            return tooltipItems[0].label;
                        },
                        label: function(context) {
                            return `Count: ${context.parsed.y}`;
                        }
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
