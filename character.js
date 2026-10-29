// character.js - 3D Character Rig with User-Requested Custom Stickers (Diet Coke, MongoDB, Python, Git)
// All other stickers are completely removed. Real-time 3D cursor eye tracking & scroll camera scrubbing preserved.

// Helper to draw rounded rectangle on 2D canvas
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// 4 User-Requested Stickers Configuration
const USER_STICKERS = {
  // 1. Left Cheek -> DIET COKE CAN
  sticker0: {
    id: 'coke',
    name: 'Diet Coke',
    desc: 'Fuel for late-night coding sessions, algorithmic breakthroughs & pure focus.',
    badge: '🥤',
    processType: 'coke'
  },

  // 2. Right Cheek -> MONGODB
  sticker5: {
    id: 'mongo',
    name: 'MongoDB',
    desc: 'NoSQL document database, aggregation pipelines, flexible schemas & MERN stack.',
    badge: '🍃',
    processType: 'mongo'
  },

  // 3. Bridge of Nose -> PYTHON LOGO
  sticker6: {
    id: 'python',
    name: 'Python 3',
    desc: 'Core data structures, scripting, algorithm engineering & backend automation.',
    badge: '🐍',
    processType: 'python'
  },

  // 4. Forehead -> GIT BRANCH
  sticker7: {
    id: 'git',
    name: 'Git & GitHub',
    desc: 'Version control, feature branching, pull request reviews & open source collaboration.',
    badge: '🐙',
    processType: 'git'
  }
};

// BFS Flood-fill to remove solid/light background around stickers
function floodFillAlpha(imgData, width, height, tolerance = 238) {
  const d = imgData.data;
  const visited = new Uint8Array(width * height);
  const queue = [];

  function isBackground(idx) {
    const r = d[idx];
    const g = d[idx + 1];
    const b = d[idx + 2];
    const a = d[idx + 3];
    if (a < 15) return true;
    return r >= tolerance && g >= tolerance && b >= tolerance;
  }

  // Push border pixels
  for (let x = 0; x < width; x++) {
    queue.push(x, 0);
    queue.push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    queue.push(0, y);
    queue.push(width - 1, y);
  }

  let head = 0;
  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];
    const pIdx = y * width + x;
    if (visited[pIdx]) continue;
    visited[pIdx] = 1;

    const dIdx = pIdx * 4;
    if (isBackground(dIdx)) {
      d[dIdx + 3] = 0; // Transparent

      if (x > 0 && !visited[pIdx - 1]) queue.push(x - 1, y);
      if (x < width - 1 && !visited[pIdx + 1]) queue.push(x + 1, y);
      if (y > 0 && !visited[pIdx - width]) queue.push(x, y - 1);
      if (y < height - 1 && !visited[pIdx + width]) queue.push(x, y + 1);
    }
  }
}

