// ===== ELEMENTS =====
const profileName     = document.getElementById("profileName");
const profileSubtitle = document.getElementById("profileSubtitle");
const clubsCount      = document.getElementById("clubsCount");
const meetingsCount   = document.getElementById("meetingsCount");
const createClubBtn   = document.getElementById("createClubBtn");
const clubsGrid       = document.getElementById("clubsGrid");
const meetingsList    = document.getElementById("meetingsList");

function escapeHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

(async function initProfile() {
  const username = Api.currentUsername();
  if (!username) { window.location.href = "login.html"; return; }

  let user, allClubs, meetings;
  try {
    user     = await Api.getUser(username);
    allClubs = await Api.getClubs();                 // [{ id, title, description }]
    meetings = await Api.getUserMeetings(username);  // [{ id, title, location, datetime, clubName }]
  } catch (err) {
    // Stale session pointer (user no longer exists) -> back to login.
    Api.clearSession();
    window.location.href = "login.html";
    return;
  }

  // HERO
  profileName.textContent = `Welcome back, ${user.nickname}`;
  const joinYear = new Date(user.joinDate).getFullYear();
  profileSubtitle.textContent = `${user.nickname} joined Bookies in ${joinYear}.`;

  // STATS
  const allClubNames = [...new Set([
    ...(user.clubs || []),
    ...(user.managedClub ? [user.managedClub] : []),
  ])];
  clubsCount.textContent = allClubNames.length;

  if (!user.managedClub) {
    createClubBtn.style.display = "";
  }

  // CLUBS
  if (allClubNames.length === 0) {
    clubsGrid.innerHTML = `
      <div class="empty-state">
        You haven't joined any clubs yet.
      </div>
    `;
  } else {
    allClubNames.forEach((clubName) => {
      const clubData  = allClubs.find(c => c.title === clubName);
      const desc      = clubData ? clubData.description : "";
      const isManager = clubName === user.managedClub;
      const badge     = isManager ? "Manager" : "Member";

      clubsGrid.innerHTML += `
        <article class="club-card" style="cursor:pointer;" onclick="window.location.href='club.html?clubTitle=${encodeURIComponent(clubName)}'">
          <span class="member-badge">${badge}</span>
          <h3 class="club-name">${escapeHtml(clubName)}</h3>
          <p class="club-description">${escapeHtml(desc) || "No description yet."}</p>
        </article>
      `;
    });
  }

  // MEETINGS (upcoming across all the user's clubs)
  const now = new Date();
  const upcomingMeetings = meetings
    .filter(m => new Date(m.datetime) > now)
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

  const displayedMeetings = upcomingMeetings.slice(0, 3);
  meetingsCount.textContent = upcomingMeetings.length;

  if (displayedMeetings.length === 0) {
    meetingsList.innerHTML = `<div class="empty-state">No upcoming meetings yet.</div>`;
  } else {
    meetingsList.innerHTML = displayedMeetings.map(m => {
      const dt    = new Date(m.datetime);
      const day   = dt.getDate();
      const month = dt.toLocaleString("en-US", { month: "short" }).toUpperCase();
      const time  = dt.toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
      return `
        <div class="meeting-card">
          <div class="meeting-date">
            <span class="meeting-day">${day}</span>
            <span class="meeting-month">${month}</span>
          </div>
          <div class="meeting-info-wrap">
            <h3 class="meeting-title">${escapeHtml(m.title || "Meeting")}</h3>
            <p class="meeting-info">${escapeHtml(time)} · ${escapeHtml(m.clubName)}</p>
          </div>
        </div>`;
    }).join("");
  }
})();
