import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  createBook,
  createCamera,
  createChair,
  createComputer,
  createDesk,
  createDeskObjects,
  createHiddenNotes,
  createLamp,
  createPlant,
  createRoom,
  createShelf,
} from "./models.js";
import { createMaterials, palette } from "./scene-kit.js";
import "./styles.css";

const canvas = document.querySelector("#scene");
const statusText = document.querySelector("#status-text");
const statusKicker = document.querySelector("#status-kicker");
const loadingScreen = document.querySelector(".loading-screen");
const loadingTrack = document.querySelector(".loading-track span");
const loadingValue = document.querySelector("#loading-value");
const storyPanel = document.querySelector(".story-panel");
const storyEyebrow = document.querySelector("#story-eyebrow");
const storyTitle = document.querySelector("#story-title");
const storyBody = document.querySelector("#story-body");
const storyMeta = document.querySelector("#story-meta");
const timeToggle = document.querySelector(".time-toggle");
const timeLabel = document.querySelector("#time-label");
const portfolioShell = document.querySelector(".portfolio-shell");
const portfolioWindow = document.querySelector(".portfolio-window");
const portfolioFrame = document.querySelector(".portfolio-frame");
const portfolioLoading = document.querySelector(".portfolio-loading");
const portfolioClose = document.querySelector(".portfolio-close");
const sketchbookShell = document.querySelector(".sketchbook-shell");
const sketchbookClose = document.querySelector(".sketchbook-close");
const sketchCanvas = document.querySelector("#sketch-canvas");
const sketchSize = document.querySelector("#sketch-size");
const sketchStorageKey = "xiaotong-sketchbook-v2";
const filmShell = document.querySelector(".film-shell");
const filmClose = document.querySelector(".film-close");
const filmViewport = document.querySelector(".film-viewport");
const filmCount = document.querySelector(".film-count");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const scene = new THREE.Scene();
const dayColor = new THREE.Color(0xbab7b3);
const nightColor = new THREE.Color(0x3a403f);
scene.background = dayColor.clone();
scene.fog = new THREE.Fog(dayColor.clone(), 24, 42);

const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
// Entry framing follows the reference's high left-front three-quarter view:
// the near left desk leg anchors the perspective while the chair recedes right.
const desktopCamera = new THREE.Vector3(-6.15, 9.55, 16.75);
const mobileCamera = new THREE.Vector3(-4.5, 9.15, 20.8);
const initialTarget = new THREE.Vector3(-0.2, 3.15, -0.72);
camera.position.copy(desktopCamera);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.06;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.065;
controls.enablePan = false;
controls.minDistance = 3.1;
controls.maxDistance = 25;
controls.minPolarAngle = Math.PI * 0.2;
controls.maxPolarAngle = Math.PI * 0.47;
controls.minAzimuthAngle = -Math.PI * 0.4;
controls.maxAzimuthAngle = Math.PI * 0.4;
controls.target.copy(initialTarget);

