// ============================================
//  Bookies — Forgot Password Logic (iterative)
// ============================================

let foundUser = null;
let activeQ   = 1;
const TOTAL_Q = 2;

const $ = (id) => document.getElementById(id);

function showErr(id, msg) { $(id).textContent = msg; }
function clearErr(id)     { $(id).textContent = ""; }
function setInvalid(id, v){ $(id).classList.toggle("is-invalid", v); }

// ---- Step switching ----
function showStep(n) {
  [1, 2, 3].forEach((i) => {
    $("step" + i).classList.toggle("fp-hidden", i !== n);
  });
  // Progress dots
  [1, 2, 3].forEach((i) => {
    const dot = $("dot" + i);
    dot.classList.remove("fp-dot--active", "fp-dot--done");
    if (i < n)  dot.classList.add("fp-dot--done");
    if (i === n) dot.classList.add("fp-dot--active");
  });
}

// ============================================
//  STEP 1 — email lookup
// ============================================
$("step1Form").addEventListener("submit", async function (e) {
  e.preventDefault();
  clearErr("emailError");
  clearErr("step1GeneralError");
  setInvalid("emailInput", false);

  const email = $("emailInput").value.trim();

  if (!email) {
    showErr("emailError", "Email address is required.");
    setInvalid("emailInput", true);
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showErr("emailError", "Please enter a valid email address.");
    setInvalid("emailInput", true);
    return;
  }

  try {
    const data = await Api.forgotLookup(email);
    // The server returns only the two questions, never the answers.
    foundUser = { email: email, question1: data.question1, question2: data.question2 };
    activeQ   = 1;
    loadQuestion(1);
    showStep(2);
  } catch (err) {
    showErr("step1GeneralError", (err && err.message) || "No account found with that email address.");
  }
});

// ============================================
//  STEP 2 — security question
// ============================================
function loadQuestion(qNum) {
  activeQ = qNum;
  const question = qNum === 1 ? foundUser.question1 : foundUser.question2;
  $("securityQuestion").textContent = question;
  $("prevQBtn").disabled = (qNum === 1);
  $("nextQBtn").disabled = (qNum === TOTAL_Q);
  $("qIndicator").textContent = `${qNum} of ${TOTAL_Q}`;
  $("securityAnswer").value = "";
  clearErr("answerError");
  clearErr("step2GeneralError");
  setInvalid("securityAnswer", false);
}

$("prevQBtn").addEventListener("click", () => { if (activeQ > 1)       loadQuestion(activeQ - 1); });
$("nextQBtn").addEventListener("click", () => { if (activeQ < TOTAL_Q) loadQuestion(activeQ + 1); });

$("backToStep1").addEventListener("click", () => {
  clearErr("answerError");
  clearErr("step2GeneralError");
  showStep(1);
});

$("step2Form").addEventListener("submit", async function (e) {
  e.preventDefault();
  clearErr("answerError");
  clearErr("step2GeneralError");
  setInvalid("securityAnswer", false);

  const answer = $("securityAnswer").value.trim();
  if (!answer) {
    showErr("answerError", "Please provide an answer.");
    setInvalid("securityAnswer", true);
    return;
  }

  try {
    // The server checks the answer for the currently active question.
    await Api.forgotVerify(foundUser.email, activeQ, answer);
    showStep(3);
  } catch (err) {
    setInvalid("securityAnswer", true);
    showErr("answerError", (err && err.message) || "That answer is incorrect. Try again or switch questions.");
  }
});

// ============================================
//  STEP 3 — new password
// ============================================
$("backToStep2").addEventListener("click", () => {
  clearErr("newPasswordError");
  clearErr("confirmNewPasswordError");
  clearErr("step3GeneralError");
  showStep(2);
});

function addToggle(btnId, inputId) {
  $(btnId).addEventListener("click", function () {
    const input = $(inputId);
    const showing = input.type === "text";
    input.type = showing ? "password" : "text";
    this.setAttribute("aria-label", showing ? "Show password" : "Hide password");
  });
}
addToggle("toggleNewPw", "newPassword");
addToggle("toggleConfirmNewPw", "confirmNewPassword");

$("step3Form").addEventListener("submit", async function (e) {
  e.preventDefault();
  clearErr("newPasswordError");
  clearErr("confirmNewPasswordError");
  clearErr("step3GeneralError");
  setInvalid("newPassword", false);
  setInvalid("confirmNewPassword", false);

  const newPw  = $("newPassword").value;
  const confPw = $("confirmNewPassword").value;
  let valid = true;

  if (!newPw) {
    showErr("newPasswordError", "Password is required.");
    setInvalid("newPassword", true); valid = false;
  } else if (newPw.length < 8) {
    showErr("newPasswordError", "Password must be at least 8 characters.");
    setInvalid("newPassword", true); valid = false;
  } else if (!/[A-Z]/.test(newPw)) {
    showErr("newPasswordError", "Must contain at least one uppercase letter.");
    setInvalid("newPassword", true); valid = false;
  } else if (!/[a-z]/.test(newPw)) {
    showErr("newPasswordError", "Must contain at least one lowercase letter.");
    setInvalid("newPassword", true); valid = false;
  } else if (!/[0-9]/.test(newPw)) {
    showErr("newPasswordError", "Must contain at least one number.");
    setInvalid("newPassword", true); valid = false;
  }

  if (!confPw) {
    showErr("confirmNewPasswordError", "Please confirm your password.");
    setInvalid("confirmNewPassword", true); valid = false;
  } else if (newPw !== confPw) {
    showErr("confirmNewPasswordError", "Passwords do not match.");
    setInvalid("confirmNewPassword", true); valid = false;
  }

  if (!valid) return;

  try {
    await Api.forgotReset(foundUser.email, newPw);
    window.location.href = "login.html?reset=success";
  } catch (err) {
    showErr("step3GeneralError", (err && err.message) || "Could not reset your password. Please try again.");
  }
});