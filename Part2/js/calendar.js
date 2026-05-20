// ============================================
// COLOUR MAP - up to 5 clubs get distinct hues
// ============================================
const CLUB_COLOURS = [
  { bg: 'rgba(201,169,154,0.20)', dot: '#c9a99a', text: '#8b5e3c', accent: '#c9a99a' },
  { bg: 'rgba(130,170,130,0.20)', dot: '#7a9170', text: '#3d6140', accent: '#7a9170' },
  { bg: 'rgba(143,163,177,0.20)', dot: '#8fa3b1', text: '#3a5f72', accent: '#8fa3b1' },
  { bg: 'rgba(181,152,200,0.20)', dot: '#a080c0', text: '#6b4d8a', accent: '#a080c0' },
  { bg: 'rgba(200,175,110,0.20)', dot: '#c8a050', text: '#8a6820', accent: '#c8a050' },
];

// ============================================
// DATA - load from localStorage
// ============================================
function loadMeetings() {
  const currentUser = getCurrentUser();
  if (!currentUser) return [];

  const allClubs = getClubs();
  const userClubNames = [
    ...new Set([
      ...(currentUser.clubs || []),
      ...(currentUser.managedClub ? [currentUser.managedClub] : [])
    ])
  ];

  const colourMap = {};
  let colourIdx = 0;

  const meetings = [];

  userClubNames.forEach(clubName => {
    const club = allClubs.find(c => c.clubTitle === clubName);
    if (!club) return;

    if (!colourMap[clubName]) {
      colourMap[clubName] = CLUB_COLOURS[colourIdx % CLUB_COLOURS.length];
      colourIdx++;
    }

    (club.meetings || []).forEach(m => {
      // datetime-local stores as "YYYY-MM-DDTHH:MM"
      const date = m.datetime ? m.datetime.slice(0, 10) : (m.date || '');
      const time = m.datetime ? m.datetime.slice(11, 16) : (m.time || '');
      meetings.push({
        id:       clubName + '_' + (m.datetime || m.date || m.createdAt),
        name:     m.title || m.name || 'Meeting',
        clubName: clubName,
        date,
        time,
        location: m.location || '',
        colour:   colourMap[clubName],
      });
    });
  });

  // Sort by date
  meetings.sort((a, b) => a.date.localeCompare(b.date));

  return { meetings, colourMap };
}

// ============================================
// STATE
// ============================================
let currentYear, currentMonth;
let allMeetings = [];
let colourMap   = {};
let activeView  = 'grid';
let focusedEvent = null;

function init() {
  const now = new Date();
  currentYear  = now.getFullYear();
  currentMonth = now.getMonth();

  const data = loadMeetings();
  allMeetings  = data.meetings;
  colourMap    = data.colourMap;

  renderLegend();
  renderAll();
}

// ============================================
// LEGEND
// ============================================
function renderLegend() {
  const el = document.getElementById('club-legend');
  const clubs = Object.keys(colourMap);
  if (clubs.length === 0) { el.style.display = 'none'; return; }
  el.innerHTML = clubs.map(name => `
    <div class="legend-item">
      <span class="legend-dot" style="background:${colourMap[name].dot}"></span>
      ${escapeHtml(name)}
    </div>
  `).join('');
}

// ============================================
// VIEWS
// ============================================
function setView(v) {
  activeView = v;
  document.getElementById('view-grid').style.display = v === 'grid' ? 'block' : 'none';
  document.getElementById('view-list').style.display = v === 'list' ? 'block' : 'none';
  document.getElementById('btn-grid').classList.toggle('active', v === 'grid');
  document.getElementById('btn-list').classList.toggle('active', v === 'list');
  renderAll();
}

function changeMonth(dir) {
  currentMonth += dir;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  if (currentMonth < 0)  { currentMonth = 11; currentYear--; }
  renderAll();
}

function renderAll() {
  const label = new Date(currentYear, currentMonth, 1)
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  document.getElementById('month-label').textContent = label;

  if (activeView === 'grid') renderGrid();
  else                       renderList();
}

