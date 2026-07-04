function showTab(tab) {
  document.querySelectorAll('.tab-btn').forEach((b, i) => {
    b.classList.toggle('active', (tab === 'login' && i === 0) || (tab === 'register' && i === 1));
  });
  document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
  document.getElementById('registerForm').classList.toggle('hidden', tab !== 'register');
  document.getElementById('loginError').textContent = '';
  document.getElementById('registerError').textContent = '';
}

function handleLogin(e) {
  e.preventDefault();
  const err = document.getElementById('loginError');
  err.textContent = '';
  try {
    API.login(
      document.getElementById('loginEmail').value.trim(),
      document.getElementById('loginPassword').value
    );
    enterApp();
  } catch (ex) { err.textContent = ex.message; }
}

function handleRegister(e) {
  e.preventDefault();
  const err = document.getElementById('registerError');
  err.textContent = '';
  try {
    API.register({
      name:     document.getElementById('regName').value.trim(),
      email:    document.getElementById('regEmail').value.trim(),
      password: document.getElementById('regPassword').value,
      age:      +document.getElementById('regAge').value    || null,
      weight:   +document.getElementById('regWeight').value || null,
      height:   +document.getElementById('regHeight').value || null,
      goal:     document.getElementById('regGoal').value,
    });
    enterApp();
  } catch (ex) { err.textContent = ex.message; }
}

function enterApp() {
  document.body.classList.remove('auth-page');
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  navigate('dashboard', document.querySelector('.nav-link[data-page="dashboard"]'));
}

function logout() {
  API.logout();
  document.body.classList.add('auth-page');
  document.getElementById('app').classList.add('hidden');
  document.getElementById('authScreen').classList.remove('hidden');
  document.getElementById('loginForm').reset();
  document.getElementById('registerForm').reset();
  showTab('login');
}