// Process and create an ultra-clean die-cut vinyl sticker texture for each uploaded image
function createUserStickerTexture(stickerDef, onReady) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.flipY = true;

  const rawSrc = window.UPLOADED_STICKERS && window.UPLOADED_STICKERS[stickerDef.id];
  if (!rawSrc) return texture;

  const img = new Image();
  img.onload = () => {
    const cw = 512;
    const ch = 512;

    // Offscreen temp canvas for image extraction
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = img.naturalWidth || 512;
    tempCanvas.height = img.naturalHeight || 512;
    const tCtx = tempCanvas.getContext('2d');
    tCtx.drawImage(img, 0, 0);

    const imgData = tCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const d = imgData.data;

    // 1. Process Diet Coke: Flood-fill white background outside sticker boundary
    if (stickerDef.processType === 'coke') {
      floodFillAlpha(imgData, tempCanvas.width, tempCanvas.height, 240);
      tCtx.putImageData(imgData, 0, 0);

      // Draw onto final canvas with slight die-cut white outline
      ctx.clearRect(0, 0, cw, ch);

      // Fit can preserving aspect ratio
      const scale = Math.min((cw - 40) / tempCanvas.width, (ch - 40) / tempCanvas.height);
      const dw = tempCanvas.width * scale;
      const dh = tempCanvas.height * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;

      // Soft shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 4;
      ctx.drawImage(tempCanvas, dx, dy, dw, dh);
      ctx.shadowColor = 'transparent';
    }

    // 2. Process MongoDB
    else if (stickerDef.processType === 'mongo') {
      // Remove any pure black or pure white surrounding box
      floodFillAlpha(imgData, tempCanvas.width, tempCanvas.height, 245);
      // Also check corners for black
      if (d[0] < 30 && d[1] < 30 && d[2] < 30) {
        for (let i = 0; i < d.length; i += 4) {
          if (d[i] < 35 && d[i + 1] < 35 && d[i + 2] < 35) {
            d[i + 3] = 0;
          }
        }
      }
      tCtx.putImageData(imgData, 0, 0);

      // White die-cut vinyl background
      ctx.clearRect(0, 0, cw, ch);
      ctx.fillStyle = '#ffffff';
      drawRoundedRect(ctx, 35, 120, cw - 70, ch - 240, 45);
      ctx.fill();
      ctx.strokeStyle = '#1a3311';
      ctx.lineWidth = 8;
      ctx.stroke();

      const scale = Math.min((cw - 100) / tempCanvas.width, (ch - 270) / tempCanvas.height);
      const dw = tempCanvas.width * scale;
      const dh = tempCanvas.height * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;

      ctx.drawImage(tempCanvas, dx, dy, dw, dh);
    }

    // 3. Process Python Logo
    else if (stickerDef.processType === 'python') {
      // Remove any dark/white box
      for (let i = 0; i < d.length; i += 4) {
        // Transparent if near black or corner background
        if (d[i] < 20 && d[i + 1] < 20 && d[i + 2] < 20) {
          d[i + 3] = 0;
        }
      }
      tCtx.putImageData(imgData, 0, 0);

      ctx.clearRect(0, 0, cw, ch);

      // White die-cut pill backing
      ctx.fillStyle = '#ffffff';
      drawRoundedRect(ctx, 30, 30, cw - 60, ch - 60, 60);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 8;
      ctx.stroke();

      // Dark inner backdrop
      ctx.fillStyle = '#1e2838';
      drawRoundedRect(ctx, 38, 38, cw - 76, ch - 76, 52);
      ctx.fill();

      const scale = Math.min((cw - 110) / tempCanvas.width, (ch - 110) / tempCanvas.height);
      const dw = tempCanvas.width * scale;
      const dh = tempCanvas.height * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;

      ctx.drawImage(tempCanvas, dx, dy, dw, dh);
    }

    // 4. Process Git Branch (Strips out fake checkerboard background and creates a pristine die-cut sticker)
    else if (stickerDef.processType === 'git') {
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];
        // Git branch is vivid orange: R is dominant, G is moderate, B is low.
        // Checkerboard squares are grey/white/black where R, G, B are roughly equal.
        const isOrange = r > 165 && (r - g) > 35 && b < 100;
        if (!isOrange) {
          d[i + 3] = 0; // Eliminate fake checkerboard completely!
        }
      }
      tCtx.putImageData(imgData, 0, 0);

      ctx.clearRect(0, 0, cw, ch);

      // White die-cut sticker backing
      ctx.fillStyle = '#ffffff';
      drawRoundedRect(ctx, 35, 35, cw - 70, ch - 70, 55);
      ctx.fill();
      ctx.strokeStyle = '#222222';
      ctx.lineWidth = 8;
      ctx.stroke();

      // Vivid Git orange badge backdrop
      ctx.fillStyle = '#f05032';
      drawRoundedRect(ctx, 43, 43, cw - 86, ch - 86, 47);
      ctx.fill();

      // Draw the isolated orange icon with clean white outline in center
      const scale = Math.min((cw - 120) / tempCanvas.width, (ch - 120) / tempCanvas.height);
      const dw = tempCanvas.width * scale;
      const dh = tempCanvas.height * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;

      // Draw white silhouette behind for crisp contrast
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.drawImage(tempCanvas, dx, dy, dw, dh);
      ctx.drawImage(tempCanvas, dx, dy, dw, dh);
      ctx.shadowColor = 'transparent';
    }

    texture.needsUpdate = true;
    if (onReady) onReady();
  };
  img.src = rawSrc;

  return texture;
}

