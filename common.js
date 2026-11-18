/* Shared helpers: navigation bar, score storage (localStorage), overlay UI, controls. */
const $ = id => document.getElementById(id);

// ---- Navigation (injected into <div id="nav"> on every page) ----
(function () {
  const pages = [['index.html','Home'],['flappy.html','Flappy'],['snake.html','Snake'],['cricket.html','Cricket'],
                 ['chess.html','Chess'],['leaderboard.html','Leaderboard'],['howto.html','How to Play']];
  const here = location.pathname.split('/').pop() || 'index.html';
  const nav = $('nav'); if (!nav) return;
  nav.className = 'nav';
  nav.innerHTML = '<a class="brand" href="index.html">🎮 Play Hub</a>' +
    pages.map(([h,t]) => `<a href="${h}"${h===here?' class="active"':''}>${t}</a>`).join('');
})();

const Arcade = {
  KEY: 'playhub_scores_v1',
  all() { try { return JSON.parse(localStorage.getItem(this.KEY)) || {}; } catch (e) { return {}; } },
  top(g) { return (this.all()[g] || []).slice().sort((a,b) => b.score - a.score).slice(0, 10); },
  best(g) { const t = this.top(g); return t.length ? t[0].score : 0; },
  add(g, name, score) {
    const a = this.all(); (a[g] = a[g] || []).push({ name, score, date: new Date().toLocaleDateString() });
    try { localStorage.setItem(this.KEY, JSON.stringify(a)); } catch (e) {}
  },
  clear() { try { localStorage.removeItem(this.KEY); } catch (e) {} },
  // ---- Overlay (start / pause / game-over screens) ----
  show(title, msg, label, fn) {
    const o = $('overlay'); o.hidden = false;
    o.innerHTML = `<h2>${title}</h2><p>${msg}</p>` + (label ? `<button class="btn" id="ob">${label}</button>` : '');
    if (label) $('ob').onclick = fn;
  },
  hide() { $('overlay').hidden = true; },
  // Game-over screen with name entry; saves to the leaderboard.
  gameOver(game, score, again, title = 'Game Over', line = 'Score: ' + score, saveLabel = 'Save score') {
    const o = $('overlay'); o.hidden = false;
    o.innerHTML = `<h2>${title}</h2><p>${line}</p>` +
      (score > 0 ? '<input id="pn" maxlength="12" placeholder="Your name"><button class="btn alt" id="ps">' + saveLabel + '</button>' : '') +
      '<button class="btn" id="pa">Play again</button>';
    if (score > 0) {
      let saved = ''; try { saved = localStorage.getItem('playhub_name') || ''; } catch (e) {}
      $('pn').value = saved;
      $('ps').onclick = () => {
        const n = $('pn').value.trim() || 'Player';
        try { localStorage.setItem('playhub_name', n); } catch (e) {}
        this.add(game, n, score); $('ps').outerHTML = '<p>✅ Saved!</p>'; $('pn').remove();
        const b = $('best'); if (b) b.textContent = this.best(game);
      };
    }
    $('pa').onclick = again;
  },
  // Wire Start / Pause / Restart buttons and the P key.
  bind(api) {
    $('btnStart').onclick = api.start; $('btnPause').onclick = api.pause; $('btnRestart').onclick = api.restart;
    this.key(e => { if (e.key === 'p' || e.key === 'P') api.pause(); });
  },
  key(fn) { document.addEventListener('keydown', e => { if (e.target.tagName !== 'INPUT') fn(e); }); },
  // Swipe detection for touch devices
  swipe(el, fn) {
    let sx, sy;
    el.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    el.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.max(Math.abs(dx), Math.abs(dy)) > 20) fn(Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]);
    });
  }
};
