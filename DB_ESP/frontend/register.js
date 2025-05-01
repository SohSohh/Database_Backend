document.addEventListener("DOMContentLoaded", function () {
  // Get DOM elements
  const registerForm = document.getElementById("registerForm");
  const typeToggleBtns = document.querySelectorAll(".auth-type-btn");
  const handlerFields = document.querySelector(".handler-fields");
  const userTypeInput = document.getElementById("userType");
  const passwordInput = document.getElementById("password");
  const strengthMeter = document.getElementById("strengthMeter");
  const strengthText = document.getElementById("strengthText");

  // Toggle between viewer and handler registration
  typeToggleBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      // Remove active class from all buttons
      typeToggleBtns.forEach((b) => b.classList.remove("active"));

      // Add active class to clicked button
      this.classList.add("active");

      // Get user type from data attribute
      const userType = this.getAttribute("data-type");

      // Update hidden input
      userTypeInput.value = userType;

      // Show/hide handler fields
      if (userType === "handler") {
        handlerFields.style.display = "block";
      } else {
        handlerFields.style.display = "none";
      }
    });
  });

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
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Get form data
      const formData = new FormData(this);
      const userData = {};

      // Convert FormData to object
      for (const [key, value] of formData.entries()) {
        userData[key] = value;
      }

      // Basic validation
      if (userData.password !== userData.confirmPassword) {
        showError(registerForm, "Passwords don't match");
        return;
      }

      // Check password strength
      const strength = checkPasswordStrength(userData.password);
      if (strength.class === "weak") {
        showError(registerForm, "Please choose a stronger password");
        return;
      }

      // Check handler auth key if registering as handler
      if (userData.userType === "handler") {
        // Mock handler authentication key validation
        // In a real app, this would be verified with the backend
        const validHandlerKeys = ["HANDLER123", "ORGANIZER456", "EVENT789"];

        if (!validHandlerKeys.includes(userData.handlerAuthKey)) {
          showError(registerForm, "Invalid handler authentication key");
          return;
        }
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        showError(registerForm, "Please enter a valid email address");
        return;
      }

      // Username validation
      if (userData.username.length < 4) {
        showError(registerForm, "Username must be at least 4 characters");
        return;
      }

      // Check for special characters in username
      const usernameRegex = /^[a-zA-Z0-9_-]+$/;
      if (!usernameRegex.test(userData.username)) {
        showError(
          registerForm,
          "Username can only contain letters, numbers, underscores and hyphens"
        );
        return;
      }

      // If all validations pass, send registration data to server
      registerUser(userData)
        .then((response) => {
          if (response.success) {
            // Show success message
            showSuccess(
              registerForm,
              "Registration successful! Redirecting to login..."
            );

            // Redirect to login page after 2 seconds
            setTimeout(() => {
              window.location.href = "/login.html";
            }, 2000);
          } else {
            // Show error from server
            showError(
              registerForm,
              response.message || "Registration failed. Please try again."
            );
          }
        })
        .catch((error) => {
          console.error("Registration error:", error);
          showError(registerForm, "An error occurred. Please try again later.");
        });
    });
  }

  /**
   * Send registration data to the server
   * @param {Object} userData - User registration data
   * @returns {Promise} - Response from server
   */
  function registerUser(userData) {
    // API endpoint
    const endpoint = "/api/register";

    // Remove confirm password field as it's not needed on the server
    const { confirmPassword, ...dataToSend } = userData;

    // In a real application, this would be an actual API call
    return fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSend),
    }).then((response) => response.json());
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

  // Initialize the form with default user type
  document.querySelector('.auth-type-btn[data-type="viewer"]').click();
});
