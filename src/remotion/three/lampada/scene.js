/**
 * Lampada — cena Three.js autoral, portada para Remotion.
 *
 * A cena e do Victor, preservada. Mudou so o que precisava mudar para virar
 * Remotion, e cada ponto esta comentado no lugar em que ocorre:
 *
 *   1. imports do importmap CDN  ->  pacote npm `three`
 *   2. renderer recebe o <canvas> do React e ganha `preserveDrawingBuffer`
 *   3. OrbitControls sai (stub preserva `controls.target`) — a timeline dirige
 *   4. HUD, clique, tecla Espaco e resize saem: interacao vira agendamento
 *   5. `tick()` + requestAnimationFrame  ->  `update(t, state)`
 *
 * Fica em .js de proposito. O tsconfig daqui roda `strict`, e anotar 770 linhas
 * de cena so para agradar o compilador seria reescrever o trabalho do autor.
 * Os tipos da API publica estao em `scene.d.ts`, escritos a mao.
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';

/**
 * Monta a cena num canvas ja existente.
 *
 * Caro: gera as texturas procedurais, roda o PMREM e compila o stack de
 * post-processing. Chame UMA vez por aba, atras de delayRender().
 */
export function createLampada(canvas, { width: W, height: H, distancia = 1, polar = 0 }) {
const TAU = Math.PI * 2;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function mulberry32(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvasTex(size, draw, { srgb = true, wrap = true, repeat = 1 } = {}) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 8;
  t.needsUpdate = true;
  if (wrap) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat, repeat);
  }
  return t;
}

function lathe(pairs, segs = 96) {
  const pts = pairs.map(([x, y]) => new THREE.Vector2(x, y));
  const g = new THREE.LatheGeometry(pts, segs);
  g.computeVertexNormals();
  return g;
}

function mesh(geo, mat, parent, { cast = true, receive = true, pos, rot } = {}) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = cast;
  m.receiveShadow = receive;
  if (pos) m.position.set(...pos);
  if (rot) m.rotation.set(...rot);
  parent.add(m);
  return m;
}

function tube(points, radius, tubular = 64, radial = 8) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  return new THREE.TubeGeometry(curve, tubular, radius, radial, false);
}

function helixPts({ r, y0, y1, turns, n = 180, rJitter = 0 }) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = t * turns * TAU;
    const rr = r + Math.sin(t * 18) * rJitter;
    pts.push([Math.cos(a) * rr, lerp(y0, y1, t), Math.sin(a) * rr]);
  }
  return pts;
}

function springAlong(p0, p1, bulge, coilR, turns, wireR) {
  const a = new THREE.Vector3(...p0);
  const c = new THREE.Vector3(...p1);
  const b = a.clone().lerp(c, 0.5).add(new THREE.Vector3(...bulge));
  const n = Math.max(24, Math.floor(turns * 28));
  const bez = (t) => {
    const u = 1 - t;
    return a.clone().multiplyScalar(u * u)
      .addScaledVector(b, 2 * u * t)
      .addScaledVector(c, t * t);
  };
  const dbez = (t) => b.clone().sub(a).multiplyScalar(2 * (1 - t)).add(c.clone().sub(b).multiplyScalar(2 * t));
  const pts = [];
  let prev = new THREE.Vector3(0, 0, 1);
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const p = bez(t);
    const tng = dbez(t).normalize();
    let nrm = new THREE.Vector3().crossVectors(tng, prev);
    if (nrm.lengthSq() < 1e-10) nrm.crossVectors(tng, new THREE.Vector3(1, 0, 0));
    nrm.normalize();
    const bin = new THREE.Vector3().crossVectors(tng, nrm).normalize();
    nrm.crossVectors(bin, tng).normalize();
    prev = bin;
    const ang = t * turns * TAU;
    pts.push(p.clone().addScaledVector(nrm, Math.cos(ang) * coilR).addScaledVector(bin, Math.sin(ang) * coilR));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n, wireR, 6, false);
}

