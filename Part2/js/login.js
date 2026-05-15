// --- Toggle password visibility ---
document.getElementById("togglePw").addEventListener("click", function () {
  const input = document.getElementById("password");
  const showing = input.type === "text";
  input.type = showing ? "password" : "text";
  this.setAttribute("aria-label", showing ? "Show password" : "Hide password");
});

// --- Validation helpers ---
function showError(id, msg) {
  document.getElementById(id).textContent = msg;
}

function clearError(id) {
  document.getElementById(id).textContent = "";
}

function setInvalid(inputId, invalid) {
  document.getElementById(inputId).classList.toggle("is-invalid", invalid);
}

// --- Form submit ---
document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  clearError("emailError");
  clearError("passwordError");
  clearError("generalError");
  setInvalid("email", false);
  setInvalid("password", false);

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  let valid = true;

  if (!email) {
    showError("emailError", "Email address is required.");
    setInvalid("email", true);
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError("emailError", "Please enter a valid email address.");
    setInvalid("email", true);
    valid = false;
  }

  if (!password) {
    showError("passwordError", "Password is required.");
    setInvalid("password", true);
    valid = false;
  }

  if (!valid) return;

  const users = JSON.parse(localStorage.getItem("bookies_users") || "[]");
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!user) {
    showError("generalError", "Incorrect email or password.") ;
    return;
  }

  localStorage.setItem("bookies_session", user.username);
  window.location.href = "profile.html";
});
