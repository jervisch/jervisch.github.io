// Hero topography shader - editorial print aesthetic
// Based on motion.dev topography example

import { animate, frame, cancelFrame } from "motion";
import { threeEffect } from "motion/three";
import * as THREE from "three";

export async function initHeroShader(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn('Hero container not found:', containerId);
    return;
  }

  // Tear down any previous instance. Astro re-runs this module script after
  // every ClientRouter swap, so without this the old renderer would leak.
  if (window.__heroCleanup) {
    window.__heroCleanup();
    window.__heroCleanup = null;
  }

  // Per-instance on purpose: a module-level flag stays true after the first
  // dispose(), which makes the *second* mount's dispose() a no-op and strands
  // its render loop in an infinite requestAnimationFrame cycle.
  let disposed = false;

  const stage = container;
  const canvas = container.querySelector('canvas');
  const fallback = container.querySelector('.fallback');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  function runTopography(uniforms) {
    animate.addEffect(threeEffect);
    return animate(uniforms, { phase: [0, Math.PI * 2] }, {
      duration: 90,
      ease: 'linear',
      repeat: Infinity,
    });
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  } catch {
    if (fallback) fallback.hidden = false;
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 2);
  camera.position.z = 1;

  // === TUNING PARAMETERS ===
  const config = {
    // Canvas coverage
    canvasScale: 0.5,        // Multiply min(width, height) - smaller = larger drawing
    
    // Paper/ink area in normalized coords (-1 to 1)
    paperWidth: 2.0,         // Full width = 2.0, reduce to crop sides
    paperHeight: 0.6,        // Vertical extent of ink area

    // Flow field
    lowerY: -0.48,           // Horizontal center of flow
    lowerRadius: 0.365,      // Horizontal extent of flow field
    distortion: 1.0,         // Warp amount
    density: 22,             // Contour line density
    lineWidth: 0.065,        // Contour line thickness

    // Disc
    discX: 0.49,             // Disc X position (normalized)
    discY: 0.075,            // Disc Y position (normalized)
    discRadius: 0.285,       // Disc size
    shineGain: 0.92,         // Highlight threshold

    // Visual
    lineOpacity: 0.6,        // Contour line opacity
  };