/* ───────── textures ───────── */
const Rw = mulberry32(0xA19);
const texWood = canvasTex(1024, (g, s) => {
  g.fillStyle = '#2a1c12';
  g.fillRect(0, 0, s, s);
  for (let x = 0; x < s; x++) {
    const n = Math.sin(x * 0.07) * 8 + Math.sin(x * 0.019) * 14 + Math.sin(x * 0.003) * 6;
    const v = 42 + n + Rw() * 22;
    g.fillStyle = `rgba(${v | 0},${(v * 0.68) | 0},${(v * 0.38) | 0},0.7)`;
    g.fillRect(x, 0, 1, s);
  }
  for (let i = 0; i < 22; i++) {
    const x0 = Rw() * s;
    g.strokeStyle = `rgba(12,6,2,${0.12 + Rw() * 0.22})`;
    g.lineWidth = 1 + Rw() * 2.5;
    g.beginPath();
    g.moveTo(x0, 0);
    for (let y = 0; y <= s; y += 10) g.lineTo(x0 + Math.sin(y * 0.035 + i) * 7, y);
    g.stroke();
  }
  const plank = 170;
  for (let x = 0; x < s; x += plank) {
    g.fillStyle = 'rgba(6,3,1,0.45)';
    g.fillRect(x, 0, 2, s);
    g.fillStyle = 'rgba(90,70,48,0.08)';
    g.fillRect(x + 2, 0, 1, s);
  }
}, { srgb: true, wrap: true, repeat: 4 });

const texWoodBump = canvasTex(1024, (g, s) => {
  g.fillStyle = '#888';
  g.fillRect(0, 0, s, s);
  for (let x = 0; x < s; x += 2) {
    const v = (100 + Rw() * 50) | 0;
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.fillRect(x, 0, 1, s);
  }
}, { srgb: false, wrap: true, repeat: 4 });

const Rb = mulberry32(0xE27);
const texBrass = canvasTex(512, (g, s) => {
  const grd = g.createLinearGradient(0, 0, 0, s);
  grd.addColorStop(0, '#d7b25a');
  grd.addColorStop(0.5, '#c49a46');
  grd.addColorStop(1, '#9a742e');
  g.fillStyle = grd;
  g.fillRect(0, 0, s, s);
  for (let y = 0; y < s; y++) {
    const v = 150 + Rb() * 70;
    g.fillStyle = `rgba(${v | 0},${(v * 0.78) | 0},${(v * 0.38) | 0},${0.1 + Rb() * 0.12})`;
    g.fillRect(0, y, s, 1);
  }
  for (let i = 0; i < 80; i++) {
    g.fillStyle = `rgba(80,50,16,${0.04 + Rb() * 0.1})`;
    g.fillRect(Rb() * s, Rb() * s, 8 + Rb() * 30, 1);
  }
}, { srgb: true, wrap: true });

const texBrassRough = canvasTex(512, (g, s) => {
  g.fillStyle = '#7a7a7a';
  g.fillRect(0, 0, s, s);
  for (let y = 0; y < s; y++) {
    const v = (80 + Rb() * 90) | 0;
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.fillRect(0, y, s, 1);
  }
  g.fillStyle = 'rgba(200,200,200,0.25)';
  g.fillRect(0, s * 0.82, s, s * 0.18);
}, { srgb: false, wrap: true });

const texGlassRough = canvasTex(256, (g, s) => {
  g.fillStyle = '#0c0c0c';
  g.fillRect(0, 0, s, s);
  for (let i = 0; i < 400; i++) {
    const v = (8 + Rb() * 22) | 0;
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.fillRect(Rb() * s, Rb() * s, 1, 1);
  }
}, { srgb: false, wrap: true });

