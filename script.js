'use strict';

/* =========================================================
   0. Ambient backdrop — bubbles + cursor aura
   ========================================================= */
(function initBackdrop() {
  const field = document.getElementById('bubbleField');
  const BUBBLE_COUNT = window.innerWidth < 640 ? 10 : 18;
  for (let i = 0; i < BUBBLE_COUNT; i++) {
    const b = document.createElement('span');
    b.className = 'bubble';
    const size = 8 + Math.random() * 34;
    b.style.width = `${size}px`;
    b.style.height = `${size}px`;
    b.style.left = `${Math.random() * 100}%`;
    b.style.setProperty('--drift', `${(Math.random() - 0.5) * 120}px`);
    b.style.animationDuration = `${14 + Math.random() * 16}s`;
    b.style.animationDelay = `${Math.random() * -20}s`;
    field.appendChild(b);
  }

  const aura = document.getElementById('cursorAura');
  let auraX = window.innerWidth / 2, auraY = window.innerHeight / 2;
  let targetX = auraX, targetY = auraY;
  window.addEventListener('pointermove', (e) => {
    targetX = e.clientX; targetY = e.clientY;
    aura.classList.add('is-active');
  });
  (function raf() {
    auraX += (targetX - auraX) * 0.12;
    auraY += (targetY - auraY) * 0.12;
    aura.style.left = `${auraX}px`;
    aura.style.top = `${auraY}px`;
    requestAnimationFrame(raf);
  })();
})();

/* =========================================================
   1. Boot sequence
   ========================================================= */
const BOOT_LOG = [
  'Inisialisasi Makeblock mCore V1.5 & Arduino Nano...',
  'Kalibrasi Sensor Ultrasonik HC-SR04...',
  'Menyambungkan Modul VeritasNode (ESP32)...',
  'Membaca Soil Moisture Probe...',
  'Membuka Dashboard AgriCloud:V...'
];

function runBootSequence() {
  const logEl = document.getElementById('bootLog');
  const fillEl = document.getElementById('bootFill');
  const pctEl = document.getElementById('bootPct');
  const total = BOOT_LOG.length;
  let idx = 0;

  function typeLine(text, isLast, onDone) {
    const line = document.createElement('div');
    logEl.appendChild(line);
    let i = 0;
    const speed = 14;
    (function type() {
      if (i <= text.length) {
        line.textContent = text.slice(0, i);
        i++;
        setTimeout(type, speed);
      } else {
        const tag = document.createElement('span');
        tag.className = isLast ? 'ready' : 'ok';
        tag.textContent = isLast ? ' [READY]' : ' [OK]';
        line.appendChild(tag);
        onDone();
      }
    })();
  }

  function next() {
    if (idx >= total) {
      setTimeout(finishBoot, 500);
      return;
    }
    const isLast = idx === total - 1;
    const label = BOOT_LOG[idx].replace('...', '');
    typeLine(label, isLast, () => {
      idx++;
      const pct = Math.round((idx / total) * 100);
      fillEl.style.width = `${pct}%`;
      pctEl.textContent = `${pct}%`;
      setTimeout(next, 220);
    });
  }
  next();
}

function finishBoot() {
  const boot = document.getElementById('bootScreen');
  boot.classList.add('phase-exit');
  setTimeout(() => {
    boot.hidden = true;
    const lock = document.getElementById('lockScreen');
    lock.hidden = false;
    lock.classList.add('phase-enter');
  }, 550);
}

/* =========================================================
   2. Lockscreen — parallax + start
   ========================================================= */
(function initLockscreen() {
  const hero = document.getElementById('lockHero');
  const logo = document.getElementById('heroLogo');
  document.addEventListener('pointermove', (e) => {
    if (document.getElementById('lockScreen').hidden) return;
    const rx = (e.clientX / window.innerWidth - 0.5) * 18;
    const ry = (e.clientY / window.innerHeight - 0.5) * -18;
    logo.style.transform = `rotateY(${rx}deg) rotateX(${ry}deg)`;
  });

  document.getElementById('startBtn').addEventListener('click', () => {
    const lock = document.getElementById('lockScreen');
    lock.classList.remove('phase-enter');
    lock.classList.add('phase-exit');
    setTimeout(() => {
      lock.hidden = true;
      const dash = document.getElementById('dashboard');
      dash.hidden = false;
      dash.classList.add('phase-enter');
      initDashboard();
    }, 550);
  });
})();

