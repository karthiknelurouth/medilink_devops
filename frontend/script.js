/* script.js — v4
   Hospital Resource & Emergency Coordination
   Role-based UI: admin badge, admin sidebar link, real user data in profile panel.
*/

const API_BASE = 'http://localhost:8000';

/* =========================================================
   AUTH HELPERS
   ========================================================= */
function getUser() {
  try { return JSON.parse(localStorage.getItem('medilink_user')) || null; }
  catch { return null; }
}

function isAdmin() {
  const u = getUser();
  return u && u.role === 'admin';
}

/* Inject role-aware UI on every page — populates profile panel from localStorage */
function applyRoleUI() {
  const user = getUser();
  if (!user) return;

  // --- Admin badge in header (only for admin) ---
  if (user.role === 'admin') {
    const headerLeft = document.querySelector('.header-left');
    if (headerLeft && !document.getElementById('adminBadge')) {
      const badge = document.createElement('div');
      badge.id = 'adminBadge';
      badge.innerHTML = `<span>👑</span> Admin`;
      badge.style.cssText = `
        display:inline-flex;align-items:center;gap:6px;
        background:linear-gradient(90deg,#D81B60,#E8365D);
        color:#fff;font-size:12px;font-weight:700;
        padding:5px 12px;border-radius:999px;
        box-shadow:0 2px 10px rgba(216,27,96,0.4);
        letter-spacing:0.3px;margin-left:8px;
      `;
      headerLeft.appendChild(badge);
    }
  }

  // --- Admin link in sidebar (only for admin) ---
  const nav = document.querySelector('.nav');
  if (nav && user.role === 'admin' && !document.getElementById('adminNavLink')) {
    const link = document.createElement('a');
    link.id = 'adminNavLink';
    link.className = 'nav-link';
    link.href = 'admin.html';
    link.innerHTML = `<span class="nav-icon">⚙️</span><span class="nav-label">Admin Panel</span>`;
    nav.insertBefore(link, nav.firstChild);
  }

  // --- Profile panel: populate all fields from localStorage ---
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  // Top section
  set('profileName',   user.hospital_name || user.name || 'User');
  set('profileRole',   user.role === 'admin' ? '👑 Admin • Full Access' : '👤 Staff • View Access');
  set('profileAvatar', user.role === 'admin' ? '👑' : '🏥');

  // Body rows
  set('pdHospitalId',   user.hospital_id   || '—');
  set('pdName',         user.name          || '—');
  set('pdEmail',        user.email         || '—');
  set('pdHospitalName', user.hospital_name || '—');
  set('pdRole',         user.role === 'admin' ? 'Admin' : 'Staff');
  set('pdPermissions',  user.role === 'admin' ? 'View • Edit • Transfer • Export • Admin' : 'View • Update');

  // My Hospital pill in header
  set('pillHospName', user.hospital_name || 'My Hospital');

  // Hide action buttons for staff
  if (user.role !== 'admin') {
  document.querySelectorAll('button').forEach(btn => {
    const t = btn.textContent.trim();
    if (t === '+ New Request') btn.style.display = 'none';
  });
}
}

/* =========================================================
   DATA
   ========================================================= */

// Normalize DB row (snake_case) → UI shape (camelCase)
function _normalizeHospital(row) {
  return {
    id:         row.hospital_id,
    hospital:   row.hospital_name,
    state:      row.state       || '—',
    totalBeds:  row.total_beds  || 0,
    icuTotal:   row.icu_total   || 0,
    icuAvail:   row.icu_avail   || 0,
    bloodUnits: row.blood_units || 0,
    oxygenCyl:  row.oxygen_cyl  || 0,
    status:     row.status      || 'Normal',
    updated:    row.updated_at  ? new Date(row.updated_at).toLocaleString('en-IN') : '—'
  };
}

// Fetch live hospitals; overwrites DUMMY.hospitals if API returns data
async function fetchHospitals() {
  try {
    const res = await fetch(`${API_BASE}/api/hospitals`);
    if (!res.ok) throw new Error('API error');
    const rows = await res.json();
    if (Array.isArray(rows) && rows.length) {
      DUMMY.hospitals = rows.map(_normalizeHospital);
    }
  } catch (e) {
    console.warn('Could not fetch hospitals from API, using dummy data.', e);
  }
}

