// ============================================
//  Bookies — Forgot Password Logic
// ============================================

// ---- State ----
let foundUser   = null;   // the user object we found by email
let userIndex   = -1;     // index in bookies_users array
let activeQ     = 1;      // which question we're currently on (1 or 2)
let q1Failed    = false;  // did question 1 already fail?

// ---- Helpers ----
function showError(id, msg) {
  document.getElementById(id).textContent = msg;
}

function clearError(id) {
  document.getElementById(id).textContent = "";
}

function setInvalid(id, invalid) {
  document.getElementById(id).classList.toggle("is-invalid", invalid);
}

function showStep(n) {
  [1, 2, 3].forEach((i) => {
    const el = document.getElementById("step" + i);
    el.classList.toggle("fp-step-hidden", i !== n);
  });
}

// ============================================
//  STEP 1 — Find user by email
// ============================================
document.getElementById("step1Form").addEventListener("submit", function (e) {
  e.preventDefault();

  clearError("emailError");
  clearError("step1GeneralError");
  setInvalid("emailInput", false);

  const email = document.getElementById("emailInput").value.trim();

  if (!email) {
    showError("emailError", "Email address is required.");
    setInvalid("emailInput", true);
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError("emailError", "Please enter a valid email address.");
    setInvalid("emailInput", true);
    return;
  }

  const users = getUsers();
  const idx   = users.findIndex(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (idx === -1) {
    showError("step1GeneralError", "No account found with that email address.");
    return;
  }

  foundUser  = users[idx];
  userIndex  = idx;
  activeQ    = 1;
  q1Failed   = false;

  loadQuestion(1);
  showStep(2);
});

// ============================================
//  STEP 2 — Security question
// ============================================

function loadQuestion(qNum) {
  const question = qNum === 1
    ? foundUser.securityQuestion1
    : foundUser.securityQuestion2;

  document.getElementById("securityQuestion").textContent = question;
  document.getElementById("step2Subtitle").textContent =
    qNum === 1 ? "Answer your security question" : "Try your second security question";

  // Reset input + errors
  document.getElementById("securityAnswer").value = "";
  clearError("answerError");
  clearError("step2GeneralError");
  setInvalid("securityAnswer", false);

  // Hide the "try other" button when loading fresh
  document.getElementById("tryOtherWrap").classList.add("fp-step-hidden");
}

document.getElementById("step2Form").addEventListener("submit", function (e) {
  e.preventDefault();

  clearError("answerError");
  clearError("step2GeneralError");
  setInvalid("securityAnswer", false);

  const answer = document.getElementById("securityAnswer").value.trim();

  if (!answer) {
    showError("answerError", "Please provide an answer.");
    setInvalid("securityAnswer", true);
    return;
  }

  const correctAnswer = activeQ === 1
    ? foundUser.securityAnswer1
    : foundUser.securityAnswer2;

  const isCorrect =
    answer.toLowerCase() === correctAnswer.toLowerCase();

  if (isCorrect) {
    // ✅ Correct — move to step 3
    showStep(3);
    return;
  }

  // ❌ Wrong answer
  setInvalid("securityAnswer", true);

  if (activeQ === 1 && !q1Failed) {
    // First failure on question 1 — offer to try question 2
    q1Failed = true;
    showError("answerError", "That answer is incorrect.");
    document.getElementById("tryOtherWrap").classList.remove("fp-step-hidden");
  } else {
    // Already on question 2 (or second attempt) — final failure
    showError("step2GeneralError",
      "Both answers were incorrect. Please contact support or try registering again."
    );
    document.getElementById("tryOtherWrap").classList.add("fp-step-hidden");
    // Disable the form
    document.getElementById("securityAnswer").disabled = true;
    document.querySelector("#step2Form .btn-vintage").disabled = true;
  }
});

document.getElementById("tryOtherBtn").addEventListener("click", function () {
  activeQ = 2;
  loadQuestion(2);
});

// ============================================
//  STEP 3 — New password
// ============================================

// Toggle password visibility
function addToggle(btnId, inputId) {
  document.getElementById(btnId).addEventListener("click", function () {
    const input   = document.getElementById(inputId);
    const showing = input.type === "text";
    input.type    = showing ? "password" : "text";
    this.setAttribute("aria-label", showing ? "Show password" : "Hide password");
  });
}

addToggle("toggleNewPw",        "newPassword");
addToggle("toggleConfirmNewPw", "confirmNewPassword");

document.getElementById("step3Form").addEventListener("submit", function (e) {
  e.preventDefault();

  clearError("newPasswordError");
  clearError("confirmNewPasswordError");
  clearError("step3GeneralError");
  setInvalid("newPassword",        false);
  setInvalid("confirmNewPassword", false);

  const newPw  = document.getElementById("newPassword").value;
  const confPw = document.getElementById("confirmNewPassword").value;

  let valid = true;

  // --- Same rules as register.js ---
  if (!newPw) {
    showError("newPasswordError", "Password is required.");
    setInvalid("newPassword", true);
    valid = false;
  } else if (newPw.length < 8) {
    showError("newPasswordError", "Password must be at least 8 characters.");
    setInvalid("newPassword", true);
    valid = false;
  } else if (!/[A-Z]/.test(newPw)) {
    showError("newPasswordError", "Password must contain at least one uppercase letter.");
    setInvalid("newPassword", true);
    valid = false;
  } else if (!/[a-z]/.test(newPw)) {
    showError("newPasswordError", "Password must contain at least one lowercase letter.");
    setInvalid("newPassword", true);
    valid = false;
  } else if (!/[0-9]/.test(newPw)) {
    showError("newPasswordError", "Password must contain at least one number.");
    setInvalid("newPassword", true);
    valid = false;
  }

  if (!confPw) {
    showError("confirmNewPasswordError", "Please confirm your password.");
    setInvalid("confirmNewPassword", true);
    valid = false;
  } else if (newPw !== confPw) {
    showError("confirmNewPasswordError", "Passwords do not match.");
    setInvalid("confirmNewPassword", true);
    valid = false;
  }

  if (!valid) return;

  // --- Save updated password ---
  foundUser.password = newPw;
  saveUser(foundUser);

  // Redirect to login with a small success indicator in the URL
  window.location.href = "login.html?reset=success";
});