/* =========================================================
   3. Dashboard init (runs once)
   ========================================================= */
let dashboardInitialised = false;
function initDashboard() {
  if (dashboardInitialised) return;
  dashboardInitialised = true;

  initClock();
  initThemeToggle();
  initAudioPanel();
  initPageNav();
  initAccordion();
  initCircuit();
  initComponents();
  initSimulation();
}

/* ---- Clock ---- */
function initClock() {
  const el = document.getElementById('clockTime');
  function tick() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    el.textContent = `${h}:${m}:${s}`;
  }
  tick();
  setInterval(tick, 1000);
}

/* ---- Theme toggle ---- */
function initThemeToggle() {
  const btn = document.getElementById('themeToggle');
  const icon = btn.querySelector('i');
  const stored = localStorage.getItem('solaris-theme');
  if (stored === 'dark') applyTheme(true);

  function applyTheme(dark) {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    icon.className = dark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    localStorage.setItem('solaris-theme', dark ? 'dark' : 'light');
  }
  btn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    applyTheme(!isDark);
  });
}

/* ---- Ambient audio panel ---- */
const AUDIO_TRACKS = [
  { name: 'Sweet Sandy Coast', artist: 'SupaBuppa',          file: 'Sweet Sandy Coast.mp3', art: 'SSC.jpg',       color: '#ef4444' },
  { name: 'lalalatte',         artist: 'Tsundere Twintails', file: 'lalalatte.mp3',         art: 'lalalatte.jpg', color: '#f97316' },
  { name: 'LEASE',             artist: 'Takeshi Abo',        file: 'LEASE.mp3',             art: 'LEASE.jpg',     color: '#eab308' },
  { name: '2004 ur mall',      artist: 'zan',                file: '2004 ur mall.mp3',      art: 'UrMall.jpg',    color: '#ec4899' },
  { name: 'New Look',          artist: 'Kazumi Totaka',      file: 'New Look.mp3',          art: 'WiiU.jpg',      color: '#f4f4f5' },
];

