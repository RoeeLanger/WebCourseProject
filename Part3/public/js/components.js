// ============================================
// Bookies — Shared Components
// Requires club.js to be loaded first.
// ============================================

function initAppHeader(navLinks, logoHref) {
  logoHref = logoHref || 'profile.html';

  var navLinksHtml = (navLinks || []).map(function (link) {
    return '<a href="' + link.href + '" class="nav-link-vintage">' + link.label + '</a>';
  }).join('');

  var header = document.createElement('header');
  header.className = 'landing-header login-header';
  header.innerHTML =
    '<a href="' + logoHref + '" class="site-logo">Bookies</a>' +
    '<div class="header-search" style="flex:1;min-width:0;max-width:600px;">' +
      '<input type="text" id="clubSearch" class="search-input" placeholder="Search clubs..." autocomplete="off" style="width:100%;">' +
      '<ul class="search-dropdown" id="searchDropdown" hidden></ul>' +
    '</div>' +
    '<nav class="header-nav" style="flex-wrap:nowrap;">' +
      '<div class="nav-clubs-wrap" style="position:relative;">' +
        '<a class="nav-link-vintage" id="my-clubs-btn" style="white-space:nowrap;cursor:pointer;">My Clubs ▾</a>' +
        '<ul class="nav-clubs-dropdown" id="nav-clubs-dropdown" style="' +
          'display:none;' +
          'position:absolute;' +
          'top:calc(100% + 0.4rem);' +
          'right:0;' +
          'background:rgba(245,240,232,0.97);' +
          'backdrop-filter:blur(12px);' +
          'border:1px solid rgba(120,90,70,0.15);' +
          'border-radius:12px;' +
          'padding:0.4rem;' +
          'min-width:200px;' +
          'box-shadow:0 12px 32px rgba(0,0,0,0.12);' +
          'list-style:none;' +
          'z-index:200;' +
        '"></ul>' +
      '</div>' +
      navLinksHtml +
      '<a href="#" class="nav-link-vintage" id="logout-btn">Logout</a>' +
    '</nav>';

  document.body.insertBefore(header, document.body.firstChild);

  // ── My Clubs dropdown ──────────────────────
  var myClubsBtn = document.getElementById('my-clubs-btn');
  var myClubsDropdown = document.getElementById('nav-clubs-dropdown');

  async function buildMyClubsDropdown() {
    var username = Api.currentUsername();
    var user = null;
    if (username) {
      try { user = await Api.getUser(username); } catch (e) { user = null; }
    }
    myClubsDropdown.innerHTML = '';
    var clubs = user ? (user.clubs || []) : [];

    if (clubs.length === 0) {
      myClubsDropdown.innerHTML =
        '<li style="padding:0.6rem 1rem;font-size:0.85rem;color:var(--ink-light);font-style:italic;">No clubs yet</li>';
    } else {
      clubs.forEach(function (clubTitle) {
        var li = document.createElement('li');
        li.innerHTML =
          '<a href="club.html?clubTitle=' + encodeURIComponent(clubTitle) + '"' +
          ' style="display:block;padding:0.6rem 1rem;font-size:0.88rem;color:var(--ink);' +
          'text-decoration:none;border-radius:8px;transition:background 0.2s;"' +
          ' onmouseover="this.style.background=\'rgba(201,169,154,0.18)\'"' +
          ' onmouseout="this.style.background=\'\'">' +
          clubTitle + '</a>';
        myClubsDropdown.appendChild(li);
      });
    }
  }

  myClubsBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    buildMyClubsDropdown();
    myClubsDropdown.style.display = myClubsDropdown.style.display === 'none' ? 'block' : 'none';
  });

  document.addEventListener('click', function () {
    myClubsDropdown.style.display = 'none';
  });

  // ── Club search ────────────────────────────
  var searchInput = document.getElementById('clubSearch');
  var searchDropdown = document.getElementById('searchDropdown');
  var allClubs = [];
  // Server returns [{ id, title, description }]. Load once for the search box.
  Api.getClubs().then(function (clubs) { allClubs = clubs; }).catch(function () { allClubs = []; });

  function renderSuggestions(term) {
    searchDropdown.innerHTML = '';
    var matches = term
      ? allClubs.filter(function (c) { return (c.title || '').toLowerCase().includes(term); })
      : allClubs.slice();
    matches = matches.slice(0, 5);

    if (matches.length === 0) {
      searchDropdown.innerHTML = '<li class="search-no-results">No clubs found</li>';
    } else {
      matches.forEach(function (club) {
        var li = document.createElement('li');
        li.className = 'search-result-item';
        li.textContent = club.title;
        li.addEventListener('click', function () {
          window.location.href = 'club.html?clubTitle=' + encodeURIComponent(club.title);
        });
        searchDropdown.appendChild(li);
      });
    }
    searchDropdown.hidden = false;
  }

  searchInput.addEventListener('focus', function () {
    renderSuggestions(searchInput.value.trim().toLowerCase());
  });

  searchInput.addEventListener('input', function () {
    renderSuggestions(searchInput.value.trim().toLowerCase());
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.header-search')) {
      searchDropdown.hidden = true;
    }
  });

  // ── Logout ─────────────────────────────────
  document.getElementById('logout-btn').addEventListener('click', function (e) {
    e.preventDefault();
    localStorage.removeItem('bookies_session');
    window.location.href = 'login.html';
  });
}

function initFooter() {
  var footer = document.createElement('footer');
  footer.className = 'landing-footer';
  footer.innerHTML = '<p>© 2026 Bookies — All rights reserved</p>';
  document.body.appendChild(footer);
}