/* ───────── renderer ───────── */
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: 'high-performance',
  // Sem isto o Chromium descarta o buffer e o screenshot do Remotion sai preto.
  preserveDrawingBuffer: true,
});
// Pixel ratio fixo: o Remotion controla escala via --scale, e devicePixelRatio
// mudaria o resultado conforme a maquina.
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.debug.checkShaderErrors = true;
// DEBUG: o three so LOGA erro de shader; aqui ele vira excecao visivel.
renderer.debug.onShaderError = (gl, program, vs, fs) => {
  throw new Error(
    'SHADER FALHOU\nprogram: ' + gl.getProgramInfoLog(program) +
    '\nvert: ' + gl.getShaderInfoLog(vs) +
    '\nfrag: ' + gl.getShaderInfoLog(fs),
  );
};
RectAreaLightUniformsLib.init();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x241910);
scene.fog = new THREE.Fog(0x241910, 1.6, 4.4);

const camera = new THREE.PerspectiveCamera(40, W / H, 0.01, 20);
camera.position.set(0.18, 0.11, 0.22);

// Sem orbita manual no video: quem dirige a camera e a timeline.
// O stub mantem `controls.target` valido nos pontos que ja o usavam.
const controls = { target: new THREE.Vector3(0, 0.03, 0), enabled: false, update() {} };

(function buildEnv() {
  const es = new THREE.Scene();
  es.background = new THREE.Color(0x3a2e24);
  const add = (geo, color, pos, rot, scale) => {
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color }));
    m.position.copy(pos);
    if (rot) m.rotation.copy(rot);
    if (scale) m.scale.copy(scale);
    es.add(m);
  };
  add(new THREE.PlaneGeometry(8, 4), 0xf2f0ea, new THREE.Vector3(0, 4.2, 0), new THREE.Euler(Math.PI / 2, 0, 0));
  add(new THREE.CircleGeometry(0.55, 32), 0xffffff, new THREE.Vector3(-1.4, 3.4, 1.1), new THREE.Euler(-1.1, 0, 0));
  add(new THREE.CircleGeometry(0.35, 32), 0xfff6e8, new THREE.Vector3(1.8, 3.0, 0.2), new THREE.Euler(-0.9, 0.4, 0));
  add(new THREE.CircleGeometry(0.22, 24), 0xe8f0ff, new THREE.Vector3(0.4, 2.6, 2.4), new THREE.Euler(-0.5, 0, 0));
  add(new THREE.PlaneGeometry(3, 4), 0xd8e4f0, new THREE.Vector3(-5, 2.0, 1.0), new THREE.Euler(0, Math.PI / 2.2, 0));
  add(new THREE.PlaneGeometry(12, 12), 0x2a1c12, new THREE.Vector3(0, -0.5, 0), new THREE.Euler(-Math.PI / 2, 0, 0));
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(es, 0.04, 0.08, 20).texture;
  scene.environmentIntensity = 1.15;
  pmrem.dispose();
})();

/* ───────── materials ───────── */
const matWood = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  map: texWood,
  bumpMap: texWoodBump,
  bumpScale: 0.012,
  roughness: 0.62,
  metalness: 0.02,
  clearcoat: 0.12,
  clearcoatRoughness: 0.5,
  envMapIntensity: 0.35,
});

const matBrass = new THREE.MeshPhysicalMaterial({
  color: 0xc8a24c,
  map: texBrass,
  roughnessMap: texBrassRough,
  metalness: 1,
  roughness: 0.38,
  anisotropy: 0.55,
  clearcoat: 0.15,
  clearcoatRoughness: 0.4,
  envMapIntensity: 1.05,
});

const matInsulator = new THREE.MeshPhysicalMaterial({
  color: 0x1a120e,
  roughness: 0.62,
  metalness: 0.04,
  clearcoat: 0.25,
  clearcoatRoughness: 0.5,
});

const matSolder = new THREE.MeshPhysicalMaterial({
  color: 0xb8b6b0,
  metalness: 0.92,
  roughness: 0.42,
});

const matMastic = new THREE.MeshStandardMaterial({
  color: 0x14110f,
  roughness: 0.85,
  metalness: 0,
});

