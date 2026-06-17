function updateTime() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  document.getElementById('time').textContent = `${h}:${m}:${s}`;
  //get hours, minutes, seconds
  //format them as HH:MM:SS
  //set #time elemet's text contents
}

function updateGreeting() {
  const hour = new Date().getHours();
  let greet;
  if (hour <12) greet = 'good morning nyan';
  else if (hour <17) greet = 'good afternoon nyan';
  else greet = 'good evening nyan';
  document.getElementById('greeting').textContent = greet;
  //set greeting according to the time
}

//run on load
updateTime();
updateGreeting();

//update with seconds
setInterval(updateTime, 1000);

// drag & drop
const container = document.querySelector('.container');
const COLS = 8;
const ROWS = 6;
let dragged = null;
let dragColRaw = '';
let dragRowRaw = '';

function getCardPos(card) {
  return {
    col: card.style.gridColumn || '1',
    row: card.style.gridRow || '1',
  };
}

function findCardAt(col, row) {
  return [...container.children].find(c => {
    if (!c.classList.contains('card')) return false;
    const gc = c.style.gridColumn || '1';
    const gr = c.style.gridRow || '1';
    const sCol = parseInt(gc) || 1;
    const sRow = parseInt(gr) || 1;
    const spanCol = gc.includes('span') ? parseInt(gc.split('span')[1]) : 1;
    const spanRow = gr.includes('span') ? parseInt(gr.split('span')[1]) : 1;
    return col >= sCol && col < sCol + spanCol &&
           row >= sRow && row < sRow + spanRow;
  });
}

container.addEventListener('dragstart', (e) => {
  const card = e.target.closest('.card');
  if (!card) return;
  dragged = card;
  dragColRaw = card.style.gridColumn || '1';
  dragRowRaw = card.style.gridRow || '1';
  card.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', '');
});

container.addEventListener('dragend', () => {
  if (dragged) dragged.classList.remove('dragging');
  container.querySelectorAll('.card.drag-over').forEach(c => c.classList.remove('drag-over'));
  dragged = null;
  dragColRaw = '';
  dragRowRaw = '';
});

container.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  container.querySelectorAll('.card.drag-over').forEach(c => c.classList.remove('drag-over'));
  const card = e.target.closest('.card');
  if (card && card !== dragged) {
    card.classList.add('drag-over');
  }
});

container.addEventListener('dragleave', (e) => {
  const card = e.target.closest('.card');
  if (card) card.classList.remove('drag-over');
});

container.addEventListener('drop', (e) => {
  e.preventDefault();
  if (!dragged) return;

  const rect = container.getBoundingClientRect();
  const pad = 0.75 * parseFloat(getComputedStyle(document.documentElement).fontSize);
  const gap = 0.5 * parseFloat(getComputedStyle(document.documentElement).fontSize);

  const mx = e.clientX - rect.left - pad;
  const my = e.clientY - rect.top - pad;

  const contentW = rect.width - pad * 2;
  const contentH = rect.height - pad * 2;

  const cellW = (contentW - (COLS - 1) * gap) / COLS;
  const cellH = (contentH - (ROWS - 1) * gap) / ROWS;

  let col = Math.floor(mx / (cellW + gap)) + 1;
  let row = Math.floor(my / (cellH + gap)) + 1;

  col = Math.max(1, Math.min(COLS, col));
  row = Math.max(1, Math.min(ROWS, row));

  function hasSpan(v) { return typeof v === 'string' && v.includes('span'); }

  const target = findCardAt(col, row);
  if (target && target !== dragged) {
    target.style.gridColumn = parseInt(dragColRaw) || 1;
    target.style.gridRow = parseInt(dragRowRaw) || 1;
  }

  if (hasSpan(dragColRaw)) {
    const spanVal = parseInt(dragColRaw.split('span')[1]);
    const clampedCol = Math.min(col, COLS - spanVal + 1);
    dragged.style.gridColumn = `${clampedCol} / span ${spanVal}`;
  } else {
    dragged.style.gridColumn = col;
  }
  dragged.style.gridRow = row;

  dragged.classList.remove('dragging');
  container.querySelectorAll('.card.drag-over').forEach(c => c.classList.remove('drag-over'));
  dragged = null;
});