function initAudioPanel() {
  const toggle = document.getElementById('audioToggle');
  const panel = document.getElementById('audioPanel');
  const audioEl = document.getElementById('audioEl');
  const playBtn = document.getElementById('audioPlay');
  const playIcon = playBtn.querySelector('i');
  const artEl = document.getElementById('audioArt');
  const trackName = document.getElementById('audioTrackName');
  const artistEl = document.getElementById('audioArtist');
  const scrub = document.getElementById('audioScrubBar');
  const timeCurrent = document.getElementById('timeCurrent');
  const timeTotal = document.getElementById('timeTotal');
  const list = document.getElementById('audioList');

  let current = 0;
  let isScrubbing = false;

  function formatTime(totalSeconds) {
    if (!isFinite(totalSeconds) || totalSeconds < 0) return '0:00';
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  AUDIO_TRACKS.forEach((t, i) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="audio-panel__dot" style="background:${t.color}"></span>
      <span class="audio-panel__list-text">
        <span class="audio-panel__list-name">${t.name}</span>
        <span class="audio-panel__list-artist">${t.artist}</span>
      </span>`;
    li.addEventListener('click', () => loadTrack(i, true));
    list.appendChild(li);
  });

  function renderList() {
    [...list.children].forEach((li, i) => li.classList.toggle('is-playing', i === current && !audioEl.paused));
  }

  function loadTrack(i, autoplay) {
    current = i;
    const t = AUDIO_TRACKS[current];
    audioEl.src = encodeURI(t.file);
    artEl.src = t.art;
    artEl.alt = `Sampul lagu ${t.name}`;
    trackName.textContent = t.name;
    artistEl.textContent = t.artist;
    scrub.value = '0';
    timeCurrent.textContent = '0:00';
    timeTotal.textContent = '0:00';
    renderList();
    if (autoplay) audioEl.play().catch(() => {});
  }

  function nextTrack() { loadTrack((current + 1) % AUDIO_TRACKS.length, true); }
  function prevTrack() { loadTrack((current - 1 + AUDIO_TRACKS.length) % AUDIO_TRACKS.length, true); }

  audioEl.addEventListener('loadedmetadata', () => {
    scrub.max = String(Math.floor(audioEl.duration) || 0);
    timeTotal.textContent = formatTime(audioEl.duration);
  });
  audioEl.addEventListener('timeupdate', () => {
    if (isScrubbing) return;
    scrub.value = String(Math.floor(audioEl.currentTime));
    timeCurrent.textContent = formatTime(audioEl.currentTime);
  });
  audioEl.addEventListener('ended', nextTrack);
  audioEl.addEventListener('play', () => { playIcon.className = 'fa-solid fa-pause'; renderList(); });
  audioEl.addEventListener('pause', () => { playIcon.className = 'fa-solid fa-play'; renderList(); });

  scrub.addEventListener('input', () => {
    isScrubbing = true;
    timeCurrent.textContent = formatTime(Number(scrub.value));
  });
  scrub.addEventListener('change', () => {
    audioEl.currentTime = Number(scrub.value);
    isScrubbing = false;
  });

  toggle.addEventListener('click', () => {
    const isHidden = panel.hidden;
    panel.hidden = !isHidden;
    toggle.setAttribute('aria-expanded', String(isHidden));
    toggle.classList.toggle('is-active', isHidden);
  });
  document.addEventListener('click', (e) => {
    if (!panel.hidden && !panel.contains(e.target) && e.target !== toggle && !toggle.contains(e.target)) {
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.classList.remove('is-active');
    }
  });

  playBtn.addEventListener('click', () => {
    if (audioEl.paused) audioEl.play().catch(() => {});
    else audioEl.pause();
  });
  document.getElementById('audioPrev').addEventListener('click', prevTrack);
  document.getElementById('audioNext').addEventListener('click', nextTrack);

  loadTrack(0, false);
}

/* ---- SPA page navigation ---- */
function initPageNav() {
  const navItems = document.querySelectorAll('.bottom-nav__item');
  const pages = document.querySelectorAll('.page');
  const indicator = document.getElementById('navIndicator');

  function positionIndicator(btn) {
    const navRect = btn.parentElement.getBoundingClientRect();
    const rect = btn.getBoundingClientRect();
    indicator.style.left = `${rect.left - navRect.left}px`;
  }

  function goTo(pageId) {
    pages.forEach(p => p.classList.toggle('is-active', p.dataset.page === pageId));
    navItems.forEach(btn => {
      const active = btn.dataset.page === pageId;
      btn.classList.toggle('is-active', active);
      if (active) positionIndicator(btn);
    });
  }

  navItems.forEach(btn => btn.addEventListener('click', () => goTo(btn.dataset.page)));
  document.querySelectorAll('[data-goto]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.goto;
      goTo(target);
      document.querySelector(`.bottom-nav__item[data-page="${target}"]`)?.focus();
    });
  });

  window.addEventListener('resize', () => {
    const active = document.querySelector('.bottom-nav__item.is-active');
    if (active) positionIndicator(active);
  });

  goTo('beranda');
}

/* ---- Accordion ---- */
function initAccordion() {
  document.querySelectorAll('.accordion__trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion__item');
      const willOpen = !item.classList.contains('is-open');
      item.parentElement.querySelectorAll('.accordion__item').forEach(i => {
        i.classList.remove('is-open');
        i.querySelector('.accordion__trigger').setAttribute('aria-expanded', 'false');
      });
      if (willOpen) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* =========================================================
   4. Circuit diagrams (SVG) — Utama & VeritasNode
   ========================================================= */
const CIRCUIT_MAIN = {
  nodes: {
    app:     { x: 30,  y: 40,  w: 150, h: 58, label: 'Aplikasi mBot', icon: '\uf3cd',
      desc: 'Antarmuka kendali di smartphone operator, terhubung ke mCore V1.5 lewat Bluetooth untuk mengemudikan rover dan memicu pompa.' },
    battery: { x: 30,  y: 170, w: 150, h: 58, label: 'Baterai Kotak 9V', icon: '\uf5df',
      desc: 'Sumber daya utama sekali pakai yang menyalakan mCore V1.5 dan Arduino Nano.' },
    powerbank: { x: 30, y: 260, w: 150, h: 58, label: 'Powerbank', icon: '\uf242',
      desc: 'Sumber daya alternatif isi ulang, dapat menggantikan baterai kotak 9V.' },
    mcore:   { x: 250, y: 140, w: 150, h: 70, label: 'mCore V1.5', icon: '\uf2db',
      desc: 'Makeblock mCore V1.5 menerima perintah dari aplikasi mBot lewat Bluetooth dan menggerakkan keempat motor DC TT rover.' },
    motors:  { x: 480, y: 40,  w: 150, h: 58, label: '4x Motor DC TT', icon: '\uf3fd',
      desc: 'Motor penggerak roda yang memberi mobilitas pada rover di lahan, dikendalikan langsung oleh mCore V1.5.' },
    nano:    { x: 480, y: 230, w: 150, h: 70, label: 'Arduino Nano', icon: '\uf2db',
      desc: 'Mikrokontroler utama yang membaca sensor ultrasonik HC-SR04 dan mengaktifkan relay pompa submersible atas perintah mCore V1.5.' },
    hcsr04:  { x: 700, y: 140, w: 150, h: 58, label: 'HC-SR04', icon: '\uf7a3',
      desc: 'Sensor ultrasonik untuk mendeteksi rintangan di depan rover, dibaca langsung oleh Arduino Nano.' },
    pump:    { x: 700, y: 260, w: 150, h: 58, label: 'Pompa Submersible', icon: '\uf773',
      desc: 'Memompa air dari tangki menuju nozzle penyiraman saat diaktifkan oleh Arduino Nano.' },
  },
  edges: [
    ['app', 'mcore', 'signal'],
    ['battery', 'mcore', 'power'], ['powerbank', 'mcore', 'power'],
    ['battery', 'nano', 'power'],
    ['mcore', 'motors', 'power'],
    ['mcore', 'nano', 'signal'],
    ['nano', 'hcsr04', 'signal'],
    ['nano', 'pump', 'power'],
  ],
};

const CIRCUIT_VERITAS = {
  nodes: {
    esp32: { x: 60,  y: 160, w: 170, h: 70, label: 'ESP32 30-Pin', icon: '\uf2db',
      desc: 'Mikrokontroler IoT modul VeritasNode; membaca probe soil moisture dan mengirim datanya lewat WiFi ke AgriCloud:V.' },
    soil:  { x: 340, y: 60,  w: 170, h: 58, label: 'Soil Moisture Sensor', icon: '\uf043',
      desc: 'Probe analog yang mengukur kadar air dalam tanah di sekitar perakaran tanaman.' },
    cloud: { x: 340, y: 260, w: 170, h: 58, label: 'AgriCloud:V Dashboard', icon: '\uf0c2',
      desc: 'Dashboard IoT di smartphone yang menampilkan kadar kelembapan tanah secara real-time lewat koneksi WiFi.' },
  },
  edges: [
    ['soil', 'esp32', 'signal'],
    ['esp32', 'cloud', 'signal'],
  ],
};

let activeBlueprint = 'main';

function drawCircuit(diagram) {
  const wrap = document.getElementById('circuitSvgWrap');
  wrap.innerHTML = '';
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 900 360');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Diagram sirkuit AgriVeritas');

  diagram.edges.forEach(([fromId, toId, kind]) => {
    const a = diagram.nodes[fromId], b = diagram.nodes[toId];
    const ax = a.x + a.w / 2, ay = a.y + a.h / 2;
    const bx = b.x + b.w / 2, by = b.y + b.h / 2;
    const path = document.createElementNS(svgNS, 'path');
    const midX = (ax + bx) / 2;
    path.setAttribute('d', `M ${ax} ${ay} C ${midX} ${ay}, ${midX} ${by}, ${bx} ${by}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', kind === 'power' ? '#ffb648' : '#57b8ec');
    path.setAttribute('stroke-width', kind === 'power' ? '3.5' : '2.5');
    path.setAttribute('class', 'circuit-flow-line');
    path.setAttribute('opacity', '0.85');
    svg.appendChild(path);
  });

  Object.entries(diagram.nodes).forEach(([id, n]) => {
    const g = document.createElementNS(svgNS, 'g');
    g.setAttribute('class', 'circuit-node');
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', n.label);

    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('x', n.x); rect.setAttribute('y', n.y);
    rect.setAttribute('width', n.w); rect.setAttribute('height', n.h);
    rect.setAttribute('rx', '14');
    rect.setAttribute('fill', 'rgba(255,255,255,0.85)');
    rect.setAttribute('stroke', '#1f7a52');
    rect.setAttribute('stroke-width', '1.5');
    g.appendChild(rect);

    const text = document.createElementNS(svgNS, 'text');
    text.setAttribute('x', n.x + n.w / 2);
    text.setAttribute('y', n.y + n.h / 2 + 5);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '13');
    text.setAttribute('font-weight', '600');
    text.setAttribute('fill', '#163428');
    text.textContent = n.label;
    g.appendChild(text);

    function open() { showCircuitDetail(n.label, n.desc); }
    g.addEventListener('click', open);
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    svg.appendChild(g);
  });

  wrap.appendChild(svg);
}