const hemisphere = new THREE.HemisphereLight(0xf2f1ed, 0x8b8279, 2.35);
const sun = new THREE.DirectionalLight(0xfff1de, 3.15);
sun.position.set(8, 17, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -10;
sun.shadow.camera.right = 10;
sun.shadow.camera.top = 10;
sun.shadow.camera.bottom = -10;
sun.shadow.bias = -0.00025;
sun.shadow.radius = 5;
sun.shadow.blurSamples = 18;
const coolFill = new THREE.PointLight(0xd5ded9, 6.4, 19, 2);
coolFill.position.set(-5, 5.5, 5);
const nightWindow = new THREE.RectAreaLight(0x5a87a0, 0, 4.2, 2.5);
nightWindow.position.set(3.4, 4.7, -4.8);
nightWindow.rotation.x = -0.08;
scene.add(hemisphere, sun, coolFill, nightWindow);

const materials = createMaterials();
const room = createRoom(materials);
const desk = createDesk(materials);
const computer = createComputer(materials);
const book = createBook(materials);
const deskCamera = createCamera(materials);
const shelf = createShelf(materials);
const lamp = createLamp(materials);
const chair = createChair(materials);
const deskObjects = createDeskObjects(materials);
const floorPlant = createPlant(materials, [4.62, 0, -2.42], 1.02);
const hiddenNotes = createHiddenNotes(materials);
scene.add(room, desk, computer, book, deskCamera, shelf, lamp, chair, deskObjects, floorPlant, hiddenNotes);

const interactives = new Map([
  ["computer", computer],
  ["book", book],
  ["camera", deskCamera],
  ["shelf", shelf],
  ["lamp", lamp],
]);

const interactionCopy = {
  book: {
    kicker: "桌上的书",
    title: "留下一页自己的笔迹",
    body: "镜头会转为俯视视角，空白双页可以自由写字、画画或擦除。",
    meta: "内容会自动保存在当前浏览器中",
  },
  shelf: {
    kicker: "墙边档案",
    title: "作品从边柜里被抽出来",
    body: "档案抽屉沿滑轨离开边柜，索引面板在它身后展开，让浏览像真正查找一份资料。",
    meta: "再次点击边柜可收回档案",
  },
  lamp: {
    kicker: "光线线索",
    title: "夜晚会揭示白天看不到的痕迹",
    body: "台灯接管房间照明，桌面与边柜旁的标记逐渐显影，空间也进入夜间。",
    meta: "再次点击台灯返回日光",
  },
  camera: {
    kicker: "桌上的相机",
    title: "照片留在一条可以推动的胶卷里",
    body: "点击相机后，横向胶片会铺满画面。滚轮、拖动或方向键都可以继续翻阅。",
    meta: "当前使用可替换的示例照片",
  },
};

const pointer = new THREE.Vector2(2, 2);
const raycaster = new THREE.Raycaster();
const timer = new THREE.Timer();
timer.connect(document);
let hoveredGroup = null;
let activeGroup = null;
let cameraTransition = null;
let dragged = false;
let pointerDown = null;
let sketchDrawing = false;
let sketchTool = "pen";
let sketchLastPoint = null;
let sketchHistory = [];
let filmDragging = false;
let filmDragStartX = 0;
let filmDragStartScroll = 0;
let portfolioTrigger = null;

const worldState = {
  bookTarget: 0,
  shelfTarget: 0,
  nightTarget: 0,
  screenTarget: 0,
  bookProgress: 0,
  shelfProgress: 0,
  nightProgress: 0,
  screenProgress: 0,
};

function clamp01(value) {
  return Math.min(Math.max(value, 0), 1);
}

function smoothstep(value) {
  const clamped = clamp01(value);
  return clamped * clamped * (3 - 2 * clamped);
}

function damp(current, target, lambda, delta) {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * delta));
}

