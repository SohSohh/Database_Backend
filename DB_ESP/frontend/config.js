/**
 * Global application configuration
 * This file must be included BEFORE all other JavaScript files
 */

// Dynamically determine the API base URL
(function () {
    const hostname = window.location.hostname;
    const port = "8000"; // Django's dev server port
    let apiHost;

    if (hostname === "localhost" || hostname === "127.0.0.1") {
        // Local development on the same machine
        apiHost = "127.0.0.1";
    } else {
        // Access from another device (e.g., phone or another computer on LAN)
        apiHost = hostname;
    }

    // const API_BASE_URL = `http://${apiHost}:${port}/api`;
    const API_BASE_URL = 'https://database-backend-stbj.onrender.com/api/'

    // Define main configuration object on window
    window.AppConfig = {
        // API configuration
        API_BASE_URL: API_BASE_URL,

        // Environment settings
        DEBUG: true,
        VERSION: "1.0.0",

        // Add any other global configuration variables here
    };

    // For backward compatibility with any existing code using these variables directly
    window.API_BASE_URL = window.AppConfig.API_BASE_URL;
    window.BASE_URL = window.AppConfig.API_BASE_URL;

    console.log("Configuration loaded:", window.AppConfig);
})();