function initCircuit() {
  drawCircuit(CIRCUIT_MAIN);

  document.getElementById('circuitDetailClose').addEventListener('click', () => {
    document.getElementById('circuitDetail').hidden = true;
  });

  const toggleBtn = document.getElementById('blueprintToggle');
  const toggleLabel = document.getElementById('blueprintToggleLabel');
  const title = document.getElementById('blueprintTitle');
  const desc = document.getElementById('blueprintDesc');

  toggleBtn.addEventListener('click', () => {
    document.getElementById('circuitDetail').hidden = true;
    activeBlueprint = activeBlueprint === 'main' ? 'veritas' : 'main';
    if (activeBlueprint === 'veritas') {
      drawCircuit(CIRCUIT_VERITAS);
      title.textContent = 'Blueprint VeritasNode';
      desc.textContent = 'Modul IoT tambahan AgriVeritas: ESP32 membaca probe soil moisture dan mengirim datanya ke dashboard AgriCloud:V lewat WiFi.';
      toggleLabel.textContent = 'Kembali ke Sirkuit Utama';
      toggleBtn.classList.add('is-active');
    } else {
      drawCircuit(CIRCUIT_MAIN);
      title.textContent = 'Peta Sirkuit Utama';
      desc.textContent = 'Diagram alur daya dan sinyal yang menghubungkan sensor, kontroler, dan aktuator inti pada AgriVeritas. Klik simpul untuk melihat detail.';
      toggleLabel.textContent = 'Lihat Blueprint VeritasNode';
      toggleBtn.classList.remove('is-active');
    }
  });
}

