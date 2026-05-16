// --- Club schema ---

function createClub({ clubTitle, managerUsername, description = "", maxMembers = 20, background = "" }) {
  return {
    clubTitle,
    managerUsername,
    description,
    background,
    members: [managerUsername],
    announcements: [],
    maxMembers,
    polls: [],
    meetings: [],
    createdAt: new Date().toISOString(),
  };
}

// --- User helpers ---

/**
 * Returns the full user object for the currently logged-in session,
 * or null if there is no active session or the user is not found.
 */
function getCurrentUser() {
  const username = localStorage.getItem("bookies_session");
  if (!username) return null;
  return getUsers().find(u => u.username === username) || null;
}

/**
 * Persists changes to an existing user entry back into bookies_users.
 * Matches by username — does nothing if the user is not found.
 * @param {Object} updatedUser - The full user object with updated fields.
 */
function saveUser(updatedUser) {
  const users = getUsers();
  const idx = users.findIndex(u => u.username === updatedUser.username);
  if (idx !== -1) {
    users[idx] = updatedUser;
    saveUsers(users);
  }
}

// --- Users localStorage helpers ---

/**
 * Returns the full bookies_users array from localStorage.
 */
function getUsers() {
  return JSON.parse(localStorage.getItem("bookies_users") || "[]");
}

/**
 * Overwrites the bookies_users array in localStorage.
 * Use saveUser() for single-entry updates; this is for bulk writes (e.g. registration).
 * @param {Array} users - The full users array to persist.
 */
function saveUsers(users) {
  localStorage.setItem("bookies_users", JSON.stringify(users));
}

// --- Club localStorage helpers ---

function getClubs() {
  return JSON.parse(localStorage.getItem("bookies_clubs") || "[]");
}

function saveClubs(clubs) {
  localStorage.setItem("bookies_clubs", JSON.stringify(clubs));
}

function getClubByTitle(clubTitle) {
  return getClubs().find((c) => c.clubTitle === clubTitle) || null;
}

function saveClub(updatedClub) {
  const clubs = getClubs();
  const idx = clubs.findIndex((c) => c.clubTitle === updatedClub.clubTitle);
  if (idx === -1) {
    clubs.push(updatedClub);
  } else {
    clubs[idx] = updatedClub;
  }
  saveClubs(clubs);
}