const DUMMY = {
  hospitals: [
    { id:"AP-GGH-001", state:"Andhra Pradesh",  hospital:"Green General Hospital (Vijayawada)",    updated:"2026-02-11 09:40", totalBeds:320, icuTotal:48,  icuAvail:6,  bloodUnits:78,  oxygenCyl:24,  status:"Critical"  },
    { id:"MH-KEM-002", state:"Maharashtra",     hospital:"KEM City Medical Center (Mumbai)",        updated:"2026-02-11 09:20", totalBeds:650, icuTotal:120, icuAvail:18, bloodUnits:220, oxygenCyl:120, status:"Normal"    },
    { id:"TN-AIR-003", state:"Tamil Nadu",      hospital:"AIIMS Regional (Chennai)",                updated:"2026-02-11 08:55", totalBeds:480, icuTotal:90,  icuAvail:4,  bloodUnits:56,  oxygenCyl:18,  status:"Critical"  },
    { id:"KA-BGH-004", state:"Karnataka",       hospital:"Bengaluru General (Bengaluru)",            updated:"2026-02-11 09:10", totalBeds:410, icuTotal:64,  icuAvail:20, bloodUnits:140, oxygenCyl:60,  status:"Normal"    },
    { id:"DL-CGH-005", state:"Delhi",           hospital:"Capital Gate Hospital (New Delhi)",        updated:"2026-02-11 09:30", totalBeds:300, icuTotal:50,  icuAvail:2,  bloodUnits:32,  oxygenCyl:8,   status:"Emergency" },
    { id:"WB-NPH-006", state:"West Bengal",     hospital:"North Point Hospital (Kolkata)",           updated:"2026-02-11 09:00", totalBeds:390, icuTotal:72,  icuAvail:14, bloodUnits:98,  oxygenCyl:44,  status:"Warning"   }
  ],
  transfers: [
    { id:"T-1001", from:"Green General Hospital (Vijayawada)",    to:"AIIMS Regional (Chennai)",           requested:{icu:1,oxygen:1,bloodGroup:"B+"}, criticality:"Critical", time:"2026-02-11 09:12", notes:"Post-op deterioration, needs ICU ventilator" },
    { id:"T-1002", from:"Capital Gate Hospital (New Delhi)",      to:"Bengaluru General (Bengaluru)",       requested:{icu:1,oxygen:2,bloodGroup:"O-"}, criticality:"Urgent",   time:"2026-02-11 08:55", notes:"Requires urgent specialist consultation"     },
    { id:"T-1003", from:"KEM City Medical Center (Mumbai)",       to:"Green General Hospital (Vijayawada)", requested:{icu:0,oxygen:1,bloodGroup:"A+"}, criticality:"Normal",   time:"2026-02-10 16:30", notes:"Stable but referral for bed availability"     }
  ],
  faqs: [
    { q:"How to request a patient transfer?",       a:"Open the Patient Transfers page, click 'New Request', fill in the required resources and urgency level, then submit. The receiving hospital coordinator can Accept or Reject the request from their dashboard." },
    { q:"What constitutes 'Emergency' status?",     a:"Emergency is triggered when ICU availability drops below 5% of total ICU beds, or when oxygen / blood unit counts fall below critical thresholds defined by the state health authority." },
    { q:"How are notifications delivered?",         a:"Notifications appear in the header bell icon with a pulsing badge. In production, real-time WebSocket events push updates; this demo simulates badges with local state." },
    { q:"How do I update inventory levels?",        a:"Navigate to the Inventory page, find the item and click 'Edit' to update quantity or reorder threshold. Rows highlighted in red are currently below the reorder level." },
    { q:"Can multiple states be compared at once?", a:"Use the 'All States' option in the State filter on the Dashboard to view combined data, or select individual states to drill down. The table supports column-based sorting for quick comparison." }
  ]
};

/* =========================================================
   TOAST SYSTEM
   ========================================================= */
(function initToasts(){
  const container = document.createElement('div');
  container.id = 'toastContainer';
  document.body.appendChild(container);
})();