function showCircuitDetail(title, body) {
  const panel = document.getElementById('circuitDetail');
  document.getElementById('circuitDetailTitle').textContent = title;
  document.getElementById('circuitDetailBody').textContent = body;
  panel.hidden = false;
}

/* =========================================================
   5. Hardware components — Utama & VeritasNode
   ========================================================= */
const COMPONENTS_MAIN = [
  { name: 'Makeblock mCore V1.5', specs: [['Peran', 'Kontroler penggerak'], ['Koneksi', 'Bluetooth ke aplikasi mBot'], ['Fungsi', 'Menggerakkan 4x motor DC TT']],
    svg: svgMcore() },
  { name: 'Arduino Nano', specs: [['Peran', 'Mikrokontroler utama sensor & pompa'], ['I/O', 'Digital & Analog'], ['Fungsi', 'Membaca HC-SR04, mengaktifkan pompa']],
    svg: svgNano() },
  { name: 'Aplikasi mBot', specs: [['Platform', 'Android/iOS'], ['Koneksi', 'Bluetooth'], ['Fungsi', 'Kendali kemudi & pompa dari smartphone']],
    svg: svgAppPhone() },
  { name: 'Sensor Ultrasonik HC-SR04', specs: [['Jangkauan', '2–400 cm'], ['Akurasi', '±3mm'], ['Trigger', '10µs pulse']],
    svg: svgUltrasonic() },
  { name: '4x Motor DC TT', specs: [['Tegangan', '3–6V'], ['RPM', '~200 RPM'], ['Fungsi', 'Penggerak roda']],
    svg: svgTTMotor() },
  { name: 'Pompa Air Submersible', specs: [['Tegangan', '3–6V'], ['Debit', '~1.5 L/menit'], ['Fungsi', 'Penyiraman lewat nozzle']],
    svg: svgPump() },
  { name: 'Baterai Kotak 9V', specs: [['Tegangan', '9V'], ['Tipe', 'Alkaline sekali pakai'], ['Fungsi', 'Sumber daya utama']],
    svg: svgBattery9V() },
  { name: 'Powerbank', specs: [['Tegangan Keluaran', '5V DC'], ['Tipe', 'Isi ulang'], ['Fungsi', 'Sumber daya alternatif']],
    svg: svgPowerbank() },
];

