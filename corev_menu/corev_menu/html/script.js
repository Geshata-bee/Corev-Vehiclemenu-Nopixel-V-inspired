(() => {
  const app = document.getElementById('app');
  const groupsEl = document.getElementById('groups');
  const nameEl = document.getElementById('vname');

  const RES = () => (typeof GetParentResourceName === 'function' ? GetParentResourceName() : 'corev_menu');
  const post = (name, data) =>
    fetch(`https://${RES()}/${name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data || {})
    }).then(r => r.json()).catch(() => null);

  const svg = (inner, attrs = 'fill="currentColor"') => `<svg viewBox="0 0 24 24" ${attrs}>${inner}</svg>`;
  const TC = 'stroke="var(--tc)" fill="none" stroke-linecap="round" stroke-linejoin="round"';
  const LINE = 'fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"';

  const door =
    '<path fill-rule="evenodd" d="M2.600 9.800L7.600 4.600H19.600Q21.400 4.600 21.400 6.400V17.200Q21.400 19 19.600 19H4.400Q2.600 19 2.600 17.200ZM8.400 6.800H19V10.600H5.600Z"/>' +
    `<path d="M15.200 14.400h3.400" ${TC} stroke-width="1.600"/>`;

  const win =
    '<path d="M2.400 18.600C2.400 12.400 6 7.800 11.600 6.400L19.600 4.600Q21.600 4.200 21.600 6.300V17Q21.600 19 19.600 19H3.800Q2.400 19 2.400 18.600Z"/>' +
    `<path d="M5.800 17.400C6.200 13.600 8.800 11.400 12 11" ${TC} stroke-width="1.300"/>` +
    `<path d="M15.200 10.200l2.200-1.900 2.200 1.900M15.200 14.800l2.200 1.900 2.200-1.900" ${TC} stroke-width="1.400"/>`;

  const ICONS = {
    hood:
      svg('<path d="M2.200 19.800V14.800C2.200 9.200 6.400 5 12 5S21.800 9.200 21.800 14.800v5z"/>' +
          `<path d="M5.400 17.600V15.200C5.400 11.500 8.100 8.400 12 8.400S18.600 11.500 18.600 15.200v2.400" ${TC} stroke-width="1.400"/>` +
          '<circle cx="6.800" cy="18.300" r="1.100" fill="var(--tc)"/><circle cx="17.200" cy="18.300" r="1.100" fill="var(--tc)"/>'),
    trunk:
      svg('<path d="M4.800 7.500Q12 6.500 19.200 7.500V10.600Q19.200 11.700 18.100 11.700H5.900Q4.800 11.700 4.800 10.600Z"/>' +
          '<path d="M4.800 13.700Q12 12.700 19.200 13.700V14.600Q19.200 15.700 18.100 15.700H16.900V17.400Q16.900 18.500 15.800 18.500H8.200Q7.100 18.500 7.100 17.400V15.700H5.900Q4.800 15.700 4.800 14.600Z"/>'),
    doorL: svg(door),
    doorR: svg(door),
    winL:  svg(win),
    winR:  svg(win),
    wheel:
      svg('<circle cx="12" cy="12" r="8.400" stroke-width="2.300"/>' +
          '<path d="M3.800 11.400C8.400 9.600 15.600 9.600 20.200 11.400" stroke-width="2.100"/>' +
          '<path d="M9.700 14L10.700 20M14.300 14L13.300 20" stroke-width="2.100"/>', LINE),
    seat:
      svg('<rect x="9" y="2.600" width="6" height="3.600" rx="1.300"/>' +
          '<path d="M8 7H16L17.200 15.600H6.800Z"/>' +
          `<path d="M9.900 9V13.600M14.100 9V13.600" ${TC} stroke-width="1.100"/>` +
          '<rect x="5.600" y="16.600" width="12.800" height="3.600" rx="1.400"/>'),
    power:
      svg('<path d="M12 3.400V11.600"/><path d="M6.400 7.200a8.200 8.200 0 1011.200 0"/>', LINE.replace('fill="none"', 'fill="none" stroke-width="2.300"')),
    light:
      svg('<path d="M10.800 4.800a7.200 7.200 0 000 14.400z"/><rect x="14" y="6.400" width="6.400" height="1.800" rx=".9"/><rect x="14" y="11.100" width="6.400" height="1.800" rx=".9"/><rect x="14" y="15.800" width="6.400" height="1.800" rx=".9"/>'),
    hazard:
      svg('<path d="M12 3L22 20.400H2Z" stroke="currentColor" stroke-width="2.400" stroke-linejoin="round"/>' +
          '<path d="M12 9.400v5.200M12 17.300v.2" stroke="var(--tc)" stroke-width="2.300" stroke-linecap="round" fill="none"/>')
  };

  const GROUPS = [
    { label: 'Body', items: [
      { id: 'hood',  icon: 'hood',  tip: 'Hood' },
      { id: 'trunk', icon: 'trunk', tip: 'Trunk' } ] },
    { label: 'Doors', items: [
      { id: 'door_fl', icon: 'doorL', tip: 'Front left door',  door: 'fl' },
      { id: 'door_fr', icon: 'doorR', tip: 'Front right door', door: 'fr' },
      { id: 'door_rl', icon: 'doorL', tip: 'Rear left door',  door: 'rl' },
      { id: 'door_rr', icon: 'doorR', tip: 'Rear right door', door: 'rr' } ] },
    { label: 'Windows', items: [
      { id: 'win_fl', icon: 'winL', tip: 'Front left window',  door: 'fl' },
      { id: 'win_fr', icon: 'winR', tip: 'Front right window', door: 'fr' },
      { id: 'win_rl', icon: 'winL', tip: 'Rear left window',  door: 'rl' },
      { id: 'win_rr', icon: 'winR', tip: 'Rear right window', door: 'rr' } ] },
    { label: 'Seats', items: [
      { id: 'seat_d',  icon: 'wheel', tip: 'Driver seat',     seats: 1 },
      { id: 'seat_p',  icon: 'seat',  tip: 'Passenger seat',  seats: 2 },
      { id: 'seat_rl', icon: 'seat',  tip: 'Rear left seat',  seats: 3 },
      { id: 'seat_rr', icon: 'seat',  tip: 'Rear right seat', seats: 4 } ] },
    { label: 'Auxiliary', items: [
      { id: 'engine', icon: 'power',  tip: 'Engine' },
      { id: 'lights', icon: 'light',  tip: 'Lights' },
      { id: 'hazard', icon: 'hazard', tip: 'Hazard lights' } ] }
  ];

  let cells = [[], []];
  let cur = { r: 0, c: 0 };
  let state = {};
  let cfg = { background: true };
  let seatCount = 2;
  let doors = { fl: true, fr: true };

  function scale() {
    document.documentElement.style.setProperty('--k', Math.max(0.55, innerHeight / 751).toFixed(3));
  }
  addEventListener('resize', scale);
  scale();

  function build() {
    groupsEl.innerHTML = '';
    cells = [new Array(10).fill(null), new Array(10).fill(null)];
    GROUPS.forEach((g, gi) => {
      const gEl = document.createElement('div');
      gEl.className = 'group';
      gEl.innerHTML = `<div class="glabel">${g.label}</div><div class="grid"></div>`;
      const grid = gEl.querySelector('.grid');
      for (let slot = 0; slot < 4; slot++) {
        const it = g.items[slot];
        const t = document.createElement('div');
        if (!it || (it.door && !doors[it.door]) || (it.seats && seatCount < it.seats)) {
          t.className = 'tile empty';
        } else {
          t.className = 'tile off' + '';
          t.dataset.id = it.id;
          t.title = it.tip;
          t.innerHTML = ICONS[it.icon];
          t.addEventListener('click', () => activate(t));
          t.addEventListener('mouseenter', () => {
            cur = { r: Math.floor(slot / 2), c: gi * 2 + (slot % 2) };
            clearFocus();
          });
          cells[Math.floor(slot / 2)][gi * 2 + (slot % 2)] = t;
        }
        grid.appendChild(t);
      }
      groupsEl.appendChild(gEl);
    });
    paint();
    cur = { r: 0, c: 0 };
    clearFocus();
  }

  function paint() {
    document.querySelectorAll('.tile[data-id]').forEach(t => {
      const on = !!state[t.dataset.id];
      t.classList.toggle('on', on);
      t.classList.toggle('off', !on);
    });
  }

  function clearFocus() { cells.flat().forEach(t => t && t.classList.remove('focus')); }

  function setCur(r, c) {
    clearFocus();
    cur = { r, c };
    if (cells[r][c]) cells[r][c].classList.add('focus');
  }

  function move(dr, dc) {
    if (!document.querySelector('.tile.focus')) {
      if (!cells[cur.r][cur.c]) { cur = { r: 0, c: 0 }; }
      return setCur(cur.r, cur.c);
    }
    let { r, c } = cur;
    if (dr) {
      const nr = 1 - r;
      if (cells[nr][c]) r = nr;
      else for (let i = 1; i < 10; i++) {
        const cc = (c + i) % 10;
        if (cells[nr][cc]) { r = nr; c = cc; break; }
      }
    } else {
      for (let i = 0; i < 10; i++) {
        c = (c + dc + 10) % 10;
        if (cells[r][c]) break;
      }
    }
    setCur(r, c);
  }

  async function activate(t) {
    if (!t || !t.dataset.id) return;
    const res = await post('action', { id: t.dataset.id });
    if (res && typeof res === 'object') { state = res; paint(); }
  }

  function show(d) {
    cfg = Object.assign(cfg, d.config || {});
    state = d.state || {};
    seatCount = d.seats || 2;
    doors = d.doors || { fl: true, fr: true };
    nameEl.textContent = d.name || 'VEHICLE';
    app.classList.toggle('bg', !!cfg.background);
    build();
    app.classList.add('show');
  }

  function hide() { app.classList.remove('show'); }

  addEventListener('message', e => {
    const d = e.data || {};
    if (d.action === 'open') show(d);
    else if (d.action === 'state') { state = d.state || {}; paint(); }
    else if (d.action === 'close') hide();
  });

  addEventListener('keydown', e => {
    if (!app.classList.contains('show')) return;
    switch (e.key) {
      case 'ArrowLeft':  case 'a': case 'A': move(0, -1); break;
      case 'ArrowRight': case 'd': case 'D': move(0, 1);  break;
      case 'ArrowUp':    case 'w': case 'W': move(-1, 0); break;
      case 'ArrowDown':  case 's': case 'S': move(1, 0);  break;
      case 'Enter': case ' ': activate(cells[cur.r][cur.c]); break;
      case 'Escape': case 'Backspace': case 'F7': hide(); post('close'); break;
      default: return;
    }
    e.preventDefault();
  });
})();
