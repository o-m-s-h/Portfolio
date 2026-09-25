// Decorative interaction layer. The page's existing controls own motion preferences.
// Everything here is event driven: there is no animation loop running while idle.
const root = document.documentElement;
const cursor = document.querySelector('.cursor-orbit');
const projectGrid = document.getElementById('projectGrid');
const canFrame = typeof window.requestAnimationFrame === 'function';
const media = query => typeof window.matchMedia === 'function' ? window.matchMedia(query) : null;
const finePointer = media('(hover: hover) and (pointer: fine)');
const reducedMotion = media('(prefers-reduced-motion: reduce)');
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

let suspended = false;
let frame = 0;
let enabled = false;
let pointerEnabled = false;
let pointerPresent = false;
let pointerX = 0;
let pointerY = 0;
let pointerDirty = false;
let scrollDirty = true;
let tiltTarget = null;
let magneticTarget = null;
let tiltBounds = null;
let magneticBounds = null;

const tiltProperties = ['--pointer-x', '--pointer-y', '--tilt-x', '--tilt-y'];
const magneticProperties = ['--magnetic-x', '--magnetic-y'];

function clearElement(element, properties) {
  if (!element) return;
  element.classList.remove('is-interacting');
  properties.forEach(property => element.style.removeProperty(property));
}

function resetPointer() {
  clearElement(tiltTarget, tiltProperties);
  clearElement(magneticTarget, magneticProperties);
  tiltTarget = null;
  magneticTarget = null;
  tiltBounds = null;
  magneticBounds = null;
  pointerPresent = false;
  pointerDirty = false;
  if (cursor) {
    cursor.classList.remove('is-active', 'is-hovering');
    cursor.style.removeProperty('--cursor-x');
    cursor.style.removeProperty('--cursor-y');
  }
}

function cancelFrame() {
  if (frame) window.cancelAnimationFrame(frame);
  frame = 0;
}

function resetMotion() {
  cancelFrame();
  resetPointer();
  root.style.removeProperty('--hero-drift');
  scrollDirty = true;
}

function scheduleFrame() {
  if (enabled && !frame) frame = window.requestAnimationFrame(paint);
}

function setTargets(element) {
  const nextTilt = element?.closest('[data-tilt]') || null;
  const nextMagnetic = element?.closest('[data-magnetic]') || null;
  if (nextTilt !== tiltTarget) {
    clearElement(tiltTarget, tiltProperties);
    tiltTarget = nextTilt;
    tiltBounds = null;
  }
  if (nextMagnetic !== magneticTarget) {
    clearElement(magneticTarget, magneticProperties);
    magneticTarget = nextMagnetic;
    magneticBounds = null;
  }
  cursor?.classList.toggle('is-hovering', Boolean(element?.closest('.project-art')));
}

function paint() {
  frame = 0;
  if (!enabled || suspended || document.hidden) return;

  // Read geometry before writing styles. Bounds are cached until the target changes,
  // the viewport resizes, or a scroll invalidates the pointer interaction.
  if (pointerDirty && pointerEnabled && pointerPresent) {
    if (tiltTarget?.isConnected && !tiltBounds) tiltBounds = tiltTarget.getBoundingClientRect();
    if (magneticTarget?.isConnected && !magneticBounds) magneticBounds = magneticTarget.getBoundingClientRect();
  }

  if (scrollDirty) {
    const drift = clamp((window.scrollY || 0) * 0.12, 0, 70);
    root.style.setProperty('--hero-drift', `${drift.toFixed(2)}px`);
    scrollDirty = false;
  }

  if (!pointerDirty || !pointerEnabled || !pointerPresent) return;
  pointerDirty = false;

  if (cursor) {
    cursor.style.setProperty('--cursor-x', `${pointerX.toFixed(1)}px`);
    cursor.style.setProperty('--cursor-y', `${pointerY.toFixed(1)}px`);
    cursor.classList.add('is-active');
  }

  if (tiltTarget?.isConnected && tiltBounds?.width && tiltBounds?.height) {
    const x = clamp((pointerX - tiltBounds.left) / tiltBounds.width, 0, 1);
    const y = clamp((pointerY - tiltBounds.top) / tiltBounds.height, 0, 1);
    const strength = tiltTarget.classList.contains('sculpture') ? 7 : 5;
    tiltTarget.style.setProperty('--pointer-x', `${(x * 100).toFixed(2)}%`);
    tiltTarget.style.setProperty('--pointer-y', `${(y * 100).toFixed(2)}%`);
    tiltTarget.style.setProperty('--tilt-x', `${((0.5 - y) * strength * 2).toFixed(2)}deg`);
    tiltTarget.style.setProperty('--tilt-y', `${((x - 0.5) * strength * 2).toFixed(2)}deg`);
    tiltTarget.classList.add('is-interacting');
  }

  if (magneticTarget?.isConnected && magneticBounds?.width && magneticBounds?.height) {
    const x = clamp((pointerX - magneticBounds.left) / magneticBounds.width - 0.5, -0.5, 0.5);
    const y = clamp((pointerY - magneticBounds.top) / magneticBounds.height - 0.5, -0.5, 0.5);
    magneticTarget.style.setProperty('--magnetic-x', `${(x * 10).toFixed(2)}px`);
    magneticTarget.style.setProperty('--magnetic-y', `${(y * 10).toFixed(2)}px`);
    magneticTarget.classList.add('is-interacting');
  }
}

