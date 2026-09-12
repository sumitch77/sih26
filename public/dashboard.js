/* ============================================================
   SkillTrack Maharashtra — Dashboard
   Every section fetches its own data from its own endpoint.
   If an endpoint isn't wired up yet (or fails), the page falls
   back to small demo data so the layout is never empty — once
   your backend responds, real data takes over automatically.
   ============================================================ */

   const traineesLink = document.getElementById('traineesLink');


/* ---------- generic POST helper (as requested) ---------- */
async function postJSON(url, payload = {}) {
  const Response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!Response.ok) throw new Error(url + ' responded with ' + Response.status);
  const data = await Response.json();
  return data;
}

/* ---------- shared colours ---------- */
const COLORS = {
  navy:   '#122c52',
  blue:   '#2f6fed',
  teal:   '#1596a9',
  orange: '#ef8a3f',
  green:  '#1f9d55',
  red:    '#e14b4b',
  purple: '#7c5cd6'
};

/* ---------- demo fallback data ---------- */
const MOCK = {
  overview: [
    { id: 'total',      label: 'Total Registered Trainees', value: 47832, sub: 'Across 36 districts',       delta: '+2,340 vs last month', direction: 'up',   icon: '👥', tone: 'blue'   },
    { id: 'training',   label: 'Currently Training',        value: 12450, sub: 'Active enrollments',        delta: '+840 vs last month',   direction: 'up',   icon: '📘', tone: 'teal'   },
    { id: 'employed',   label: 'Employed Trainees',         value: 28940, sub: 'Of total completed',        delta: '+1,820 vs last month', direction: 'up',   icon: '💼', tone: 'orange' },
    { id: 'unemployed', label: 'Unemployed Trainees',       value: 6442,  sub: 'Seeking placement',         delta: '-312 vs last month',   direction: 'down', icon: '❗', tone: 'red'    },
    { id: 'rate',       label: 'Employment Rate',           value: '81.8%', sub: 'Of completed trainees',   delta: '+1.4% vs last month',  direction: 'up',   icon: '📈', tone: 'teal'   },
    { id: 'completed',  label: 'Courses Completed',         value: 8215,  sub: 'This fiscal year',          delta: '+0.8% vs last month',  direction: 'up',   icon: '✅', tone: 'blue'   }
  ],
  trend: [
    { sep: 2024, enrolled: 3400, completed: 2600, employed: 2100 },
    { oct: 2024, enrolled: 3900, completed: 2900, employed: 2300 },
    { nov: 2024, enrolled: 4200, completed: 3100, employed: 2500 },
    { dec: 2024, enrolled: 3300, completed: 2500, employed: 2000 },
    { jan: 2025, enrolled: 4600, completed: 3400, employed: 2700 },
    { feb: 2025, enrolled: 5200, completed: 3900, employed: 3000 },
    { mar: 2025, enrolled: 5800, completed: 4300, employed: 3300 },
    { apr: 2025, enrolled: 5600, completed: 4200, employed: 3200 },
    { may: 2025, enrolled: 6000, completed: 4500, employed: 3450 },
    { jun: 2025, enrolled: 6100, completed: 4600, employed: 3500 },
    { jul: 2025, enrolled: 6400, completed: 4800, employed: 3650 },
    { aug: 2025, enrolled: 6600, completed: 5000, employed: 3800 }
  ],
  district: {
    'Mumbai': 88, 'Pune': 86, 'Nagpur': 80, 'Nashik': 78,
    'C.S. Nagar': 74, 'Thane': 85, 'Kolhapur': 73, 'Solapur': 71
  },
  sector: {
    'IT & Digital': 28, 'Manufacturing': 22, 'Healthcare': 16,
    'Construction': 12, 'BFSI': 11, 'Agriculture': 11
  },
  courses: {
    'IT & Software': 89.9, 'Electrical Tech.': 87.2, 'Healthcare Asst.': 85.3,
    'Automotive': 83.9, 'Plumbing': 81.6, 'Retail Mgmt.': 78.0
  },
  action: {
    statements: [
      '87 trainees yet to be placed after 30+ days',
      'Amravati district employment rate below target (73.8%)',
      'August 2025 monthly report pending approval'
    ]
  },
  updates: {
    statements: [
      'Priya Sharma registered for IT & Software course',
      'Rahul Patil completed Electrical Technician training',
      'Sunita Jadhav placed at Apollo Clinic, Nagpur (₹22,000/mo)',
      'Vijay More registered for Plumbing course',
      'Kavita Deshmukh placed at Fabindia, Thane (₹25,000/mo)'
    ]
  },
  login: { name: 'Amit Mehere', role: 'Admin Officer', email: 'amit.mehere@maharashtra.gov.in' },
  batches: [
    { name: 'Cloud Computing Fundamentals', meta: 'Sep 3, 2025 · Pune', seats: '45 seats' },
    { name: 'EV Technology Training',       meta: 'Sep 10, 2025 · Nashik', seats: '30 seats' }
  ]
};

