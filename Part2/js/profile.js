const currentUser = getCurrentUser();

// ===== CLUB SEARCH =====

const clubs = getClubs();
const clubSearchInput = document.getElementById("clubSearch");
const searchDropdown = document.getElementById("searchDropdown");

clubSearchInput.addEventListener("input", () => {
  const term = clubSearchInput.value.trim().toLowerCase();
  searchDropdown.innerHTML = "";

  if (!term) {
    searchDropdown.hidden = true;
    return;
  }

  const matches = clubs.filter((c) =>
    (c.clubTitle || "").toLowerCase().includes(term)
  );

  if (matches.length === 0) {
    searchDropdown.innerHTML =
      `<li class="search-no-results">No clubs found</li>`;
  } else {
    matches.forEach((club) => {
      const li = document.createElement("li");
      li.className = "search-result-item";
      li.textContent = club.clubTitle;
      li.addEventListener("click", () => {
        window.location.href =
          `club.html?clubTitle=${encodeURIComponent(club.clubTitle)}`;
      });
      searchDropdown.appendChild(li);
    });
  }

  searchDropdown.hidden = false;
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".header-search")) {
    searchDropdown.hidden = true;
  }
});

document.getElementById("logout-btn").addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("bookies_session");
  window.location.href = "login.html";
});

// ===== ELEMENTS =====

const profileName =
  document.getElementById("profileName");

const profileSubtitle =
  document.getElementById("profileSubtitle");

const clubsCount =
  document.getElementById("clubsCount");

const managedCount =
  document.getElementById("managedCount");

const meetingsCount =
  document.getElementById("meetingsCount");

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

  clubsCount.textContent   = allClubNames.length;
  managedCount.textContent = currentUser.managedClub ? 1 : 0;
  meetingsCount.textContent = "0";

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

  meetingsList.innerHTML = `
    <div class="empty-state">
      No upcoming meetings yet.
    </div>
  `;

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