const matGlassFront = new THREE.MeshPhysicalMaterial({
  color: 0xf4fbff,
  metalness: 0.02,
  roughness: 0.035,
  roughnessMap: texGlassRough,
  transparent: true,
  opacity: 0.13,
  depthWrite: false,
  side: THREE.FrontSide,
  envMapIntensity: 2.35,
  clearcoat: 1,
  clearcoatRoughness: 0.04,
});
const matGlassBack = new THREE.MeshPhysicalMaterial({
  color: 0xf4fbff,
  metalness: 0.02,
  roughness: 0.05,
  transparent: true,
  opacity: 0.09,
  depthWrite: true,
  depthTest: true,
  side: THREE.BackSide,
  envMapIntensity: 1.4,
  clearcoat: 0.8,
  clearcoatRoughness: 0.08,
});

const matStem = new THREE.MeshPhysicalMaterial({
  color: 0xf7fdff,
  metalness: 0.04,
  roughness: 0.05,
  transparent: true,
  opacity: 0.26,
  depthWrite: false,
  side: THREE.FrontSide,
  envMapIntensity: 1.6,
  clearcoat: 1,
  clearcoatRoughness: 0.06,
});

const matWire = new THREE.MeshStandardMaterial({
  color: 0x2a2a28,
  metalness: 0.92,
  roughness: 0.28,
});
const matLead = new THREE.MeshStandardMaterial({
  color: 0x8a6a48,
  metalness: 0.95,
  roughness: 0.28,
});
const matCopper = new THREE.MeshStandardMaterial({
  color: 0xb87333,
  metalness: 1,
  roughness: 0.32,
});
const matWeld = new THREE.MeshStandardMaterial({
  color: 0x6a6864,
  metalness: 0.9,
  roughness: 0.4,
});

const matFilOn = new THREE.MeshStandardMaterial({
  color: 0xffc070,
  emissive: new THREE.Color(0xff9a40),
  emissiveIntensity: 2.4,
  roughness: 0.35,
  metalness: 0.35,
});
const matFilOff = new THREE.MeshStandardMaterial({
  color: 0x4a4640,
  emissive: new THREE.Color(0x000000),
  emissiveIntensity: 0,
  roughness: 0.42,
  metalness: 0.72,
});

/* ───────── table ───────── */
mesh(new THREE.PlaneGeometry(3.2, 3.2), matWood, scene, {
  cast: false, pos: [0, 0, 0], rot: [-Math.PI / 2, 0, 0],
});

