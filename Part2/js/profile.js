const users = JSON.parse(localStorage.getItem("bookies_users")) || [];
const sessionUsername = localStorage.getItem("bookies_session");
const currentUser = users.find((u) => u.username === sessionUsername) || null;

// ===== CLUB SEARCH =====

const clubs = JSON.parse(localStorage.getItem("bookies_clubs")) || [];
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
    c["club-title"].toLowerCase().includes(term)
  );

  if (matches.length === 0) {
    searchDropdown.innerHTML =
      `<li class="search-no-results">No clubs found</li>`;
  } else {
    matches.forEach((club) => {
      const li = document.createElement("li");
      li.className = "search-result-item";
      li.textContent = club["club-title"];
      li.addEventListener("click", () => {
        window.location.href =
          `club.html?id=${encodeURIComponent(club["club-title"])}`;
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

  clubsCount.textContent =
    currentUser.clubs.length;

  managedCount.textContent = "0";

  meetingsCount.textContent = "0";

  // CLUBS

  if (currentUser.clubs.length === 0) {

    clubsGrid.innerHTML = `
      <div class="empty-state">
        You haven't joined any clubs yet.
      </div>
    `;

  } else {

    currentUser.clubs.forEach((clubName) => {

      clubsGrid.innerHTML += `

        <article class="club-card">

          <span class="member-badge">
            Member
          </span>

          <h3 class="club-name">
            ${clubName}
          </h3>

          <p class="club-book">
            Currently reading
            <span>Unknown Book</span>
          </p>

          <p class="club-description">
            Club information will appear here later.
          </p>

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
