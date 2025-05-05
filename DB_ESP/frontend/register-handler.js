import { API_BASE_URL } from './config.js';

document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerHandlerForm");

  if (registerForm) {
    registerForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const formData = {
        email: document.getElementById('email').value,
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        password2: document.getElementById('confirmPassword').value,  // Important: Match backend expectation
        society_name: document.getElementById('handlerName').value
      };

      try {
        const response = await fetch(`${API_BASE_URL}/api/users/register/handler/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
          // Store the tokens
          localStorage.setItem('access_token', data.access);
          localStorage.setItem('refresh_token', data.refresh);
          localStorage.setItem('user_type', 'handler');
          localStorage.setItem('user_id', data.user.id);
          localStorage.setItem('join_code', data.user.join_code || '');

          showSuccess(registerForm, "Registration successful! Redirecting to dashboard...");
          setTimeout(() => {
            window.location.href = 'handler-dashboard.html';
          }, 2000);
        } else {
          const message = data.detail || Object.values(data)[0]?.[0] || 'Registration failed';
          showError(registerForm, message);
        }
      } catch (error) {
        showError(registerForm, "Registration failed. Please try again.");
      }
    });
  }

  function getErrorMessage(errorData) {
    // Handle different types of API error responses
    if (!errorData) {
      return "Unknown error. Please try again.";
    }
    
    // Display raw error response for debugging
    console.log("Full error data:", errorData);
    
    if (typeof errorData === 'string') {
      return errorData;
    }
    
    if (errorData.email) {
      return `Email error: ${Array.isArray(errorData.email) ? errorData.email[0] : errorData.email}`;
    } else if (errorData.username) {
      return `Username error: ${Array.isArray(errorData.username) ? errorData.username[0] : errorData.username}`;
    } else if (errorData.password) {
      return `Password error: ${Array.isArray(errorData.password) ? errorData.password[0] : errorData.password}`;
    } else if (errorData.society_name) {
      return `Society name error: ${Array.isArray(errorData.society_name) ? errorData.society_name[0] : errorData.society_name}`;
    } else if (errorData.detail) {
      return errorData.detail;
    } else if (errorData.non_field_errors) {
      return Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors[0] : errorData.non_field_errors;
    } else if (errorData.raw) {
      return `Raw response: ${errorData.raw}`;
    }
    
    // If we can't identify specific errors, show the full error as JSON
    return `API Error: ${JSON.stringify(errorData)}`;
  }

  function showError(form, message) {
    let errorElement = form.querySelector(".error-message");
    if (!errorElement) {
      errorElement = document.createElement("div");
      errorElement.className = "error-message";
      form.appendChild(errorElement);
    }
    errorElement.textContent = message;
    errorElement.style.display = "block";
    
    // Hide any success message
    const successElement = form.querySelector(".success-message");
    if (successElement) successElement.style.display = "none";
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      errorElement.style.display = "none";
    }, 5000);
  }

  function showSuccess(form, message) {
    let successElement = form.querySelector(".success-message");
    if (!successElement) {
      successElement = document.createElement("div");
      successElement.className = "success-message";
      form.appendChild(successElement);
    }
    successElement.textContent = message;
    successElement.style.display = "block";
    
    // Hide any error message
    const errorElement = form.querySelector(".error-message");
    if (errorElement) errorElement.style.display = "none";
  }
});