/* ---------- small helpers ---------- */
const $ = (sel) => document.querySelector(sel);
const initialsOf = (name) => (name || '?').split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
const cap = (word) => word ? word[0].toUpperCase() + word.slice(1) : word;

function toneColor(pct, high, mid) {
  if (pct >= high) return COLORS.navy;
  if (pct >= mid) return COLORS.teal;
  return COLORS.orange;
}

/* ============================================================
   1. LOGIN / PROFILE  →  POST /logindata
   ============================================================ */
async function loadLogin() {
  let data;
  try {
    data = await postJSON('/logindata', {});
  } catch (e) {
    console.warn('[/logindata] using demo data:', e.message);
    data = MOCK.login;
  }
  $('#profileName').textContent = data.name || 'Unknown user';
  $('#profileRole').textContent = data.role || data.email || '';
  $('#avatarInitials').textContent = initialsOf(data.name);
}

/* ============================================================
   2. OVERVIEW CARDS  →  POST /overview
   Expected shape: an array of card objects, e.g.
   [{ id, label, value, sub, delta, direction: 'up'|'down', icon, tone }]
   ============================================================ */
async function loadOverview() {
  let cards;
  try {
    const data = await postJSON('/doverview', {});
    cards = Array.isArray(data) ? data : (data.cards || []);
  } catch (e) {
    console.warn('[/doverview] using demo data:', e.message);
    cards = MOCK.overview;
  }

  const ICON_TONE = {
    blue:   'bg-[#e8f0fe] text-brandblue',
    teal:   'bg-[#e3f6f8] text-teal',
    orange: 'bg-[#fdeee1] text-orange',
    red:    'bg-[#fdeaea] text-red'
  };
  const DELTA_TONE = {
    up:   'bg-[#e5f7ec] text-green',
    down: 'bg-[#fdeaea] text-red'
  };

  const grid = $('#statsGrid');
  grid.innerHTML = cards.map(c => {
    const dir = c.direction === 'down' ? 'down' : 'up';
    return `
    <div class="bg-white border border-bordercol rounded-2xl p-[18px] shadow-card">
      <div class="flex items-start justify-between">
        <span class="text-[12.5px] text-muted font-semibold">${c.label}</span>
        <span class="w-8 h-8 rounded-[9px] flex items-center justify-center text-sm flex-shrink-0 ${ICON_TONE[c.tone] || ICON_TONE.blue}">${c.icon || '●'}</span>
      </div>
      <div class="text-[26px] font-extrabold text-navy mt-2.5 mb-0.5">${typeof c.value === 'number' ? c.value.toLocaleString('en-IN') : c.value}</div>
      <div class="text-[11.5px] text-muted mb-2.5">${c.sub || ''}</div>
      <span class="inline-flex items-center gap-1 text-[11.5px] font-bold px-2 py-1 rounded-full ${DELTA_TONE[dir]}">
        ${dir === 'down' ? '↓' : '↑'} ${c.delta || ''}
      </span>
    </div>`;
  }).join('');

  $('#lastUpdated').textContent = `Last updated: ${new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} · Data as of FY 2025–26 Q2`;
}

/* ============================================================
   3. EMPLOYMENT TRENDS  →  POST /trend
   Expected shape: array of objects like
   [{ "jan": 2024, "employed": 1000, "completed": 500, "enrolled": 600 }, ...]
   the one key that isn't employed/completed/enrolled is the month.
   ============================================================ */