function updatePointer(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function findInteractive(object) {
  let current = object;
  while (current && current !== scene) {
    if (current.userData.interactiveId) return current;
    if (current.userData.interactiveRoot) return current.userData.interactiveRoot;
    current = current.parent;
  }
  return null;
}

function pickObject() {
  raycaster.setFromCamera(pointer, camera);
  const intersections = raycaster.intersectObjects([computer, book, deskCamera, shelf, lamp], true);
  const next = intersections.length ? findInteractive(intersections[0].object) : null;
  if (next !== hoveredGroup) {
    hoveredGroup = next;
    canvas.classList.toggle("is-hovering", Boolean(next));
  }
}

function setActiveIndex(id) {
  document.querySelectorAll("[data-focus]").forEach((button) => {
    const active = button.dataset.focus === id;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function setStatus(kicker, message) {
  statusKicker.textContent = kicker;
  statusText.textContent = message;
}

function openStory(id) {
  const copy = interactionCopy[id];
  if (!copy) return;
  storyEyebrow.textContent = copy.kicker;
  storyTitle.textContent = copy.title;
  storyBody.textContent = copy.body;
  storyMeta.textContent = copy.meta;
  storyPanel.classList.add("is-visible");
  storyPanel.setAttribute("aria-hidden", "false");
}

function closeStory() {
  storyPanel.classList.remove("is-visible");
  storyPanel.setAttribute("aria-hidden", "true");
}

function openPortfolio() {
  closeStory();
  portfolioTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  if (!portfolioFrame.hasAttribute("src")) {
    portfolioFrame.setAttribute("src", portfolioFrame.dataset.src);
  }
  portfolioShell.classList.add("is-visible");
  portfolioShell.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-portfolio");
  controls.enabled = false;
  portfolioClose.focus({ preventScroll: true });
}

function closePortfolio(options = {}) {
  const wasVisible = portfolioShell.classList.contains("is-visible");
  portfolioShell.classList.remove("is-visible");
  portfolioShell.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-portfolio");
  controls.enabled = true;
  if (options.restoreView) resetView();
  if (wasVisible && portfolioTrigger && document.contains(portfolioTrigger)) {
    window.setTimeout(() => portfolioTrigger.focus({ preventScroll: true }), 0);
  }
}

function setExperienceOpen(shell, open) {
  shell.classList.toggle("is-visible", open);
  shell.setAttribute("aria-hidden", String(!open));
  document.body.classList.toggle("has-experience-open", open);
  controls.enabled = !open;
}

function openSketchbook() {
  closeStory();
  setExperienceOpen(sketchbookShell, true);
  window.requestAnimationFrame(() => {
    resizeSketchCanvas();
    restoreSavedSketch();
  });
  sketchbookClose.focus({ preventScroll: true });
}

function closeSketchbook(options = {}) {
  setExperienceOpen(sketchbookShell, false);
  if (options.restoreView) resetView();
}

function openFilm() {
  closeStory();
  setExperienceOpen(filmShell, true);
  updateFilmCount();
  filmClose.focus({ preventScroll: true });
}

function closeFilm(options = {}) {
  setExperienceOpen(filmShell, false);
  if (options.restoreView) resetView();
}

function transitionCamera(group, options = {}) {
  const mobile = window.innerWidth < 720;
  const offset = mobile && group.userData.interactiveId !== "computer" ? new THREE.Vector3(1.4, 0.55, 2.1) : new THREE.Vector3();
  const targetPosition = group.userData.focusTarget ?? group.userData.targetPosition;
  cameraTransition = {
    startedAt: performance.now(),
    duration: reducedMotion.matches ? 1 : options.duration ?? 1100,
    fromPosition: camera.position.clone(),
    toPosition: group.userData.focusPosition.clone().add(offset),
    fromTarget: controls.target.clone(),
    toTarget: targetPosition.clone(),
  };
}

function toggleNight(forceValue) {
  const shouldBeNight = forceValue ?? worldState.nightTarget < 0.5;
  worldState.nightTarget = shouldBeNight ? 1 : 0;
  lamp.userData.on = shouldBeNight;
  document.body.classList.toggle("is-night", shouldBeNight);
  timeToggle.setAttribute("aria-pressed", String(shouldBeNight));
  timeLabel.textContent = shouldBeNight ? "21:18" : "18:42";
  timeToggle.querySelector("span").textContent = shouldBeNight ? "关掉晚灯" : "打开晚灯";
}

function interact(group) {
  if (!group) return;
  const id = group.userData.interactiveId;
  let opening = true;
  activeGroup = group;
  setActiveIndex(id);
  transitionCamera(group);

  if (id === "book") {
    worldState.bookTarget = worldState.bookTarget < 0.5 ? 1 : 0;
    opening = worldState.bookTarget > 0.5;
    setStatus("空白画册", worldState.bookTarget ? "镜头正转向纸面，画布即将展开" : "书本正在合上");
  } else if (id === "shelf") {
    worldState.shelfTarget = worldState.shelfTarget < 0.5 ? 1 : 0;
    opening = worldState.shelfTarget > 0.5;
    setStatus("作品档案", worldState.shelfTarget ? "档案沿滑轨展开" : "档案正在归位");
  } else if (id === "lamp") {
    toggleNight();
    opening = worldState.nightTarget > 0.5;
    setStatus("光线变化", worldState.nightTarget ? "台灯与局部灯光依次亮起" : "房间恢复自然日光");
  } else if (id === "computer") {
    worldState.screenTarget = 1;
    setStatus("进入作品集", "镜头正在靠近屏幕，作品集即将展开");
  } else if (id === "camera") {
    setStatus("打开胶卷", "照片正在沿胶片轨道依次展开");
  }

  if (!opening) {
    closeStory();
  } else if (id === "computer") {
    window.setTimeout(openPortfolio, reducedMotion.matches ? 10 : 700);
  } else if (id === "book") {
    openStory(id);
    window.setTimeout(openSketchbook, reducedMotion.matches ? 10 : 760);
  } else if (id === "camera") {
    window.setTimeout(openFilm, reducedMotion.matches ? 10 : 650);
  } else {
    openStory(id);
  }
}

function resetView() {
  closePortfolio();
  setExperienceOpen(sketchbookShell, false);
  setExperienceOpen(filmShell, false);
  activeGroup = null;
  setActiveIndex(null);
  closeStory();
  worldState.screenTarget = 0;
  worldState.bookTarget = 0;
  worldState.shelfTarget = 0;
  setStatus("作品集在屏幕里", "桌上的物件也各自藏着一段内容");
  const destination = window.innerWidth < 720 ? mobileCamera : desktopCamera;
  cameraTransition = {
    startedAt: performance.now(),
    duration: reducedMotion.matches ? 1 : 1200,
    fromPosition: camera.position.clone(),
    toPosition: destination.clone(),
    fromTarget: controls.target.clone(),
    toTarget: initialTarget.clone(),
  };
}

function updateCamera(now) {
  if (!cameraTransition) return;
  const progress = clamp01((now - cameraTransition.startedAt) / cameraTransition.duration);
  const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
  camera.position.lerpVectors(cameraTransition.fromPosition, cameraTransition.toPosition, eased);
  controls.target.lerpVectors(cameraTransition.fromTarget, cameraTransition.toTarget, eased);
  if (progress >= 1) cameraTransition = null;
}

function updateBook(delta) {
  worldState.bookProgress = damp(worldState.bookProgress, worldState.bookTarget, 4.8, delta);
  const progress = smoothstep(worldState.bookProgress);
  book.userData.coverPivot.rotation.z = progress * Math.PI * 0.93;
  book.userData.coverPivot.rotation.y = -progress * 0.035;
  book.userData.pageRight.rotation.z = -progress * 0.035;
}

function updateShelf(delta) {
  worldState.shelfProgress = damp(worldState.shelfProgress, worldState.shelfTarget, 4.2, delta);
  const progress = smoothstep(worldState.shelfProgress);
  shelf.userData.archive.position.z = 0.78 + progress * 1.0;
  shelf.userData.archive.position.y = 1.02 + progress * 0.03;
  const panelScale = 0.001 + progress * 0.999;
  shelf.userData.displayPanel.scale.setScalar(panelScale);
  shelf.userData.displayPanel.position.set(0.76 - progress * 1.1, 1.02 + progress * 1.45, 0.25 + progress * 1.55);
  shelf.userData.displayPanel.rotation.y = progress * 0.1;
}

function updateNight(delta) {
  worldState.nightProgress = damp(worldState.nightProgress, worldState.nightTarget, 1.45, delta);
  const progress = smoothstep(worldState.nightProgress);
  scene.background.copy(dayColor).lerp(nightColor, progress);
  scene.fog.color.copy(scene.background);
  scene.fog.near = THREE.MathUtils.lerp(24, 19, progress);
  scene.fog.far = THREE.MathUtils.lerp(42, 34, progress);
  hemisphere.intensity = THREE.MathUtils.lerp(2.35, 0.82, progress);
  sun.intensity = THREE.MathUtils.lerp(3.15, 0.38, progress);
  coolFill.intensity = THREE.MathUtils.lerp(6.4, 2.15, progress);
  nightWindow.intensity = THREE.MathUtils.lerp(0, 7.2, progress);
  lamp.userData.light.intensity = THREE.MathUtils.lerp(0, 26, progress);
  lamp.userData.bulbMaterial.emissiveIntensity = THREE.MathUtils.lerp(0.18, 2.3, progress);
  lamp.userData.shadeMaterial.emissive.setHex(0x4e2105);
  lamp.userData.shadeMaterial.emissiveIntensity = progress * 0.4;
  hiddenNotes.userData.materials.forEach((material, index) => {
    const reveal = smoothstep(clamp01(progress * 1.5 - index * 0.12));
    material.opacity = reveal * 0.98;
    material.emissiveIntensity = 0.2 + reveal * 1.6;
  });
  room.userData.lightFixtures.forEach((fixture, index) => {
    const reveal = smoothstep(clamp01(progress * 1.24 - index * 0.08));
    fixture.material.opacity = reveal * 0.96;
    fixture.areaLight.intensity = THREE.MathUtils.lerp(0, fixture.maxArea, reveal);
    fixture.pointLight.intensity = THREE.MathUtils.lerp(0, fixture.maxPoint, reveal);
  });
  renderer.toneMappingExposure = THREE.MathUtils.lerp(1.06, 0.9, progress);

  const windowScene = room.userData.windowScene;
  if (windowScene) {
    windowScene.userData.skyMaterial.color.copy(new THREE.Color(palette.skyDay)).lerp(new THREE.Color(palette.skyNight), progress);
    windowScene.userData.sunDisc.material.opacity = 0.85 * (1 - progress);
    windowScene.userData.sunDisc.position.y = 0.7 - progress * 1.1;
    windowScene.userData.skylineMaterial.color.copy(new THREE.Color(0x52605f)).lerp(new THREE.Color(0x1b252a), progress);
  }
}

function updateScreen(delta) {
  worldState.screenProgress = damp(worldState.screenProgress, worldState.screenTarget, 4.5, delta);
  computer.userData.screenMaterial.emissiveIntensity = 0.22 + worldState.screenProgress * 0.8;
}

function updateAmbientMotion(elapsed) {
  floorPlant.rotation.z = Math.sin(elapsed * 0.5) * 0.006;
  floorPlant.rotation.x = Math.cos(elapsed * 0.32) * 0.003;
}

canvas.addEventListener("pointermove", (event) => {
  updatePointer(event);
  if (pointerDown) {
    const distance = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y);
    dragged ||= distance > 6;
  }
  pickObject();
});

canvas.addEventListener("pointerdown", (event) => {
  pointerDown = { x: event.clientX, y: event.clientY };
  dragged = false;
  canvas.classList.add("is-dragging");
});

canvas.addEventListener("pointerup", () => {
  canvas.classList.remove("is-dragging");
  if (!dragged && hoveredGroup) interact(hoveredGroup);
  pointerDown = null;
});

canvas.addEventListener("pointerleave", () => {
  pointer.set(2, 2);
  hoveredGroup = null;
  pointerDown = null;
  canvas.classList.remove("is-hovering", "is-dragging");
});

document.querySelectorAll("[data-focus]").forEach((button) => {
  button.addEventListener("click", () => interact(interactives.get(button.dataset.focus)));
});
document.querySelector(".reset-view").addEventListener("click", resetView);
document.querySelector(".story-close").addEventListener("click", closeStory);
portfolioClose.addEventListener("click", () => closePortfolio({ restoreView: true }));
portfolioShell.addEventListener("pointerdown", (event) => {
  if (event.target === portfolioShell) closePortfolio({ restoreView: true });
});
portfolioFrame.addEventListener("load", () => {
  if (!portfolioFrame.hasAttribute("src")) return;
  portfolioWindow.classList.add("is-ready");
  portfolioLoading.setAttribute("aria-hidden", "true");
});
window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin || event.source !== portfolioFrame.contentWindow) return;
  if (event.data?.type === "portfolio:close") closePortfolio({ restoreView: true });
});
sketchbookClose.addEventListener("click", () => closeSketchbook({ restoreView: true }));
sketchbookShell.addEventListener("pointerdown", (event) => {
  if (event.target === sketchbookShell) closeSketchbook({ restoreView: true });
});
filmClose.addEventListener("click", () => closeFilm({ restoreView: true }));
filmShell.addEventListener("pointerdown", (event) => {
  if (event.target === filmShell) closeFilm({ restoreView: true });
});
timeToggle.addEventListener("click", () => {
  toggleNight();
  setStatus("夜间光影", worldState.nightTarget ? "画框、置物架与柜顶的灯光正在亮起" : "局部灯光隐去，房间回到自然日光");
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") resetView();
  if (!filmShell.classList.contains("is-visible")) return;
  if (event.key === "ArrowRight") scrollFilm(1);
  if (event.key === "ArrowLeft") scrollFilm(-1);
});