// ============================================
// GRID VIEW
// ============================================
function renderGrid() {
  const cells = document.getElementById('cal-cells');
  const today = new Date();

  const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Map date string → meetings
  const byDay = {};
  allMeetings.forEach(m => {
    const d = new Date(m.date);
    if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
      const key = d.getDate();
      if (!byDay[key]) byDay[key] = [];
      byDay[key].push(m);
    }
  });

  let html = '';

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    html += '<div class="cal-cell empty"></div>';
  }

  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = (today.getFullYear() === currentYear
                  && today.getMonth()    === currentMonth
                  && today.getDate()     === day);
    const meetings = byDay[day] || [];
    const hasEvents = meetings.length > 0;

    const pills = meetings.slice(0, 3).map((m) => {
      return `<div class="cal-event-pill"
           style="background:${m.colour.bg};color:${m.colour.text};"
           onclick="openEventModal(event,'${escapeAttr(m.id)}')"
           onmouseenter="showPillTooltip(event,'${escapeAttr(m.id)}')"
           onmouseleave="hidePillTooltip()"
      >${escapeHtml(m.name)}</div>`;
    }).join('');

    const more = meetings.length > 3
      ? `<div style="font-size:0.6rem;color:var(--ink-light);padding:1px 4px;">+${meetings.length - 3} more</div>`
      : '';

    html += `
      <div class="cal-cell ${isToday ? 'today' : ''} ${hasEvents ? 'has-events' : ''}">
        <div class="cal-day-num">${day}</div>
        <div class="cal-events">${pills}${more}</div>
      </div>`;
  }

  cells.innerHTML = html;
}

// ============================================
// LIST VIEW
// ============================================
function renderList() {
  const container = document.getElementById('list-container');

  // Group by month
  const byMonth = {};
  allMeetings.forEach(m => {
    const d = new Date(m.date);
    const key = d.getFullYear() + '-' + String(d.getMonth()).padStart(2,'0');
    if (!byMonth[key]) byMonth[key] = { label: d.toLocaleDateString('en-US',{month:'long',year:'numeric'}), items: [] };
    byMonth[key].items.push(m);
  });

  const keys = Object.keys(byMonth).sort();

  if (keys.length === 0) {
    container.innerHTML = `<div class="empty-state">No upcoming meetings scheduled.</div>`;
    return;
  }

  // Show current month first, then future
  const now = new Date();
  const nowKey = now.getFullYear() + '-' + String(now.getMonth()).padStart(2,'0');

  const sortedKeys = keys.filter(k => k >= nowKey);
  const pastKeys   = keys.filter(k => k < nowKey);

  let html = '';

  sortedKeys.forEach(key => {
    html += buildListSection(byMonth[key]);
  });

  if (pastKeys.length > 0) {
    html += `
      <div style="text-align:center;margin:1.5rem 0;">
        <span style="font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--ink-light);">Past Meetings</span>
      </div>`;
    pastKeys.reverse().forEach(key => {
      html += buildListSection(byMonth[key], true);
    });
  }

  container.innerHTML = html;
}