async function loadTrend() {
  let rows;
  try {
    const data = await postJSON('/trend', {});
    rows = Array.isArray(data) ? data : (data.trend || []);
  } catch (e) {
    console.warn('[/trend] using demo data:', e.message);
    rows = MOCK.trend;
  }

  const labels = [], enrolled = [], completed = [], employed = [];
  rows.forEach(row => {
    let month = null, year = '';
    Object.keys(row).forEach(key => {
      if (!['employed', 'completed', 'enrolled'].includes(key)) {
        month = key;
        year = row[key];
      }
    });
    labels.push(`${cap(month)} '${String(year).slice(-2)}`);
    enrolled.push(row.enrolled || 0);
    completed.push(row.completed || 0);
    employed.push(row.employed || 0);
  });

  const ctx = $('#trendChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Enrolled',  data: enrolled,  borderColor: COLORS.navy, backgroundColor: hexA(COLORS.navy, .08),  fill: true, tension: .35, pointRadius: 0, borderWidth: 2 },
        { label: 'Completed', data: completed, borderColor: COLORS.blue, backgroundColor: hexA(COLORS.blue, .08),  fill: true, tension: .35, pointRadius: 0, borderWidth: 2 },
        { label: 'Employed',  data: employed,  borderColor: COLORS.green, backgroundColor: hexA(COLORS.green, .12), fill: true, tension: .35, pointRadius: 0, borderWidth: 2 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { color: '#eef0f5' } }
      }
    }
  });

  $('#trendLegend').innerHTML = ['Enrolled', 'Completed', 'Employed'].map((label, i) => `
    <span class="flex items-center gap-1.5 text-xs text-muted">
      <span class="inline-block w-[9px] h-[9px] rounded-[2px]" style="background:${[COLORS.navy, COLORS.blue, COLORS.green][i]}"></span>${label}
    </span>
  `).join('');
}

function hexA(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ============================================================
   4. SECTOR DISTRIBUTION (donut) — comes bundled visually with
   the trends card in the screenshot; kept static/demo here since
   no dedicated endpoint was specified. Swap MOCK.sector for a
   fetch('/sector', ...) call if/when that endpoint exists.
   ============================================================ */
function loadSector() {
  const data = MOCK.sector;
  const labels = Object.keys(data);
  const values = Object.values(data);
  const palette = [COLORS.navy, COLORS.orange, COLORS.green, COLORS.purple, COLORS.teal, '#f2b46b'];

  const ctx = $('#sectorChart').getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data: values, backgroundColor: palette, borderWidth: 0 }] },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '68%',
      plugins: { legend: { display: false } }
    }
  });

  $('#sectorLegend').innerHTML = labels.map((label, i) => `
    <li class="flex items-center justify-between text-[12.5px]">
      <span class="flex items-center gap-[7px]">
        <span class="w-[9px] h-[9px] rounded-[2px] flex-shrink-0" style="background:${palette[i]}"></span>${label}
      </span>
      <span class="font-bold">${values[i]}%</span>
    </li>
  `).join('');
}

/* ============================================================
   5. DISTRICT-WISE EMPLOYMENT  →  POST /distrcit
   Expected shape: { "Mumbai": 88, "Pune": 86, ... }  (city → % employed)
   ============================================================ */
async function loadDistrict() {
  let data;
  try {
    data = await postJSON('/distrcit', {});
  } catch (e) {
    console.warn('[/distrcit] using demo data:', e.message);
    data = MOCK.district;
  }

  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const labels = entries.map(e => e[0]);
  const values = entries.map(e => e[1]);
  const colors = values.map(v => toneColor(v, 84, 76));

  const ctx = $('#districtChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ data: values, backgroundColor: colors, borderRadius: 4, barThickness: 14 }] },
    options: {
      indexAxis: 'y',
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => c.raw + '%' } } },
      scales: {
        x: { min: 60, max: 90, ticks: { callback: (v) => v + '%' }, grid: { color: '#eef0f5' } },
        y: { grid: { display: false } }
      }
    }
  });
}

/* ============================================================
   6. TOP PERFORMING COURSES  →  POST /courses
   Expected shape: { "Electrical Tech.": 87.2, "IT & Software": 89.9, ... }
   Rendered as a ranked progress list (matches the source design).
   ============================================================ */