function resizeSketchCanvas() {
  const rect = sketchCanvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const previous = document.createElement("canvas");
  previous.width = sketchCanvas.width;
  previous.height = sketchCanvas.height;
  previous.getContext("2d").drawImage(sketchCanvas, 0, 0);
  const ratio = Math.min(window.devicePixelRatio, 2);
  sketchCanvas.width = Math.round(rect.width * ratio);
  sketchCanvas.height = Math.round(rect.height * ratio);
  const context = sketchCanvas.getContext("2d");
  if (previous.width && previous.height) context.drawImage(previous, 0, 0, previous.width, previous.height, 0, 0, sketchCanvas.width, sketchCanvas.height);
  if (!previous.width) restoreSavedSketch();
}

function sketchPoint(event) {
  const rect = sketchCanvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function saveSketchState() {
  if (sketchHistory.length >= 24) sketchHistory.shift();
  sketchHistory.push(sketchCanvas.toDataURL("image/png"));
}

function persistSketch() {
  try { localStorage.setItem(sketchStorageKey, sketchCanvas.toDataURL("image/png")); } catch { /* storage may be unavailable */ }
}

function restoreSavedSketch() {
  try {
    const saved = localStorage.getItem(sketchStorageKey);
    if (saved) restoreSketchState(saved);
  } catch { /* storage may be unavailable */ }
}

function restoreSketchState(dataUrl) {
  const image = new Image();
  image.onload = () => {
    const context = sketchCanvas.getContext("2d");
    context.clearRect(0, 0, sketchCanvas.width, sketchCanvas.height);
    context.drawImage(image, 0, 0, sketchCanvas.width, sketchCanvas.height);
  };
  image.src = dataUrl;
}

sketchCanvas.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  sketchCanvas.setPointerCapture(event.pointerId);
  saveSketchState();
  sketchDrawing = true;
  sketchLastPoint = sketchPoint(event);
});

