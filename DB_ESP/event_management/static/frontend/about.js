// Counter animation with intersection observer
const stats = document.querySelectorAll('.stat-number');
const options = {
    threshold: 0.5,
    rootMargin: "0px"
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = entry.target;
            const endValue = parseInt(target.getAttribute('data-target'), 10);
            animateValue(target, 0, endValue, 2000);
            observer.unobserve(target);
        }
    });
}, options);

stats.forEach(stat => {
    observer.observe(stat);
});

function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value + (end >= 100 ? '+' : '');
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            element.textContent = end + (end >= 100 ? '+' : '');
        }
    };
    window.requestAnimationFrame(step);
}

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('#nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!hamburger?.contains(e.target) && !navMenu?.contains(e.target)) {
        hamburger?.classList.remove('active');
        navMenu?.classList.remove('active');
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Skip empty or javascript:void(0) links
        if (href === '#' || href === 'javascript:void(0)') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Close mobile menu when clicking a link
            hamburger?.classList.remove('active');
            navMenu?.classList.remove('active');
        }
    });
});

// Scroll reveal animation for sections
const revealElements = document.querySelectorAll('.features-row, .milestone-card, .team-card');
const revealOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const revealOnScroll = new IntersectionObserver((entries, revealOnScroll) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        
        setTimeout(() => {
            entry.target.classList.add('appear');
        }, 100); // Small delay for better visual effect
        
        revealOnScroll.unobserve(entry.target);
    });
}, revealOptions);

revealElements.forEach(element => {
    element.classList.add('reveal-element'); // Add class for initial state
    revealOnScroll.observe(element);
});

// Check if user is logged in and update profile icon link
const updateProfileLink = () => {
    const profileLink = document.getElementById('profileLink');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (profileLink) {
        profileLink.href = isLoggedIn ? 'profile.html' : 'register.html';
    }
};

// Call on page load
document.addEventListener('DOMContentLoaded', () => {
    updateProfileLink();
    
    // Add animation classes
    document.querySelectorAll('.milestone-card, .team-card, .feature-card').forEach((el, index) => {
        el.style.transitionDelay = `${index * 100}ms`;
    });
});

// Add this if you want to handle window resize events
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        hamburger?.classList.remove('active');
        navMenu?.classList.remove('active');
    }
});