// Normalizes geometry UV coordinates from [min, max] atlas slice to [0, 1] full texture
function normalizeMeshUVs(geometry) {
  const uv = geometry.attributes.uv;
  let minU = Infinity, maxU = -Infinity;
  let minV = Infinity, maxV = -Infinity;

  for (let i = 0; i < uv.count; i++) {
    const u = uv.getX(i);
    const v = uv.getY(i);
    if (u < minU) minU = u;
    if (u > maxU) maxU = u;
    if (v < minV) minV = v;
    if (v > maxV) maxV = v;
  }

  const rangeU = maxU - minU || 1;
  const rangeV = maxV - minV || 1;
  const newUV = uv.clone();

  for (let i = 0; i < uv.count; i++) {
    const u = (uv.getX(i) - minU) / rangeU;
    const v = (uv.getY(i) - minV) / rangeV;
    newUV.setXY(i, u, v);
  }

  geometry.setAttribute('uv', newUV);
}

class CharacterRig {
  constructor(scene, camera, onLoaded) {
    this.scene = scene;
    this.camera = camera;
    this.onLoaded = onLoaded;

    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Position and scale matching scene parameters
    this.posX = 0;
    this.posY = 0.4;
    this.posZ = -0.7;
    this.scale = 2.25;
    this.group.position.set(this.posX, this.posY, this.posZ);
    this.group.scale.set(this.scale, this.scale, this.scale);

    this.isLoaded = false;
    this.model = null;
    this.glbCam = null;
    this.eyes = [];
    this.stickers = [];
    this.mixer = null;
    this.actions = [];
    this.totalDuration = 0;
    this.FPS = 24;

    this.mouse = { x: 0, y: 0 };
    this.smouse = { x: 0, y: 0 };
    this.scrollProgress = 0;
    this.targetScrollProgress = 0;

    this.focusPoint = new THREE.Vector3(0, 0.4, 0);
    this.camPos = new THREE.Vector3();
    this.camQuat = new THREE.Quaternion();
    this.camScl = new THREE.Vector3();
    this.paraEuler = new THREE.Euler(0, 0, 0, 'YXZ');
    this.paraQuat = new THREE.Quaternion();
    this.tmpVec = new THREE.Vector3();
    this.tmpEuler = new THREE.Euler(0, 0, 0, 'YXZ');
    this.tmpQuat = new THREE.Quaternion();
    this.desiredQuat = new THREE.Quaternion();

    this.eyeConfig = {
      enabled: true,
      gain: 2.8,
      maxYaw: 16,
      maxPitch: 9,
      invertX: false,
      invertY: false,
      smooth: 0.42,
      crossEye: 40,
      crossRadius: 0.3
    };

    this.camConfig = {
      damping: 0.1,
      parallax: 3.5,
      parallaxEase: 0.12
    };

    this.init();
  }

  init() {
    const loader = new THREE.GLTFLoader();
    const modelSource = window.CHARACTER_MODEL_BASE64 || 'me.glb';

    loader.load(
      modelSource,
      (gltf) => this.onModelLoaded(gltf),
      undefined,
      (err) => {
        console.warn('Fallback loading me.glb:', err);
        loader.load('me.glb', (gltf) => this.onModelLoaded(gltf));
      }
    );
  }