const texAO = canvasTex(256, (g, s) => {
  const grd = g.createRadialGradient(s / 2, s / 2, 10, s / 2, s / 2, s / 2);
  grd.addColorStop(0, 'rgba(0,0,0,0.42)');
  grd.addColorStop(0.45, 'rgba(0,0,0,0.14)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, s, s);
}, { srgb: false, wrap: false });
const ao = new THREE.Mesh(
  new THREE.CircleGeometry(0.09, 48),
  new THREE.MeshBasicMaterial({ map: texAO, transparent: true, opacity: 0.55, depthWrite: false }),
);
ao.rotation.x = -Math.PI / 2;
ao.position.y = 0.0006;
ao.scale.set(1.7, 1, 0.7);
ao.renderOrder = 1;
scene.add(ao);

/* ───────── bulb (Y-up, base at 0) ───────── */
const bulb = new THREE.Group();

const BASE_R = 0.0131;
const BASE_H = 0.022;
mesh(lathe([
  [0.0045, 0.000],
  [0.0088, 0.000],
  [0.0118, 0.0018],
  [0.0126, 0.0045],
  [BASE_R, 0.007],
  [BASE_R, BASE_H + 0.001],
  [0.0122, BASE_H + 0.003],
], 80), matBrass, bulb);

mesh(tube(helixPts({ r: BASE_R + 0.00015, y0: 0.0062, y1: 0.0218, turns: 4.7, n: 220 }), 0.00072, 220, 7), matBrass, bulb, { receive: false });

mesh(lathe([
  [0.000, 0.000],
  [0.0046, 0.000],
  [0.0052, 0.0014],
  [0.0040, 0.0036],
  [0.000, 0.0042],
], 32), matSolder, bulb);

mesh(new THREE.CylinderGeometry(0.0094, 0.0104, 0.0042, 32), matInsulator, bulb, { pos: [0, 0.0036, 0] });

mesh(new THREE.TorusGeometry(0.0124, 0.0011, 10, 40), matMastic, bulb, {
  pos: [0, BASE_H + 0.0026, 0], rot: [Math.PI / 2, 0, 0],
});

const glassY = BASE_H + 0.003;
const glassProfile = [
  [0.0116, glassY],
  [0.0118, glassY + 0.006],
  [0.0132, glassY + 0.014],
  [0.0168, glassY + 0.026],
  [0.0220, glassY + 0.040],
  [0.0268, glassY + 0.054],
  [0.0296, glassY + 0.066],
  [0.0302, glassY + 0.076],
  [0.0284, glassY + 0.088],
  [0.0235, glassY + 0.098],
  [0.0160, glassY + 0.106],
  [0.0080, glassY + 0.111],
  [0.0000, glassY + 0.1135],
];
const glassBack = mesh(lathe(glassProfile, 96), matGlassBack, bulb, { receive: false, cast: false });
glassBack.renderOrder = 3;
const glassFront = mesh(lathe(glassProfile, 96), matGlassFront, bulb, { receive: false, cast: false });
glassFront.renderOrder = 4;

const stemY0 = glassY + 0.001;
const stemH = 0.040;
mesh(lathe([
  [0.0054, stemY0],
  [0.0050, stemY0 + 0.010],
  [0.0044, stemY0 + 0.022],
  [0.0038, stemY0 + 0.034],
  [0.0035, stemY0 + stemH],
  [0.0024, stemY0 + stemH],
  [0.0027, stemY0 + 0.034],
  [0.0032, stemY0 + 0.022],
  [0.0038, stemY0 + 0.010],
  [0.0042, stemY0],
], 48), matStem, bulb, { receive: false, cast: false });

const beadY = stemY0 + stemH + 0.0025;
mesh(lathe([
  [0.000, beadY - 0.002],
  [0.0036, beadY - 0.0012],
  [0.0042, beadY],
  [0.0034, beadY + 0.0024],
  [0.000, beadY + 0.0032],
], 24), matStem, bulb, { receive: false, cast: false });

mesh(new THREE.CylinderGeometry(0.00042, 0.00042, stemH + 0.006, 8), matCopper, bulb, {
  pos: [-0.00155, stemY0 + stemH * 0.5, 0], receive: false, cast: false,
});
mesh(new THREE.CylinderGeometry(0.00042, 0.00042, stemH + 0.006, 8), matCopper, bulb, {
  pos: [0.00155, stemY0 + stemH * 0.5, 0], receive: false, cast: false,
});
mesh(new THREE.CylinderGeometry(0.00028, 0.00028, 0.006, 6), matLead, bulb, {
  pos: [-0.00155, beadY + 0.004, 0], receive: false, cast: false,
});
mesh(new THREE.CylinderGeometry(0.00028, 0.00028, 0.006, 6), matLead, bulb, {
  pos: [0.00155, beadY + 0.004, 0], receive: false, cast: false,
});

const postH = 0.011;
mesh(new THREE.CylinderGeometry(0.00032, 0.00032, postH, 8), matWire, bulb, {
  pos: [-0.0048, beadY + 0.003 + postH * 0.5, 0], receive: false, cast: false,
});
mesh(new THREE.CylinderGeometry(0.00032, 0.00032, postH, 8), matWire, bulb, {
  pos: [0.0048, beadY + 0.003 + postH * 0.5, 0], receive: false, cast: false,
});
mesh(tube([[-0.00155, beadY, 0], [-0.0034, beadY + 0.002, 0], [-0.0048, beadY + 0.003, 0]], 0.00022, 12, 5), matWire, bulb, { receive: false, cast: false });
mesh(tube([[0.00155, beadY, 0], [0.0034, beadY + 0.002, 0], [0.0048, beadY + 0.003, 0]], 0.00022, 12, 5), matWire, bulb, { receive: false, cast: false });

const hookA = [
  [0, beadY + 0.001, 0],
  [0.001, beadY + 0.006, 0.005],
  [0.0004, beadY + 0.012, 0.0062],
  [-0.0012, beadY + 0.0135, 0.004],
];
const hookB = [
  [0, beadY + 0.001, 0],
  [-0.001, beadY + 0.005, -0.0048],
  [0.0006, beadY + 0.011, -0.0058],
  [0.0014, beadY + 0.013, -0.0035],
];
mesh(tube(hookA, 0.00018, 20, 5), matWire, bulb, { receive: false, cast: false });
mesh(tube(hookB, 0.00018, 20, 5), matWire, bulb, { receive: false, cast: false });

const weld = (p) => mesh(new THREE.SphereGeometry(0.00055, 10, 8), matWeld, bulb, { pos: p, receive: false, cast: false });
weld([-0.0048, beadY + 0.003, 0]);
weld([0.0048, beadY + 0.003, 0]);
weld([-0.0048, beadY + 0.003 + postH, 0]);
weld([0.0048, beadY + 0.003 + postH, 0]);

const filY = beadY + 0.003 + postH;
const filament = mesh(
  springAlong(
    [-0.0048, filY, 0],
    [0.0048, filY, 0],
    [0, 0.0045, 0.001],
    0.00115,
    16,
    0.00018,
  ),
  matFilOff,
  bulb,
  { receive: false, cast: false },
);

const innerGlow = new THREE.Mesh(
  new THREE.SphereGeometry(0.0055, 16, 12),
  new THREE.MeshBasicMaterial({
    color: 0xffc070,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }),
);
innerGlow.position.y = filY + 0.002;
innerGlow.visible = false;
innerGlow.renderOrder = 2;
bulb.add(innerGlow);

const holder = new THREE.Group();
holder.add(bulb);
bulb.rotation.z = -Math.PI / 2 + 0.32;
bulb.rotation.y = 0.22;
bulb.rotation.x = 0.08;
scene.add(holder);

holder.updateMatrixWorld(true);
{
  const box = new THREE.Box3().setFromObject(holder);
  holder.position.y -= box.min.y;
  holder.position.x -= (box.min.x + box.max.x) * 0.5;
  holder.position.z -= (box.min.z + box.max.z) * 0.5;
}
holder.updateMatrixWorld(true);
{
  const box = new THREE.Box3().setFromObject(holder);
  const c = new THREE.Vector3();
  box.getCenter(c);
  controls.target.copy(c);
  ao.position.set(c.x, 0.0006, c.z);
}

/* ───────── lights ───────── */
const hemi = new THREE.HemisphereLight(0xe8eef4, 0x2a1c12, 0.55);
scene.add(hemi);

const key = new THREE.DirectionalLight(0xfff6ea, 1.35);
key.position.set(0.45, 0.85, 0.35);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.near = 0.1;
key.shadow.camera.far = 3;
key.shadow.camera.left = key.shadow.camera.bottom = -0.4;
key.shadow.camera.right = key.shadow.camera.top = 0.4;
key.shadow.bias = -0.0003;
key.shadow.normalBias = 0.004;
scene.add(key);

const fill = new THREE.DirectionalLight(0xd4e2f2, 0.45);
fill.position.set(-0.6, 0.4, 0.2);
scene.add(fill);

const rim = new THREE.DirectionalLight(0xf0f4ff, 0.28);
rim.position.set(0.1, 0.25, -0.7);
scene.add(rim);

const soft = new THREE.RectAreaLight(0xfff4e4, 8, 1.6, 0.9);
soft.position.set(0, 0.95, 0.15);
soft.lookAt(0, 0, 0);
scene.add(soft);

const filLight = new THREE.PointLight(0xffc07a, 0, 0.9, 2);
filLight.position.copy(new THREE.Vector3(0, filY, 0));
bulb.add(filLight);

/* ───────── post ───────── */
/*
 * Alvo proprio com MSAA (`samples: 4`).
 *
 * O `antialias: true` do renderer so vale para o canvas; dentro do
 * EffectComposer a cena vai para um render target, e ali nao ha suavizacao.
 * A cena original resolvia isso com SMAAPass, que aqui saiu por dois motivos:
 * a propria doc do three pede que passes desse tipo venham DEPOIS do
 * OutputPass (nesta cena vinham antes), e o OutputPass tambem precisou sair —
 * ver a nota do bloom, no fim da cadeia. MSAA no alvo entrega o mesmo
 * resultado sem nenhum pass extra.
 */
const alvoComposer = new THREE.WebGLRenderTarget(W, H, {
  type: THREE.HalfFloatType,
  samples: 4,
});
const composer = new EffectComposer(renderer, alvoComposer);
composer.addPass(new RenderPass(scene, camera));
// Limiares reajustados para a nova posicao do bloom (depois do tone mapping).
// Em sRGB o meio-tom sobe: 0.92 sRGB ~ 0.83 linear, e no valor original o piso
// de madeira inteiro entrava no brilho. Os numeros abaixo reproduzem o
// recorte que a cena tinha em HDR linear — so filamento e realce de vidro.
const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.08, 0.32, 0.92);
// O bloom foi movido para o FIM da cadeia. Ver a nota abaixo do filmPass.
// O UnrealBloomPass compoe de volta no proprio readBuffer (needsSwap = false)
// enquanto readBuffer.texture ainda esta ligada como sampler do high-pass.
// Isso e um feedback loop framebuffer<->textura: o Chrome do desktop tolera,
// o ANGLE headless descarta o draw e o pass seguinte le preto — sem erro de
// shader, sem erro de GL, sem contexto perdido. Um CopyShader tem
// needsSwap = true e forca a troca de buffers, quebrando o loop.
// (copy pass de diagnostico removido)

const FilmShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uVignette: { value: 0.92 },
    uGrain: { value: 0.028 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime, uVignette, uGrain;
    varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      vec2 uv = (vUv - 0.5) * 1.05;
      float v = smoothstep(0.95, 0.12, dot(uv, uv));
      vec3 col = mix(c.rgb * uVignette, c.rgb, v);
      col += (hash(vUv * vec2(1600.0, 900.0) + uTime) - 0.5) * uGrain;
      gl_FragColor = vec4(col, c.a);
    }
  `,
};
const filmPass = new ShaderPass(FilmShader);
composer.addPass(filmPass);

/*
 * O UnrealBloomPass fica por ULTIMO, e o OutputPass foi removido. Nenhuma das
 * duas coisas e escolha estetica — as duas sao consequencia de bugs silenciosos
 * que so aparecem em render headless. Ambos verificados por bisseccao, com
 * still renderizado a cada passo.
 *
 * Ele tem needsSwap = false e, quando NAO e o ultimo pass, compoe o brilho de
 * volta no proprio readBuffer, o mesmo alvo cuja textura ele acabou de amostrar
 * no high-pass. Isso e um feedback loop framebuffer<->textura. O Chrome com GPU
 * tolera; o Chromium headless nao — o alvo sai vazio e TODO pass seguinte le
 * preto. Sem erro de shader, sem erro de GL, sem contexto perdido. Verificado
 * por bisseccao e reproduzido igual em --gl=angle e --gl=swangle.
 *
 * Como ultimo pass ele entra no ramo renderToScreen e funciona.
 *
 * E dai vem o segundo problema: ao desenhar para a tela (setRenderTarget(null))
 * o three reaplica tone mapping e conversao sRGB, porque e assim que ele trata
 * qualquer material desenhado no canvas. Com o OutputPass antes na cadeia, a
 * imagem levava a conversao DUAS vezes e saia lavada — o piso de madeira ia de
 * (123,101,82) para (198,187,176), medido no pixel.
 *
 * Removendo o OutputPass, quem faz a conversao e o proprio renderer, uma unica
 * vez, no draw final. Bonus: o bloom volta a operar em HDR linear, que e onde
 * ele foi calibrado — os limiares originais da cena (0.92 / 0.84–0.94) seguem
 * valendo sem retoque.
 */
composer.addPass(bloom);

/* ───────── camera auto (órbita + dolly) ───────── */
const camState = {
  auto: true,
  t0: 0,
  az0: 0.85,
  pol0: 1.12,
  dist0: 0.26,
  azSpeed: 0.22,
  dollyAmp: 0.075,
  dollyHz: 0.11,
  bobAmp: 0.07,
  bobHz: 0.07,
};
/*
 * Ajuste de enquadramento por recorte.
 *
 * A cena foi calibrada numa janela larga. Dentro de um painel alto e estreito
 * o mesmo par distancia/polar deixa o piso acabar no meio do quadro e aparece
 * uma faixa de fundo no topo. Em vez de mexer nos numeros originais, o chamador
 * corrige pelo formato que tem.
 */
camState.dist0 *= distancia;
camState.pol0 += polar;

const camTarget = controls.target.clone();
const clock = { elapsedTime: 0 };

function applyAutoCam(t) {
  const u = t - camState.t0;
  const az = camState.az0 + u * camState.azSpeed;
  const dist = camState.dist0 + Math.sin(u * camState.dollyHz * TAU) * camState.dollyAmp;
  const pol = clamp(camState.pol0 + Math.sin(u * camState.bobHz * TAU + 0.6) * camState.bobAmp, 0.35, 1.38);
  camera.position.set(
    camTarget.x + Math.sin(pol) * Math.cos(az) * dist,
    camTarget.y + Math.cos(pol) * dist,
    camTarget.z + Math.sin(pol) * Math.sin(az) * dist,
  );
  camera.lookAt(camTarget);
  controls.target.copy(camTarget);
}

/* ───────── render de UM frame ─────────
   Substitui o `tick()` com requestAnimationFrame. O tempo deixa de sair do
   relogio da maquina e vira argumento: `t` em segundos, derivado de frame/fps.
   `onAmt` (0..1) tambem chega pronto — a forma fechada do amortecimento vive
   no lado React, porque acumulador incremental nao sobrevive a frames
   renderizados fora de ordem e em paralelo. */
function update(t, state) {
  const onAmt = state && typeof state.onAmt === 'number' ? state.onAmt : 0;
  const targetOn = state && state.lightOn ? 1 : 0;
  filmPass.uniforms.uTime.value = t;

  applyAutoCam(t);

  const flick = targetOn ? 1 + Math.sin(t * 58) * 0.012 + Math.sin(t * 11.3) * 0.01 : 1;
  const k = onAmt * flick;

  filament.material = k > 0.45 ? matFilOn : matFilOff;
  matFilOn.emissiveIntensity = 1.1 + 1.5 * k;
  filLight.intensity = 0.48 * k;
  innerGlow.material.opacity = 0.1 * k;
  innerGlow.visible = k > 0.08;
  bloom.strength = lerp(0.04, 0.14, onAmt);
  bloom.threshold = lerp(0.94, 0.84, onAmt);
  renderer.toneMappingExposure = lerp(1.05, 1.0, onAmt);
  key.intensity = lerp(1.35, 1.08, onAmt);
  hemi.intensity = lerp(0.55, 0.42, onAmt);

  composer.render();


}

  /** Pre-compila os shaders para o primeiro frame nao sair pela metade. */
  async function warmup() {
    await renderer.compileAsync(scene, camera);
    update(0, { onAmt: 0, lightOn: false });
  }

  function dispose() {
    composer.dispose();
    renderer.dispose();
  }

  return { update, warmup, dispose };
}