function showToast(msg, type = 'info', duration = 3200) {
  const icons = { success:'✅', error:'❌', info:'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || ''}</span><span>${msg}</span>`;
  document.getElementById('toastContainer').appendChild(toast);
  setTimeout(() => {
    toast.classList.add('out');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, duration);
}

/* =========================================================
   FILTERS
   ========================================================= */
function populateFilters() {
  const fHospital = document.getElementById('filterHospital');
  if (fHospital) {
    fHospital.innerHTML = `<option value="all">All Hospitals</option>` +
      DUMMY.hospitals.map(h => `<option value="${h.id}">${h.hospital}</option>`).join('');
    fHospital.addEventListener('change', e => {
      const val = e.target.value;
      populateTable(val === 'all' ? DUMMY.hospitals : DUMMY.hospitals.filter(h => h.id === val));
    });
  }
  populateTable(DUMMY.hospitals);
}

/* =========================================================
   SUMMARY CARDS
   ========================================================= */
const CARD_META = [
  { key:'icu',      icon:'🛏️', title:'Available ICU Beds',  getter: d => d.reduce((s,h) => s+h.icuAvail, 0),   max: d => d.reduce((s,h)=>s+h.icuTotal,0), warnBelow:15 },
  { key:'blood',    icon:'🩸', title:'Total Blood Units',    getter: d => d.reduce((s,h) => s+h.bloodUnits, 0),  max: 700 },
  { key:'oxygen',   icon:'🫁', title:'Oxygen Cylinders',     getter: d => d.reduce((s,h) => s+h.oxygenCyl, 0),   max: 300 },
  { key:'beds',     icon:'🏥', title:'Total Hospital Beds',  getter: d => d.reduce((s,h) => s+h.totalBeds, 0),   max: 3000 },
  { key:'icuTotal', icon:'📊', title:'Total ICU Beds',       getter: d => d.reduce((s,h) => s+h.icuTotal, 0),    max: 500 },
  { key:'emerg',    icon:'🚨', title:'Emergency / Critical', getter: d => d.filter(h=>['Critical','Emergency'].includes(h.status)).length, max: d => d.length, warnAbove:0 }
];

function renderTopCards() {
  const el = document.getElementById('topCards');
  if (!el) return;
  const d = DUMMY.hospitals;
  el.innerHTML = CARD_META.map((c, i) => {
    const val = c.getter(d);
    const maxVal = typeof c.max === 'function' ? c.max(d) : c.max;
    const pct = maxVal ? Math.min(100, Math.round((val / maxVal) * 100)) : 0;
    const isCrit = (c.warnBelow !== undefined && val < c.warnBelow) || (c.warnAbove !== undefined && val > c.warnAbove);
    return `
    <div class="card${isCrit ? ' crit' : ''}" style="animation-delay:${i*70}ms">
      <div class="card-icon">${c.icon}</div>
      <h4>${c.title}</h4>
      <div class="value">${val}</div>
      <div class="card-bar"><div class="card-bar-fill" style="width:${pct}%"></div></div>
      <div class="delta">of ${typeof maxVal==='number'?maxVal:'—'} total</div>
    </div>`;
  }).join('');
}

/* =========================================================
   CHARTS
   ========================================================= */
let _charts = {};

function initCharts() {
  destroyCharts();
  const labels = generateTimeLabels(7);
  const pink  = 'rgba(216,27,96,0.88)';
  const pink2 = 'rgba(232,54,93,0.65)';
  const blue  = '#3b82f6';

  const c1 = getCtx('chartICU');
  if (c1) _charts.icu = new Chart(c1, {
    type: 'line',
    data: { labels, datasets: [{ label:'ICU Occupancy (%)',
      data: labels.map((_, i) => Math.max(10, Math.round(Math.random()*20 + 60 - i*2))),
      tension:0.4, fill:true, pointRadius:4, pointHoverRadius:6,
      borderColor:pink, backgroundColor:makeGradient(c1,'rgba(216,27,96,0.12)','rgba(216,27,96,0)'), borderWidth:2
    }]}, options: lineOptions('ICU %')
  });

  const c2 = getCtx('chartBlood');
  if (c2) _charts.blood = new Chart(c2, {
    type: 'bar',
    data: { labels, datasets: [{ label:'Blood Units Used',
      data: labels.map(() => Math.round(Math.random()*40 + 30)),
      backgroundColor: labels.map((_, i) => i%2===0 ? pink : pink2),
      borderRadius:8, borderSkipped:false
    }]}, options: barOptions('Units')
  });

  const c3 = getCtx('chartOxygen');
  if (c3) _charts.oxygen = new Chart(c3, {
    type: 'line',
    data: { labels, datasets: [{ label:'Oxygen Demand',
      data: labels.map(() => Math.round(Math.random()*30 + 20)),
      tension:0.35, borderColor:blue, pointRadius:4,
      backgroundColor:'rgba(59,130,246,0.08)', fill:true, borderWidth:2
    }]}, options: lineOptions('Cylinders')
  });

  const c4 = getCtx('chartBeds');
  if (c4) _charts.beds = new Chart(c4, {
    type: 'doughnut',
    data: {
      labels: DUMMY.hospitals.map(h => h.hospital.split('(')[0].trim()),
      datasets: [{ data: DUMMY.hospitals.map(h => h.totalBeds), hoverOffset:8,
        backgroundColor:['#D81B60','#FF4D6D','#f97316','#3b82f6','#22c55e','#a855f7'] }]
    },
    options: { responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{ position:'bottom', labels:{ boxWidth:10, font:{size:11} } }, tooltip:{ mode:'index' } }
    }
  });
}

function destroyCharts() { Object.values(_charts).forEach(c => c && c.destroy()); _charts = {}; }
function getCtx(id) { const el = document.getElementById(id); return el ? el.getContext('2d') : null; }
function makeGradient(ctx, from, to) { const g = ctx.createLinearGradient(0,0,0,220); g.addColorStop(0,from); g.addColorStop(1,to); return g; }
function generateTimeLabels(n) {
  return Array.from({ length:n }, (_,i) => { const d = new Date(); d.setDate(d.getDate()-(n-1-i)); return `${d.getMonth()+1}/${d.getDate()}`; });
}
function lineOptions(yLabel) {
  return { responsive:true,
    plugins:{ legend:{display:false}, tooltip:{mode:'index',intersect:false} },
    scales:{ x:{grid:{display:false},ticks:{font:{size:11}}}, y:{grid:{color:'#f1f3f5'},ticks:{font:{size:11}},title:{display:true,text:yLabel,font:{size:11}}} }
  };
}
function barOptions(yLabel) {
  return { responsive:true,
    plugins:{ legend:{display:false}, tooltip:{mode:'index',intersect:false} },
    scales:{ x:{grid:{display:false},ticks:{font:{size:11}}}, y:{grid:{color:'#f1f3f5'},ticks:{font:{size:11}},title:{display:true,text:yLabel,font:{size:11}}} }
  };
}

/* =========================================================
   TABLE
   ========================================================= */
let _sortKey = null, _sortDir = 1;

function populateTable(data) {
  const tbody = document.querySelector('#hospitalTable tbody');
  if (!tbody) return;
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">🔍</div><p>No hospitals match your filter.</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = data.map(h => `
    <tr>
      <td><strong>${h.hospital}</strong></td>
      <td style="font-family:'DM Mono',monospace;font-size:12px">${h.updated}</td>
      <td>${h.totalBeds}</td><td>${h.icuTotal}</td>
      <td class="${h.icuAvail<=5?'qty-low':''}">${h.icuAvail}</td>
      <td class="${h.bloodUnits<=40?'qty-low':''}">${h.bloodUnits}</td>
      <td class="${h.oxygenCyl<=15?'qty-low':''}">${h.oxygenCyl}</td>
      <td>${renderPill(h.status)}</td>
    </tr>`).join('');
}

function renderPill(status) {
  const map = { Normal:'ok', Warning:'warn', Critical:'crit', Emergency:'crit', Urgent:'warn' };
  return `<span class="pill ${map[status]||'ok'}">${status}</span>`;
}

function bindTableSort() {
  document.querySelectorAll('#hospitalTable thead th[data-key]').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.getAttribute('data-key');
      if (_sortKey===key) { _sortDir*=-1; } else { _sortKey=key; _sortDir=1; }
      document.querySelectorAll('#hospitalTable thead th').forEach(t => t.classList.remove('asc','desc'));
      th.classList.add(_sortDir===1?'asc':'desc');
      const sorted = DUMMY.hospitals.slice().sort((a,b) => {
        const va=a[key], vb=b[key];
        if (typeof va==='number') return (va-vb)*_sortDir;
        return (va+'').localeCompare(vb+'')*_sortDir;
      });
      populateTable(sorted);
    });
  });
}

function bindTableSearch() {
  const input = document.getElementById('tableSearch');
  if (!input) return;
  input.addEventListener('input', e => {
    const q = e.target.value.toLowerCase().trim();
    populateTable(q ? DUMMY.hospitals.filter(h => h.hospital.toLowerCase().includes(q)) : DUMMY.hospitals);
  });
}

function bindExports() {
  document.getElementById('exportCopy')?.addEventListener('click', () => {
    const rows = DUMMY.hospitals.map(h=>[h.hospital,h.updated,h.totalBeds,h.icuTotal,h.icuAvail,h.bloodUnits,h.oxygenCyl,h.status].join('\t'));
    navigator.clipboard?.writeText(rows.join('\n')).then(()=>showToast('Table copied to clipboard','success')).catch(()=>showToast('Clipboard not available','error'));
  });
  document.getElementById('exportExcel')?.addEventListener('click', () => {
    const headers = ['Hospital','Last Updated','Total Beds','ICU Total','ICU Avail','Blood Units','Oxygen Cyl','Status'];
    const rows = DUMMY.hospitals.map(h=>[h.hospital,h.updated,h.totalBeds,h.icuTotal,h.icuAvail,h.bloodUnits,h.oxygenCyl,h.status].map(csvEscape).join(','));
    downloadBlob([headers.join(','),...rows].join('\n'),'hospitals.csv','text/csv');
    showToast('Exported as CSV / Excel','success');
  });
  document.getElementById('exportPDF')?.addEventListener('click', () => { showToast('Preparing PDF print view…','info'); setTimeout(()=>window.print(),600); });
}

function csvEscape(v) { return `"${String(v).replace(/"/g,'""')}"`; }
function downloadBlob(content, filename, mime) {
  const blob = new Blob([content],{type:mime});
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'),{href:url,download:filename});
  a.click(); URL.revokeObjectURL(url);
}