sketchCanvas.addEventListener("pointermove", (event) => {
  if (!sketchDrawing) return;
  const nextPoint = sketchPoint(event);
  const context = sketchCanvas.getContext("2d");
  const ratio = sketchCanvas.width / sketchCanvas.getBoundingClientRect().width;
  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = Number(sketchSize.value) * ratio;
  context.strokeStyle = sketchTool === "eraser" ? "rgba(0,0,0,1)" : "#292a29";
  context.globalCompositeOperation = sketchTool === "eraser" ? "destination-out" : "source-over";
  context.beginPath();
  context.moveTo(sketchLastPoint.x * ratio, sketchLastPoint.y * ratio);
  context.lineTo(nextPoint.x * ratio, nextPoint.y * ratio);
  context.stroke();
  context.restore();
  sketchLastPoint = nextPoint;
  persistSketch();
});

function stopSketch(event) {
  if (event?.pointerId != null && sketchCanvas.hasPointerCapture(event.pointerId)) sketchCanvas.releasePointerCapture(event.pointerId);
  sketchDrawing = false;
  sketchLastPoint = null;
}
sketchCanvas.addEventListener("pointerup", stopSketch);
sketchCanvas.addEventListener("pointercancel", stopSketch);

document.querySelectorAll("[data-sketch-tool]").forEach((button) => {
  button.addEventListener("click", () => {
    sketchTool = button.dataset.sketchTool;
    document.querySelectorAll("[data-sketch-tool]").forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
  });
});

