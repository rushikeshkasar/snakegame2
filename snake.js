/* Snake – arrows/WASD or swipe. Eat food to grow; walls and your own body end the game. */
const cv = $('c'), x = cv.getContext('2d'), N = 20, S = cv.width / N;
let snake, dir, queue, food, score, st, acc, last;

function upd() { $('score').textContent = score; $('best').textContent = Arcade.best('snake'); }
function placeFood() {
  do { food = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) }; }
  while (snake.some(s => s.x === food.x && s.y === food.y));
}
function reset() {
  snake = [{x:10,y:10},{x:9,y:10},{x:8,y:10}]; dir = {x:1,y:0}; queue = []; score = 0; acc = 0; st = 'ready';
  placeFood(); upd(); draw(); Arcade.show('Snake', 'Press Start or an arrow key', 'Start', start);
}
function start() {
  if (st === 'over') reset();
  if (st === 'ready' || st === 'paused') { st = 'run'; Arcade.hide(); last = performance.now(); requestAnimationFrame(loop); }
}
function pause() { if (st === 'run') { st = 'paused'; Arcade.show('Paused', '', 'Resume', start); } else if (st === 'paused') start(); }
function restart() { reset(); start(); }
function turn(dx, dy) {
  const l = queue.length ? queue[queue.length - 1] : dir;
  if ((dx === -l.x && dy === -l.y) || (dx === l.x && dy === l.y)) return; // no reversing / duplicates
  if (queue.length < 3) queue.push({ x: dx, y: dy });
  if (st === 'ready') start();
}
function tick() {
  dir = queue.shift() || dir;
  const h = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
  const eat = h.x === food.x && h.y === food.y;
  const body = eat ? snake : snake.slice(0, -1); // tail moves away unless we grow
  if (h.x < 0 || h.y < 0 || h.x >= N || h.y >= N || body.some(s => s.x === h.x && s.y === h.y)) return false;
  snake.unshift(h);
  if (eat) { score += 10; placeFood(); upd(); } else snake.pop();
  return true;
}
function loop(now) {
  if (st !== 'run') return;
  acc += now - last; last = now;
  const step = Math.max(60, 130 - score / 2); // speeds up as you grow
  while (acc >= step) { acc -= step; if (!tick()) { st = 'over'; draw(); Arcade.gameOver('snake', score, restart); upd(); return; } }
  draw(); requestAnimationFrame(loop);
}
function draw() {
  x.fillStyle = '#e8f5e9'; x.fillRect(0, 0, 360, 360);
  x.fillStyle = '#dcefdd'; for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if ((i + j) % 2) x.fillRect(i * S, j * S, S, S);
  x.fillStyle = '#ef4444'; x.beginPath(); x.arc((food.x + .5) * S, (food.y + .5) * S, S * .38, 0, 7); x.fill();
  snake.forEach((s, i) => { x.fillStyle = i ? '#3b82f6' : '#1d4ed8'; x.beginPath(); x.roundRect(s.x * S + 1, s.y * S + 1, S - 2, S - 2, 5); x.fill(); });
}
Arcade.key(e => {
  const m = { ArrowUp:[0,-1], w:[0,-1], ArrowDown:[0,1], s:[0,1], ArrowLeft:[-1,0], a:[-1,0], ArrowRight:[1,0], d:[1,0] }[e.key];
  if (m) { e.preventDefault(); turn(...m); }
});
Arcade.swipe(cv, d => turn(...d));
Arcade.bind({ start, pause, restart }); reset();