function buildListSection(section, isPast = false) {
  const items = section.items.map((m, i) => {
    const d   = new Date(m.date);
    const day = d.getDate();
    const mon = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const fullDate = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return `
      <div class="meeting-item" style="opacity:${isPast ? '0.62' : '1'}">
        <div class="meeting-item-inner">
          <div class="meeting-accent" style="background:${m.colour.accent}"></div>
          <div class="meeting-date-block">
            <div class="meeting-date-day">${day}</div>
            <div class="meeting-date-mon">${mon}</div>
          </div>
          <div style="flex:1;min-width:0;">
            <div class="meeting-content-collapsed">
              <div style="min-width:0;flex:1;">
                <div class="meeting-name">${escapeHtml(m.name)}</div>
                <div class="meeting-meta-row">
                  <span class="meeting-club-badge"
                        style="background:${m.colour.bg};color:${m.colour.text};"
                  >${escapeHtml(m.clubName)}</span>
                  ${m.time ? `<span class="meeting-time">🕐 ${escapeHtml(m.time)}</span>` : ''}
                </div>
              </div>
              <button class="meeting-expand-btn" id="expand-${escapeAttr(m.id)}"
                      onclick="toggleDetail(event, '${escapeAttr(m.id)}')"
                      aria-label="Show details">⌄</button>
            </div>
            <div class="meeting-details" id="detail-${escapeAttr(m.id)}">
              <div class="meeting-details-inner">
                <div class="detail-group">
                  <span class="detail-label">Date</span>
                  <span class="detail-value">${fullDate}</span>
                </div>
                ${m.time ? `<div class="detail-group">
                  <span class="detail-label">Time</span>
                  <span class="detail-value">${escapeHtml(m.time)}</span>
                </div>` : ''}
                ${m.location ? `<div class="detail-group">
                  <span class="detail-label">Location</span>
                  <span class="detail-value">${escapeHtml(m.location)}</span>
                </div>` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="list-section">
      <div class="list-month-title">${section.label}</div>
      <div class="list-meetings">${items}</div>
    </div>`;
}

// ============================================
// EXPAND DETAIL (list)
// ============================================
function toggleDetail(evt, id) {
  evt.stopPropagation();
  const detail = document.getElementById('detail-' + id);
  const btn    = document.getElementById('expand-' + id);
  if (!detail) return;
  const isOpen = detail.classList.toggle('open');
  btn.classList.toggle('open', isOpen);
}

// ============================================
// EVENT MODAL (calendar grid click)
// ============================================
function openEventModal(evt, id) {
  evt.stopPropagation();
  const m = allMeetings.find(x => x.id === id);
  if (!m) return;

  const d = new Date(m.date);
  const fullDate = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  document.getElementById('modal-event-name').textContent = m.name;
  document.getElementById('modal-date').innerHTML = `<strong>${fullDate}</strong>`;
  document.getElementById('modal-time').textContent = m.time || 'Time not specified';
  document.getElementById('modal-location').textContent = m.location || 'Location not specified';
  document.getElementById('modal-club').textContent = m.clubName;

  document.getElementById('event-modal-overlay').classList.add('open');
}

function closeEventModal(evt) {
  if (evt.target === document.getElementById('event-modal-overlay')) {
    document.getElementById('event-modal-overlay').classList.remove('open');
  }
}
function closeEventModalDirect() {
  document.getElementById('event-modal-overlay').classList.remove('open');
}

// ============================================
// HELPERS
// ============================================
function escapeHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function escapeAttr(str) {
  return String(str || '').replace(/[^a-zA-Z0-9_-]/g, '_');
}

// ============================================
// PILL TOOLTIP (JS-positioned, body-level)
// ============================================
const _tt = document.getElementById('pill-tooltip-global');
let _ttTimer = null;

function showPillTooltip(evt, id) {
  const m = allMeetings.find(x => x.id === id);
  if (!m) return;

  const timeRow = m.time     ? `<div class="tt-row"><span>🕐</span><span>${m.time}</span></div>` : '';
  const locRow  = m.location ? `<div class="tt-row"><span>📍</span><span>${m.location}</span></div>` : '';

  _tt.innerHTML = `
    <div class="tt-club">${m.clubName}</div>
    <div class="tt-name">${m.name}</div>
    ${timeRow}${locRow}`;

  // Position above the pill
  const rect = evt.currentTarget.getBoundingClientRect();
  const ttW  = 210;
  let left   = rect.left + rect.width / 2 - ttW / 2;
  // clamp to viewport
  left = Math.max(8, Math.min(left, window.innerWidth - ttW - 8));
  const top  = rect.top - 8; // will be shifted up via transform

  _tt.style.left      = left + 'px';
  _tt.style.top       = top  + 'px';
  _tt.style.transform = 'translateY(-100%)';

  clearTimeout(_ttTimer);
  _tt.classList.add('visible');
}

function hidePillTooltip() {
  _ttTimer = setTimeout(() => _tt.classList.remove('visible'), 80);
}

// ============================================
// BOOT
// ============================================
initAppHeader([{ href: 'profile.html', label: 'My Profile' }]);
initFooter();
init();