function syncMotion() {
  const nextEnabled = canFrame && Boolean(reducedMotion) && !reducedMotion.matches &&
    root.classList.contains('motion-enabled') && !root.classList.contains('motion-paused') &&
    !root.classList.contains('page-hidden') && !document.hidden && !suspended;
  const nextPointerEnabled = nextEnabled && Boolean(finePointer?.matches);
  const changed = nextEnabled !== enabled;
  const pointerChanged = nextPointerEnabled !== pointerEnabled;
  enabled = nextEnabled;
  pointerEnabled = nextPointerEnabled;
  if (changed && !enabled) resetMotion();
  else if (pointerChanged && !pointerEnabled) resetPointer();
  if (changed && enabled) {
    scrollDirty = true;
    scheduleFrame();
  }
}

function handlePointer(event) {
  // Hybrid laptops can report a fine primary pointer while a touch is in progress.
  if (event.pointerType === 'touch') {
    resetPointer();
    return;
  }
  if (!pointerEnabled || suspended || document.hidden) return;
  if (!(event.target instanceof Element)) return;
  pointerPresent = true;
  pointerX = event.clientX;
  pointerY = event.clientY;
  setTargets(event.target);
  pointerDirty = true;
  scheduleFrame();
}

// Delegation also covers project art inserted after a filter change.
document.addEventListener('pointermove', handlePointer, { passive: true });
document.addEventListener('pointerover', handlePointer, { passive: true });
document.addEventListener('pointerout', event => {
  if (event.pointerType === 'touch') {
    resetPointer();
    return;
  }
  if (!pointerEnabled) return;
  if (!(event.relatedTarget instanceof Element)) {
    resetPointer();
    return;
  }
  setTargets(event.relatedTarget);
}, { passive: true });
document.documentElement.addEventListener('pointerleave', resetPointer, { passive: true });
document.addEventListener('pointercancel', resetPointer, { passive: true });
document.addEventListener('keydown', event => {
  if (event.key === 'Tab') resetPointer();
});
window.addEventListener('blur', resetPointer);

window.addEventListener('scroll', () => {
  if (!enabled) return;
  // A stationary pointer should not leave a displaced card or button behind.
  if (pointerPresent) resetPointer();
  scrollDirty = true;
  scheduleFrame();
}, { passive: true });

window.addEventListener('resize', () => {
  if (!enabled) return;
  resetPointer();
  scrollDirty = true;
  scheduleFrame();
}, { passive: true });

function listenToMedia(query) {
  if (!query) return;
  if (typeof query.addEventListener === 'function') query.addEventListener('change', syncMotion);
  else if (typeof query.addListener === 'function') query.addListener(syncMotion);
}
listenToMedia(finePointer);
listenToMedia(reducedMotion);
document.addEventListener('visibilitychange', syncMotion);
document.getElementById('motionToggle')?.addEventListener('click', syncMotion);

// Only class mutations are observed; custom-property writes cannot feed this observer.
const preferenceObserver = typeof MutationObserver === 'function' ? new MutationObserver(syncMotion) : null;
preferenceObserver?.observe(root, { attributes: true, attributeFilter: ['class'] });

const scenes = new Set();
const processSteps = new Set();
const hasIntersectionObserver = typeof IntersectionObserver === 'function';
const sceneObserver = hasIntersectionObserver ? new IntersectionObserver(entries => {
  if (suspended) return;
  entries.forEach(({ target, isIntersecting }) => {
    if (target.isConnected) target.classList.toggle('motion-in-view', isIntersecting);
  });
}, { threshold: 0 }) : null;

const processObserver = hasIntersectionObserver ? new IntersectionObserver(entries => {
  if (suspended) return;
  entries.forEach(({ target, isIntersecting }) => target.classList.toggle('is-active', isIntersecting));
}, { threshold: 0.35, rootMargin: '0px 0px -12% 0px' }) : null;

function observeScenes() {
  if (suspended) return;
  // The core observer handles static scenes. This observer owns the replaceable grid.
  for (const scene of scenes) {
    if (!scene.isConnected) {
      sceneObserver?.unobserve(scene);
      scenes.delete(scene);
    }
  }
  projectGrid?.querySelectorAll('[data-motion-scene]').forEach(scene => {
    if (scenes.has(scene)) return;
    scenes.add(scene);
    if (sceneObserver) sceneObserver.observe(scene);
    else scene.classList.add('motion-in-view');
  });

  document.querySelectorAll('[data-process-step]').forEach(step => {
    if (processSteps.has(step)) return;
    processSteps.add(step);
    if (processObserver) processObserver.observe(step);
    else step.classList.add('is-active');
  });
}

document.addEventListener('portfolio:projects-rendered', () => {
  resetPointer();
  observeScenes();
});

// Preserve event listeners for back/forward cache restoration, but stop pending work
// and release observation targets while the page is away.
window.addEventListener('pagehide', () => {
  suspended = true;
  syncMotion();
  resetMotion();
  preferenceObserver?.disconnect();
  sceneObserver?.disconnect();
  processObserver?.disconnect();
  scenes.clear();
  processSteps.clear();
});

window.addEventListener('pageshow', () => {
  suspended = false;
  preferenceObserver?.observe(root, { attributes: true, attributeFilter: ['class'] });
  observeScenes();
  syncMotion();
});

observeScenes();
syncMotion();
