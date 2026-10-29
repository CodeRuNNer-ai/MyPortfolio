// app.js - Three.js Scene, Studio Lighting, Scroll Gliding & Interactive Portfolio Logic
// Abhijeet Bhandari — 3D Character Portfolio

(function () {
  'use strict';

  // 1. Canvas & WebGL Renderer Setup
  const canvas = document.getElementById('webgl-canvas');
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    23.5, // Narrow cinematic FOV matching author's Blender camera
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0.4, 3.8);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    powerPreference: 'high-performance',
    alpha: false
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  // 2. Artistic Studio Gradient Background Sphere (Sage #6f906f to Cream #dbd3b5)
  const bgUniforms = {
    uTop: { value: new THREE.Color('#6f906f') },
    uBottom: { value: new THREE.Color('#dbd3b5') },
    uSteep: { value: 1.4 }
  };
  const bgGeo = new THREE.SphereGeometry(60, 32, 32);
  const bgMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: bgUniforms,
    vertexShader: `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uTop;
      uniform vec3 uBottom;
      uniform float uSteep;
      varying vec3 vDir;
      void main() {
        float t = clamp(vDir.y * uSteep * 0.5 + 0.5, 0.0, 1.0);
        gl_FragColor = vec4(mix(uBottom, uTop, t), 1.0);
      }
    `
  });
  const bgMesh = new THREE.Mesh(bgGeo, bgMat);
  scene.add(bgMesh);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x404040, 1.15);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xffd9c6, 2.35);
  keyLight.position.set(5, 8, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  keyLight.shadow.bias = -0.0005;
  scene.add(keyLight);

  // Soft Cool Fill Light (Front-Left)
  const fillLight = new THREE.DirectionalLight(0x9fc6ff, 2.25);
  fillLight.position.set(-5, 4, -4);
  scene.add(fillLight);

  // Rim Accent Light
  const rimLight = new THREE.DirectionalLight(0xffffff, 1.5);
  rimLight.position.set(0, 5, -5);
  scene.add(rimLight);

  // 4. Sound Synthesis (Web Audio API)
  let audioCtx = null;
  let sfxEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
  }

  function playPop(freq = 520, type = 'sine') {
    if (!sfxEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.4, audioCtx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.13);
    } catch (e) {}
  }

  function playChime() {
    if (!sfxEnabled || !audioCtx) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
      setTimeout(() => playPop(f, 'triangle'), idx * 75);
    });
  }

  // 5. Initialize Character Rig
  const loadingOverlay = document.getElementById('loadingOverlay');
  const character = new CharacterRig(scene, camera, () => {
    // Hide loading overlay once model is ready
    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
    }
    onScroll();
  });

  // 6. Mouse & Pointer Tracking for Real-Time 3D Eyeball Look-At
  const mouse = { x: 0, y: 0 };
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function onPointerMove(e) {
    initAudio();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

    mouse.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(clientY / window.innerHeight) * 2 + 1;

    character.setMousePosition(mouse.x, mouse.y);
    pointer.x = mouse.x;
    pointer.y = mouse.y;

    checkStickersRaycast();
  }

  window.addEventListener('mousemove', onPointerMove, { passive: true });
  window.addEventListener('touchmove', onPointerMove, { passive: true });

  // 7. Interactive Face Stickers Inspection
  const stickerPopover = document.getElementById('stickerPopover');
  const popoverTitle = document.getElementById('popoverTitle');
  const popoverDesc = document.getElementById('popoverDesc');
  const popoverBadge = document.getElementById('popoverBadge');
  let activeHoverSticker = null;

  function checkStickersRaycast() {
    if (!character.isLoaded || !character.stickers || character.stickers.length === 0) return;

    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(character.stickers, true);

    if (hits.length > 0) {
      const hit = hits[0].object;
      const data = hit.userData;
      if (activeHoverSticker !== hit && data && data.name) {
        activeHoverSticker = hit;
        document.body.style.cursor = 'pointer';
        popoverTitle.textContent = data.name;
        popoverDesc.textContent = data.desc || 'Interactive face sticker';
        popoverBadge.textContent = data.badge || '✨';
        stickerPopover.classList.add('visible');
        playPop(640, 'sine');
      }
    } else {
      if (activeHoverSticker) {
        activeHoverSticker = null;
        document.body.style.cursor = 'default';
        stickerPopover.classList.remove('visible');
      }
    }
  }

  canvas.addEventListener('click', () => {
    initAudio();
    character.triggerReaction('wink');
    playPop(720, 'sine');
    if (activeHoverSticker && typeof confetti === 'function') {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { x: (pointer.x + 1) / 2, y: (-pointer.y + 1) / 2 }
      });
    }
  });

  // 8. Scroll-Driven 3D Face Angle Gliding
  function onScroll() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? window.scrollY / docHeight : 0;
    character.setScrollProgress(progress);
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  const scrollTrigger = document.getElementById('scrollTrigger');
  if (scrollTrigger) {
    scrollTrigger.addEventListener('click', () => {
      initAudio();
      playPop(520, 'triangle');
      const storyEl = document.getElementById('storySection');
      if (storyEl) storyEl.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // 9. UI Controls (Audio, Risograph Filter, Copy)
  const sfxBtn = document.getElementById('sfxToggleBtn');
  const sfxIcon = document.getElementById('sfxIcon');
  if (sfxBtn) {
    sfxBtn.addEventListener('click', () => {
      initAudio();
      sfxEnabled = !sfxEnabled;
      sfxIcon.textContent = sfxEnabled ? '🔊' : '🔇';
      showToast(sfxEnabled ? 'Sound Enabled 🔊' : 'Sound Muted 🔇');
      if (sfxEnabled) playPop(600, 'sine');
    });
  }

  const grainBtn = document.getElementById('grainToggleBtn');
  const risoOverlay = document.getElementById('risographOverlay');
  if (grainBtn && risoOverlay) {
    grainBtn.addEventListener('click', () => {
      initAudio();
      risoOverlay.classList.toggle('subtle');
      const isSubtle = risoOverlay.classList.contains('subtle');
      showToast(isSubtle ? 'Clean Mode ✨' : 'Risograph Halftone Mode 🎨');
      playPop(540, 'triangle');
    });
  }

  const toastMsg = document.getElementById('toastMsg');
  let toastTimer = null;
  function showToast(text) {
    if (!toastMsg) return;
    toastMsg.textContent = text;
    toastMsg.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastMsg.classList.remove('show'), 2400);
  }

  function setupCopy(btnId, text, toast) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener('click', () => {
      initAudio();
      navigator.clipboard.writeText(text).then(() => {
        showToast(toast);
        playChime();
        if (typeof confetti === 'function') {
          confetti({ particleCount: 40, spread: 60, origin: { y: 0.85 } });
        }
      }).catch(() => showToast('Copied: ' + text));
    });
  }

  setupCopy('copyEmailBtn', 'abhibhandari30@gmail.com', 'Email copied to clipboard! ✉️');
  setupCopy('copyPhoneBtn', '+91 8193033508', 'Phone number copied! 📱');

  const quickSendBtn = document.getElementById('quickSendBtn');
  const quickMsgInput = document.getElementById('quickMsgInput');
  if (quickSendBtn && quickMsgInput) {
    quickSendBtn.addEventListener('click', () => {
      initAudio();
      const val = quickMsgInput.value.trim();
      if (!val) {
        showToast('Please type a message first! ✨');
        playPop(340, 'sawtooth');
        return;
      }
      if (typeof confetti === 'function') {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.7 } });
      }
      playChime();
      character.triggerReaction('wink');
      showToast('Message sent! Abhijeet will connect soon 🚀');
      quickMsgInput.value = '';
    });
    quickMsgInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') quickSendBtn.click();
    });
  }

  // 10. Resize Handling
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
  window.addEventListener('resize', onResize);

  // 11. Main Render Loop
  let lastTime = performance.now();
  function animate(timestamp) {
    requestAnimationFrame(animate);

    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    character.update(dt, timestamp);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);

})();
