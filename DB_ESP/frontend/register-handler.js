document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerHandlerForm");

  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Get form data
      const formData = new FormData(this);
      const userData = {};
      for (const [key, value] of formData.entries()) {
        userData[key] = value;
      }

      // Basic validation
      if (!userData.email || !userData.handlerName || !userData.password || !userData.confirmPassword) {
        showError(registerForm, "Please fill in all fields");
        return;
      }

      if (userData.password !== userData.confirmPassword) {
        showError(registerForm, "Passwords don't match");
        return;
      }

      // Password strength check (reuse your function if you want)
      if (userData.password.length < 6) {
        showError(registerForm, "Password must be at least 6 characters");
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        showError(registerForm, "Please enter a valid email address");
        return;
      }

      // If all validations pass, show success
      showSuccess(registerForm, "Handler registration successful! Redirecting to login...");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    });
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
    const errorElement = form.querySelector(".error-message");
    if (errorElement) errorElement.style.display = "none";
  }
});
