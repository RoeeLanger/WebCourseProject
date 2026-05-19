// ============================================
// BACKGROUND PICKER STATE
// ============================================
let selectedBg = null;

document.querySelectorAll(".bg-option").forEach(option => {
  option.addEventListener("click", function () {
    document.querySelectorAll(".bg-option").forEach(o => o.classList.remove("selected"));
    this.classList.add("selected");
    this.querySelector("input").checked = true;
    selectedBg = this.dataset.val;
    document.getElementById("bg-error").textContent = "";

    const vid      = document.getElementById("preview-video");
    const fallback = document.getElementById("preview-bg-fallback");
    vid.src           = selectedBg;
    vid.style.display = "block";
    vid.load();
    vid.play().catch(() => {});
    fallback.style.display = "none";
  });
});

// ============================================
// MEMBER LIMIT SLIDER
// ============================================
const slider  = document.getElementById("member-limit");
const display = document.getElementById("limit-display");

function updateSlider() {
  const val = parseInt(slider.value);
  const min = parseInt(slider.min);
  const max = parseInt(slider.max);
  const pct = ((val - min) / (max - min) * 100).toFixed(1);
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
// EDIT MODE DETECTION
// ============================================
const editTitle  = new URLSearchParams(window.location.search).get("edit");
const isEditMode = !!editTitle;
let editClub     = null;

if (isEditMode) {
  editClub = getClubs().find(c => c.clubTitle === editTitle) || null;

  document.getElementById("page-eyebrow").textContent  = "Manage your club";
  document.getElementById("page-title").textContent    = "Edit Club";
  document.getElementById("page-subtitle").textContent =
    "Update your club's details below. The club name cannot be changed.";
  document.getElementById("submit-btn").textContent    = "Save Changes ✦";

  const cancelBtn = document.getElementById("cancel-btn");
  cancelBtn.href  = "club.html?clubTitle=" + encodeURIComponent(editTitle);

  if (editClub) {
    // Lock name field
    const nameInput    = document.getElementById("club-name");
    nameInput.value    = editClub.clubTitle;
    nameInput.disabled = true;
    document.getElementById("club-name-hint").textContent =
      "The club name cannot be changed after creation.";

    // Pre-fill description
    const descInput = document.getElementById("club-desc");
    descInput.value = editClub.description || "";

    // Update live preview
    document.getElementById("preview-name").textContent = editClub.clubTitle;
    if (editClub.description) {
      document.getElementById("preview-desc").textContent = editClub.description;
    }

    // Pre-select background
    if (editClub.background) {
      const match = document.querySelector(`.bg-option[data-val="${CSS.escape(editClub.background)}"]`);
      if (match) {
        match.classList.add("selected");
        match.querySelector("input").checked = true;
        selectedBg = editClub.background;

        const vid      = document.getElementById("preview-video");
        const fallback = document.getElementById("preview-bg-fallback");
        vid.src           = editClub.background;
        vid.style.display = "block";
        vid.load();
        vid.play().catch(() => {});
        fallback.style.display = "none";
      }
    }

    // Enforce minimum = current member count
    const currentMemberCount = (editClub.members || []).length;
    if (currentMemberCount > 2) {
      slider.min = currentMemberCount;
    }

    // Pre-set member limit (clamped to new min)
    const presetLimit = Math.max(editClub.maxMembers || 10, currentMemberCount);
    slider.value = presetLimit;
    updateSlider();
  }
}

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

  const sessionUserData = getCurrentUser();

  // Guard: only one managed club allowed (skip in edit mode)
  if (!isEditMode && sessionUserData && sessionUserData.managedClub) {
    const ge = document.getElementById("general-error");
    ge.textContent = `You already manage "${sessionUserData.managedClub}". Each member can only manage one club.`;
    ge.style.display = "block";
    return;
  }

  const clubName    = isEditMode ? editTitle : document.getElementById("club-name").value.trim();
  const clubDesc    = document.getElementById("club-desc").value.trim();
  const memberLimit = parseInt(slider.value);

  let valid = true;

  if (!isEditMode) {
    if (!clubName) {
      showError("club-name-error", "Please give your club a name.");
      setInvalid("club-name", true);
      valid = false;
    } else if (clubName.length > 40) {
      showError("club-name-error", "Club name must be 40 characters or fewer.");
      setInvalid("club-name", true);
      valid = false;
    } else if (getClubs().some(c => c.clubTitle.toLowerCase() === clubName.toLowerCase())) {
      showError("club-name-error", "A club with this name already exists. Please choose a different name.");
      setInvalid("club-name", true);
      valid = false;
    }
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

  if (isEditMode) {
    const clubs = getClubs();
    const idx   = clubs.findIndex(c => c.clubTitle === editTitle);
    if (idx !== -1) {
      clubs[idx].description = clubDesc;
      clubs[idx].maxMembers  = memberLimit;
      clubs[idx].background  = selectedBg;
      saveClubs(clubs);
    }
    window.location.href = "club.html?clubTitle=" + encodeURIComponent(editTitle);
  } else {
    const managerUsername = sessionUserData.username;
    const club = createClub({
      clubTitle: clubName,
      managerUsername,
      description: clubDesc,
      maxMembers: memberLimit,
      background: selectedBg,
    });
    saveClub(club);

    if (!sessionUserData.clubs.includes(clubName)) {
      sessionUserData.clubs.push(clubName);
    }
    sessionUserData.managedClub = clubName;
    saveUser(sessionUserData);

    window.location.href = "club.html?clubTitle=" + encodeURIComponent(clubName);
  }
});

// ============================================
// LOGOUT
// ============================================
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("bookies_session");
  window.location.href = "login.html";
});
