const Profile = (() => {
  const GOALS = {
    stay_fit: 'Stay Fit', lose_weight: 'Lose Weight',
    build_muscle: 'Build Muscle', increase_stamina: 'Increase Stamina',
  };

  function render() {
    const u = API.currentUser();
    const initials = u.name.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase();
    const workouts = API.workouts.list().length;
    const meals = API.meals.list().length;
    const goals = API.goals.list().length;

    document.getElementById('mainContent').innerHTML = `
      <div class="page-header">
        <div><h1>Profile</h1><div class="subtitle">Manage your account and preferences</div></div>
      </div>

      <div class="profile-hero">
        <div class="avatar">${initials}</div>
        <div style="flex:1;min-width:220px">
          <h2>${u.name}</h2>
          <div class="email">${u.email}</div>
          <div class="profile-stats">
            <div class="stat"><div class="n">${workouts}</div><div class="l">Workouts</div></div>
            <div class="stat"><div class="n">${meals}</div><div class="l">Meals</div></div>
            <div class="stat"><div class="n">${goals}</div><div class="l">Goals</div></div>
            <div class="stat"><div class="n">${u.joined || '—'}</div><div class="l">Joined</div></div>
          </div>
        </div>
        <button class="btn btn-primary" style="width:auto;padding:10px 18px" onclick="Profile.edit()">Edit Profile</button>
      </div>

      <div class="grid grid-2" style="margin-top:24px">
        <div class="settings-card">
          <h3>Personal Info</h3>
          <div class="settings-row"><span class="k">Age</span><span class="v">${u.age || '—'} yrs</span></div>
          <div class="settings-row"><span class="k">Weight</span><span class="v">${u.weight || '—'} kg</span></div>
          <div class="settings-row"><span class="k">Height</span><span class="v">${u.height || '—'} cm</span></div>
          <div class="settings-row"><span class="k">Fitness Goal</span><span class="v">${GOALS[u.goal] || '—'}</span></div>
        </div>

        <div class="settings-card">
          <h3>Preferences</h3>
          <div class="settings-row"><span class="k">Email Notifications</span>
            <label class="toggle"><input type="checkbox" checked/><span class="slider"></span></label></div>
          <div class="settings-row"><span class="k">Weekly Summary</span>
            <label class="toggle"><input type="checkbox" checked/><span class="slider"></span></label></div>
          <div class="settings-row"><span class="k">Dark Mode</span>
            <label class="toggle"><input type="checkbox" checked disabled/><span class="slider"></span></label></div>
          <div class="settings-row">
            <span class="k">Danger Zone</span>
            <button class="btn btn-danger btn-sm" onclick="Profile.resetData()">Reset All Data</button>
          </div>
        </div>
      </div>`;
  }

  function edit() {
    const u = API.currentUser();
    openModal('Edit Profile', `
      <div class="form-group"><label>Full Name</label><input name="name" value="${u.name}" required/></div>
      <div class="form-row">
        <div class="form-group"><label>Age</label><input type="number" name="age" value="${u.age||''}"/></div>
        <div class="form-group"><label>Weight (kg)</label><input type="number" name="weight" value="${u.weight||''}"/></div>
        <div class="form-group"><label>Height (cm)</label><input type="number" name="height" value="${u.height||''}"/></div>
      </div>
      <div class="form-group"><label>Fitness Goal</label>
        <select name="goal">
          ${Object.entries(GOALS).map(([k,v]) => `<option value="${k}" ${u.goal===k?'selected':''}>${v}</option>`).join('')}
        </select>
      </div>
    `, (data, close) => {
      API.updateUser({
        name: data.name, age: +data.age || null,
        weight: +data.weight || null, height: +data.height || null,
        goal: data.goal,
      });
      close(); render(); toast('Profile updated');
    });
  }

  function resetData() {
    if (!confirm('This will remove all your workouts, meals and goals. Continue?')) return;
    const u = API.currentUser();
    ['ft_workouts','ft_meals','ft_goals'].forEach(k => {
      const rows = JSON.parse(localStorage.getItem(k) || '[]').filter(r => r.userId !== u.id);
      localStorage.setItem(k, JSON.stringify(rows));
    });
    render(); toast('Data reset', 'error');
  }

  return { render, edit, resetData };
})();