  onModelLoaded(gltf) {
    this.model = gltf.scene;
    this.animations = gltf.animations || [];
    this.group.add(this.model);

    // Traverse model:
    // 1. Only KEEP the 4 user-specified stickers (Diet Coke, MongoDB, Python, Git)
    // 2. REMOVE / HIDE ALL OTHER STICKERS!
    this.model.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;

        if (o.geometry) {
          o.geometry.computeVertexNormals();
        }

        if (o.name.startsWith('sticker')) {
          const userStickerDef = USER_STICKERS[o.name];

          if (userStickerDef) {
            // Keep and configure one of the 4 requested stickers
            o.visible = true;

            // Isolate UVs
            o.geometry = o.geometry.clone();
            normalizeMeshUVs(o.geometry);

            // Generate custom die-cut vinyl texture from uploaded image
            const stickerTexture = createUserStickerTexture(userStickerDef, () => {
              if (o.material) o.material.needsUpdate = true;
            });

            o.material = new THREE.MeshStandardMaterial({
              map: stickerTexture,
              transparent: true,
              alphaTest: 0.05,
              roughness: 0.42,
              metalness: 0.05,
              side: THREE.DoubleSide,
              depthWrite: false
            });

            o.userData = {
              isSticker: true,
              id: userStickerDef.id,
              name: userStickerDef.name,
              desc: userStickerDef.desc,
              badge: userStickerDef.badge
            };

            this.stickers.push(o);
          } else {
            // REMOVE ALL OTHER STICKERS COMPLETELY!
            o.visible = false;
          }
        } else {
          // Normal character meshes (Skin, Hair, Teeth, Shirt)
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach((m) => {
            if (m) {
              m.flatShading = false;
              m.roughness = Math.max(0.35, m.roughness || 0.5);
              m.needsUpdate = true;
            }
          });
        }
      }

      // Detect Camera
      if (o.isCamera) {
        this.glbCam = o;
      }

