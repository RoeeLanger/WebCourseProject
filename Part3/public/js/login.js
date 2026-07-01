// ============================================
//  Bookies — Login Logic
// ============================================

// --- Show success banner if coming from password reset ---
(function () {
  const params = new URLSearchParams(window.location.search);
  if (params.get("reset") === "success") {
    const el = document.getElementById("generalError");
    el.textContent  = "✦ Password updated successfully. You may now sign in.";
    el.style.color  = "var(--sage-dark)";
  }
})();

// --- Toggle password visibility ---
document.getElementById("togglePw").addEventListener("click", function () {
  const input   = document.getElementById("password");
  const showing = input.type === "text";
  input.type    = showing ? "password" : "text";
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
document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  clearError("emailError");
  clearError("passwordError");

  // Only clear generalError if it's not the success message
  const ge = document.getElementById("generalError");
  if (ge.style.color !== "var(--sage-dark)") clearError("generalError");
  ge.style.color = "";

  setInvalid("email",    false);
  setInvalid("password", false);

  const email    = document.getElementById("email").value.trim();
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

  try {
    const result = await Api.login(email, password);
    Api.setSession(result.username);
    window.location.href = "profile.html";
  } catch (err) {
    // Server returns 401 "Incorrect email or password." for bad credentials.
    showError("generalError", (err && err.message) || "Incorrect email or password.");
  }
});