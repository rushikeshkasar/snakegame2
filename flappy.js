/* Flappy Hop – tap/Space to flap through gaps in the pillars. All art is drawn with canvas shapes. */
const cv = $('c'), x = cv.getContext('2d'), W = cv.width, H = cv.height;
const GAP = 135, PW = 52, BX = 90;
let st, bird, pipes, score, last, timer;

function upd() { $('score').textContent = score; $('best').textContent = Arcade.best('flappy'); }
function reset() {
  bird = { y: H / 2, v: 0 }; pipes = []; score = 0; timer = 70; st = 'ready'; upd(); draw();
  Arcade.show('Flappy Hop', 'Tap or press Space to flap', 'Start', start);
}
function start() {
  if (st === 'over') reset();
  if (st === 'ready' || st === 'paused') { st = 'run'; Arcade.hide(); last = performance.now(); requestAnimationFrame(loop); }
}
function pause() {
  if (st === 'run') { st = 'paused'; Arcade.show('Paused', 'Take a breather', 'Resume', start); }
  else if (st === 'paused') start();
}
function restart() { reset(); start(); }
function flap() { if (st === 'ready' || st === 'over') { if (st === 'over') return; start(); } if (st === 'run') bird.v = -6.6; }
function die() { st = 'over'; draw(); Arcade.gameOver('flappy', score, restart); upd(); }

function loop(now) {
  if (st !== 'run') return;
  const dt = Math.min(2, (now - last) / 16.67); last = now;
  bird.v += 0.38 * dt; bird.y += bird.v * dt;
  timer += dt;
  if (timer > 90) { timer = 0; pipes.push({ x: W, top: 60 + Math.random() * (H - GAP - 140), passed: false }); }
  for (const p of pipes) {
    p.x -= 2.4 * dt;
    if (!p.passed && p.x + PW < BX) { p.passed = true; score++; upd(); }
    // collision: bird (radius 12) vs pillar rectangles
    if (BX + 12 > p.x && BX - 12 < p.x + PW && (bird.y - 12 < p.top || bird.y + 12 > p.top + GAP)) return die();
  }
  pipes = pipes.filter(p => p.x > -PW);
  if (bird.y > H - 30 || bird.y < 0) return die();
  draw(); requestAnimationFrame(loop);
}
function draw() {
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#bfe3ff'); g.addColorStop(1, '#eaf6ff');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.fillStyle = '#fff'; [[60,90],[250,150],[150,300]].forEach(([a,b]) => { x.beginPath(); x.arc(a,b,22,0,7); x.arc(a+24,b+4,18,0,7); x.arc(a-22,b+6,16,0,7); x.fill(); });
  x.fillStyle = '#34a853';
  for (const p of pipes) { x.fillRect(p.x, 0, PW, p.top); x.fillRect(p.x, p.top + GAP, PW, H); x.fillRect(p.x - 4, p.top - 14, PW + 8, 14); x.fillRect(p.x - 4, p.top + GAP, PW + 8, 14); }
  x.fillStyle = '#c9a66b'; x.fillRect(0, H - 20, W, 20);
  x.save(); x.translate(BX, bird.y); x.rotate(Math.max(-.5, Math.min(1, bird.v / 10)));
  x.fillStyle = '#f59e0b'; x.beginPath(); x.arc(0, 0, 13, 0, 7); x.fill();
  x.fillStyle = '#fff'; x.beginPath(); x.arc(5, -4, 5, 0, 7); x.fill();
  x.fillStyle = '#000'; x.beginPath(); x.arc(7, -4, 2, 0, 7); x.fill();
  x.fillStyle = '#ef4444'; x.beginPath(); x.moveTo(11, 0); x.lineTo(21, 3); x.lineTo(11, 6); x.fill(); x.restore();
}
Arcade.key(e => { if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); flap(); } });
cv.addEventListener('pointerdown', flap);
Arcade.bind({ start, pause, restart }); reset();
