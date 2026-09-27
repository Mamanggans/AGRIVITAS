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
