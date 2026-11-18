/* Chess – two players on one device. Own move generator: legal moves, turns, check, checkmate, stalemate.
   Simplified rules: no castling or en passant; pawns auto-promote to queens. */
const START = ['rnbqkbnr','pppppppp','........','........','........','........','PPPPPPPP','RNBQKBNR'];
const GLYPH = { p:'♟︎', n:'♞', b:'♝', r:'♜', q:'♛', k:'♚' };
let b, turn, sel, targets, over;
const isW = p => p === p.toUpperCase();

// Pseudo-legal moves for the piece at (r,c) on board bd
function gen(bd, r, c) {
  const p = bd[r][c], w = isW(p), t = p.toLowerCase(), out = [];
  const add = (R, C) => { // returns true if square was empty (sliders may continue)
    if (R < 0 || R > 7 || C < 0 || C > 7) return false;
    const q = bd[R][C]; if (q === '.') { out.push([R, C]); return true; }
    if (isW(q) !== w) out.push([R, C]); return false;
  };
  if (t === 'p') {
    const d = w ? -1 : 1, s = w ? 6 : 1;
    if (bd[r + d][c] === '.') { out.push([r + d, c]); if (r === s && bd[r + 2 * d][c] === '.') out.push([r + 2 * d, c]); }
    for (const dc of [-1, 1]) { const q = bd[r + d] && bd[r + d][c + dc]; if (q && q !== '.' && isW(q) !== w) out.push([r + d, c + dc]); }
  } else if (t === 'n') for (const [a, e] of [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]]) add(r + a, c + e);
  else if (t === 'k') { for (let a = -1; a < 2; a++) for (let e = -1; e < 2; e++) if (a || e) add(r + a, c + e); }
  else {
    const dirs = []; if (t !== 'b') dirs.push([1,0],[-1,0],[0,1],[0,-1]); if (t !== 'r') dirs.push([1,1],[1,-1],[-1,1],[-1,-1]);
    for (const [a, e] of dirs) { let R = r + a, C = c + e; while (add(R, C)) { R += a; C += e; } }
  }
  return out;
}
function mv(bd, r, c, R, C) {
  const n = bd.map(row => row.slice()); let p = n[r][c];
  if (p === 'P' && R === 0) p = 'Q'; if (p === 'p' && R === 7) p = 'q';
  n[R][C] = p; n[r][c] = '.'; return n;
}
function findKing(bd, t) { const k = t === 'w' ? 'K' : 'k'; for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (bd[r][c] === k) return [r, c]; }
function inCheck(bd, t) {
  const [kr, kc] = findKing(bd, t);
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { const p = bd[r][c];
    if (p !== '.' && isW(p) !== (t === 'w') && gen(bd, r, c).some(m => m[0] === kr && m[1] === kc)) return true; }
  return false;
}
// Legal = pseudo-legal moves that don't leave own king in check
function legal(r, c) { const t = isW(b[r][c]) ? 'w' : 'b'; return gen(b, r, c).filter(([R, C]) => !inCheck(mv(b, r, c, R, C), t)); }
function hasMoves(t) {
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (b[r][c] !== '.' && isW(b[r][c]) === (t === 'w') && legal(r, c).length) return true;
  return false;
}
function reset() { b = START.map(r => r.split('')); turn = 'w'; sel = null; targets = []; over = false; Arcade.hide(); draw(); }
function click(r, c) {
  if (over) return;
  if (sel && targets.some(m => m[0] === r && m[1] === c)) {
    b = mv(b, sel[0], sel[1], r, c); turn = turn === 'w' ? 'b' : 'w'; sel = null; targets = [];
    if (!hasMoves(turn)) {
      over = true; draw();
      if (inCheck(b, turn)) Arcade.gameOver('chess', 1, reset, 'Checkmate!', (turn === 'w' ? 'Black' : 'White') + ' wins', 'Save win');
      else Arcade.show('Stalemate', 'The game is a draw', 'New game', reset);
      return;
    }
  } else if (b[r][c] !== '.' && isW(b[r][c]) === (turn === 'w')) { sel = [r, c]; targets = legal(r, c); }
  else { sel = null; targets = []; }
  draw();
}
function draw() {
  const chk = !over && inCheck(b, turn), kp = findKing(b, turn);
  $('board').innerHTML = b.map((row, r) => row.map((p, c) => {
    const cls = ['sq', (r + c) % 2 ? 'd' : 'l'];
    if (sel && sel[0] === r && sel[1] === c) cls.push('sel');
    if (targets.some(m => m[0] === r && m[1] === c)) cls.push('t', p !== '.' ? 'cap' : '');
    if (chk && kp[0] === r && kp[1] === c) cls.push('chk');
    return `<div class="${cls.join(' ')}" data-r="${r}" data-c="${c}">${p === '.' ? '' : `<span class="${isW(p) ? 'pw' : 'pb'}">${GLYPH[p.toLowerCase()]}</span>`}</div>`;
  }).join('')).join('');
  $('info').textContent = over ? 'Game over' : `${turn === 'w' ? 'White' : 'Black'} to move${chk ? ' — CHECK!' : ''}`;
}
$('board').addEventListener('click', e => { const s = e.target.closest('.sq'); if (s) click(+s.dataset.r, +s.dataset.c); });
$('btnRestart').onclick = reset; reset();
