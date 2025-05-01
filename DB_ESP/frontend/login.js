document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Collect login data
        const formData = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };
        
        // In a real application, you would send this data to your Python backend
        console.log('Login attempt:', formData);
        
        // Example AJAX request to your backend (uncomment and modify as needed)
        /*
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Store auth token if your backend returns one
                if (data.token) {
                    localStorage.setItem('authToken', data.token);
                }
                
                // Redirect based on user type
                window.location.href = data.userType === 'handler' 
                    ? 'handler-dashboard.html' 
                    : 'viewer-dashboard.html';
            } else {
                alert(data.message || 'Login failed. Please check your credentials.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during login. Please try again.');
        });
        */
        
        // For demonstration purposes, simulate successful login
        // In a real application, this would be determined by your backend response
        const demoEmail = 'admin@example.com';
        const demoPassword = 'password';
        
        if (formData.email === demoEmail && formData.password === demoPassword) {
            alert('Login successful! Redirecting to dashboard...');
            // Simulate admin login
            window.location.href = 'handler-dashboard.html';
        } else {
            // Simulate regular user login for any other credentials
            alert('Login successful! Redirecting to viewer dashboard...');
            window.location.href = 'viewer-dashboard.html';
        }
    });
});