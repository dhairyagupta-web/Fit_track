const Nutrition = (() => {
  const TARGETS = { kcal: 2500, protein: 150, carbs: 300, fat: 70 };

  function render() {
    const meals = API.meals.list().filter(m => m.date === API._today());
    const tot = meals.reduce((s,m) => ({
      kcal: s.kcal + m.kcal, protein: s.protein + m.protein,
      carbs: s.carbs + m.carbs, fat: s.fat + m.fat
    }), { kcal:0, protein:0, carbs:0, fat:0 });

    const ring = (val, target, color) => {
      const pct = Math.min(100, Math.round((val / target) * 100));
      return `<div class="macro-ring" style="--value:${pct};--color:${color}"><span>${pct}%</span></div>`;
    };

    document.getElementById('mainContent').innerHTML = `
      <div class="page-header">
        <div><h1>Nutrition</h1><div class="subtitle">Today's intake tracking</div></div>
        <div class="page-actions">
          <button class="btn btn-primary" style="width:auto;padding:10px 18px" onclick="Nutrition.openAdd()">+ Add Meal</button>
        </div>
      </div>

      <div class="macro-grid">
        <div class="macro-card">${ring(tot.kcal, TARGETS.kcal, '#b6ff3c')}
          <div class="macro-info"><div class="label">Calories</div><div class="value">${tot.kcal} / ${TARGETS.kcal}</div></div></div>
        <div class="macro-card">${ring(tot.protein, TARGETS.protein, '#22d3ee')}
          <div class="macro-info"><div class="label">Protein</div><div class="value">${tot.protein}g / ${TARGETS.protein}g</div></div></div>
        <div class="macro-card">${ring(tot.carbs, TARGETS.carbs, '#fbbf24')}
          <div class="macro-info"><div class="label">Carbs</div><div class="value">${tot.carbs}g / ${TARGETS.carbs}g</div></div></div>
        <div class="macro-card">${ring(tot.fat, TARGETS.fat, '#ff5c7a')}
          <div class="macro-info"><div class="label">Fat</div><div class="value">${tot.fat}g / ${TARGETS.fat}g</div></div></div>
      </div>

      <div class="chart-card" style="margin-top:24px">
        <h3>Today's Meals</h3>
        ${meals.length === 0 ? `
          <div class="empty-state"><div class="icon">🥗</div><h4>No meals logged</h4><p>Track what you eat to hit your macros.</p></div>` :
          meals.map(m => `
            <div class="meal-card" style="margin-top:10px">
              <div>
                <div style="font-weight:600">${m.name} <span class="chip">${m.type}</span></div>
                <div style="color:var(--text-dim);font-size:12.5px;margin-top:4px">
                  P: ${m.protein}g • C: ${m.carbs}g • F: ${m.fat}g
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:12px">
                <span class="kcal">${m.kcal} kcal</span>
                <button class="btn btn-danger btn-sm" onclick="Nutrition.remove('${m.id}')">✕</button>
              </div>
            </div>`).join('')}
      </div>`;
  }

  function openAdd() {
    openModal('Add Meal', `
      <div class="form-row">
        <div class="form-group"><label>Meal Name</label><input name="name" required placeholder="Chicken Salad"/></div>
        <div class="form-group"><label>Type</label>
          <select name="type">
            <option>Breakfast</option><option>Lunch</option>
            <option>Dinner</option><option>Snack</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Calories</label><input type="number" name="kcal" required placeholder="450"/></div>
        <div class="form-group"><label>Protein (g)</label><input type="number" name="protein" required placeholder="35"/></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Carbs (g)</label><input type="number" name="carbs" required placeholder="40"/></div>
        <div class="form-group"><label>Fat (g)</label><input type="number" name="fat" required placeholder="12"/></div>
      </div>
    `, (data, close) => {
      API.meals.add({
        name: data.name, type: data.type, date: API._today(),
        kcal: +data.kcal, protein: +data.protein, carbs: +data.carbs, fat: +data.fat,
      });
      close(); render(); toast('Meal added');
    });
  }

  function remove(id) { API.meals.remove(id); render(); toast('Meal removed', 'error'); }

  return { render, openAdd, remove };
})();