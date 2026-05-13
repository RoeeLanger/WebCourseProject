const SECURITY_QUESTIONS = [
  // Book-Related
  "What is the title of the first book you remember reading as a child?",
  "What is the name of your favorite fictional character?",
  "Which book did you most enjoy reading during high school?",
  "What was the last name of your favorite author when you were a teenager?",
  "What is the title of the first \"grown-up\" book you ever finished?",
  "In which fictional world or city would you most like to live?",
  "What is the title of the book you have re-read the most times?",
  "What was the first name of your favorite elementary school librarian?",
  // General
  "What was the last name of your favorite teacher in middle school?",
  "What is the middle name of your oldest sibling?",
  "What was the name of the first street you lived on?",
  "In what city did your parents meet?",
];

const q1Select = document.getElementById("securityQ1");
const q2Select = document.getElementById("securityQ2");

function buildOptions(selectEl, excludeIndex = null) {
  const current = selectEl.value;
  // Keep the placeholder option
  while (selectEl.options.length > 1) selectEl.remove(1);
  SECURITY_QUESTIONS.forEach((q, i) => {
    if (i === excludeIndex) return;
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = q;
    selectEl.appendChild(opt);
  });
  // Restore selection if still valid
  if (current && current !== String(excludeIndex)) selectEl.value = current;
}

buildOptions(q1Select);
buildOptions(q2Select);

q1Select.addEventListener("change", () => {
  if (q1Select.value === q2Select.value) q2Select.value = "";
  buildOptions(q2Select, Number(q1Select.value));
  clearError("securityQ1Error");
  q1Select.classList.remove("is-invalid");
});

q2Select.addEventListener("change", () => {
  if (q2Select.value === q1Select.value) q2Select.value = "";
  clearError("securityQ2Error");
  q2Select.classList.remove("is-invalid");
});

// --- Toggle password visibility ---
function addToggle(btnId, inputId) {
  document.getElementById(btnId).addEventListener("click", function () {
    const input = document.getElementById(inputId);
    const showing = input.type === "text";
    input.type = showing ? "password" : "text";
    this.setAttribute("aria-label", showing ? "Show password" : "Hide password");
  });
}

addToggle("togglePw", "password");
addToggle("toggleConfirmPw", "confirmPassword");

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
document.getElementById("registerForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const fields = ["username", "nickname", "email", "password", "confirmPassword", "securityQ1", "securityA1", "securityQ2", "securityA2"];
  fields.forEach((id) => {
    clearError(id + "Error");
    setInvalid(id, false);
  });
  document.getElementById("generalError").textContent = "";

  const username = document.getElementById("username").value.trim();
  const nickname = document.getElementById("nickname").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const q1 = q1Select.value;
  const securityA1 = document.getElementById("securityA1").value.trim();
  const q2 = q2Select.value;
  const securityA2 = document.getElementById("securityA2").value.trim();

  let valid = true;

  if (!username) {
    showError("usernameError", "Username is required.");
    setInvalid("username", true);
    valid = false;
  } else if (username.length < 3) {
    showError("usernameError", "Username must be at least 3 characters.");
    setInvalid("username", true);
    valid = false;
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    showError("usernameError", "Only letters, numbers and underscores allowed.");
    setInvalid("username", true);
    valid = false;
  }

  if (!nickname) {
    showError("nicknameError", "Nickname is required.");
    setInvalid("nickname", true);
    valid = false;
  } else if (nickname.length < 2) {
    showError("nicknameError", "Nickname must be at least 2 characters.");
    setInvalid("nickname", true);
    valid = false;
  }

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
  } else if (password.length < 8) {
    showError("passwordError", "Password must be at least 8 characters.");
    setInvalid("password", true);
    valid = false;
  } else if (!/[A-Z]/.test(password)) {
    showError("passwordError", "Password must contain at least one uppercase letter.");
    setInvalid("password", true);
    valid = false;
  } else if (!/[a-z]/.test(password)) {
    showError("passwordError", "Password must contain at least one lowercase letter.");
    setInvalid("password", true);
    valid = false;
  } else if (!/[0-9]/.test(password)) {
    showError("passwordError", "Password must contain at least one number.");
    setInvalid("password", true);
    valid = false;
  }

  if (!confirmPassword) {
    showError("confirmPasswordError", "Please confirm your password.");
    setInvalid("confirmPassword", true);
    valid = false;
  } else if (password !== confirmPassword) {
    showError("confirmPasswordError", "Passwords do not match.");
    setInvalid("confirmPassword", true);
    valid = false;
  }

  if (!q1) {
    showError("securityQ1Error", "Please choose a security question.");
    setInvalid("securityQ1", true);
    valid = false;
  }

  if (!securityA1) {
    showError("securityA1Error", "Please provide an answer.");
    setInvalid("securityA1", true);
    valid = false;
  }

  if (!q2) {
    showError("securityQ2Error", "Please choose a security question.");
    setInvalid("securityQ2", true);
    valid = false;
  }

  if (!securityA2) {
    showError("securityA2Error", "Please provide an answer.");
    setInvalid("securityA2", true);
    valid = false;
  }

  if (!valid) return;

  // Check uniqueness against stored users
  const users = JSON.parse(localStorage.getItem("bookies_users") || "[]");

  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    showError("usernameError", "This username is already taken.");
    setInvalid("username", true);
    return;
  }

  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    showError("emailError", "An account with this email already exists.");
    setInvalid("email", true);
    return;
  }

  // Build user object — additional fields reserved for future use
  const User = {
    username,
    nickname,
    email,
    password,
    securityQuestion1: SECURITY_QUESTIONS[Number(q1)],
    securityQuestion2: SECURITY_QUESTIONS[Number(q2)],
    securityAnswer1: securityA1,
    securityAnswer2: securityA2,
    clubs: [],
    managedClub: null,
    joinDate: new Date().toISOString(),
  };

  users.push(User);
  localStorage.setItem("bookies_users", JSON.stringify(users));

  window.location.href = "login.html";
});
