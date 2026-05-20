const currentUser = getCurrentUser();
const clubs = getClubs();

// ===== ELEMENTS =====

const profileName =
  document.getElementById("profileName");

const profileSubtitle =
  document.getElementById("profileSubtitle");

const clubsCount =
  document.getElementById("clubsCount");

const meetingsCount =
  document.getElementById("meetingsCount");

const createClubBtn =
  document.getElementById("createClubBtn");

const clubsGrid =
  document.getElementById("clubsGrid");

const meetingsList =
  document.getElementById("meetingsList");

// ===== USER EXISTS =====

if (currentUser) {

  // HERO

  profileName.textContent =
    `Welcome back, ${currentUser.nickname}`;

  const joinYear =
    new Date(currentUser.joinDate).getFullYear();

  profileSubtitle.textContent =
    `${currentUser.nickname} joined Bookies in ${joinYear}.`;

  // STATS

  const allClubNames = [...new Set([
    ...currentUser.clubs,
    ...(currentUser.managedClub ? [currentUser.managedClub] : []),
  ])];

  clubsCount.textContent = allClubNames.length;

  if (!currentUser.managedClub) {
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
      const clubData = clubs.find(c => c.clubTitle === clubName);
      const desc     = clubData ? clubData.description : "";
      const isManager = clubName === currentUser.managedClub;
      const badge    = isManager ? "Manager" : "Member";

      clubsGrid.innerHTML += `
        <article class="club-card" style="cursor:pointer;" onclick="window.location.href='club.html?clubTitle=${encodeURIComponent(clubName)}'">
          <span class="member-badge">${badge}</span>
          <h3 class="club-name">${clubName}</h3>
          <p class="club-description">${desc || "No description yet."}</p>
        </article>
      `;
    });
  }

  // MEETINGS

  function escapeHtml(str) {
    return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  const now = new Date();
  const upcomingMeetings = [];

  allClubNames.forEach(clubName => {
    const clubData = clubs.find(c => c.clubTitle === clubName);
    if (!clubData || !clubData.meetings) return;
    clubData.meetings.forEach(m => {
      if (new Date(m.datetime) > now) {
        upcomingMeetings.push(Object.assign({}, m, { clubName }));
      }
    });
  });

  upcomingMeetings.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

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

}

// ===== NO USERS =====

else {

  profileSubtitle.textContent =
    "No registered users found.";

  clubsGrid.innerHTML = `
    <div class="empty-state">
      No clubs yet.
    </div>
  `;

  meetingsList.innerHTML = `
    <div class="empty-state">
      No meetings yet.
    </div>
  `;
}