/* =========================================================
   TRANSFERS
   ========================================================= */
function populateTransfers() {
  const list = document.getElementById('transferList');
  if (!list) return;
  updateNotifBadges();
  if (!DUMMY.transfers.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">✅</div><p>No pending transfer requests.</p></div>`;
    return;
  }
  list.innerHTML = DUMMY.transfers.map((t,i) => `
    <div class="transfer-card" id="transfer-${t.id}" style="animation-delay:${i*80}ms">
      <div class="transfer-meta">
        <div class="transfer-route">${escHtml(t.from)} <span class="arrow">→</span> ${escHtml(t.to)}</div>
        <div class="transfer-info">
          <span>🛏️ ICU: ${t.requested.icu}</span>
          <span>🫁 O₂: ${t.requested.oxygen}</span>
          <span>🩸 ${t.requested.bloodGroup}</span>
          <span>🕐 ${t.time}</span>
        </div>
        <div class="muted small">${escHtml(t.notes)}</div>
      </div>
      <div class="transfer-actions">
        ${renderPill(t.criticality)}
        <button class="btn small outline-accent" onclick="openTransferModal('${t.id}')">View</button>
      </div>
    </div>`).join('');
}

function openTransferModal(id) {
  const t = DUMMY.transfers.find(x=>x.id===id); if (!t) return;
  const modal = document.getElementById('transferModal');
  document.getElementById('modalTitle').textContent = `Transfer ${t.id}`;
  document.getElementById('modalBody').innerHTML = `
    <p><strong>From:</strong> ${escHtml(t.from)}</p>
    <p><strong>To:</strong> ${escHtml(t.to)}</p>
    <p><strong>Resources:</strong> ICU ×${t.requested.icu}, O₂ ×${t.requested.oxygen}, Blood: ${t.requested.bloodGroup}</p>
    <p><strong>Criticality:</strong> ${renderPill(t.criticality)}</p>
    <p><strong>Notes:</strong> ${escHtml(t.notes)}</p>
    <p><strong>Requested:</strong> ${t.time}</p>`;
  document.getElementById('modalAccept').onclick = () => { acceptTransfer(id); closeModal('transferModal'); };
  document.getElementById('modalReject').onclick  = () => { rejectTransfer(id); closeModal('transferModal'); };
  modal.classList.remove('hidden');
}