const COMPONENTS_VERITAS = [
  { name: 'ESP32 30-Pin Microcontroller', specs: [['Clock', '240 MHz Dual-Core'], ['WiFi/BT', 'Terintegrasi'], ['GPIO', '30 Pin']],
    svg: svgChip() },
  { name: 'Soil Moisture Sensor', specs: [['Output', 'Analog & Digital'], ['Tegangan', '3.3–5V'], ['Fungsi', 'Deteksi kelembapan tanah']],
    svg: svgProbe() },
  { name: 'AgriCloud:V Dashboard', specs: [['Platform', 'Android/iOS'], ['Koneksi', 'WiFi'], ['Fungsi', 'Menampilkan data kelembapan tanah real-time']],
    svg: svgCloudDash() },
];

let activeComponentView = 'main';

function renderComponents(list) {
  const grid = document.getElementById('componentGrid');
  grid.innerHTML = '';
  list.forEach(c => {
    const card = document.createElement('article');
    card.className = 'component-card glass-panel';
    const specsHtml = c.specs.map(([k, v]) => `<li><span>${k}</span><span>${v}</span></li>`).join('');
    card.innerHTML = `
      <div class="component-card__art">${c.svg}</div>
      <h3>${c.name}</h3>
      <ul class="component-card__specs">${specsHtml}</ul>
    `;
    grid.appendChild(card);
  });
}

function initComponents() {
  renderComponents(COMPONENTS_MAIN);

  const toggleBtn = document.getElementById('veritasComponentsToggle');
  const toggleLabel = document.getElementById('veritasComponentsToggleLabel');
  const title = document.getElementById('componentsTitle');
  const desc = document.getElementById('componentsDesc');

  toggleBtn.addEventListener('click', () => {
    activeComponentView = activeComponentView === 'main' ? 'veritas' : 'main';
    if (activeComponentView === 'veritas') {
      renderComponents(COMPONENTS_VERITAS);
      title.textContent = 'Komponen VeritasNode';
      desc.textContent = 'Modul IoT tambahan yang mengirim data kelembapan tanah ke dashboard AgriCloud:V.';
      toggleLabel.textContent = 'Kembali ke Komponen Utama';
      toggleBtn.classList.add('is-active');
    } else {
      renderComponents(COMPONENTS_MAIN);
      title.textContent = 'Komponen Hardware Utama';
      desc.textContent = 'Spesifikasi teknis setiap modul yang membangun sistem inti AgriVeritas.';
      toggleLabel.textContent = 'Lihat Komponen VeritasNode';
      toggleBtn.classList.remove('is-active');
    }
  });
}

