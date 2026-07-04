const Workouts = (() => {
  function render() {
    const rows = API.workouts.list();
    document.getElementById('mainContent').innerHTML = `
      <div class="page-header">
        <div><h1>Workouts</h1><div class="subtitle">${rows.length} sessions logged</div></div>
        <div class="page-actions">
          <button class="btn btn-primary" style="width:auto;padding:10px 18px" onclick="Workouts.openAdd()">+ New Workout</button>
        </div>
      </div>

      ${rows.length === 0 ? `
        <div class="empty-state">
          <div class="icon">🏋️</div><h4>No workouts yet</h4>
          <p>Click "New Workout" to log your first session.</p>
        </div>` : `
        <div class="workout-list">
          ${rows.slice().reverse().map(w => `
            <div class="workout-card">
              <div class="workout-info">
                <h4>${w.name}</h4>
                <div class="meta">
                  <span class="chip primary">⏱️ ${w.duration} min</span>
                  <span class="chip cyan">🔥 ${w.calories} kcal</span>
                  <span class="chip">📅 ${w.date}</span>
                  <span class="chip">💪 ${w.exercises?.length || 0} exercises</span>
                </div>
              </div>
              <div style="display:flex;gap:8px">
                <button class="btn btn-secondary btn-sm" onclick="Workouts.view('${w.id}')">View</button>
                <button class="btn btn-danger btn-sm" onclick="Workouts.remove('${w.id}')">Delete</button>
              </div>
            </div>`).join('')}
        </div>`}
    `;
  }

  function openAdd() {
    openModal('Log a Workout', `
      <div class="form-group"><label>Workout Name</label><input name="name" required placeholder="e.g. Push Day"/></div>
      <div class="form-row">
        <div class="form-group"><label>Duration (min)</label><input type="number" name="duration" required placeholder="45"/></div>
        <div class="form-group"><label>Calories</label><input type="number" name="calories" required placeholder="350"/></div>
      </div>
      <div class="form-group"><label>Date</label><input type="date" name="date" value="${API._today()}" required/></div>
    `, (data, close) => {
      API.workouts.add({ ...data, duration: +data.duration, calories: +data.calories, exercises: [] });
      close(); render(); toast('Workout logged');
    });
  }

  function view(id) {
    const w = API.workouts.list().find(x => x.id === id);
    if (!w) return;
    document.getElementById('mainContent').innerHTML = `
      <div class="page-header">
        <div><h1>${w.name}</h1><div class="subtitle">${w.date} • ${w.duration} min • ${w.calories} kcal</div></div>
        <div class="page-actions">
          <button class="btn btn-secondary" onclick="Workouts.render()">← Back</button>
        </div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Exercise</th><th>Sets</th><th>Reps</th><th>Weight</th></tr></thead>
          <tbody>
            ${(w.exercises||[]).map(e => `<tr><td>${e.name}</td><td>${e.sets}</td><td>${e.reps}</td><td>${e.weight} kg</td></tr>`).join('')
              || '<tr><td colspan="4" style="text-align:center;color:var(--text-dim)">No exercises recorded</td></tr>'}
          </tbody>
        </table>
      </div>`;
  }

  function remove(id) {
    if (!confirm('Delete this workout?')) return;
    API.workouts.remove(id); render(); toast('Workout deleted', 'error');
  }

  return { render, openAdd, view, remove };
})();