function acceptTransfer(id) { removeTransfer(id); showToast(`Transfer ${id} accepted`,'success'); }
function rejectTransfer(id) { removeTransfer(id); showToast(`Transfer ${id} rejected`,'error'); }

function removeTransfer(id) {
  const card = document.getElementById(`transfer-${id}`);
  if (card) {
    card.classList.add('removing');
    card.addEventListener('animationend', () => { _spliceTransfer(id); populateTransfers(); }, {once:true});
  } else { _spliceTransfer(id); populateTransfers(); }
}
function _spliceTransfer(id) { const i=DUMMY.transfers.findIndex(t=>t.id===id); if(i>=0) DUMMY.transfers.splice(i,1); }

function openNewTransferForm() {
  const existing = document.getElementById('newTransferFormEl');
  if (existing) { existing.remove(); return; }
  const form = document.createElement('div');
  form.id = 'newTransferFormEl'; form.className = 'new-transfer-form';
  form.innerHTML = `
    <h3>New Transfer Request</h3>
    <div class="form-grid">
      <label>From Hospital<input id="ntFrom" placeholder="Source hospital" /></label>
      <label>To Hospital<input id="ntTo" placeholder="Destination hospital" /></label>
      <label>Blood Group<select id="ntBlood"><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option></select></label>
      <label>Criticality<select id="ntCrit"><option>Normal</option><option>Urgent</option><option>Critical</option></select></label>
      <label>ICU Beds Needed<input id="ntIcu" type="number" value="0" min="0" /></label>
      <label>O₂ Cylinders<input id="ntOxy" type="number" value="0" min="0" /></label>
    </div>
    <div style="grid-column:1/-1"><label>Notes<input id="ntNotes" placeholder="Additional notes…" style="width:100%;margin-top:5px" /></label></div>
    <div class="modal-actions" style="margin-top:14px">
      <button class="btn" onclick="submitNewTransfer()">Submit Request</button>
      <button class="btn ghost" onclick="document.getElementById('newTransferFormEl').remove()">Cancel</button>
    </div>`;
  const list = document.getElementById('transferList');
  list.parentElement.insertBefore(form, list);
}

