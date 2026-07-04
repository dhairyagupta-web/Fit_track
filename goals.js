const Goals = (() => {
  function render() {
    const goals = API.goals.list();
    document.getElementById('mainContent').innerHTML = `
      <div class="page-header">
        <div><h1>Goals</h1><div class="subtitle">${goals.length} active goals</div></div>
        <div class="page-actions">
          <button class="btn btn-primary" style="width:auto;padding:10px 18px" onclick="Goals.openAdd()">+ New Goal</button>
        </div>
      </div>

      ${goals.length === 0 ? `
        <div class="empty-state"><div class="icon">🎯</div><h4>No goals yet</h4><p>Set a goal to start tracking progress.</p></div>` : `
        <div class="grid grid-2">
          ${goals.map(g => {
            const pct = g.inverse
              ? Math.max(0, Math.min(100, Math.round((g.target / g.current) * 100)))
              : Math.max(0, Math.min(100, Math.round((g.current / g.target) * 100)));
            return `
              <div class="goal-card">
                <div class="goal-head">
                  <h4>${g.title}</h4>
                  <span class="chip primary">${pct}%</span>
                </div>
                <div class="goal-target">Kind: ${g.kind}</div>
                <div class="progress"><div class="progress-bar" style="width:${pct}%"></div></div>
                <div class="progress-meta">
                  <span>Current: <strong>${g.current} ${g.unit}</strong></span>
                  <span>Target: <strong>${g.target} ${g.unit}</strong></span>
                </div>
                <div style="display:flex;gap:8px;margin-top:6px">
                  <button class="btn btn-secondary btn-sm" onclick="Goals.updateCurrent('${g.id}')">Update</button>
                  <button class="btn btn-danger btn-sm" onclick="Goals.remove('${g.id}')">Delete</button>
                </div>
              </div>`;
          }).join('')}
        </div>`}
    `;
  }

  function openAdd() {
    openModal('New Goal', `
      <div class="form-group"><label>Title</label><input name="title" required placeholder="Bench Press 100kg"/></div>
      <div class="form-row">
        <div class="form-group"><label>Kind</label>
          <select name="kind">
            <option value="strength">Strength</option>
            <option value="cardio">Cardio</option>
            <option value="nutrition">Nutrition</option>
            <option value="habit">Habit</option>
          </select>
        </div>
        <div class="form-group"><label>Unit</label><input name="unit" required placeholder="kg / min / kcal"/></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Current</label><input type="number" name="current" required placeholder="0"/></div>
        <div class="form-group"><label>Target</label><input type="number" name="target" required placeholder="100"/></div>
      </div>
    `, (data, close) => {
      API.goals.add({
        title: data.title, kind: data.kind, unit: data.unit,
        current: +data.current, target: +data.target,
        inverse: data.kind === 'cardio',
      });
      close(); render(); toast('Goal created');
    });
  }

  function updateCurrent(id) {
    const g = API.goals.list().find(x => x.id === id);
    const v = prompt(`Update current value for "${g.title}" (${g.unit}):`, g.current);
    if (v === null) return;
    API.goals.update(id, { current: +v });
    render(); toast('Progress updated');
  }

  function remove(id) {
    if (!confirm('Delete this goal?')) return;
    API.goals.remove(id); render(); toast('Goal deleted', 'error');
  }

  return { render, openAdd, updateCurrent, remove };
})();