/* -- Vector component illustrations (simplified realistic SVGs) -- */
function svgChip() {
  return `<svg viewBox="0 0 140 110" width="120"><rect x="30" y="18" width="80" height="74" rx="4" fill="#2b3a3f"/>
  <rect x="38" y="26" width="64" height="58" rx="2" fill="#37474f"/>
  <circle cx="48" cy="36" r="2" fill="#57b8ec"/>
  <text x="70" y="58" font-size="9" fill="#b7ecc9" text-anchor="middle" font-family="monospace">ESP32</text>
  <text x="70" y="70" font-size="7" fill="#8fa89d" text-anchor="middle" font-family="monospace">WROOM-32</text>
  ${pins(30, 18, 80, 74, 15)}</svg>`;
}
function pins(x, y, w, h, count) {
  let out = '';
  const gap = w / (count - 1);
  for (let i = 0; i < count; i++) {
    const px = x + gap * i;
    out += `<rect x="${px - 1.5}" y="${y - 10}" width="3" height="10" fill="#c0c0c0"/>`;
    out += `<rect x="${px - 1.5}" y="${y + h}" width="3" height="10" fill="#c0c0c0"/>`;
  }
  return out;
}
function svgNano() {
  return `<svg viewBox="0 0 140 110" width="120"><rect x="26" y="30" width="88" height="50" rx="4" fill="#0e6b52" stroke="#0a4d3b"/>
  <rect x="40" y="40" width="60" height="20" rx="2" fill="#2c2c2c"/>
  <text x="70" y="53" font-size="7" fill="#d1ffe9" text-anchor="middle" font-family="monospace">NANO</text>
  <circle cx="105" cy="42" r="3" fill="#57b8ec"/>
  ${pins(26, 30, 88, 50, 12)}</svg>`;
}
function svgMcore() {
  return `<svg viewBox="0 0 140 110" width="120"><circle cx="70" cy="55" r="44" fill="#1a3b8f" stroke="#122a66" stroke-width="2"/>
  <circle cx="70" cy="55" r="30" fill="#274fc2"/>
  <text x="70" y="50" font-size="9" fill="#fff" text-anchor="middle" font-family="monospace">mCore</text>
  <text x="70" y="62" font-size="8" fill="#cfe0ff" text-anchor="middle" font-family="monospace">V1.5</text>
  <circle cx="70" cy="55" r="44" fill="none" stroke="#57b8ec" stroke-width="1" stroke-dasharray="4 4"/>
  </svg>`;
}
function svgAppPhone() {
  return `<svg viewBox="0 0 140 110" width="120"><rect x="45" y="10" width="50" height="90" rx="10" fill="#2b3a3f" stroke="#0a0a0a"/>
  <rect x="50" y="18" width="40" height="66" rx="2" fill="#57b8ec"/>
  <circle cx="70" cy="92" r="4" fill="#1a1a1a"/>
  <path d="M58 45 L70 33 L82 45 M70 33 L70 63" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}
function svgCloudDash() {
  return `<svg viewBox="0 0 140 110" width="120">
  <path d="M35 70 a18 18 0 0 1 4-35 a24 24 0 0 1 46-8 a18 18 0 0 1 15 33 a18 18 0 0 1 -4 10 Z" fill="#eaf7ff" stroke="#57b8ec" stroke-width="2"/>
  <rect x="55" y="58" width="30" height="34" rx="4" fill="#2b3a3f"/>
  <rect x="59" y="63" width="22" height="20" rx="1" fill="#3fae74"/>
  <text x="70" y="76" font-size="6" fill="#fff" text-anchor="middle" font-family="monospace">AgriCloud</text>
  </svg>`;
}
function svgProbe() {
  return `<svg viewBox="0 0 140 110" width="120"><rect x="45" y="10" width="50" height="26" rx="4" fill="#2e7d5b"/>
  <text x="70" y="27" font-size="7" fill="#fff" text-anchor="middle" font-family="monospace">MODULE</text>
  <rect x="66" y="36" width="8" height="16" fill="#8a8a8a"/>
  <path d="M55 52 L85 52 L80 96 L60 96 Z" fill="#c7c7c7" stroke="#8a8a8a"/>
  <path d="M55 52 L85 52 L80 96 L60 96 Z" fill="none" stroke="#8a8a8a"/>
  <rect x="63" y="60" width="14" height="30" fill="#e0e0e0"/>
  </svg>`;
}
function svgUltrasonic() {
  return `<svg viewBox="0 0 140 110" width="120"><rect x="30" y="35" width="80" height="34" rx="4" fill="#e6e6e6" stroke="#999"/>
  <circle cx="55" cy="52" r="14" fill="#c8c8c8" stroke="#8a8a8a"/>
  <circle cx="85" cy="52" r="14" fill="#c8c8c8" stroke="#8a8a8a"/>
  <circle cx="55" cy="52" r="9" fill="#9a9a9a"/><circle cx="85" cy="52" r="9" fill="#9a9a9a"/>
  ${[0,1,2,3].map(i => `<rect x="${45+i*10}" y="69" width="3" height="12" fill="#c0c0c0"/>`).join('')}
  </svg>`;
}
function svgBattery9V() {
  return `<svg viewBox="0 0 140 110" width="120"><rect x="40" y="18" width="60" height="78" rx="6" fill="#2c2c2c"/>
  <rect x="46" y="24" width="48" height="30" rx="2" fill="#f4c430"/>
  <text x="70" y="43" font-size="9" fill="#2c2c2c" text-anchor="middle" font-family="monospace">9V</text>
  <rect x="58" y="8" width="10" height="10" fill="#c0c0c0"/><rect x="74" y="8" width="10" height="10" fill="#c0c0c0"/>
  </svg>`;
}
function svgPowerbank() {
  return `<svg viewBox="0 0 140 110" width="120"><rect x="35" y="20" width="70" height="70" rx="10" fill="#37474f" stroke="#1c262b"/>
  <circle cx="70" cy="40" r="6" fill="#57b8ec"/>
  ${[0,1,2].map(i => `<rect x="60" y="${58+i*8}" width="20" height="4" rx="2" fill="#8fa89d"/>`).join('')}
  <rect x="64" y="12" width="12" height="10" fill="#c0c0c0"/>
  </svg>`;
}
function svgTTMotor() {
  return `<svg viewBox="0 0 140 110" width="120"><rect x="30" y="34" width="46" height="30" rx="4" fill="#f4c430"/>
  <rect x="76" y="42" width="18" height="14" fill="#8a8a8a"/>
  <circle cx="108" cy="49" r="20" fill="#2c2c2c"/><circle cx="108" cy="49" r="7" fill="#555"/>
  </svg>`;
}
function svgPump() {
  return `<svg viewBox="0 0 140 110" width="120"><ellipse cx="70" cy="66" rx="34" ry="20" fill="#2b3a3f"/>
  <rect x="50" y="26" width="40" height="42" rx="16" fill="#37474f"/>
  <circle cx="70" cy="40" r="8" fill="#57b8ec"/>
  <rect x="66" y="16" width="8" height="14" fill="#8a8a8a"/>
  </svg>`;
}

/* =========================================================
   6. Simulation — Video player & Soil Moisture IoT Dashboard
   ========================================================= */
let simSoilState = 'normal';
let soilClickCount = 0;

function initSimulation() {
  // Hidden shortcut: 5 left clicks pada iot-dashboard__reading untuk toggle kondisi tanah
  const soilTrigger = document.getElementById('soilConditionTrigger');
  soilTrigger.addEventListener('click', (e) => {
    if (e.button === 0) { // Left click only
      soilClickCount++;
      if (soilClickCount === 5) {
        simSoilState = simSoilState === 'normal' ? 'kering' : 'normal';
        soilClickCount = 0;
        refreshIotDashboard();
      }
    }
  });

  refreshIotDashboard();
}

function refreshIotDashboard() {
  const isKering = simSoilState === 'kering';
  const soilPct = isKering ? (18 + Math.floor(Math.random() * 8)) : (55 + Math.floor(Math.random() * 15));

  const valueEl = document.getElementById('iotSoilValue');
  const stateEl = document.getElementById('iotSoilState');
  valueEl.textContent = `${soilPct}%`;
  stateEl.textContent = isKering ? 'Tanah Kering' : 'Tanah Basah';
  stateEl.style.color = isKering ? 'var(--sun-700)' : 'var(--leaf-700)';
}

/* =========================================================
   7. Boot
   ========================================================= */
document.addEventListener('DOMContentLoaded', runBootSequence);
