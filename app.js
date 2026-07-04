/* ============================================================
   Router
   ============================================================ */
const PAGES = {
  dashboard: () => Dashboard.render(),
  workouts:  () => Workouts.render(),
  nutrition: () => Nutrition.render(),
  goals:     () => Goals.render(),
  profile:   () => Profile.render(),
};

function navigate(page, el) {
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  if (el) el.classList.add('active');
  const main = document.getElementById('mainContent');
  main.innerHTML = '<div class="spinner"></div>';
  // Simulate short async transition
  setTimeout(() => { main.innerHTML = ''; PAGES[page]?.(); }, 120);
}

/* ============================================================
   Toast helper (used across pages)
   ============================================================ */
function toast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = (type === 'success' ? '✅ ' : '⚠️ ') + msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2400);
}

/* ============================================================
   Modal helper
   ============================================================ */
function openModal(title, bodyHTML, onSubmit) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <h3>${title}</h3>
      <form class="modal-body" id="__modalForm">${bodyHTML}</form>
      <div class="modal-actions">
        <button class="btn btn-ghost" type="button" id="__cancel">Cancel</button>
        <button class="btn btn-primary" style="width:auto;padding:10px 18px" type="submit" form="__modalForm">Save</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  const close = () => overlay.remove();
  overlay.querySelector('#__cancel').onclick = close;
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  overlay.querySelector('#__modalForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    onSubmit(data, close);
  });
}

/* ============================================================
   Boot
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  if (API.currentUser()) enterApp();
  else showTab('login');
});