/* ============================================================
   SkillTrack Maharashtra — public landing page
   Each block below calls its own backend route (POST + JSON).
   ============================================================ */

const $ = (id) => document.getElementById(id);

/* ---------- 1. OVERVIEW STATS  →  POST /trainees ----------
   expected: { total_trainees, verified_trainees, total_providers, total_courses } */
async function loadTrainees() {
  try {
    const captchaResponse = await fetch('/trainees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // i will handle
      })
    });
    const data = await captchaResponse.json();

    $('statTotalTrainees').textContent = data.total_trainees ?? 0;
    $('statVerified').textContent      = data.verified_trainees ?? 0;
    $('statProviders').textContent     = data.total_providers ?? 0;
    $('statCourses').textContent       = data.total_courses ?? 0;
  } catch (e) {
    console.warn('/trainees failed:', e.message);
  }
}

/* ---------- 2. TRAINING BATCHES  →  POST /batch ----------
   expected: { total_batches, active_batches, completed_batches, total_trainers } */
async function loadBatches() {
  try {
    const captchaResponse = await fetch('/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // i will handle
      })
    });
    const data = await captchaResponse.json();

    $('statTotalBatches').textContent     = data.total_batches ?? 0;
    $('statActiveBatches').textContent    = data.active_batches ?? 0;
    $('statCompletedBatches').textContent = data.completed_batches ?? 0;
    $('statTrainers').textContent         = data.total_trainers ?? 0;
  } catch (e) {
    console.warn('/batch failed:', e.message);
  }
}

/* ---------- 3. DISTRICT CHART  →  POST /district ----------
   expected: [{ district, total }, ...] */
async function loadDistrictChart() {
  let rows = [];
  try {
    const captchaResponse = await fetch('/district', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // i will handle
      })
    });
    const data = await captchaResponse.json();
    rows = Array.isArray(data) ? data : (data.district_data || []);
  } catch (e) {
    console.warn('/district failed:', e.message);
  }

  new Chart($('districtChart'), {
    type: 'bar',
    data: {
      labels: rows.map(r => r.district),
      datasets: [{ label: 'Trainees', data: rows.map(r => r.total || 0), backgroundColor: '#1769aa', borderRadius: 6 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  });
}

/* ---------- 4. SECTOR CHART  →  POST /sector ----------
   expected: [{ sector, total }, ...] */
async function loadSectorChart() {
  let rows = [];
  try {
    const captchaResponse = await fetch('/sector', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // i will handle
      })
    });
    const data = await captchaResponse.json();
    rows = Array.isArray(data) ? data : (data.sector_data || []);
  } catch (e) {
    console.warn('/sector failed:', e.message);
  }

  new Chart($('sectorChart'), {
    type: 'doughnut',
    data: {
      labels: rows.map(r => r.sector),
      datasets: [{ data: rows.map(r => r.total || 0), backgroundColor: ['#0b2943', '#1769aa', '#177245', '#c67519', '#7057c8', '#b42318'] }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
  });
}

/* ---------- 5. EMPLOYMENT CHART  →  POST /employment ----------
   No endpoint for this was specified — assumed shape:
   { rate, employed, seeking, unemployed }. Adjust the URL/keys
   below once the real route exists. */
async function loadEmploymentChart() {
  let d = { rate: 0, employed: 0, seeking: 0, unemployed: 0 };
  try {
    const captchaResponse = await fetch('/employment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // i will handle
      })
    });
    d = await captchaResponse.json();
  } catch (e) {
    console.warn('/employment failed:', e.message);
  }

  $('employmentRate').textContent = (d.rate ?? 0) + '%';

  new Chart($('employmentChart'), {
    type: 'doughnut',
    data: {
      labels: ['Employed', 'Seeking Employment', 'Unemployed'],
      datasets: [{ data: [d.employed || 0, d.seeking || 0, d.unemployed || 0], backgroundColor: ['#177245', '#c67519', '#b42318'] }]
    },
    options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom' } } }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof Chart === 'undefined') {
    console.error('Chart.js failed to load — check chart.umd.js is in the same folder as index.html.');
  }
  $('footerYear').textContent = `© ${new Date().getFullYear()} SkillTrack Maharashtra · Digital Programme Platform`;

  loadTrainees();
  loadBatches();
  loadDistrictChart();
  loadSectorChart();
  loadEmploymentChart();
});