      // Collect Eye meshes for tracking
      if (/eye/i.test(o.name)) {
        this.eyes.push({
          obj: o,
          base: o.quaternion.clone(),
          x: o.position.x,
          sx: 0
        });
      }
    });

    // Eye convergence calculation
    if (this.eyes.length > 1) {
      const xs = this.eyes.map((e) => e.x);
      const min = Math.min(...xs);
      const max = Math.max(...xs);
      const mid = (min + max) / 2;
      this.eyes.forEach((e) => {
        e.sx = e.x < mid ? -1 : 1;
      });
    }

    // Set up Animation Mixer for camera timeline scrub
    this.mixer = new THREE.AnimationMixer(this.model);
    if (this.animations && this.animations.length > 0) {
      const camClip = this.animations.find((c) => c.name === 'CameraAction') || this.animations[0];
      this.totalDuration = camClip.duration;

      this.actions = this.animations.map((clip) => {
        const action = this.mixer.clipAction(clip);
        action.play();
        action.paused = true;
        return { action, duration: clip.duration };
      });
    }

    // Auto-fit & center for models from Tripo / external generators without glbCam
    if (!this.glbCam) {
      const box = new THREE.Box3().setFromObject(this.model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      this.model.position.x = -center.x;
      this.model.position.y = -center.y + size.y * 0.15;
      this.model.position.z = -center.z;

      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0) {
        const fitScale = 2.2 / maxDim;
        this.group.scale.set(fitScale, fitScale, fitScale);
      }
      this.group.position.set(0, 0.1, 0);
    }

    this.isLoaded = true;
    console.log(`Character loaded. glbCam: ${!!this.glbCam}, Eyes: ${this.eyes.length}`);

    if (this.onLoaded) {
      this.onLoaded(this);
    }
  }

  setMousePosition(x, y) {
    this.mouse.x = x;
    this.mouse.y = y;
  }

  setScrollProgress(progress) {
    this.targetScrollProgress = Math.max(0, Math.min(1, progress));
  }

  triggerReaction(type = 'wink') {
    if (this.eyes.length > 0) {
      this.eyes.forEach((e) => {
        gsap.to(e.obj.rotation, {
          z: e.obj.rotation.z + 0.35,
          duration: 0.18,
          yoyo: true,
          repeat: 1
        });
      });
    }
  }

  update(dt, time) {
    if (!this.isLoaded) return;

    // 1. Smooth scroll progress easing
    this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * 0.12;

    // 2. Scrub Camera & Model Animations along scroll timeline
    if (this.mixer && this.actions.length > 0) {
      const scrubTime = this.scrollProgress * this.totalDuration;
      for (const { action, duration } of this.actions) {
        action.time = Math.min(scrubTime, duration);
      }
      this.mixer.update(0);
    }

    // 3. Update Camera World Transform from glbCam + Orbital Mouse Parallax (or Procedural Orbit for Tripo models)
    if (this.glbCam && this.camera) {
      this.glbCam.updateWorldMatrix(true, false);
      this.glbCam.matrixWorld.decompose(this.camPos, this.camQuat, this.camScl);

      const me = 1 - Math.pow(this.camConfig.parallaxEase, Math.min(dt, 0.1));
      this.smouse.x += (this.mouse.x - this.smouse.x) * me;
      this.smouse.y += (this.mouse.y - this.smouse.y) * me;

      const ax = THREE.MathUtils.degToRad(this.camConfig.parallax);
      this.paraEuler.set(-this.smouse.y * ax, -this.smouse.x * ax, 0);
      this.paraQuat.setFromEuler(this.paraEuler);

      this.focusPoint.set(this.posX, this.posY + 0.25, this.posZ + 0.2);

      this.tmpVec.copy(this.camPos).sub(this.focusPoint).applyQuaternion(this.paraQuat);
      this.tmpVec.add(this.focusPoint);

      this.camera.position.copy(this.tmpVec);
      this.camera.quaternion.multiplyQuaternions(this.paraQuat, this.camQuat);

      if (this.glbCam.fov && Math.abs(this.camera.fov - this.glbCam.fov) > 0.1) {
        this.camera.fov = this.glbCam.fov;
        this.camera.updateProjectionMatrix();
      }
    } else if (this.camera) {
      // Automatic smooth cinematic glide for Tripo models across scroll waypoints
      const p = this.scrollProgress;
      const angle = (p - 0.5) * Math.PI * 0.75;
      const targetX = Math.sin(angle) * 1.5 + this.mouse.x * 0.35;
      const targetY = 0.35 + Math.sin(p * Math.PI * 2) * 0.2 - this.mouse.y * 0.2;
      const targetZ = 3.6 - Math.abs(Math.sin(angle)) * 0.4;

      this.camera.position.x += (targetX - this.camera.position.x) * 0.08;
      this.camera.position.y += (targetY - this.camera.position.y) * 0.08;
      this.camera.position.z += (targetZ - this.camera.position.z) * 0.08;
      this.camera.lookAt(0, 0.35, 0);
    }

    // 4. Real-Time 3D Eyeball Cursor Tracking
    if (this.eyeConfig.enabled && this.eyes.length > 0) {
      const sx = this.eyeConfig.invertX ? -1 : 1;
      const sy = this.eyeConfig.invertY ? -1 : 1;

      let ax = 0;
      let ay = 0;
      for (const e of this.eyes) {
        e.obj.getWorldPosition(this.tmpVec).project(this.camera);
        ax += this.tmpVec.x;
        ay += this.tmpVec.y;
      }
      ax /= this.eyes.length;
      ay /= this.eyes.length;

      const mx = this.mouse.x - ax;
      const my = this.mouse.y - ay;

      const yawBase = sx * mx * THREE.MathUtils.degToRad(this.eyeConfig.maxYaw) * this.eyeConfig.gain;
      const pitch = sy * -my * THREE.MathUtils.degToRad(this.eyeConfig.maxPitch) * this.eyeConfig.gain;

      const dist = Math.hypot(mx, my);
      const convWeight = THREE.MathUtils.clamp(1 - dist / this.eyeConfig.crossRadius, 0, 1);
      const convRad = THREE.MathUtils.degToRad(this.eyeConfig.crossEye) * convWeight;

      for (const e of this.eyes) {
        const yaw = yawBase - e.sx * convRad;
        this.tmpEuler.set(pitch, yaw, 0);
        this.tmpQuat.setFromEuler(this.tmpEuler);
        this.desiredQuat.copy(this.tmpQuat).multiply(e.base);
        e.obj.quaternion.slerp(this.desiredQuat, this.eyeConfig.smooth);
      }
    }
  }
}

window.CharacterRig = CharacterRig;
