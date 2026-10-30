// Applies the saved theme before first paint.
try { var p = JSON.parse(localStorage.getItem('sf_prefs') || '{}'); if (p.theme === 'light') document.documentElement.classList.add('light'); } catch (e) {}