async function loadCourses() {
  let data;
  try {
    data = await postJSON('/courses', {});
  } catch (e) {
    console.warn('[/courses] using demo data:', e.message);
    data = MOCK.courses;
  }

  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const palette = [COLORS.green, COLORS.green, COLORS.navy, COLORS.orange, COLORS.navy, COLORS.orange];

  $('#courseList').innerHTML = entries.map(([name, pct], i) => `
    <li class="flex items-center gap-3">
      <span class="w-5 h-5 rounded-full bg-[#f1f3f8] text-muted text-[11px] font-bold flex items-center justify-center flex-shrink-0">${i + 1}</span>
      <div class="flex-1 min-w-0">
        <div class="flex justify-between text-[13px] mb-1.5">
          <span class="font-semibold">${name}</span>
          <span class="font-bold" style="color:${palette[i % palette.length]}">${pct}%</span>
        </div>
        <div class="h-1.5 rounded-full bg-[#eef0f5] overflow-hidden">
          <span class="block h-full rounded-full" style="width:${pct}%;background:${palette[i % palette.length]}"></span>
        </div>
      </div>
    </li>
  `).join('');
}

/* ============================================================
   7. RECENT ACTIVITY  →  POST /updates   { statements: [...] }
   ============================================================ */
async function loadUpdates() {
  let statements;
  try {
    const data = await postJSON('/updates', {});
    statements = data.statements || [];
  } catch (e) {
    console.warn('[/updates] using demo data:', e.message);
    statements = MOCK.updates.statements;
  }

  $('#activityList').innerHTML = statements.length
    ? statements.map(text => `
        <li class="flex gap-2.5 items-start text-[13px]">
          <span class="w-[26px] h-[26px] rounded-full bg-[#f1f3f8] text-muted flex items-center justify-center text-xs flex-shrink-0 mt-0.5">●</span>
          <span>${text}</span>
        </li>`).join('')
    : '<li class="text-muted2 text-[12.5px] py-1.5">No recent activity</li>';
}

/* ============================================================
   8. ACTION REQUIRED  →  POST /action   { statements: [...] }
   ============================================================ */
async function loadAction() {
  let statements;
  try {
    const data = await postJSON('/action', {});
    statements = data.statements || [];
  } catch (e) {
    console.warn('[/action] using demo data:', e.message);
    statements = MOCK.action.statements;
  }

  const TONES = [
    { cls: 'bg-[#fef6e7] text-[#8a5a12]', dot: COLORS.orange },
    { cls: 'bg-[#fdeaea] text-[#9c2b2b]', dot: COLORS.red },
    { cls: 'bg-[#eaf1fd] text-[#1d4a8a]', dot: COLORS.brandblue || '#2f6fed' }
  ];
  $('#actionList').innerHTML = statements.length
    ? statements.map((text, i) => {
        const t = TONES[i % TONES.length];
        return `
        <li class="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] text-[13px] font-medium ${t.cls}">
          <span class="w-2 h-2 rounded-full flex-shrink-0" style="background:${t.dot}"></span>
          <span>${text}</span>
        </li>`;
      }).join('')
    : '<li class="text-muted2 text-[12.5px] py-1.5">Nothing needs attention right now</li>';
}

/* ============================================================
   9. UPCOMING BATCHES — no endpoint was specified for this
   section, so it stays as static demo content. Point it at a
   real endpoint the same way as the sections above if needed.
   ============================================================ */
function loadBatches() {
  $('#batchList').innerHTML = MOCK.batches.map(b => `
    <li class="flex items-center justify-between text-[13px]">
      <div>
        <div class="font-semibold">${b.name}</div>
        <div class="text-muted text-xs mt-0.5">${b.meta}</div>
      </div>
      <span class="bg-[#f1f3f8] text-[#16223f] text-[11.5px] font-bold px-2.5 py-1 rounded-full flex-shrink-0">${b.seats}</span>
    </li>
  `).join('');
}

/* ---------- profile dropdown ---------- */
function wireProfileMenu() {
  const toggle = $('#profileToggle');
  const menu = $('#profileMenu');
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('hidden');
    menu.classList.toggle('flex');
  });
  document.addEventListener('click', () => {
    menu.classList.add('hidden');
    menu.classList.remove('flex');
  });
}

/* ---------- boot ---------- */
document.addEventListener('DOMContentLoaded', () => {
  wireProfileMenu();
  loadLogin();
  loadOverview();
  loadTrend();
  loadSector();
  loadDistrict();
  loadCourses();
  loadUpdates();
  loadAction();
  loadBatches();
});