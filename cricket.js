/* Slam Over – original batting game. 12 balls, 3 wickets. Swing when the ball is over the ring:
   closer to the centre = more runs. Swing too early/late or miss entirely = wicket. */
const cv = $('c'), x = cv.getContext('2d'), W = cv.width, H = cv.height;
const BALLS = 12, WK = 3, HITY = 380, START_Y = 70;
let st, ball, runs, balls, wk, msg, swing, wait, ended, last;

function upd() { $('score').textContent = runs; $('best').textContent = Arcade.best('cricket'); $('info').textContent = `Wickets ${wk}/${WK} · Balls left ${BALLS - balls}`; }
function newBall() { ball = { y: START_Y, jit: Math.random() * 90 - 45, sp: 4.2 + Math.random() * 2.8 + balls * 0.15, s: 'bowl', x: 180, vx: 0, vy: 0 }; swing = 0; }
function reset() { runs = 0; balls = 0; wk = 0; msg = ''; ended = false; st = 'ready'; newBall(); upd(); draw(); Arcade.show('Slam Over', 'Swing when the ball reaches the ring', 'Start', start); }
function start() {
  if (st === 'over') reset();
  if (st === 'ready' || st === 'paused') { st = 'run'; Arcade.hide(); last = performance.now(); requestAnimationFrame(loop); }
}
function pause() { if (st === 'run') { st = 'paused'; Arcade.show('Paused', '', 'Resume', start); } else if (st === 'paused') start(); }
function restart() { reset(); start(); }
function finish(text, r, out) {
  runs += r; if (out) wk++; balls++; msg = text; wait = 55; ended = wk >= WK || balls >= BALLS; upd();
}
function hit() {
  if (st === 'ready') return start();
  if (st !== 'run' || ball.s !== 'bowl' || swing > 0) return;
  swing = 12; const d = Math.abs(ball.y - HITY);
  if (d > 50) { ball.s = 'dead'; return finish('Mistimed! Out', 0, true); }
  const r = d < 8 ? 6 : d < 20 ? 4 : d < 35 ? 2 : 1;
  ball.s = 'hit'; ball.vx = (Math.random() * 2 - 1) * 6; ball.vy = -(5 + ball.sp);
  finish(r === 6 ? 'SIX! 🎉' : r === 4 ? 'FOUR!' : r + (r === 1 ? ' run' : ' runs'), r, false);
}
function loop(now) {
  if (st !== 'run') return;
  const dt = Math.min(2, (now - last) / 16.67); last = now;
  if (swing > 0) swing -= dt;
  if (ball.s === 'bowl') { ball.y += ball.sp * dt; if (ball.y > HITY + 50) { ball.s = 'dead'; finish('Bowled!', 0, true); } }
  else { if (ball.s === 'hit') { ball.x += ball.vx * dt; ball.y += ball.vy * dt; }
    wait -= dt;
    if (wait <= 0) { if (ended) { st = 'over'; draw(); Arcade.gameOver('cricket', runs, restart, 'Innings Over', `You scored ${runs} runs`); upd(); return; } newBall(); msg = ''; } }
  draw(); requestAnimationFrame(loop);
}
function draw() {
  x.fillStyle = '#7fc46f'; x.fillRect(0, 0, W, H);
  x.fillStyle = '#e9d8a6'; x.beginPath(); x.moveTo(155, 40); x.lineTo(205, 40); x.lineTo(255, H); x.lineTo(105, H); x.fill();
  x.fillStyle = '#fff'; [172, 180, 188].forEach(a => x.fillRect(a, 425, 4, 32));          // stumps
  x.fillStyle = '#6b4f2a'; x.beginPath(); x.arc(180, 44, 9, 0, 7); x.fill();               // bowler
  x.setLineDash([5, 5]); x.strokeStyle = '#1e293b'; x.beginPath(); x.arc(180, HITY, 20, 0, 7); x.stroke(); x.setLineDash([]); // hit ring
  x.save(); x.translate(225, 405); x.fillStyle = '#3b82f6'; x.beginPath(); x.arc(0, -22, 9, 0, 7); x.fill(); x.fillRect(-8, -14, 16, 30);
  x.rotate(-Math.sin(Math.max(0, swing) / 12 * Math.PI) * 2.2 + 0.4); x.fillStyle = '#d4a257'; x.fillRect(-48, -4, 50, 8); x.restore(); // batter + bat
  const p = Math.min(1, (ball.y - START_Y) / (HITY - START_Y)), bx = ball.s === 'bowl' || ball.s === 'dead' ? 180 + ball.jit * (1 - p) : ball.x;
  x.fillStyle = '#dc2626'; x.beginPath(); x.arc(bx, ball.y, 4 + Math.max(0, p) * 7, 0, 7); x.fill();
  x.fillStyle = '#1e293b'; x.font = 'bold 26px system-ui'; x.textAlign = 'center'; x.fillText(msg, W / 2, 130);
}
Arcade.key(e => { if (e.code === 'Space') { e.preventDefault(); hit(); } });
cv.addEventListener('pointerdown', hit);
Arcade.bind({ start, pause, restart }); reset();