function submitNewTransfer() {
  const from  = document.getElementById('ntFrom')?.value.trim();
  const to    = document.getElementById('ntTo')?.value.trim();
  const blood = document.getElementById('ntBlood')?.value;
  const crit  = document.getElementById('ntCrit')?.value;
  const icu   = Number(document.getElementById('ntIcu')?.value||0);
  const oxy   = Number(document.getElementById('ntOxy')?.value||0);
  const notes = document.getElementById('ntNotes')?.value.trim()||'';
  if (!from||!to) { showToast('Please fill in both hospital names','error'); return; }
  const id = 'T-'+(1000+Math.floor(Math.random()*9000));
  DUMMY.transfers.unshift({id,from,to,requested:{icu,oxygen:oxy,bloodGroup:blood},criticality:crit,time:new Date().toLocaleString(),notes});
  document.getElementById('newTransferFormEl')?.remove();
  populateTransfers();
  showToast(`Transfer request ${id} created`,'success');
}

/* =========================================================
   INVENTORY — connected to real API
   ========================================================= */
let _editingId = null;

function populateInventory() {
  const tbody = document.querySelector('#inventoryTable tbody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;color:#999">Loading…</td></tr>`;

  const user = getUser();
  // Admin sees all inventory, staff sees only their hospital's
  const hospitalParam = (user && user.role !== 'admin' && user.hospital_name)
    ? `?hospital=${encodeURIComponent(user.hospital_name)}`
    : '';

  fetch(`${API_BASE}/api/inventory${hospitalParam}`)
    .then(res => res.json())
    .then(data => {
      if (!data.length) {
        tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">📦</div><p>No inventory items for your hospital.</p></div></td></tr>`;
        return;
      }
      const admin = isAdmin();
      tbody.innerHTML = data.map(it => `
        <tr class="${it.quantity <= 10 ? 'low-stock' : ''}" id="inv-${it.id}">
          <td><strong>${escHtml(it.item_name)}</strong></td>
          <td style="font-family:'DM Mono',monospace;font-size:12px">${escHtml(it.category || '—')}</td>
          <td class="${it.quantity <= 10 ? 'qty-low' : ''}">${it.quantity} ${it.quantity <= 10 ? '⚠️' : ''}</td>
          <td>${escHtml(it.hospital || '—')}</td>
          <td>${admin
            ? `<button class="btn ghost small" onclick="deleteInventory(${it.id})">Delete</button>`
            : '<span style="color:var(--muted);font-size:12px">View only</span>'
          }</td>
        </tr>`).join('');
    })
    .catch(() => {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">⚠️</div><p>Failed to load inventory.</p></div></td></tr>`;
      showToast('Failed to load inventory', 'error');
    });
}

function openInventoryForm() {
  _editingId = null;
  document.getElementById('invModalTitle').textContent = 'Add Inventory Item';
  ['invName','invBatch','invQty','invReorder'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  document.getElementById('inventoryModal').classList.remove('hidden');
}

function closeInventoryModal() { document.getElementById('inventoryModal').classList.add('hidden'); }

function saveInventoryItem() {
  const name  = document.getElementById('invName').value.trim();
  const batch = document.getElementById('invBatch').value.trim();
  const qty   = Number(document.getElementById('invQty').value||0);
  if (!name) { showToast('Item name is required','error'); return; }
  const user = getUser();
  fetch(`${API_BASE}/api/inventory`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ item_name:name, category:batch, quantity:qty, hospital: user?.hospital_name||'MediLink' })
  })
    .then(res=>res.json())
    .then(()=>{ showToast(`"${name}" added to inventory`,'success'); populateInventory(); closeInventoryModal(); })
    .catch(()=>showToast('Failed to save item','error'));
}

