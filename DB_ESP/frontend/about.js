document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in (for demonstration purposes)
    const isLoggedIn = localStorage.getItem('authToken') !== null;
    const userType = localStorage.getItem('userType'); // This would be set during login
    
    // Update navigation based on login status
    updateNavigation(isLoggedIn, userType);
    
    // Animation for stats (simple counter animation when section is in view)
    const statsSection = document.querySelector('.stats-section');
    const statNumbers = document.querySelectorAll('.stat-item h3');
    
    // Convert stat text to numbers for animation
    const statValues = Array.from(statNumbers).map(stat => {
        const value = parseInt(stat.textContent.replace(/,|\+/g, ''));
        stat.textContent = '0';
        return value;
    });
    
    // Check if element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    // Animate stats when scrolled into view
    let animated = false;
    window.addEventListener('scroll', function() {
        if (isInViewport(statsSection) && !animated) {
            animated = true;
            
            statNumbers.forEach((stat, index) => {
                const targetValue = statValues[index];
                const duration = 2000; // 2 seconds
                const frameRate = 60;
                const totalFrames = duration / 1000 * frameRate;
                const increment = targetValue / totalFrames;
                
                let currentValue = 0;
                const counter = setInterval(() => {
                    currentValue += increment;
                    
                    if (currentValue >= targetValue) {
                        clearInterval(counter);
                        stat.textContent = targetValue.toLocaleString() + '+';
                    } else {
                        stat.textContent = Math.floor(currentValue).toLocaleString();
                    }
                }, 1000 / frameRate);
            });
        }
    });
});

function updateNavigation(isLoggedIn, userType) {
    const navLinks = document.querySelector('.nav-links');
    
    if (isLoggedIn) {
        // Remove login and register links
        const loginLink = document.querySelector('.nav-links li a[href="login.html"]').parentNode;
        const registerLink = document.querySelector('.nav-links li a[href="register.html"]').parentNode;
        
        if (loginLink) loginLink.remove();
        if (registerLink) registerLink.remove();
        
        // Add dashboard and logout links
        const dashboardLi = document.createElement('li');
        const dashboardLink = document.createElement('a');
        dashboardLink.href = userType === 'handler' ? 'handler-dashboard.html' : 'viewer-dashboard.html';
        dashboardLink.textContent = 'Dashboard';
        dashboardLi.appendChild(dashboardLink);
        
        const logoutLi = document.createElement('li');
        const logoutLink = document.createElement('a');
        logoutLink.href = '#';
        logoutLink.textContent = 'Logout';
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            // Clear auth data
            localStorage.removeItem('authToken');
            localStorage.removeItem('userType');
            // Redirect to home page
            window.location.href = 'index.html';
        });
        logoutLi.appendChild(logoutLink);
        
        navLinks.appendChild(dashboardLi);
        navLinks.appendChild(logoutLi);
    }
}