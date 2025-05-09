import { API_BASE_URL } from './config.js';

document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerForm");
  const passwordInput = document.getElementById("password");
  const strengthMeter = document.getElementById("strengthMeter");
  const strengthText = document.getElementById("strengthText");
  const submitButton = document.getElementById("submitBtn");
  const buttonText = submitButton.querySelector('.button-text');
  const loadingSpinner = submitButton.querySelector('.loading-spinner');

  // Password strength checker
  if (passwordInput) {
    passwordInput.addEventListener("input", function () {
      const password = this.value;
      const strength = checkPasswordStrength(password);

      // Update strength meter
      strengthMeter.className = "strength-meter " + strength.class;
      strengthText.textContent = strength.text;
    });
  }

  // Form submission
  if (registerForm) {
    registerForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Show loading state
      submitButton.disabled = true;
      buttonText.style.display = 'none';
      loadingSpinner.style.display = 'inline-block';

      const formData = {
        email: document.getElementById('email').value,
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        password2: document.getElementById('password2').value,
        first_name: document.getElementById('first_name').value,
        last_name: document.getElementById('last_name').value
      };

      // For debugging - log what we're about to send
      console.log("Form data to be sent:", formData);

      // Basic validation
      if (formData.password !== formData.password2) {
        showError(registerForm, "Passwords don't match");
        submitButton.disabled = false;
        buttonText.style.display = 'inline-block';
        loadingSpinner.style.display = 'none';
        return;
      }

      // Check password strength
      const strength = checkPasswordStrength(formData.password);
      if (strength.class === "weak") {
        showError(registerForm, "Please choose a stronger password");
        submitButton.disabled = false;
        buttonText.style.display = 'inline-block';
        loadingSpinner.style.display = 'none';
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        showError(registerForm, "Please enter a valid email address");
        submitButton.disabled = false;
        buttonText.style.display = 'inline-block';
        loadingSpinner.style.display = 'none';
        return;
      }

      // Username validation
      if (formData.username.length < 4) {
        showError(registerForm, "Username must be at least 4 characters");
        submitButton.disabled = false;
        buttonText.style.display = 'inline-block';
        loadingSpinner.style.display = 'none';
        return;
      }

      // Check for special characters in username
      const usernameRegex = /^[a-zA-Z0-9_-]+$/;
      if (!usernameRegex.test(formData.username)) {
        showError(
          registerForm,
          "Username can only contain letters, numbers, underscores and hyphens"
        );
        submitButton.disabled = false;
        buttonText.style.display = 'inline-block';
        loadingSpinner.style.display = 'none';
        return;
      }

      // Check if terms are agreed to
      if (!document.getElementById("agreeTerms").checked) {
        showError(registerForm, "You must agree to the Terms & Conditions");
        submitButton.disabled = false;
        buttonText.style.display = 'inline-block';
        loadingSpinner.style.display = 'none';
        return;
      }

      try {
        console.log('Sending registration request:', {
          url: `${API_BASE_URL}/api/users/register/viewer/`,
          method: 'POST',
          body: { ...formData, password: '[HIDDEN]', password2: '[HIDDEN]' }
        });

        const response = await fetch(`${API_BASE_URL}/api/users/register/viewer/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });

        const data = await response.json();
        console.log('Response status:', response.status);
        console.log('Response data:', data);

        if (response.ok) {
          // Store the tokens
          localStorage.setItem('access_token', data.access);
          localStorage.setItem('refresh_token', data.refresh);
          localStorage.setItem('user_type', 'viewer');
          localStorage.setItem('user_id', data.user_id);

          // Show success message and redirect
          showSuccess(registerForm, "Registration successful! Redirecting to login screen...");
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 2000);
        } else {
          const errorMessage = getErrorMessage(data);
          showError(registerForm, errorMessage);
        }
      } catch (error) {
        console.error('Registration error:', error);
        showError(registerForm, "Registration failed. Please try again.");
      } finally {
        // Reset button state
        submitButton.disabled = false;
        buttonText.style.display = 'inline-block';
        loadingSpinner.style.display = 'none';
      }
    });
  }

  /**
   * Check password strength
   * @param {string} password - Password to check
   * @returns {Object} - Strength class and description
   */
  function checkPasswordStrength(password) {
    if (!password) {
      return { class: "empty", text: "No password" };
    }

    // Calculate score based on various criteria
    let score = 0;

    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Complexity checks
    if (/[a-z]/.test(password)) score += 1; // lowercase
    if (/[A-Z]/.test(password)) score += 1; // uppercase
    if (/[0-9]/.test(password)) score += 1; // numbers
    if (/[^a-zA-Z0-9]/.test(password)) score += 2; // special characters

    // Check for common patterns
    if (/123|abc|qwerty|password|admin/i.test(password)) score -= 2;

    // Determine strength based on score
    if (score < 3) {
      return { class: "weak", text: "Weak" };
    } else if (score < 6) {
      return { class: "medium", text: "Medium" };
    } else {
      return { class: "strong", text: "Strong" };
    }
  }

  /**
   * Display error message on form
   * @param {HTMLElement} form - Form element
   * @param {string} message - Error message
   */
  function showError(form, message) {
    const errorElement =
      form.querySelector(".error-message") ||
      createMessageElement(form, "error-message");
    errorElement.textContent = message;
    errorElement.style.display = "block";

    // Hide error message after 5 seconds
    setTimeout(() => {
      errorElement.style.display = "none";
    }, 5000);
  }

  /**
   * Display success message on form
   * @param {HTMLElement} form - Form element
   * @param {string} message - Success message
   */
  function showSuccess(form, message) {
    const successElement =
      form.querySelector(".success-message") ||
      createMessageElement(form, "success-message");
    successElement.textContent = message;
    successElement.style.display = "block";

    // Hide any error messages
    const errorElement = form.querySelector(".error-message");
    if (errorElement) {
      errorElement.style.display = "none";
    }
  }

  /**
   * Create message element if it doesn't exist
   * @param {HTMLElement} form - Form element
   * @param {string} className - CSS class for the message
   * @returns {HTMLElement} - Created or existing message element
   */
  function createMessageElement(form, className) {
    const messageElement = document.createElement("div");
    messageElement.className = className;
    form.appendChild(messageElement);
    return messageElement;
  }

  function getErrorMessage(errorData) {
    if (!errorData) return "Unknown error occurred";
    
    console.log('Full error data:', errorData);

    if (typeof errorData === 'string') return errorData;

    // Check for specific field errors
    const fields = ['email', 'username', 'password', 'first_name', 'last_name'];
    for (const field of fields) {
      if (errorData[field]) {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} error: ${
          Array.isArray(errorData[field]) ? errorData[field][0] : errorData[field]
        }`;
      }
    }

    // Fallback to detail or generic message
    return errorData.detail || "Registration failed. Please try again.";
  }
});