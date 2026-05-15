// --- Club schema ---

function createClub({ clubTitle, managerUsername, description = "", maxMembers = 20 }) {
  return {
    clubTitle,
    managerUsername,
    description,
    members: [managerUsername],
    announcements: [],
    maxMembers,
    polls: [],
    meetings: [],
  };
}

// --- localStorage helpers ---

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
