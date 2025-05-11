/**
 * Elegant Filigree Background Animation
 * 
 * This script creates an animated filigree background that draws itself as the user scrolls.
 * The animation is designed to be smooth and elegant, with different parts of the pattern
 * appearing at different scroll positions.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get all filigree paths
    const filigreenPaths = document.querySelectorAll('.filigree-path');
    const pathCount = filigreenPaths.length;
    
    // Organize paths into sections for more controlled drawing
    const pathSections = {
        top: Array.from(filigreenPaths).slice(0, Math.floor(pathCount * 0.3)),
        middle: Array.from(filigreenPaths).slice(Math.floor(pathCount * 0.3), Math.floor(pathCount * 0.7)),
        bottom: Array.from(filigreenPaths).slice(Math.floor(pathCount * 0.7))
    };
    
    // Main path should always be drawn first
    const mainPath = document.querySelector('.filigree-path.main-path');
    
    // Calculate total document height for scroll percentage
    const getDocHeight = () => {
        return Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        );
    };
    
    // Function to update paths based on scroll position
    function updateFiligreePaths() {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const docHeight = getDocHeight();
        const scrollPercentage = scrollPosition / (docHeight - windowHeight);
        
        // Always draw the main vertical path based on scroll percentage
        if (mainPath) {
            // Start drawing immediately when page loads
            if (scrollPercentage > 0.01) {
                mainPath.classList.add('drawn');
            } else {
                mainPath.classList.remove('drawn');
            }
        }
        
        // Draw top section elements early in the scroll - with lower trigger points
        pathSections.top.forEach((path, idx) => {
            const delay = idx * 50; // Reduced delay for quicker appearance
            const triggerPoint = 0.05 + (idx / pathSections.top.length * 0.05); // Lower trigger point
            
            if (scrollPercentage > triggerPoint) {
                setTimeout(() => {
                    path.classList.add('drawn');
                }, delay);
            } else {
                path.classList.remove('drawn');
            }
        });
        
        // Draw middle section as the user scrolls through the middle
        pathSections.middle.forEach((path, idx) => {
            // Stagger the drawing of middle elements
            const delay = idx * 40; // Faster stagger
            const triggerPoint = 0.1 + (idx / pathSections.middle.length * 0.15); // Lower trigger point
            
            if (scrollPercentage > triggerPoint) {
                setTimeout(() => {
                    path.classList.add('drawn');
                }, delay);
            } else {
                path.classList.remove('drawn');
            }
        });
        
        // Draw bottom section as the user approaches the bottom
        pathSections.bottom.forEach((path, idx) => {
            // Stagger the drawing of bottom elements
            const delay = idx * 60; // Medium stagger for bottom elements
            const triggerPoint = 0.25 + (idx / pathSections.bottom.length * 0.15); // Lower trigger point
            
            if (scrollPercentage > triggerPoint) {
                setTimeout(() => {
                    path.classList.add('drawn');
                }, delay);
            } else {
                path.classList.remove('drawn');
            }
        });
    }
    
    // Initial update - force paths to be drawn initially
    setTimeout(() => {
        // Force all paths to be drawn initially with a staggered effect
        updateFiligreePaths();
        
        // Add a forced initial draw for better visibility
        const mainPath = document.querySelector('.filigree-path.main-path');
        if (mainPath) {
            mainPath.classList.add('drawn');
        }
        
        // Force immediate drawing of at least a few elements
        const firstTopPaths = Array.from(pathSections.top).slice(0, 3);
        firstTopPaths.forEach((path, idx) => {
            setTimeout(() => {
                path.classList.add('drawn');
            }, idx * 100);
        });
    }, 300); // Small delay for page to settle
    
    // Update on scroll with throttling for better performance
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                scrollTimeout = null;
                window.requestAnimationFrame(updateFiligreePaths);
            }, 10); // Small throttle for smoother performance
        }
    });
    
    // Update on resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
        if (!resizeTimeout) {
            resizeTimeout = setTimeout(() => {
                resizeTimeout = null;
                window.requestAnimationFrame(updateFiligreePaths);
            }, 100);
        }
    });
});