function deleteInventory(id) {
  if (!isAdmin()) { showToast('Admin access required','error'); return; }
  fetch(`${API_BASE}/api/inventory/${id}`,{method:'DELETE'})
    .then(res=>res.json())
    .then(()=>{ showToast('Item deleted','info'); populateInventory(); })
    .catch(()=>showToast('Failed to delete item','error'));
}

/* =========================================================
   FAQs
   ========================================================= */
function populateFAQs() {
  const el = document.getElementById('faqAccordion');
  if (!el) return;
  el.innerHTML = DUMMY.faqs.map((f,i) => `
    <div class="qa" id="faq-${i}" style="animation-delay:${i*70}ms">
      <div class="qa-header" onclick="toggleFaq(${i})">
        <h4>${escHtml(f.q)}</h4><span class="qa-chevron">▼</span>
      </div>
      <div class="qa-body"><p>${escHtml(f.a)}</p></div>
    </div>`).join('');
}

function toggleFaq(i) {
  const el = document.getElementById(`faq-${i}`); if (!el) return;
  const wasOpen = el.classList.contains('open');
  document.querySelectorAll('.qa.open').forEach(q=>q.classList.remove('open'));
  if (!wasOpen) el.classList.add('open');
}

/* =========================================================
   NOTIFICATIONS
   ========================================================= */
function updateNotifBadges() {
  const count = DUMMY.transfers.length;
  ['notifBadge','notifBadge2'].forEach(id => {
    const badge = document.getElementById(id); if (!badge) return;
    badge.textContent = count; badge.dataset.count = count;
  });
  _renderNotifPanels();
}

function _renderNotifPanels() {
  [['notifList','notifPanelCount'],['notifList2','notifPanelCount2']].forEach(([listId,countId]) => {
    const list = document.getElementById(listId);
    const countEl = document.getElementById(countId);
    if (!list) return;
    if (countEl) countEl.textContent = DUMMY.transfers.length ? `(${DUMMY.transfers.length})` : '';
    if (!DUMMY.transfers.length) { list.innerHTML = '<div class="notif-empty">No pending notifications</div>'; return; }
    list.innerHTML = DUMMY.transfers.map(t => {
      const dotClass = t.criticality==='Critical'?'critical':t.criticality==='Urgent'?'urgent':'normal';
      return `<div class="notif-item">
        <div class="notif-dot ${dotClass}"></div>
        <div class="notif-body">
          <div class="notif-title">${escHtml(t.criticality)} Transfer — ${escHtml(t.id)}</div>
          <div class="notif-sub">${escHtml(t.from)} → ${escHtml(t.to)}</div>
          <div class="notif-time">${escHtml(t.time)}</div>
        </div>
      </div>`;
    }).join('');
  });
}

