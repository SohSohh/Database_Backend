// Load configuration in non-module contexts
(function() {
    // Create a script element to load config.js
    const script = document.createElement('script');
    script.src = 'config.js';
    script.type = 'module';
    
    // Add error handling
    script.onerror = function() {
        console.error('Failed to load configuration. Using fallback configuration.');
        window.API_BASE_URL = window.API_BASE_URL || 'http://127.0.0.1:8000/api';
    };
    
    // Insert at the beginning of the head
    document.head.insertBefore(script, document.head.firstChild);
})();