document.querySelector(".sketch-undo").addEventListener("click", () => {
  const previous = sketchHistory.pop();
  if (previous) {
    restoreSketchState(previous);
    window.setTimeout(persistSketch, 0);
  }
});
document.querySelector(".sketch-clear").addEventListener("click", () => {
  saveSketchState();
  sketchCanvas.getContext("2d").clearRect(0, 0, sketchCanvas.width, sketchCanvas.height);
  persistSketch();
});
document.querySelector(".sketch-save").addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "xiaotong-sketchbook.png";
  link.href = sketchCanvas.toDataURL("image/png");
  link.click();
});

function filmFrames() {
  return [...document.querySelectorAll(".film-frame")];
}

function nearestFilmIndex() {
  const center = filmViewport.scrollLeft + filmViewport.clientWidth / 2;
  return filmFrames().reduce((best, frame, index) => {
    const frameCenter = frame.offsetLeft + frame.offsetWidth / 2;
    return Math.abs(frameCenter - center) < best.distance ? { index, distance: Math.abs(frameCenter - center) } : best;
  }, { index: 0, distance: Infinity }).index;
}

function updateFilmCount() {
  const count = filmFrames().length;
  filmCount.textContent = `${String(nearestFilmIndex() + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`;
}

function scrollFilm(direction) {
  const frames = filmFrames();
  const nextIndex = Math.min(Math.max(nearestFilmIndex() + direction, 0), frames.length - 1);
  const frame = frames[nextIndex];
  filmViewport.scrollTo({
    left: frame.offsetLeft - (filmViewport.clientWidth - frame.offsetWidth) / 2,
    behavior: reducedMotion.matches ? "auto" : "smooth",
  });
}