function _toggleNotifPanel(panelId) {
  const panel = document.getElementById(panelId); if (!panel) return;
  const isOpen = panel.classList.contains('open');
  document.querySelectorAll('.notif-panel.open').forEach(p=>p.classList.remove('open'));
  if (!isOpen) { _renderNotifPanels(); panel.classList.add('open'); }
}

function goToTransfers() { window.location.href = 'transfers.html'; }

/* =========================================================
   MODAL HELPERS
   ========================================================= */
function closeModal(id='transferModal') { document.getElementById(id)?.classList.add('hidden'); }

document.addEventListener('click', e => {
  ['transferModal','inventoryModal'].forEach(id => {
    const modal = document.getElementById(id);
    if (modal && e.target===modal) modal.classList.add('hidden');
  });
  if (!e.target.closest('.notif-wrapper')) document.querySelectorAll('.notif-panel.open').forEach(p=>p.classList.remove('open'));
  if (!e.target.closest('.profile-wrapper')) document.getElementById('profilePanel')?.classList.remove('open');
});

/* =========================================================
   UTILITIES
   ========================================================= */
function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* =========================================================
   HOSPITALS API — normalize DB rows to frontend shape
   ========================================================= */
function _normalizeHospital(row) {
  return {
    id:         row.hospital_id,
    hospital:   row.hospital_name,
    state:      row.state        || '—',
    updated:    row.updated_at   ? new Date(row.updated_at).toLocaleString('en-IN') : '—',
    totalBeds:  row.total_beds   || 0,
    icuTotal:   row.icu_total    || 0,
    icuAvail:   row.icu_avail    || 0,
    bloodUnits: row.blood_units  || 0,
    oxygenCyl:  row.oxygen_cyl   || 0,
    status:     row.status       || 'Normal'
  };
}

async function loadHospitals() {
  try {
    const res  = await fetch(`${API_BASE}/api/hospitals`);
    const data = await res.json();
    if (Array.isArray(data) && data.length) {
      DUMMY.hospitals = data.map(_normalizeHospital);
    }
  } catch (e) {
    console.warn('Could not fetch hospitals from API, using dummy data.', e);
  }
}

/* =========================================================
   INIT
   ========================================================= */
document.addEventListener('DOMContentLoaded', async () => {
  applyRoleUI();

  await loadHospitals();

  populateFilters();
  renderTopCards();
  initCharts();
  populateTable(DUMMY.hospitals);
  populateTransfers();
  populateInventory();
  populateFAQs();
  updateNotifBadges();

  document.getElementById('notifBtn')?.addEventListener('click', ()=>_toggleNotifPanel('notifPanel'));
  document.getElementById('notifBtn2')?.addEventListener('click', ()=>_toggleNotifPanel('notifPanel2'));
  document.getElementById('profileBtn')?.addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('profilePanel')?.classList.toggle('open');
  });

  bindTableSort();
  bindTableSearch();
  bindExports();
  updateSyncTime();
  _scheduleSyncStale();

  document.getElementById('filterPeriod')?.addEventListener('change', () => {
    destroyCharts(); initCharts(); updateSyncTime(); _scheduleSyncStale();
    showToast('Charts updated','info',1800);
  });
});

/* =========================================================
   SIDEBAR SYNC TIME
   ========================================================= */
function updateSyncTime() {
  const el = document.getElementById('syncTime');
  const dot = document.getElementById('syncDot');
  if (!el) return;
  el.textContent = new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
  if (dot) dot.classList.remove('stale');
}

let _syncStaleTimer = null;
function _scheduleSyncStale() {
  clearTimeout(_syncStaleTimer);
  _syncStaleTimer = setTimeout(() => {
    const dot = document.getElementById('syncDot');
    if (dot) dot.classList.add('stale');
  }, 5*60*1000);
}

/* =========================================================
   End of script.js — v4
   ========================================================= */