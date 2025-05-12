import { API_BASE_URL } from './config.js';

document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerHandlerForm");

  if (registerForm) {
    // Get the submit button for updating its state
    const submitButton = registerForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton ? submitButton.textContent : 'Register';
    
    registerForm.addEventListener("submit", async function (e) {
      e.preventDefault();      // Disable the button and show loading state
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.classList.remove('success', 'error');  // Clear any previous states
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
      }

      const formData = {
        email: document.getElementById('email').value,
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        password2: document.getElementById('confirmPassword').value,  // Important: Match backend expectation
        society_name: document.getElementById('handlerName').value
      };      try {
        const response = await fetch(`${API_BASE_URL}/api/users/register/handler/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
          // Show success in button
          if (submitButton) {
            submitButton.innerHTML = '<i class="fas fa-check"></i> Success! Redirecting...';
            submitButton.classList.add('success');
            submitButton.classList.remove('error'); // Remove error class if it existed
          }
          
          // Show success message
          showSuccess(registerForm, "Registration successful! Redirecting to login page...");
            // Short delay before redirect to show success state
          setTimeout(() => {
            // Create a smooth transition effect before redirecting
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.5s ease';
            
            // After fade-out effect, redirect to login page
            setTimeout(() => {
              window.location.href = 'login.html';
            }, 500);
          }, 800);
        } else {          // Show error in button
          if (submitButton) {
            submitButton.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Registration Failed';
            submitButton.classList.add('error');
            submitButton.classList.remove('success'); // Remove success class if it existed
            
            // Reset button after a delay
            setTimeout(() => {
              submitButton.disabled = false;
              submitButton.innerHTML = originalButtonText;
              submitButton.classList.remove('error');
            }, 2000);
          }
          
          const message = getErrorMessage(data);
          showError(registerForm, message);
        }
      } catch (error) {
        console.error("Registration error:", error);
          // Reset button state on error
        if (submitButton) {
          submitButton.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Connection Error';
          submitButton.classList.add('error');
          submitButton.classList.remove('success');
          
          // Reset button after a delay
          setTimeout(() => {
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
            submitButton.classList.remove('error');
          }, 2000);
        }
        
        showError(registerForm, "Registration failed. Please try again.");
      }
    });
  }

  // Use the existing getErrorMessage function for more detailed error handling
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
  }  function showError(form, message) {
    // Check if status-messages container exists, if not create it
    let messagesContainer = form.querySelector("#status-messages");
    if (!messagesContainer) {
      messagesContainer = document.createElement("div");
      messagesContainer.id = "status-messages";
      form.prepend(messagesContainer);
    }
    
    let errorElement = messagesContainer.querySelector(".error-message");
    if (!errorElement) {
      errorElement = document.createElement("div");
      errorElement.className = "error-message";
      messagesContainer.appendChild(errorElement);
    }
    
    // Make container visible
    messagesContainer.style.display = "block";
    
    // Add icon to error message
    errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    errorElement.style.display = "block";
    
    // Hide any success message
    const successElement = messagesContainer.querySelector(".success-message");
    if (successElement) successElement.style.display = "none";
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      errorElement.style.display = "none";
      if (!successElement || successElement.style.display === "none") {
        messagesContainer.style.display = "none";
      }
    }, 5000);
  }
  function showSuccess(form, message) {
    // Check if status-messages container exists, if not create it
    let messagesContainer = form.querySelector("#status-messages");
    if (!messagesContainer) {
      messagesContainer = document.createElement("div");
      messagesContainer.id = "status-messages";
      form.prepend(messagesContainer);
    }
    
    let successElement = messagesContainer.querySelector(".success-message");
    if (!successElement) {
      successElement = document.createElement("div");
      successElement.className = "success-message";
      messagesContainer.appendChild(successElement);
    }
    
    // Make container visible
    messagesContainer.style.display = "block";
    
    // Add icon to success message
    successElement.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    successElement.style.display = "block";
    
    // Hide any error message
    const errorElement = messagesContainer.querySelector(".error-message");
    if (errorElement) errorElement.style.display = "none";
  }
});