document.querySelector(".film-prev").addEventListener("click", () => scrollFilm(-1));
document.querySelector(".film-next").addEventListener("click", () => scrollFilm(1));
filmViewport.addEventListener("scroll", updateFilmCount, { passive: true });
filmViewport.addEventListener("wheel", (event) => {
  if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
  event.preventDefault();
  filmViewport.scrollLeft += event.deltaY;
}, { passive: false });
filmViewport.addEventListener("pointerdown", (event) => {
  filmDragging = true;
  filmDragStartX = event.clientX;
  filmDragStartScroll = filmViewport.scrollLeft;
  filmViewport.classList.add("is-dragging");
  filmViewport.setPointerCapture(event.pointerId);
});
filmViewport.addEventListener("pointermove", (event) => {
  if (!filmDragging) return;
  filmViewport.scrollLeft = filmDragStartScroll - (event.clientX - filmDragStartX);
});
filmViewport.addEventListener("pointerup", (event) => {
  filmDragging = false;
  filmViewport.classList.remove("is-dragging");
  if (filmViewport.hasPointerCapture(event.pointerId)) filmViewport.releasePointerCapture(event.pointerId);
  const frame = filmFrames()[nearestFilmIndex()];
  filmViewport.scrollTo({
    left: frame.offsetLeft - (filmViewport.clientWidth - frame.offsetWidth) / 2,
    behavior: reducedMotion.matches ? "auto" : "smooth",
  });
});

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.fov = width < 720 ? 44 : 35;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, width < 720 ? 1.2 : 1.5));
  renderer.setSize(width, height, false);
  if (sketchbookShell.classList.contains("is-visible")) resizeSketchCanvas();
  if (!activeGroup && !cameraTransition) {
    camera.position.copy(width < 720 ? mobileCamera : desktopCamera);
    controls.target.copy(initialTarget);
  }
}
window.addEventListener("resize", resize);
resize();

let loadingProgress = 0;
const loadingTimer = window.setInterval(() => {
  loadingProgress = Math.min(loadingProgress + 9 + Math.random() * 13, 100);
  loadingTrack.style.width = `${loadingProgress}%`;
  loadingValue.textContent = `${Math.round(loadingProgress)}%`;
  if (loadingProgress >= 100) {
    window.clearInterval(loadingTimer);
    window.setTimeout(() => loadingScreen.classList.add("is-hidden"), 240);
  }
}, 90);

function animate(now) {
  timer.update(now);
  const delta = Math.min(timer.getDelta(), 0.05);
  const elapsed = timer.getElapsed();
  updateCamera(now);
  updateBook(delta);
  updateShelf(delta);
  updateNight(delta);
  updateScreen(delta);
  updateAmbientMotion(elapsed);

  interactives.forEach((group) => {
    const highlighted = group === hoveredGroup;
    const baseScale = group.userData.baseScale ?? 1;
    const targetScale = baseScale * (highlighted ? 1.012 : 1);
    group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 1 - Math.exp(-9 * delta));
  });

  controls.update();
  pickObject();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
