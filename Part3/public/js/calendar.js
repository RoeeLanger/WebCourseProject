// ============================================
// COLOUR MAP - up to 5 clubs get distinct hues
// ============================================
const CLUB_COLOURS = [
  { bg: 'rgba(139,80,40,0.18)',  dot: '#8b5028', text: '#6b3510', accent: '#8b5028' },  // dark warm brown
  { bg: 'rgba(45,110,65,0.18)',  dot: '#2d6e41', text: '#1a4d2a', accent: '#2d6e41' },  // forest green
  { bg: 'rgba(90,55,140,0.18)',  dot: '#5a3787', text: '#3d2060', accent: '#5a3787' },  // deep purple
  { bg: 'rgba(120,30,50,0.18)',  dot: '#78202e', text: '#55111e', accent: '#78202e' },  // burgundy
  { bg: 'rgba(95,100,108,0.18)', dot: '#5f646c', text: '#3a3e44', accent: '#5f646c' },  // warm grey
];

// ============================================
// DATA - load from the server (all meetings across the user's clubs)
// ============================================
async function loadMeetings() {
  const username = Api.currentUsername();
  if (!username) return { meetings: [], colourMap: {} };

  let rows;
  try {
    rows = await Api.getUserMeetings(username); // [{ id, title, location, datetime, clubName }]
  } catch (e) {
    return { meetings: [], colourMap: {} };
  }

  const colourMap = {};
  let colourIdx = 0;
  const meetings = [];

  rows.forEach(m => {
    const clubName = m.clubName;
    if (!colourMap[clubName]) {
      colourMap[clubName] = CLUB_COLOURS[colourIdx % CLUB_COLOURS.length];
      colourIdx++;
    }
    // datetime comes back as "YYYY-MM-DD HH:MM:SS"
    const dtStr = String(m.datetime || '');
    const date  = dtStr.slice(0, 10);
    const time  = dtStr.slice(11, 16);
    meetings.push({
      id:          clubName + '_' + m.id,
      name:        m.title || 'Meeting',
      clubName:    clubName,
      date,
      time,
      location:    m.location || '',
      description: '',
      colour:      colourMap[clubName],
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

async function init() {
  const username = Api.currentUsername();
  if (!username) { window.location.href = "login.html"; return; }

  const now = new Date();
  currentYear  = now.getFullYear();
  currentMonth = now.getMonth();

  const data = await loadMeetings();
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
    const manyEvents = meetings.length >= 4;

    let eventsHtml;

    if (manyEvents) {
      // Compact mode: coloured dot + short name, up to 4, then overflow dots
      const compact = meetings.slice(0, 4).map((m) => {
        const idx = allMeetings.indexOf(m);
        return `<div class="cal-event-pill cal-pill-compact"
             style="background:${m.colour.bg};color:${m.colour.text};"
             onclick="openEventModalByIndex(event,${idx})"
             onmouseenter="showPillTooltipByIndex(event,${idx})"
             onmouseleave="hidePillTooltip()"
        ><span class="pill-dot" style="background:${m.colour.dot};"></span>${escapeHtml(m.name)}</div>`;
      }).join('');

      const overflow = meetings.length > 4
        ? `<div class="cal-overflow-dots">${
            meetings.slice(4).map(m =>
              `<span class="cal-overflow-dot" style="background:${m.colour.dot};" title="${escapeHtml(m.name)}"></span>`
            ).join('')
          }</div>`
        : '';

      eventsHtml = compact + overflow;
    } else {
      // Normal mode: full pills (up to 3)
      eventsHtml = meetings.slice(0, 3).map((m) => {
        const idx = allMeetings.indexOf(m);
        return `<div class="cal-event-pill"
             style="background:${m.colour.bg};color:${m.colour.text};"
             onclick="openEventModalByIndex(event,${idx})"
             onmouseenter="showPillTooltipByIndex(event,${idx})"
             onmouseleave="hidePillTooltip()"
        >${escapeHtml(m.name)}</div>`;
      }).join('');
    }

    html += `
      <div class="cal-cell ${isToday ? 'today' : ''} ${hasEvents ? 'has-events' : ''} ${manyEvents ? 'many-events' : ''}">
        <div class="cal-day-num">${day}</div>
        <div class="cal-events">${eventsHtml}</div>
      </div>`;
  }

  cells.innerHTML = html;
}

// ============================================
// LIST VIEW
// ============================================
function renderList() {
  const container = document.getElementById('list-container');

  // Filter to the currently selected month (same as grid)
  const monthMeetings = allMeetings.filter(m => {
    const d = new Date(m.date);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  if (monthMeetings.length === 0) {
    container.innerHTML = `<div class="empty-state">No meetings scheduled for this month.</div>`;
    return;
  }

  const now   = new Date();
  const todayStr = now.getFullYear() + '-'
    + String(now.getMonth() + 1).padStart(2,'0') + '-'
    + String(now.getDate()).padStart(2,'0');

  const upcoming = monthMeetings.filter(m => m.date >= todayStr);
  const past     = monthMeetings.filter(m => m.date <  todayStr);

  const monthLabel = new Date(currentYear, currentMonth, 1)
    .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  let html = '';

  if (upcoming.length > 0) {
    html += buildListSection({ label: monthLabel, items: upcoming }, false);
  }

  if (past.length > 0) {
    if (upcoming.length > 0) {
      html += `<div style="text-align:center;margin:1.5rem 0;">
        <span style="font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--ink-light);">Past Meetings</span>
      </div>`;
    }
    html += buildListSection({ label: upcoming.length === 0 ? monthLabel : '', items: past }, true);
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
        <div class="meeting-item-inner" style="--meeting-bg:${m.colour.bg};">
          <div class="meeting-accent" style="background:${m.colour.accent};width:7px;"></div>
          <div class="meeting-date-block" style="border-right-color:${m.colour.accent}30;">
            <div class="meeting-date-day" style="color:${m.colour.text};">${day}</div>
            <div class="meeting-date-mon">${mon}</div>
          </div>
          <div style="flex:1;min-width:0;">
            <div class="meeting-content-collapsed">
              <div style="min-width:0;flex:1;">
                <div class="meeting-name">${escapeHtml(m.name)}</div>
                <div class="meeting-meta-row">
                  <span class="meeting-club-badge"
                        style="background:${m.colour.dot};color:#fff;font-weight:600;"
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
// EVENT MODAL (calendar grid click) — by index
// ============================================
function openEventModalByIndex(evt, idx) {
  evt.stopPropagation();
  const m = allMeetings[idx];
  if (!m) return;
  _openModal(m);
}

// kept for any other callers
function openEventModal(evt, id) {
  evt.stopPropagation();
  const m = allMeetings.find(x => x.id === id);
  if (!m) return;
  _openModal(m);
}

function _openModal(m) {
  const d = new Date(m.date);
  const fullDate = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  document.getElementById('modal-event-name').textContent = m.name;
  document.getElementById('modal-date').innerHTML = `<strong>${fullDate}</strong>`;
  document.getElementById('modal-time').textContent = m.time || 'Time not specified';
  document.getElementById('modal-location').textContent = m.location || 'Location not specified';
  document.getElementById('modal-club').textContent = m.clubName;

  const descRow = document.getElementById('modal-desc-row');
  const descEl  = document.getElementById('modal-desc');
  if (m.description) {
    descEl.textContent = m.description;
    descRow.style.display = 'flex';
  } else {
    descRow.style.display = 'none';
  }

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

function showPillTooltipByIndex(evt, idx) {
  const m = allMeetings[idx];
  if (!m) return;
  _showTooltip(evt, m);
}

function showPillTooltip(evt, id) {
  const m = allMeetings.find(x => x.id === id);
  if (!m) return;
  _showTooltip(evt, m);
}

function _showTooltip(evt, m) {
  const timeRow = m.time     ? `<div class="tt-row"><span>🕐</span><span>${m.time}</span></div>` : '';
  const locRow  = m.location ? `<div class="tt-row"><span>📍</span><span>${m.location}</span></div>` : '';

  _tt.innerHTML = `
    <div class="tt-club">${m.clubName}</div>
    <div class="tt-name">${m.name}</div>
    ${timeRow}${locRow}`;

  const rect = evt.currentTarget.getBoundingClientRect();
  const ttW  = 210;
  let left   = rect.left + rect.width / 2 - ttW / 2;
  left = Math.max(8, Math.min(left, window.innerWidth - ttW - 8));
  const top  = rect.top - 8;

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