const uniforms = {
    resolution: { value: new THREE.Vector2() },
    phase: { value: 0 },
    // Ink palette, resolved from CSS tokens so it follows the site theme
    discInk: { value: new THREE.Vector3(1.0, 0.235, 0.19) },
    discAlpha: { value: 0.7 },
    lineInk: { value: new THREE.Vector3(0.317, 0.435, 0.514) },
    shineInk: { value: new THREE.Vector3(0.51, 0.70, 0.84) },
    // Canvas/paper config
    canvasScale: { value: config.canvasScale },
    paperWidth: { value: config.paperWidth },
    paperHeight: { value: config.paperHeight },
    lineOpacity: { value: config.lineOpacity },
    // Flow/disc
    discX: { value: config.discX },
    discY: { value: config.discY },
    discRadius: { value: config.discRadius },
    shineGain: { value: config.shineGain },
    lowerY: { value: config.lowerY },
    lowerRadius: { value: config.lowerRadius },
    density: { value: config.density },
    lineWidth: { value: config.lineWidth },
    distortion: { value: config.distortion },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    depthTest: false,
    depthWrite: false,
    transparent: true,
    vertexShader: `
      void main() {
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec2 resolution;
      uniform float phase;
      // Ink palette, read from CSS tokens
      uniform vec3 discInk, lineInk, shineInk;
      uniform float discAlpha;
      // Canvas/paper config
      uniform float canvasScale;
      uniform float paperWidth;
      uniform float paperHeight;
      uniform float lineOpacity;
      // Flow/disc
      uniform float discX, discY, discRadius, shineGain;
      uniform float lowerY, lowerRadius, density, lineWidth, distortion;

      float hash(vec2 p) {
        vec3 q = fract(vec3(p.xyx) * 0.1031);
        q += dot(q, q.yzx + 33.33);
        return fract((q.x + q.y) * q.z);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
                   mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float weight = 0.5;
        mat2 turn = mat2(0.8, -0.6, 0.6, 0.8);
        for (int i = 0; i < 3; i++) {
          value += weight * noise(p);
          p = turn * p * 2.03 + 7.1;
          weight *= 0.5;
        }
        return value;
      }

      void main() {
        // Scale: smaller = drawing appears larger on screen
        float scale = min(resolution.x, resolution.y) * canvasScale;
        vec2 p = (gl_FragCoord.xy - resolution * 0.5) / scale;
        float pixel = 1.0 / scale;
        float grain = hash(floor(gl_FragCoord.xy));
        
        // Contour lines mix up from the line ink itself, so coverage is carried
        // by alpha alone. Seeding from a dark colour would muddy pale inks.
        vec3 color = lineInk;
        float alpha = 0.0;
        
        // Paper mask - controls WHERE ink can appear
        float paper = step(abs(p.x), paperWidth) * step(abs(p.y), paperHeight);

        if (paper > 0.0) {
          // Drift and flow horizontal across paper width
          vec2 drift = vec2(cos(phase), sin(phase)) * 0.8;
          float x = (p.x - lowerY) / lowerRadius;
          float rise = smoothstep(-0.05, 0.95, x);
          float warp = (fbm(vec2(p.x * 1.5, p.y * 3.0) + drift) - 0.5) * distortion;
          float fine = (fbm(vec2(p.x * 3.0, p.y * 6.0) - drift) - 0.5) * distortion;
          float sphereWidth = lowerRadius * sqrt(max(0.0, 1.0 - min(x, 0.0) * min(x, 0.0)));
          float width = sphereWidth + rise * (0.05 + 0.05 * sin(p.x * 6.0 + warp * 3.0));
          float y = p.y + (warp * 0.3 + fine * 0.04) * smoothstep(-1.0, 0.6, x);
          y += rise * distortion * (0.08 * sin(p.x * 5.0 + drift.x) + 0.04 * sin(p.x * 12.0 + drift.y));
          float ny = y / max(width, 0.001);
          float body = 1.0 - smoothstep(0.98, 1.0, abs(ny));
          body *= smoothstep(-1.02, -0.96, x);
          float longitude = asin(clamp(ny, -0.999, 0.999));
          float latitude = asin(clamp(x, -0.999, 0.999));
          float field = longitude * density + warp * (2.0 + rise * 2.0)
            + fine * 0.6 + (1.0 - rise) * latitude * 4.0;

          float distanceToLine = abs(fract(field) - 0.5);
          float aa = min(fwidth(field) * 0.65, 0.20);
          float lines = 1.0 - smoothstep(lineWidth, lineWidth + aa, distanceToLine);
          float nz = sqrt(max(0.0, 1.0 - ny * ny - x * x));
          float light = clamp(0.3 - ny * 0.45 + nz * 0.35 + x * 0.3, 0.0, 1.0);
          float stipple = smoothstep(grain - 0.12, grain + 0.12, light);
          float fade = mix(stipple * light, 0.90, rise);
          float rim = pow(max(ny, 0.0), 10.0)
            * smoothstep(-1.0, -0.8, x)
            * (1.0 - smoothstep(-0.1, 0.18, x));
          fade = max(fade, rim * 0.32 * (0.65 + 0.35 * step(grain, 0.65)));
          
          // Contour lines - visible but subtle
          float lineOpacityVal = lines * body * fade * lineOpacity;
          color = mix(color, lineInk, lineOpacityVal);
          alpha = max(alpha, lineOpacityVal);

          // Disc
          vec2 sphere = (p - vec2(discX, discY)) / discRadius;
          float radius = length(sphere);
          float cover = 1.0 - smoothstep(1.0 - pixel / discRadius, 1.0, radius);
          if (cover > 0.0) {
            vec3 normal = vec3(sphere, sqrt(max(0.0, 1.0 - radius * radius)));
            float shade = max(0.0, dot(normal, normalize(vec3(-0.65, 0.85, 0.35))));
            float highlight = step(grain, pow(shade, 4.0) * shineGain + 0.035);
            vec3 sphereColor = mix(discInk, shineInk, highlight);
            float discOpacityVal = cover * discAlpha;
            color = mix(color, sphereColor, discOpacityVal);
            alpha = max(alpha, discOpacityVal);
          }
        }
        
        // Subtle grain on inked areas only
        color *= 0.97 + grain * 0.03;
        gl_FragColor = vec4(color, alpha);
      }
    `,
  });

  const geometry = new THREE.PlaneGeometry(2, 2);
  scene.add(new THREE.Mesh(geometry, material));

  const animation = runTopography(uniforms);
  let paused = reducedMotion.matches;

  function render() {
    if (!canvas.isConnected) {
      dispose();
      return;
    }
    renderer.render(scene, camera);
  }

  function syncPlayback() {
    cancelFrame(render);
    if (paused || document.hidden) {
      animation.pause();
      render();
    } else {
      animation.play();
      frame.render(render, true);
    }
  }

  function resize() {
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setSize(stage.clientWidth, stage.clientHeight, false);
    renderer.getDrawingBufferSize(uniforms.resolution.value);
    render();
  }

  function preferenceChanged() {
    paused = reducedMotion.matches;
    syncPlayback();
  }

  // Ink palette lives in CSS so it tracks the site theme. The dark values are
  // the fallbacks, which also keep this working if a token goes missing.
  const FALLBACK = {
    '--hero-disc': '#FF3C30',
    '--hero-disc-alpha': '0.7',
    '--hero-line': '#516F83',
    '--hero-shine': '#82B3D6',
  };

  function parseInk(value) {
    const hex = (value || '').trim().replace('#', '');
    const byte = s => parseInt(s.length === 1 ? s + s : s, 16) / 255;
    if (/^[0-9a-f]{3}$/i.test(hex)) {
      const [r, g, b] = hex.split('');
      return new THREE.Vector3(byte(r), byte(g), byte(b));
    }
    if (/^[0-9a-f]{6}$/i.test(hex)) {
      return new THREE.Vector3(
        parseInt(hex.slice(0, 2), 16) / 255,
        parseInt(hex.slice(2, 4), 16) / 255,
        parseInt(hex.slice(4, 6), 16) / 255,
      );
    }
    return parseInk(FALLBACK['--hero-line']);
  }

  function parseAlpha(value) {
    const n = parseFloat(value);
    return Number.isFinite(n) ? Math.min(Math.max(n, 0), 1) : parseAlpha(FALLBACK['--hero-disc-alpha']);
  }

  function syncPalette() {
    const css = getComputedStyle(document.documentElement);
    const read = token => css.getPropertyValue(token) || FALLBACK[token];

    uniforms.discInk.value.copy(parseInk(read('--hero-disc')));
    uniforms.lineInk.value.copy(parseInk(read('--hero-line')));
    uniforms.shineInk.value.copy(parseInk(read('--hero-shine')));
    uniforms.discAlpha.value = parseAlpha(read('--hero-disc-alpha'));
    render();
  }

  function themeChanged() {
    syncPalette();
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    animation.stop();
    cancelFrame(render);
    if (observer) observer.disconnect();
    if (removalObserver) removalObserver.disconnect();
    if (themeObserver) themeObserver.disconnect();
    reducedMotion.removeEventListener('change', preferenceChanged);
    document.removeEventListener('visibilitychange', syncPlayback);
    window.removeEventListener('pagehide', dispose);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    if (window.__heroCleanup === dispose) window.__heroCleanup = null;
  }

  const observer = new ResizeObserver(resize);
  observer.observe(stage);

  // Scoped to the stage: watching document.body subtree fires on every DOM
  // mutation anywhere on the site. Removal from the tree is also caught by the
  // isConnected check in render(), this just makes it immediate.
  const removalObserver = new MutationObserver(() => {
    if (!canvas.isConnected) dispose();
  });
  removalObserver.observe(stage, { childList: true, subtree: true });

  const themeObserver = new MutationObserver(themeChanged);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  reducedMotion.addEventListener('change', preferenceChanged);
  document.addEventListener('visibilitychange', syncPlayback);
  window.addEventListener('pagehide', dispose);

  resize();
  syncPalette();
  syncPlayback();

  window.__heroCleanup = dispose;
}