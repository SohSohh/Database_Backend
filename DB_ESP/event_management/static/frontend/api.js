/**
 * API service module for EventHub application
 * Handles all API requests to the backend
 */

// Ensure the global API_BASE_URL is loaded
if (!window.API_BASE_URL) {
    throw new Error('API_BASE_URL is not defined. Make sure config.js is loaded before this script.');
}

const api = {
    /**
     * Authentication related API calls
     */
    auth: {
        /**
         * Login user with email and password
         * @param {Object} credentials - User credentials
         * @param {string} credentials.email - User email
         * @param {string} credentials.password - User password
         * @returns {Promise<Object>} - User data and tokens
         */
        login: async (credentials) => {
            try {
                const response = await fetch(`${window.API_BASE_URL}/api/users/login/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(credentials),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Login failed. Please try again.');
                }

                const data = await response.json();
                
                // Extract user and token data from response
                // This matches the structure from your Postman collection
                return {
                    user: {
                        id: data.id || data.user_id,
                        email: credentials.email,
                        name: data.name || data.username || credentials.email,
                        userType: data.user_type || 'viewer', // Default to viewer if not specified
                    },
                    tokens: {
                        access: data.access,
                        refresh: data.refresh
                    }
                };
            } catch (error) {
                console.error('API login error:', error);
                throw error;
            }
        },

        /**
         * Logout user
         * @returns {Promise<void>}
         */
        logout: async () => {
            // Clear local storage on logout
            localStorage.removeItem('auth_user');
            localStorage.removeItem('auth_tokens');
            // Additional logout logic if needed
        }
    },

    /**
     * Add API request helper with authorization
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise<Object>} - Response data
     */
    request: async (endpoint, options = {}) => {
        const tokens = JSON.parse(localStorage.getItem('auth_tokens') || '{}');
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (tokens.access) {
            headers['Authorization'] = `Bearer ${tokens.access}`;
        }

        const response = await fetch(`${window.API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        // Handle token expiration
        if (response.status === 401) {
            // Token might be expired, could implement refresh here
            // For now, just redirect to login
            window.location.href = 'login.html';
            return;
        }

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || 'API request failed');
        }
        
        return data;
    }
};

export default api;