const Dashboard = (() => {
  function render() {
    const user = API.currentUser();
    const workouts = API.workouts.list();
    const meals = API.meals.list();
    const goals = API.goals.list();

    const kcalToday = meals.filter(m => m.date === API._today()).reduce((s, m) => s + m.kcal, 0);
    const minutesToday = workouts.filter(w => w.date === API._today()).reduce((s, w) => s + w.duration, 0);
    const goalProgress = goals.length
      ? Math.round(goals.reduce((s, g) => s + Math.min(100, (g.current / g.target) * 100), 0) / goals.length)
      : 0;

    const html = `
      <div class="page-header">
        <div>
          <h1>Welcome back, ${user.name.split(' ')[0]} 👋</h1>
          <div class="subtitle">Here's your fitness snapshot for today.</div>
        </div>
        <div class="page-actions">
          <button class="btn btn-secondary" onclick="navigate('workouts', document.querySelector('[data-page=workouts]'))">View Workouts</button>
          <button class="btn btn-primary" style="width:auto;padding:10px 18px" onclick="Workouts.openAdd()">+ Log Workout</button>
        </div>
      </div>

      <div class="grid grid-4">
        <div class="stat-card">
          <div class="stat-icon">🔥</div>
          <div class="stat-label">Calories Today</div>
          <div class="stat-value">${kcalToday}<span class="stat-unit">kcal</span></div>
          <span class="stat-delta up">▲ Logged ${meals.filter(m=>m.date===API._today()).length} meals</span>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-label">Active Minutes</div>
          <div class="stat-value">${minutesToday}<span class="stat-unit">min</span></div>
          <span class="stat-delta up">▲ ${workouts.filter(w=>w.date===API._today()).length} workouts today</span>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-label">Goals Progress</div>
          <div class="stat-value">${goalProgress}<span class="stat-unit">%</span></div>
          <span class="stat-delta ${goalProgress>=50?'up':'down'}">${goals.length} active goals</span>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⚡</div>
          <div class="stat-label">Total Workouts</div>
          <div class="stat-value">${workouts.length}</div>
          <span class="stat-delta up">Keep it up!</span>
        </div>
      </div>

      <div class="grid grid-2" style="margin-top:24px">
        <div class="chart-card">
          <h3>Weekly Activity</h3>
          <div class="chart-placeholder" id="chart"></div>
        </div>
        <div class="chart-card">
          <h3>Recent Activity</h3>
          <ul class="activity-list">
            ${[...workouts].slice(-4).reverse().map(w => `
              <li class="activity-item">
                <div class="activity-icon">🏋️</div>
                <div class="activity-body">
                  <div class="activity-title">${w.name}</div>
                  <div class="activity-meta">${w.duration} min • ${w.calories} kcal • ${w.date}</div>
                </div>
              </li>`).join('') || '<div class="empty-state"><div class="icon">📭</div><h4>No activity yet</h4><p>Log your first workout to see it here.</p></div>'}
          </ul>
        </div>
      </div>
    `;
    document.getElementById('mainContent').innerHTML = html;
    drawChart();
  }

  // Minimal SVG bar chart (last 7 days workouts + meals)
  function drawChart() {
    const el = document.getElementById('chart');
    if (!el) return;
    const days = [...Array(7)].map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });
    const wData = days.map(d => API.workouts.list().filter(w => w.date === d).reduce((s,w)=>s+w.duration,0));
    const max = Math.max(...wData, 60);
    const W = el.clientWidth, H = 240, pad = 24, bw = (W - pad*2) / days.length - 8;
    el.innerHTML = `
      <svg width="${W}" height="${H}" style="display:block">
        ${wData.map((v,i) => {
          const h = ((v/max) * (H - pad*2)) || 4;
          const x = pad + i * (bw + 8);
          const y = H - pad - h;
          return `<rect x="${x}" y="${y}" width="${bw}" height="${h}" rx="6"
             fill="url(#g1)" opacity="0.9"><title>${days[i]}: ${v} min</title></rect>
             <text x="${x + bw/2}" y="${H - 6}" text-anchor="middle" font-size="11"
             fill="#9aa4b8">${days[i].slice(5)}</text>`;
        }).join('')}
        <defs>
          <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stop-color="#b6ff3c"/>
            <stop offset="1" stop-color="#22d3ee"/>
          </linearGradient>
        </defs>
      </svg>`;
  }

  return { render };
})();