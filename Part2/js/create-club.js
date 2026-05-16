// ============================================
// CHAR COUNTERS
// ============================================
function initCharCounter(inputId, countId, max) {
  const el = document.getElementById(inputId);
  const ct = document.getElementById(countId);
  function update() {
    const n = el.value.length;
    ct.textContent = n + " / " + max;
    ct.classList.toggle("near", n >= max * 0.8 && n < max);
    ct.classList.toggle("at",   n >= max);
  }
  el.addEventListener("input", update);
  update();
}

initCharCounter("club-name", "club-name-count", 40);
initCharCounter("club-desc",  "club-desc-count",  200);

// ============================================
// LIVE PREVIEW
// ============================================
document.getElementById("club-name").addEventListener("input", function () {
  const el = document.getElementById("preview-name");
  el.innerHTML = this.value.trim()
    ? this.value
    : '<span class="preview-placeholder">Club Name</span>';
});

document.getElementById("club-desc").addEventListener("input", function () {
  const el = document.getElementById("preview-desc");
  el.innerHTML = this.value.trim()
    ? this.value
    : '<span class="preview-placeholder">Your description will appear here…</span>';
});

// ============================================
// BACKGROUND PICKER
// ============================================
let selectedBg = null;

document.querySelectorAll(".bg-option").forEach(option => {
  option.addEventListener("click", function () {
    document.querySelectorAll(".bg-option").forEach(o => o.classList.remove("selected"));
    this.classList.add("selected");
    this.querySelector("input").checked = true;
    selectedBg = this.dataset.val;
    document.getElementById("bg-error").textContent = "";

    // Update preview video
    const vid = document.getElementById("preview-video");
    const fallback = document.getElementById("preview-bg-fallback");
    vid.src = selectedBg;
    vid.style.display = "block";
    vid.load();
    vid.play().catch(() => {});
    fallback.style.display = "none";
  });
});

// ============================================
// MEMBER LIMIT SLIDER
// ============================================
const slider = document.getElementById("member-limit");
const display = document.getElementById("limit-display");

function updateSlider() {
  const val = parseInt(slider.value);
  const pct = ((val - 2) / 48 * 100).toFixed(1);
  slider.style.setProperty("--pct", pct + "%");
  display.childNodes[0].textContent = val;
}

function setLimit(val) {
  slider.value = val;
  updateSlider();
}

slider.addEventListener("input", updateSlider);
updateSlider();

// ============================================
// VALIDATION & SUBMIT
// ============================================
function showError(id, msg) { document.getElementById(id).textContent = msg; }
function clearError(id)     { document.getElementById(id).textContent = ""; }
function setInvalid(id, v)  { document.getElementById(id).classList.toggle("is-invalid", v); }

document.getElementById("create-club-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const fields = ["club-name", "club-desc"];
  fields.forEach(id => { clearError(id + "-error"); setInvalid(id, false); });
  clearError("bg-error");
  document.getElementById("general-error").style.display = "none";

  // Guard: only one managed club allowed
  const sessionUserData = getCurrentUser();
  if (sessionUserData && sessionUserData.managedClub) {
    const ge = document.getElementById("general-error");
    ge.textContent = `You already manage "${sessionUserData.managedClub}". Each member can only manage one club.`;
    ge.style.display = "block";
    return;
  }

  const clubName    = document.getElementById("club-name").value.trim();
  const clubDesc    = document.getElementById("club-desc").value.trim();
  const memberLimit = parseInt(slider.value);

  let valid = true;

  if (!clubName) {
    showError("club-name-error", "Please give your club a name.");
    setInvalid("club-name", true);
    valid = false;
  } else if (clubName.length > 40) {
    showError("club-name-error", "Club name must be 40 characters or fewer.");
    setInvalid("club-name", true);
    valid = false;
  }

  if (!clubDesc) {
    showError("club-desc-error", "Please add a short description.");
    setInvalid("club-desc", true);
    valid = false;
  }

  if (!selectedBg) {
    showError("bg-error", "Please choose a background for your club.");
    valid = false;
  }

  if (!valid) {
    document.getElementById("general-error").style.display = "block";
    return;
  }

  const managerUsername = sessionUserData.username;
  const club = createClub({
    clubTitle: clubName,
    managerUsername,
    description: clubDesc,
    maxMembers: memberLimit,
    background: selectedBg,
  });
  saveClub(club);

  // Add club to manager's clubs list and set managedClub
  if (!sessionUserData.clubs.includes(clubName)) {
    sessionUserData.clubs.push(clubName);
  }
  sessionUserData.managedClub = clubName;
  saveUser(sessionUserData);

  window.location.href = "club.html?clubTitle=" + encodeURIComponent(clubName);
});

// ============================================
// LOGOUT
// ============================================
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("bookies_session");
  window.location.href = "login.html";
});
