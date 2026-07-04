/* ============================================================
   FitTrack API - localStorage-backed demo layer
   ============================================================ */
const API = (() => {
  const K = {
    USERS: 'ft_users',
    SESSION: 'ft_session',
    WORKOUTS: 'ft_workouts',
    MEALS: 'ft_meals',
    GOALS: 'ft_goals',
  };

  const read  = (k, d) => JSON.parse(localStorage.getItem(k) || JSON.stringify(d));
  const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const uid   = () => Math.random().toString(36).slice(2, 10);
  const today = () => new Date().toISOString().slice(0, 10);

  // ---- Seed demo data on first load ----
  function seed() {
    if (localStorage.getItem('ft_seeded')) return;
    const demoId = 'demo-user';
    write(K.USERS, [{
      id: demoId,
      name: 'Rahul Sharma',
      email: 'rahul@demo.com',
      password: 'password123',
      age: 24, weight: 72, height: 178, goal: 'build_muscle',
      joined: today(),
    }]);
    write(K.WORKOUTS, [
      { id: uid(), userId: demoId, name: 'Push Day',  date: today(), duration: 55, calories: 420, exercises: [
          { name: 'Bench Press',    sets: 4, reps: 8,  weight: 60 },
          { name: 'Shoulder Press', sets: 3, reps: 10, weight: 25 },
          { name: 'Triceps Pushdown', sets: 3, reps: 12, weight: 20 } ] },
      { id: uid(), userId: demoId, name: 'Leg Day',   date: today(), duration: 60, calories: 510, exercises: [
          { name: 'Squat',    sets: 4, reps: 8, weight: 80 },
          { name: 'Deadlift', sets: 3, reps: 6, weight: 100 } ] },
    ]);
    write(K.MEALS, [
      { id: uid(), userId: demoId, date: today(), name: 'Oats & Banana', kcal: 380, protein: 14, carbs: 62, fat: 8,  type: 'Breakfast' },
      { id: uid(), userId: demoId, date: today(), name: 'Grilled Chicken Bowl', kcal: 620, protein: 45, carbs: 55, fat: 18, type: 'Lunch' },
      { id: uid(), userId: demoId, date: today(), name: 'Protein Shake', kcal: 220, protein: 30, carbs: 12, fat: 4,  type: 'Snack' },
    ]);
    write(K.GOALS, [
      { id: uid(), userId: demoId, title: 'Bench Press 80kg', target: 80, current: 60, unit: 'kg', kind: 'strength' },
      { id: uid(), userId: demoId, title: 'Run 5K under 25 min', target: 25, current: 28, unit: 'min', kind: 'cardio', inverse: true },
      { id: uid(), userId: demoId, title: 'Daily 2500 kcal', target: 2500, current: 1220, unit: 'kcal', kind: 'nutrition' },
      { id: uid(), userId: demoId, title: 'Workout 4x per week', target: 4, current: 2, unit: 'sessions', kind: 'habit' },
    ]);
    localStorage.setItem('ft_seeded', '1');
  }
  seed();

  // ---- Auth ----
  function register(payload) {
    const users = read(K.USERS, []);
    if (users.find(u => u.email === payload.email)) throw new Error('Email already registered');
    if (!payload.password || payload.password.length < 6) throw new Error('Password must be at least 6 characters');
    const user = { id: uid(), joined: today(), ...payload };
    users.push(user); write(K.USERS, users);
    write(K.SESSION, user.id);
    return user;
  }
  function login(email, password) {
    const user = read(K.USERS, []).find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid email or password');
    write(K.SESSION, user.id);
    return user;
  }
  function logout() { localStorage.removeItem(K.SESSION); }
  function currentUser() {
    const id = JSON.parse(localStorage.getItem(K.SESSION) || 'null');
    return id ? read(K.USERS, []).find(u => u.id === id) : null;
  }
  function updateUser(patch) {
    const users = read(K.USERS, []);
    const idx = users.findIndex(u => u.id === currentUser()?.id);
    if (idx < 0) throw new Error('Not authenticated');
    users[idx] = { ...users[idx], ...patch };
    write(K.USERS, users);
    return users[idx];
  }

  // ---- Generic CRUD factory ----
  const scoped = (key) => ({
    list: () => read(key, []).filter(r => r.userId === currentUser()?.id),
    add:  (data) => { const rows = read(key, []); const rec = { id: uid(), userId: currentUser().id, ...data }; rows.push(rec); write(key, rows); return rec; },
    update: (id, patch) => { const rows = read(key, []); const i = rows.findIndex(r => r.id === id); if (i < 0) return null; rows[i] = { ...rows[i], ...patch }; write(key, rows); return rows[i]; },
    remove: (id) => { const rows = read(key, []).filter(r => r.id !== id); write(key, rows); },
  });

  return {
    register, login, logout, currentUser, updateUser,
    workouts:  scoped(K.WORKOUTS),
    meals:     scoped(K.MEALS),
    goals:     scoped(K.GOALS),
    _today: today,
  };
})();