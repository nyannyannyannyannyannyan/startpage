// ==================== UTILITY ====================
function parseGridVal(val) {
  if (!val || val === 'auto') return { start: 1, span: 1 };
  const parts = val.split('/').map(s => s.trim());
  const start = parseInt(parts[0]) || 1;
  let span = 1;
  if (parts[1] && parts[1].includes('span')) span = parseInt(parts[1].split('span')[1]) || 1;
  return { start, span };
}

function gridColStr(start, span) {
  return span > 1 ? `${start} / span ${span}` : `${start}`;
}

function gridRowStr(start, span) {
  return span > 1 ? `${start} / span ${span}` : `${start}`;
}

// ==================== CLOCK & GREETING ====================
function updateTime() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  document.getElementById('time').textContent = `${h}:${m}:${s}`;
}

function updateGreeting() {
  const hour = new Date().getHours();
  let greet;
  if (hour <12) greet = 'good morning nyan';
  else if (hour <17) greet = 'good afternoon nyan';
  else greet = 'good evening nyan';
  document.getElementById('greeting').textContent = greet;
}

// ==================== ENTRANCE ANIMATION ====================
function animateEntrance() {
  const cards = document.querySelectorAll('.card');
  cards.forEach(c => {
    c.style.opacity = '0';
    c.style.transform = 'scale(0.85) translateY(24px)';
  });
  anime({
    targets: '.card',
    opacity: 1,
    scale: 1,
    translateY: 0,
    delay: anime.stagger(40, { from: 'center' }),
    easing: 'easeOutExpo',
    duration: 900,
    complete: () => {
      cards.forEach(c => {
        c.style.opacity = '';
        c.style.transform = '';
      });
    },
  });
}

// ==================== DRAG & DROP ====================
const container = document.querySelector('.container');
const COLS = 16;
const ROWS = 12;
let dragged = null;
let dragColRaw = '';
let dragRowRaw = '';

function findCardAt(col, row) {
  return [...container.children].find(c => {
    if (!c.classList.contains('card')) return false;
    const gc = parseGridVal(c.style.gridColumn);
    const gr = parseGridVal(c.style.gridRow);
    return col >= gc.start && col < gc.start + gc.span &&
           row >= gr.start && row < gr.start + gr.span;
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

  // FLIP: record old rects
  const allCards = [...container.querySelectorAll('.card')];
  const oldRects = allCards.map(c => ({ el: c, rect: c.getBoundingClientRect() }));

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

  const target = findCardAt(col, row);
  if (target && target !== dragged) {
    target.style.gridColumn = parseInt(dragColRaw) || 1;
    target.style.gridRow = parseInt(dragRowRaw) || 1;
  }

  const parsed = parseGridVal(dragColRaw);
  if (parsed.span > 1) {
    const clampedCol = Math.min(col, COLS - parsed.span + 1);
    dragged.style.gridColumn = gridColStr(clampedCol, parsed.span);
  } else {
    dragged.style.gridColumn = col;
  }
  dragged.style.gridRow = row;

  // FLIP: animate from old positions to new
  requestAnimationFrame(() => {
    allCards.forEach(({ el, rect: oldRect }) => {
      el.style.transform = '';
      const newRect = el.getBoundingClientRect();
      const dx = oldRect.left - newRect.left;
      const dy = oldRect.top - newRect.top;
      if (dx === 0 && dy === 0) return;
      anime({
        targets: el,
        translateX: [dx, 0],
        translateY: [dy, 0],
        easing: 'easeOutExpo',
        duration: 500,
        complete: () => { el.style.transform = ''; },
      });
    });
  });

  dragged.classList.remove('dragging');
  container.querySelectorAll('.card.drag-over').forEach(c => c.classList.remove('drag-over'));
  dragged = null;
});

// ==================== RESIZE ====================
function initResize() {
  let state = null;
  let resized = false;

  container.addEventListener('click', (e) => {
    if (resized) {
      e.preventDefault();
      resized = false;
    }
  });

  function getCellSize() {
    const r = container.getBoundingClientRect();
    const p = 0.75 * parseFloat(getComputedStyle(document.documentElement).fontSize);
    const g = 0.5 * parseFloat(getComputedStyle(document.documentElement).fontSize);
    return {
      pad: p, gap: g,
      cellW: ((r.width - p * 2) - (COLS - 1) * g) / COLS,
      cellH: ((r.height - p * 2) - (ROWS - 1) * g) / ROWS,
    };
  }

  container.addEventListener('mousedown', (e) => {
    const card = e.target.closest('.card');
    if (!card) return;

    const b = card.getBoundingClientRect();
    const onRight = b.right - e.clientX <= 16;
    const onBottom = b.bottom - e.clientY <= 16;
    if (!onRight && !onBottom) return;

    e.preventDefault();
    card.classList.add('resizing');

    const gc = parseGridVal(card.style.gridColumn);
    const gr = parseGridVal(card.style.gridRow);

    state = {
      card,
      edges: { right: onRight, bottom: onBottom },
      startX: e.clientX,
      startY: e.clientY,
      colStart: gc.start,
      rowStart: gr.start,
      colSpan: gc.span,
      rowSpan: gr.span,
    };
  });

  document.addEventListener('mousemove', (e) => {
    if (!state) return;
    const { card, edges, startX, startY, colStart, rowStart, colSpan, rowSpan } = state;
    const { cellW, cellH, gap } = getCellSize();

    if (edges.right) {
      const dx = e.clientX - startX;
      const delta = Math.round(dx / (cellW + gap));
      const ns = Math.max(1, Math.min(COLS - colStart + 1, colSpan + delta));
      card.style.gridColumn = gridColStr(colStart, ns);
    }
    if (edges.bottom) {
      const dy = e.clientY - startY;
      const delta = Math.round(dy / (cellH + gap));
      const ns = Math.max(1, Math.min(ROWS - rowStart + 1, rowSpan + delta));
      card.style.gridRow = gridRowStr(rowStart, ns);
    }
  });

  document.addEventListener('mouseup', () => {
    if (state) {
      state.card.classList.remove('resizing');
      resized = true;
      // settle animation
      anime({
        targets: state.card,
        scale: [1.04, 1],
        duration: 300,
        easing: 'easeOutExpo',
      });
      state = null;
    }
  });
}

// ==================== SAVE / LOAD ====================
function saveLayout() {
  const cards = [...container.querySelectorAll('.card')];
  const data = cards.map(c => ({
    gridColumn: c.style.gridColumn,
    gridRow: c.style.gridRow,
  }));
  localStorage.setItem('startpage-layout', JSON.stringify(data));
  const label = document.querySelector('.save-label');
  if (label) {
    label.textContent = '✓ saved';
    setTimeout(() => { label.textContent = 'save layout'; }, 1500);
  }
}

function loadLayout() {
  const raw = localStorage.getItem('startpage-layout');
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    const cards = [...container.querySelectorAll('.card')];
    cards.forEach((c, i) => {
      if (data[i]) {
        c.style.gridColumn = data[i].gridColumn;
        c.style.gridRow = data[i].gridRow;
      }
    });
  } catch (e) {
    // ignore corrupt data
  }
}

document.querySelector('.save-card')?.addEventListener('click', saveLayout);

// ==================== INIT ====================
loadLayout();
animateEntrance();
updateTime();
updateGreeting();
setInterval(updateTime, 1000);
initResize();
