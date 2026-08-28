import * as THREE from "three";
import {
  box,
  createLabelTexture,
  cylinder,
  cylinderBetween,
  leafGeometry,
  markInteractive,
  palette,
  roundedBox,
  torus,
} from "./scene-kit.js";

function joint(name, position, materials, radius = 0.11) {
  const mesh = cylinder(name, radius, radius, 0.14, position, materials.lampMetal ?? materials.blackMetal, 24, { rotation: [Math.PI / 2, 0, 0] });
  const screw = cylinder(`${name}-screw`, radius * 0.34, radius * 0.34, 0.154, position, materials.lampChrome ?? materials.darkEdge, 18, { rotation: [Math.PI / 2, 0, 0] });
  const group = new THREE.Group();
  group.add(mesh, screw);
  return group;
}

function foliageLeafGeometry(length = 1, width = 0.42) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(width * 0.5, length * 0.16, width * 0.56, length * 0.64, 0, length);
  shape.bezierCurveTo(-width * 0.5, length * 0.67, -width * 0.44, length * 0.18, 0, 0);
  return new THREE.ShapeGeometry(shape, 14);
}

function createWindowScene(materials) {
  const group = new THREE.Group();
  group.name = "window-scene";
  group.position.set(3.5, 4.68, -5.21);

  const skyMaterial = new THREE.MeshBasicMaterial({ color: palette.skyDay });
  const sky = roundedBox("window-sky", [4.12, 2.5, 0.035], [0, 0, -0.025], skyMaterial, 0.025, { castShadow: false });
  const glowMaterial = new THREE.MeshBasicMaterial({ color: 0xffd8a0, transparent: true, opacity: 0.85 });
  const sunDisc = new THREE.Mesh(new THREE.CircleGeometry(0.28, 36), glowMaterial);
  sunDisc.name = "window-sun";
  sunDisc.position.set(1.26, 0.7, 0.03);

  const skylineMaterial = new THREE.MeshStandardMaterial({ color: 0x52605f, roughness: 0.95 });
  const skyline = new THREE.Group();
  const buildings = [
    [-1.8, -0.85, 0.42, 0.58], [-1.35, -0.72, 0.4, 0.86], [-0.92, -0.8, 0.32, 0.68],
    [-0.52, -0.68, 0.46, 0.94], [-0.05, -0.78, 0.34, 0.74], [0.34, -0.64, 0.42, 1.03],
    [0.82, -0.77, 0.38, 0.76], [1.22, -0.69, 0.34, 0.92], [1.62, -0.8, 0.5, 0.68],
  ];
  buildings.forEach(([x, y, width, height], index) => {
    const building = roundedBox(`skyline-building-${index}`, [width, height, 0.06], [x, y + height / 2, 0.07], skylineMaterial, 0.018, { castShadow: false });
    skyline.add(building);
  });

  const frame = roundedBox("window-frame", [4.54, 2.9, 0.16], [0, 0, 0.13], materials.steel, 0.035);
  const pane = roundedBox("window-pane", [4.16, 2.52, 0.025], [0, 0, 0.23], materials.glass, 0.018, { castShadow: false });
  const vertical = roundedBox("window-mullion", [0.08, 2.55, 0.13], [0, 0, 0.31], materials.steel, 0.02);
  const horizontal = roundedBox("window-transom", [4.18, 0.07, 0.13], [0, -0.15, 0.31], materials.steel, 0.02);
  const sill = roundedBox("window-sill", [4.9, 0.14, 0.44], [0, -1.56, 0.33], materials.walnut, 0.04);

  group.add(sky, sunDisc, skyline, frame, pane, vertical, horizontal, sill);
  group.userData.skyMaterial = skyMaterial;
  group.userData.sunDisc = sunDisc;
  group.userData.skylineMaterial = skylineMaterial;
  return group;
}

export function createRoom(materials) {
  const room = new THREE.Group();
  room.name = "architecture";

  // Keep the room open and unframed. The shadow catcher preserves grounding
  // while the rug and props establish the working area without solid walls.
  const shadowFloor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), materials.shadowFloor);
  shadowFloor.name = "shadow-catcher";
  shadowFloor.rotation.x = -Math.PI / 2;
  shadowFloor.position.y = -0.035;
  shadowFloor.receiveShadow = true;

  const ceilingRail = box("floating-light-rail", [5.5, 0.09, 0.09], [0.3, 7.25, -4.98], materials.steel);
  room.add(shadowFloor, ceilingRail);

  for (let index = 0; index < 3; index += 1) {
    const spot = cylinder(`ceiling-spot-${index}`, 0.12, 0.16, 0.24, [-1.25 + index * 1.55, 7.1, -4.88], materials.steel, 24, { rotation: [Math.PI / 2, 0, 0] });
    room.add(spot);
  }

  const rug = box("rug", [7.35, 0.018, 4.6], [0.7, -0.006, 0.36], materials.rug, { castShadow: false });
  room.add(rug);

  const floatingShelf = new THREE.Group();
  floatingShelf.name = "floating-display-shelf";
  floatingShelf.position.set(3.45, 4.88, -5.02);
  floatingShelf.add(box("floating-shelf-board", [2.18, 0.1, 0.48], [0, 0, 0], materials.walnut));
  floatingShelf.add(box("floating-book-one", [0.16, 0.72, 0.34], [-0.68, 0.42, 0], materials.paper, { rotation: [0, 0, -0.04] }));
  floatingShelf.add(box("floating-book-two", [0.14, 0.58, 0.32], [-0.46, 0.34, 0], materials.graphite, { rotation: [0, 0, 0.06] }));
  const galleryVase = cylinder("gallery-vase", 0.16, 0.12, 0.42, [0.46, 0.27, 0], materials.smoke, 28);
  floatingShelf.add(galleryVase);
  const galleryStem = cylinderBetween("gallery-stem", [0.46, 0.46, 0], [0.58, 0.9, 0.02], 0.018, materials.leafDark, 8);
  const galleryLeaf = new THREE.Mesh(leafGeometry(0.36), materials.leaf);
  galleryLeaf.position.set(0.64, 0.88, 0.03);
  galleryLeaf.rotation.set(-Math.PI / 2, -0.2, 0.24);
  floatingShelf.add(galleryStem, galleryLeaf);
  room.add(floatingShelf);

  const art = new THREE.Group();
  art.name = "floating-artwork";
  art.position.set(5.25, 6.05, -5.04);
  art.rotation.z = -0.025;
  art.add(box("art-frame", [1.36, 1.82, 0.09], [0, 0, 0], materials.steel));
  art.add(box("art-paper", [1.18, 1.64, 0.025], [0, 0, 0.065], materials.paper, { castShadow: false }));
  art.add(torus("art-arc", 0.38, 0.075, [-0.15, 0.18, 0.1], materials.mutedRed, { rotation: [0, 0, 0], arc: Math.PI * 1.28 }));
  art.add(box("art-block", [0.48, 0.68, 0.035], [0.25, -0.3, 0.11], materials.graphite, { rotation: [0, 0, 0.18] }));
  room.add(art);

  // Three concealed fixtures create the reference image's pools of light:
  // above the artwork, beneath the floating shelf, and over the cabinet.
  const lightFixtures = [];
  const fixtureSpecs = [
    { name: "artwork-light", size: [1.18, 0.045, 0.045], position: [5.25, 7.02, -4.84], target: [5.25, 5.75, -1.2], color: 0xffd6a1, area: [1.35, 0.32], point: 7.5, distance: 6.5 },
    { name: "shelf-light", size: [1.75, 0.04, 0.04], position: [3.45, 4.78, -4.76], target: [3.45, 3.1, -1.1], color: 0xffc58f, area: [2.1, 0.28], point: 6.5, distance: 5.8 },
    { name: "cabinet-light", size: [2.4, 0.045, 0.045], position: [-4.85, 1.53, -1.55], target: [-4.85, 0.15, -1.0], color: 0xffd0a0, area: [2.7, 0.3], point: 8.5, distance: 5.6 },
  ];
  fixtureSpecs.forEach((spec) => {
    const material = new THREE.MeshBasicMaterial({ color: spec.color, transparent: true, opacity: 0, depthWrite: false });
    const fixture = box(spec.name, spec.size, spec.position, material, { castShadow: false, receiveShadow: false });
    const areaLight = new THREE.RectAreaLight(spec.color, 0, spec.area[0], spec.area[1]);
    areaLight.position.set(...spec.position);
    areaLight.lookAt(...spec.target);
    const pointLight = new THREE.PointLight(spec.color, 0, spec.distance, 2);
    pointLight.position.set(spec.position[0], spec.position[1] - 0.08, spec.position[2] + 0.12);
    room.add(fixture, areaLight, pointLight);
    lightFixtures.push({ material, areaLight, pointLight, maxArea: spec.point * 0.72, maxPoint: spec.point });
  });

  room.userData.windowScene = null;
  room.userData.lightFixtures = lightFixtures;
  return room;
}

export function createDesk(materials) {
  const desk = new THREE.Group();
  desk.name = "desk-system";
  desk.position.set(0.25, 0, -0.18);

  const top = roundedBox("desk-top", [6.35, 0.18, 2.62], [0, 2.38, 0], materials.smoke, 0.08);
  const edge = roundedBox("desk-edge", [6.34, 0.035, 2.61], [0, 2.275, 0], materials.paperShadow, 0.04);
  desk.add(top, edge);

  const legXs = [-2.58, 2.58];
  legXs.forEach((x, index) => {
    const front = box(`desk-leg-front-${index}`, [0.17, 2.22, 0.17], [x, 1.12, 0.95], materials.walnut);
    const back = box(`desk-leg-back-${index}`, [0.17, 2.22, 0.17], [x, 1.12, -0.95], materials.walnut);
    const rail = box(`desk-leg-rail-${index}`, [0.14, 0.16, 1.92], [x, 1.88, 0], materials.walnut);
    const feet = [-0.95, 0.95].map((z, footIndex) => box(`desk-foot-${index}-${footIndex}`, [0.24, 0.045, 0.28], [x, 0.03, z], materials.walnutDark));
    desk.add(front, back, rail, ...feet);
  });

  const drawerSlide = new THREE.Group();
  drawerSlide.name = "desk-drawer";
  drawerSlide.position.set(1.84, 2.03, 0.2);
  const drawerBody = box("drawer-body", [1.4, 0.28, 1.65], [0, 0, 0], materials.paperShadow);
  const drawerFace = box("drawer-face", [1.42, 0.25, 0.06], [0, 0, 0.86], materials.smoke);
  const drawerPull = cylinder("drawer-pull", 0.025, 0.025, 0.42, [0, 0, 0.925], materials.steel, 16, { rotation: [0, 0, Math.PI / 2] });
  drawerSlide.add(drawerBody, drawerFace, drawerPull);
  desk.add(drawerSlide);

  const tray = box("cable-tray", [2.7, 0.09, 0.42], [-0.2, 2.01, -0.94], materials.graphite);
  const cableGrommet = torus("desk-cable-grommet", 0.16, 0.035, [-1.98, 2.485, -0.72], materials.darkEdge, { rotation: [Math.PI / 2, 0, 0] });
  const cableGrommetInner = cylinder("desk-cable-grommet-inner", 0.125, 0.125, 0.012, [-1.98, 2.487, -0.72], materials.blackMatte, 28, { rotation: [Math.PI / 2, 0, 0], castShadow: false, receiveShadow: false });
  const powerBrick = roundedBox("desk-power-brick", [0.78, 0.16, 0.36], [-0.55, 1.82, -0.84], materials.blackMatte, 0.035);
  const powerCable = cylinderBetween("desk-power-cable", [-0.2, 1.89, -0.84], [0.2, 2.18, -0.86], 0.018, materials.blackMatte, 10);
  desk.add(tray, cableGrommet, cableGrommetInner, powerBrick, powerCable);
  desk.userData.drawerSlide = drawerSlide;
  return desk;
}

export function createComputer(materials) {
  const computer = new THREE.Group();
  computer.name = "computer";
  computer.position.set(0.15, 2.5, -0.1);

  const base = roundedBox("laptop-base", [2.25, 0.085, 1.42], [0, 0.035, 0], materials.blackMetal, 0.065);
  const keyWell = box("laptop-keywell", [2.05, 0.015, 1.17], [0, 0.085, -0.05], materials.graphite, { castShadow: false });
  computer.add(base, keyWell);

  const keyboard = new THREE.Group();
  keyboard.position.set(0, 0.105, -0.24);
  [12, 12, 11, 9].forEach((count, row) => {
    const keyWidth = row === 3 ? 0.15 : 0.125;
    const gap = 0.027;
    const total = count * keyWidth + (count - 1) * gap;
    for (let column = 0; column < count; column += 1) {
      keyboard.add(roundedBox(`laptop-key-${row}-${column}`, [keyWidth, 0.022, 0.1], [-total / 2 + keyWidth / 2 + column * (keyWidth + gap), 0, row * 0.126], materials.blackMatte, 0.006));
    }
  });
  computer.add(keyboard);
  computer.add(box("laptop-trackpad", [0.78, 0.01, 0.39], [0, 0.108, 0.43], materials.darkEdge, { castShadow: false }));
  computer.add(box("laptop-front-edge", [2.0, 0.012, 0.025], [0, 0.025, 0.71], materials.darkEdge, { castShadow: false }));
  const speakerMaterial = materials.darkEdge;
  [-0.76, -0.58, 0.58, 0.76].forEach((x, index) => {
    computer.add(roundedBox(`laptop-speaker-${index}`, [0.11, 0.012, 0.025], [x, 0.11, 0.23], speakerMaterial, 0.008, { castShadow: false, receiveShadow: false }));
  });
  computer.add(
    cylinder("laptop-logo", 0.08, 0.08, 0.012, [0, 0.098, -0.59], materials.chrome, 24, { rotation: [Math.PI / 2, 0, 0], castShadow: false, receiveShadow: false }),
  );

  const screenPivot = new THREE.Group();
  screenPivot.position.set(0, 0.07, -0.7);
  screenPivot.rotation.x = -0.11;
  const lid = roundedBox("laptop-lid", [2.22, 1.34, 0.065], [0, 0.67, 0], materials.blackMetal, 0.045);
  const screenTexture = createLabelTexture([
    { text: "WANG XIAOTONG", size: 28, y: 66, color: "#9a7470", weight: 700 },
    { text: "PORTFOLIO", size: 54, y: 148, color: "#eeeae4", weight: 700 },
    { text: "Ideas / Research / Making", size: 21, y: 220, color: "#a8aaa7" },
    { text: "CLICK TO ENTER  ->", size: 18, y: 330, color: "#d0cbc5", weight: 700 },
  ], { width: 720, height: 430, background: "#101211", rule: "rgba(235,231,224,.16)" });
  const screenMaterial = materials.screenGlass.clone();
  screenMaterial.map = screenTexture;
  screenMaterial.emissiveMap = screenTexture;
  screenMaterial.emissive.setHex(0xffffff);
  screenMaterial.emissiveIntensity = 0.15;
  const screen = roundedBox("laptop-screen", [2.06, 1.18, 0.012], [0, 0.67, 0.04], screenMaterial, 0.022, { castShadow: false });
  const cameraDot = cylinder("laptop-camera", 0.014, 0.014, 0.008, [0, 1.27, 0.047], materials.blackMatte, 14, { rotation: [Math.PI / 2, 0, 0] });
  const hingeLeft = cylinder("laptop-hinge-left", 0.035, 0.035, 0.46, [-0.72, 0.02, 0], materials.graphite, 20, { rotation: [0, 0, Math.PI / 2] });
  const hingeRight = cylinder("laptop-hinge-right", 0.035, 0.035, 0.46, [0.72, 0.02, 0], materials.graphite, 20, { rotation: [0, 0, Math.PI / 2] });
  const screenInset = roundedBox("laptop-screen-inset", [2.0, 1.13, 0.009], [0, 0.67, 0.034], materials.blackMatte, 0.018, { castShadow: false, receiveShadow: false });
  screenPivot.add(lid, screenInset, screen, cameraDot, hingeLeft, hingeRight);
  computer.add(screenPivot);

  const glow = new THREE.RectAreaLight(0xe8e4de, 1.6, 1.9, 1.05);
  glow.position.set(0, 0.75, 0.12);
  glow.rotation.x = -0.12;
  computer.add(glow);

  computer.userData.screenMaterial = screenMaterial;
  return markInteractive(computer, "computer", "电脑：进入作品集", [0.15, 3.32, 2.35], [0.15, 3.2, -0.72]);
}

function createProjectDiorama(materials) {
  const diorama = new THREE.Group();
  diorama.name = "paper-diorama";
  diorama.position.set(0, 0.19, 0);
  diorama.scale.setScalar(0.001);

  const ground = roundedBox("paper-ground", [1.55, 0.035, 1.18], [0.12, 0, 0], materials.paper, 0.025);
  const arch = torus("paper-arch", 0.33, 0.065, [-0.28, 0.37, -0.12], materials.accent, { rotation: [Math.PI / 2, 0, 0], arc: Math.PI });
  arch.rotation.z = Math.PI;
  const tower = roundedBox("paper-tower", [0.24, 0.7, 0.24], [0.42, 0.35, -0.18], materials.moss, 0.025);
  const platform = roundedBox("paper-platform", [0.76, 0.06, 0.42], [0.25, 0.17, 0.27], materials.walnut, 0.025);
  const flag = box("paper-flag", [0.32, 0.18, 0.02], [0.48, 0.64, -0.17], materials.accent, { rotation: [0, 0, -0.08] });
  diorama.add(ground, arch, tower, platform, flag);
  return diorama;
}

export function createBook(materials) {
  const book = new THREE.Group();
  book.name = "book";
  book.position.set(-5.25, 1.58, -1.82);
  book.rotation.y = -0.08;

  const base = roundedBox("book-base", [1.35, 0.07, 1.65], [0, 0, 0], materials.accent, 0.035);
  const pages = roundedBox("book-pages", [1.28, 0.16, 1.54], [0.02, 0.11, 0], materials.paper, 0.026);
  const spine = roundedBox("book-spine", [0.1, 0.25, 1.65], [-0.63, 0.11, 0], materials.accent, 0.035);
  const topPivot = new THREE.Group();
  topPivot.name = "book-cover-pivot";
  topPivot.position.set(-0.63, 0.23, 0);
  const top = roundedBox("book-cover", [1.35, 0.07, 1.65], [0.63, 0, 0], materials.accent, 0.035);
  const titlePlate = roundedBox("book-title", [0.56, 0.016, 0.32], [0.46, 0.045, -0.2], materials.paper, 0.012);
  const flyleaf = roundedBox("book-flyleaf", [1.27, 0.018, 1.53], [0.63, -0.045, 0], materials.paper, 0.018);
  topPivot.add(top, titlePlate, flyleaf);

  const pageRight = new THREE.Group();
  pageRight.name = "page-right";
  pageRight.position.set(0.02, 0.205, 0);
  pageRight.add(roundedBox("right-page", [1.25, 0.018, 1.52], [0, 0, 0], materials.paper, 0.018));
  const pen = new THREE.Group();
  pen.name = "book-pen";
  pen.position.set(1.03, 0.16, 0.08);
  pen.rotation.y = -0.06;
  pen.add(cylinder("book-pen-body", 0.026, 0.026, 1.18, [0, 0, 0], materials.graphite, 18, { rotation: [Math.PI / 2, 0, 0] }));
  pen.add(cylinder("book-pen-tip", 0, 0.027, 0.13, [0, 0, 0.655], materials.chrome, 18, { rotation: [Math.PI / 2, 0, 0] }));
  pen.add(box("book-pen-clip", [0.018, 0.018, 0.38], [0.038, 0.035, -0.25], materials.chrome, { castShadow: false }));
  book.add(base, pages, spine, topPivot, pageRight, pen);
  book.userData.coverPivot = topPivot;
  book.userData.pageRight = pageRight;
  book.userData.baseScale = 0.78;
  book.scale.setScalar(book.userData.baseScale);
  book.userData.open = false;
  return markInteractive(book, "book", "书本：展开项目世界", [-2.05, 3.15, 4.7], [-5.25, 1.78, -1.82]);
}

export function createCamera(materials) {
  const camera = new THREE.Group();
  camera.name = "camera";
  camera.position.set(2.18, 2.57, -0.34);
  camera.rotation.y = -0.12;

  const cameraShell = new THREE.MeshPhysicalMaterial({ color: 0x5c6461, roughness: 0.25, metalness: 0.62, clearcoat: 0.62, clearcoatRoughness: 0.18, emissive: 0x101615, emissiveIntensity: 0.12 });
  const cameraPanel = new THREE.MeshStandardMaterial({ color: 0x3f4946, roughness: 0.42, metalness: 0.5 });
  const cameraEdge = new THREE.MeshStandardMaterial({ color: 0x858d87, roughness: 0.26, metalness: 0.72 });
  const cameraGrip = new THREE.MeshStandardMaterial({ color: 0x313a37, roughness: 0.62, metalness: 0.22 });
  const cameraAccent = new THREE.MeshStandardMaterial({ color: 0xa68d71, roughness: 0.32, metalness: 0.62 });
  const body = roundedBox("camera-body", [1.0, 0.62, 0.42], [0, 0.3, 0], cameraShell, 0.055);
  const bodyInset = roundedBox("camera-body-inset", [0.8, 0.4, 0.024], [0, 0.31, 0.216], cameraPanel, 0.028, { castShadow: false });
  const facePlate = roundedBox("camera-front-plate", [0.68, 0.27, 0.018], [0, 0.31, 0.235], materials.graphite, 0.02, { castShadow: false });
  const faceLogo = roundedBox("camera-front-logo", [0.24, 0.045, 0.012], [0, 0.24, 0.248], cameraAccent, 0.012, { castShadow: false, receiveShadow: false });
  const topPlate = roundedBox("camera-top-plate", [0.94, 0.055, 0.36], [0, 0.64, -0.01], cameraEdge, 0.018);
  const grip = roundedBox("camera-grip", [0.22, 0.49, 0.35], [0.39, 0.29, 0.02], cameraGrip, 0.035);
  const gripTexture = roundedBox("camera-grip-inset", [0.14, 0.33, 0.018], [0.39, 0.29, 0.2], materials.blackMatte, 0.022, { castShadow: false });
  const viewfinder = roundedBox("camera-viewfinder", [0.28, 0.16, 0.2], [-0.06, 0.72, -0.04], cameraPanel, 0.025);
  const viewfinderGlass = roundedBox("camera-viewfinder-glass", [0.2, 0.09, 0.012], [-0.06, 0.72, 0.065], materials.softBlue, 0.014, { castShadow: false });
  const hotShoe = roundedBox("camera-hot-shoe", [0.2, 0.018, 0.1], [-0.08, 0.82, -0.03], cameraAccent, 0.008, { castShadow: false });
  const shutter = cylinder("camera-shutter", 0.07, 0.07, 0.035, [0.29, 0.69, 0.06], cameraAccent, 22);
  const modeDial = cylinder("camera-mode-dial", 0.1, 0.1, 0.065, [0.1, 0.71, -0.09], cameraPanel, 28);
  const modeDialCap = cylinder("camera-mode-dial-cap", 0.057, 0.057, 0.071, [0.1, 0.75, -0.09], cameraAccent, 24);
  const recordLight = new THREE.Mesh(new THREE.SphereGeometry(0.022, 14, 10), new THREE.MeshStandardMaterial({ color: 0xe67a68, emissive: 0x8f2e22, emissiveIntensity: 0.35 }));
  recordLight.position.set(-0.36, 0.58, 0.22);
  camera.add(body, bodyInset, facePlate, faceLogo, topPlate, grip, gripTexture, viewfinder, viewfinderGlass, hotShoe, shutter, modeDial, modeDialCap, recordLight);

  const lens = new THREE.Group();
  lens.position.set(-0.08, 0.31, 0.27);
  lens.rotation.x = Math.PI / 2;
  lens.add(cylinder("camera-lens-barrel", 0.25, 0.29, 0.28, [0, 0, 0], cameraPanel, 36));
  lens.add(cylinder("camera-focus-ring", 0.27, 0.27, 0.1, [0, -0.08, 0], cameraGrip, 40));
  lens.add(torus("camera-focus-groove-one", 0.255, 0.014, [0, -0.035, 0], cameraAccent, { rotation: [Math.PI / 2, 0, 0] }));
  lens.add(torus("camera-focus-groove-two", 0.255, 0.012, [0, -0.108, 0], cameraEdge, { rotation: [Math.PI / 2, 0, 0] }));
  lens.add(cylinder("camera-lens-front-ring", 0.235, 0.235, 0.055, [0, -0.145, 0], cameraEdge, 40));
  const lensGlass = new THREE.MeshPhysicalMaterial({ color: 0x5d8589, roughness: 0.07, metalness: 0.28, clearcoat: 0.96, clearcoatRoughness: 0.1, emissive: 0x193235, emissiveIntensity: 0.3 });
  lens.add(cylinder("camera-lens-glass", 0.19, 0.19, 0.02, [0, -0.19, 0], lensGlass, 40));
  lens.add(torus("camera-lens-aperture", 0.105, 0.018, [0, -0.204, 0], cameraGrip, { rotation: [Math.PI / 2, 0, 0] }));
  lens.add(cylinder("camera-lens-reflection", 0.07, 0.07, 0.006, [-0.045, -0.214, 0.035], new THREE.MeshBasicMaterial({ color: 0xbad7d5, transparent: true, opacity: 0.55 }), 28, { castShadow: false, receiveShadow: false }));
  camera.add(lens);

  const strapCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.48, 0.52, -0.08),
    new THREE.Vector3(-0.68, 0.3, -0.18),
    new THREE.Vector3(-0.52, 0.08, -0.24),
  ]);
  const strap = new THREE.Mesh(new THREE.TubeGeometry(strapCurve, 20, 0.018, 8, false), materials.blackMatte);
  strap.name = "camera-strap";
  strap.castShadow = true;
  camera.add(strap);

  return markInteractive(camera, "camera", "相机：打开胶卷画廊", [2.45, 3.75, 4.9], [2.18, 2.95, -0.34]);
}

function createShelfBook(materials, index, row, baseY, cursor) {
  const widths = [0.2, 0.24, 0.18, 0.28, 0.22];
  const heights = [0.78, 0.93, 0.84, 1.02, 0.88];
  const mats = [materials.mutedRed, materials.paper, materials.graphite, materials.warmWhite, materials.walnut];
  const width = widths[(index + row) % widths.length];
  const height = heights[(index * 2 + row) % heights.length];
  const depth = 0.8 + ((index + row) % 3) * 0.07;
  const group = new THREE.Group();
  group.position.set(cursor + width / 2, baseY, 0.27);
  group.rotation.z = index === 5 ? -0.12 : ((index + row) % 4 === 0 ? 0.035 : 0);
  const cover = mats[(index + row) % mats.length];
  group.add(roundedBox("shelf-book-cover", [width, height, depth], [0, height / 2, 0], cover, 0.018));
  group.add(box("shelf-book-pages", [Math.max(0.1, width - 0.055), height - 0.07, depth - 0.06], [0.014, height / 2, -0.012], materials.paper));
  group.add(roundedBox("shelf-book-spine", [width + 0.012, height, 0.045], [0, height / 2, depth / 2 + 0.02], cover, 0.012));
  if ((index + row) % 2 === 0) group.add(box("shelf-book-label", [width * 0.58, 0.11, 0.012], [0, height * 0.62, depth / 2 + 0.047], materials.paper));
  return { group, width };
}

export function createShelf(materials) {
  const shelf = new THREE.Group();
  shelf.name = "shelf";
  shelf.position.set(-4.85, 0, -2.35);

  const frame = new THREE.Group();
  frame.add(
    box("cabinet-top", [3.15, 0.13, 1.48], [0, 1.4, 0], materials.blackMatte),
    box("cabinet-bottom", [3.15, 0.13, 1.48], [0, 0.12, 0], materials.blackMatte),
    box("cabinet-left", [0.13, 1.28, 1.48], [-1.51, 0.76, 0], materials.blackMatte),
    box("cabinet-right", [0.13, 1.28, 1.48], [1.51, 0.76, 0], materials.blackMatte),
    box("cabinet-back", [2.9, 1.15, 0.08], [0, 0.76, -0.7], materials.graphite),
    box("cabinet-divider", [0.08, 1.15, 1.38], [0, 0.76, 0], materials.graphite),
  );
  shelf.add(frame);
  [-1.22, 1.22].forEach((x, index) => {
    shelf.add(
      roundedBox(`cabinet-foot-${index}`, [0.34, 0.18, 0.5], [x, 0.03, 0], materials.walnutDark, 0.035),
      box(`cabinet-foot-pad-${index}`, [0.42, 0.035, 0.58], [x, -0.07, 0], materials.blackMatte, { castShadow: false }),
    );
  });

  [-0.76, 0.76].forEach((x, column) => {
    [0.46, 1.02].forEach((y, row) => {
      if (column === 1 && row === 1) return;
      shelf.add(box(`cabinet-door-${column}-${row}`, [1.34, 0.46, 0.06], [x, y, 0.755], materials.blackMatte));
      shelf.add(box(`cabinet-door-line-${column}-${row}`, [0.3, 0.015, 0.012], [x, y + 0.08, 0.792], materials.darkEdge, { castShadow: false }));
      shelf.add(cylinder(`cabinet-knob-${column}-${row}`, 0.035, 0.035, 0.026, [x + (column ? -0.36 : 0.36), y - 0.08, 0.82], materials.chrome, 20, { rotation: [Math.PI / 2, 0, 0] }));
    });
  });

  const recordPlayer = new THREE.Group();
  recordPlayer.position.set(-0.65, 1.56, -0.08);
  recordPlayer.add(box("record-player-base", [1.38, 0.12, 0.95], [0, 0, 0], materials.blackMatte));
  const record = cylinder("record", 0.33, 0.33, 0.018, [-0.22, 0.08, 0], materials.graphite, 48);
  record.rotation.x = Math.PI / 2;
  recordPlayer.add(record);
  recordPlayer.add(cylinder("record-label", 0.09, 0.09, 0.021, [-0.22, 0.092, 0], materials.mutedRed, 32, { rotation: [Math.PI / 2, 0, 0] }));
  recordPlayer.add(cylinderBetween("record-arm", [0.4, 0.12, -0.18], [0.12, 0.14, 0.18], 0.018, materials.chrome, 12));
  shelf.add(recordPlayer);

  const archive = new THREE.Group();
  archive.name = "archive-drawer";
  archive.position.set(0.76, 1.02, 0.78);
  archive.add(box("archive-box", [1.34, 0.46, 1.25], [0, 0, -0.56], materials.graphite));
  archive.add(box("archive-face", [1.34, 0.46, 0.06], [0, 0, 0], materials.blackMatte));
  archive.add(box("archive-label", [0.3, 0.1, 0.012], [0, 0.07, 0.04], materials.paper, { castShadow: false }));
  archive.add(cylinder("archive-pull", 0.018, 0.018, 0.2, [0, -0.09, 0.055], materials.chrome, 14, { rotation: [0, 0, Math.PI / 2] }));
  shelf.add(archive);

  const displayPanel = new THREE.Group();
  displayPanel.name = "archive-panel";
  displayPanel.position.set(0.76, 1.02, 0.25);
  const panelTexture = createLabelTexture([
    { text: "SELECTED WORK", size: 32, y: 64, color: "#9f746e", weight: 700 },
    { text: "Research & writing", size: 24, y: 128 },
    { text: "Digital experiments", size: 24, y: 178 },
    { text: "Spatial stories", size: 24, y: 228 },
  ], { width: 560, height: 330, background: "#1c2220" });
  const panelMaterial = new THREE.MeshStandardMaterial({ map: panelTexture, emissiveMap: panelTexture, emissive: 0xffffff, emissiveIntensity: 0.06, roughness: 0.55 });
  displayPanel.add(box("archive-panel-body", [2.25, 1.36, 0.08], [0, 0, 0], materials.steel));
  displayPanel.add(box("archive-panel-screen", [2.08, 1.2, 0.02], [0, 0, 0.055], panelMaterial));
  displayPanel.scale.setScalar(0.001);
  shelf.add(displayPanel);

  shelf.userData.archive = archive;
  shelf.userData.displayPanel = displayPanel;
  shelf.userData.progress = 0;
  shelf.userData.open = false;
  return markInteractive(shelf, "shelf", "边柜：抽出作品档案", [-0.8, 3.65, 9.4], [-4.2, 1.35, -1.9]);
}

export function createLamp(materials) {
  const lamp = new THREE.Group();
  lamp.name = "lamp";
  // Desk top is centered at y=2.38 with a 0.18 height; align the base bottom to its upper edge.
  // Keep the lamp behind and left of the laptop so the silhouette reads clearly in the entry view.
  lamp.position.set(-1.8, 2.465, -0.12);

  const lampMetal = new THREE.MeshPhysicalMaterial({ color: 0x4f5955, roughness: 0.26, metalness: 0.68, clearcoat: 0.46, clearcoatRoughness: 0.2 });
  const lampChrome = new THREE.MeshStandardMaterial({ color: 0xa1a39a, roughness: 0.24, metalness: 0.76 });
  const lampBaseTop = new THREE.MeshStandardMaterial({ color: 0x69736d, roughness: 0.34, metalness: 0.56 });
  materials.lampMetal = lampMetal;
  materials.lampChrome = lampChrome;

  const base = cylinder("lamp-base", 0.34, 0.39, 0.11, [0, 0.055, 0], lampMetal, 40);
  const baseFoot = cylinder("lamp-base-foot", 0.3, 0.33, 0.045, [0, 0.015, 0], materials.blackMatte, 40);
  const baseTop = cylinder("lamp-base-top", 0.285, 0.285, 0.022, [0, 0.118, 0], lampBaseTop, 40);
  const baseRing = torus("lamp-base-ring", 0.31, 0.025, [0, 0.13, 0], lampChrome, { rotation: [Math.PI / 2, 0, 0] });
  const baseInnerRing = torus("lamp-base-inner-ring", 0.19, 0.012, [0, 0.143, 0], materials.mutedRed, { rotation: [Math.PI / 2, 0, 0] });
  const switchButton = cylinder("lamp-switch", 0.04, 0.04, 0.032, [0.2, 0.152, 0.1], materials.mutedRed, 18);
  lamp.add(base, baseFoot, baseTop, baseRing, baseInnerRing, switchButton);

  const basePoint = [-0.02, 0.18, 0];
  const elbowPoint = [-0.17, 0.84, 0];
  const headPoint = [-0.28, 1.22, 0];
  [-0.055, 0.055].forEach((z, index) => {
    lamp.add(cylinderBetween(`lower-strut-${index}`, [basePoint[0], basePoint[1], z], [elbowPoint[0], elbowPoint[1], z], 0.033, lampMetal, 18));
    lamp.add(cylinderBetween(`upper-strut-${index}`, [elbowPoint[0], elbowPoint[1], z], [headPoint[0], headPoint[1], z], 0.033, lampMetal, 18));
  });
  lamp.add(joint("base-joint", basePoint, materials, 0.12));
  lamp.add(joint("elbow-joint", elbowPoint, materials, 0.13));
  lamp.add(joint("head-joint", headPoint, materials, 0.12));

  const head = new THREE.Group();
  head.position.set(...headPoint);
  head.rotation.z = -0.18;
  lamp.add(head);

  const socket = cylinder("lamp-socket", 0.1, 0.12, 0.2, [0, -0.12, 0], lampMetal, 28);
  const socketCollar = torus("lamp-socket-collar", 0.105, 0.016, [0, -0.19, 0], lampChrome, { rotation: [Math.PI / 2, 0, 0] });
  const shadeMaterial = new THREE.MeshPhysicalMaterial({ color: 0x76534a, roughness: 0.28, metalness: 0.42, clearcoat: 0.55, clearcoatRoughness: 0.18, emissive: 0x160b08, emissiveIntensity: 0.05, side: THREE.DoubleSide });
  const shadeInnerMaterial = new THREE.MeshStandardMaterial({ color: 0xb47755, roughness: 0.42, metalness: 0.18, emissive: 0x2b140b, emissiveIntensity: 0.08, side: THREE.DoubleSide });
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.52, 40, 1, true), shadeMaterial);
  shade.name = "lamp-shade";
  shade.position.y = -0.38;
  shade.castShadow = true;
  const shadeInner = new THREE.Mesh(new THREE.ConeGeometry(0.315, 0.46, 40, 1, true), shadeInnerMaterial);
  shadeInner.name = "lamp-shade-inner";
  shadeInner.position.y = -0.38;
  shadeInner.castShadow = false;
  const rim = torus("lamp-shade-rim", 0.36, 0.026, [0, -0.64, 0], lampChrome, { rotation: [Math.PI / 2, 0, 0] });
  const shadeBand = torus("lamp-shade-band", 0.305, 0.016, [0, -0.51, 0], materials.mutedRed, { rotation: [Math.PI / 2, 0, 0] });
  const bulbMaterial = materials.bulb.clone();
  const bulbMesh = new THREE.Mesh(new THREE.SphereGeometry(0.13, 28, 20), bulbMaterial);
  bulbMesh.position.set(0, -0.5, 0);
  bulbMesh.scale.y = 1.2;
  const light = new THREE.PointLight(palette.amber, 0, 7.5, 2);
  light.position.set(0, -0.68, 0.08);
  light.castShadow = false;
  head.add(socket, socketCollar, shade, shadeInner, rim, shadeBand, bulbMesh, light);

  const cableCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.06, 0.11),
    new THREE.Vector3(0.03, 0.3, 0.11),
    new THREE.Vector3(...elbowPoint).add(new THREE.Vector3(0.03, -0.08, 0.11)),
    new THREE.Vector3(...headPoint).add(new THREE.Vector3(-0.02, -0.04, 0.11)),
  ]);
  const cable = new THREE.Mesh(new THREE.TubeGeometry(cableCurve, 30, 0.017, 8, false), materials.blackMatte);
  cable.castShadow = true;
  lamp.add(cable);

  lamp.userData.focusTarget = new THREE.Vector3(-1.78, 3.35, -0.12);
  lamp.userData.light = light;
  lamp.userData.bulbMaterial = bulbMaterial;
  lamp.userData.shadeMaterial = shadeMaterial;
  lamp.userData.on = false;
  return markInteractive(lamp, "lamp", "台灯：切换昼夜与隐藏线索", [-1.2, 4.25, 4.75], [-1.78, 3.35, -0.34]);
}

export function createChair(materials) {
  const chair = new THREE.Group();
  chair.name = "chair";
  chair.position.set(2.75, 0, 2.82);
  chair.rotation.y = -0.32;
  chair.scale.setScalar(0.9);

  const seatShape = new THREE.Shape();
  seatShape.moveTo(-0.72, -0.48);
  seatShape.bezierCurveTo(-0.78, -0.06, -0.68, 0.47, -0.5, 0.58);
  seatShape.bezierCurveTo(-0.12, 0.68, 0.55, 0.63, 0.7, 0.38);
  seatShape.bezierCurveTo(0.78, 0.04, 0.72, -0.34, 0.56, -0.5);
  seatShape.bezierCurveTo(0.18, -0.62, -0.34, -0.61, -0.72, -0.48);
  const seat = new THREE.Mesh(new THREE.ExtrudeGeometry(seatShape, { depth: 0.16, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.04, bevelSegments: 3, curveSegments: 16 }), materials.blackMatte);
  seat.name = "chair-curved-seat";
  seat.rotation.x = -Math.PI / 2;
  seat.position.set(0, 1.7, 0.05);
  seat.castShadow = true;

  const backShape = new THREE.Shape();
  backShape.moveTo(-0.66, -0.7);
  backShape.bezierCurveTo(-0.76, -0.25, -0.72, 0.48, -0.5, 0.73);
  backShape.bezierCurveTo(-0.2, 0.94, 0.38, 0.92, 0.6, 0.66);
  backShape.bezierCurveTo(0.74, 0.32, 0.72, -0.34, 0.56, -0.67);
  backShape.bezierCurveTo(0.18, -0.8, -0.3, -0.8, -0.66, -0.7);
  const back = new THREE.Mesh(new THREE.ExtrudeGeometry(backShape, { depth: 0.1, bevelEnabled: true, bevelSize: 0.045, bevelThickness: 0.035, bevelSegments: 3, curveSegments: 18 }), materials.blackMatte);
  back.name = "chair-curved-back";
  back.position.set(0, 2.62, 0.51);
  back.rotation.x = -0.14;
  back.castShadow = true;

  const support = box("chair-support", [0.16, 0.82, 0.12], [0, 1.96, 0.48], materials.steel, { rotation: [-0.12, 0, 0] });
  const stem = cylinder("chair-stem", 0.08, 0.1, 1.22, [0, 0.96, 0], materials.chrome, 22);
  const gas = cylinder("chair-gas", 0.13, 0.13, 0.32, [0, 1.42, 0], materials.steel, 24);
  const armrests = new THREE.Group();
  [-0.68, 0.68].forEach((x, index) => {
    armrests.add(
      cylinder(`chair-arm-post-${index}`, 0.035, 0.035, 0.48, [x, 2.02, 0.33], materials.chrome, 16, { rotation: [0.08, 0, 0] }),
      roundedBox(`chair-arm-pad-${index}`, [0.32, 0.08, 0.62], [x, 2.27, 0.24], materials.blackMatte, 0.035),
    );
  });
  const backSeam = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.42, 2.54, 0.565),
      new THREE.Vector3(0.42, 2.54, 0.565),
      new THREE.Vector3(0.42, 2.98, 0.565),
      new THREE.Vector3(-0.42, 2.98, 0.565),
    ]),
    new THREE.LineBasicMaterial({ color: 0x41423f, transparent: true, opacity: 0.8 }),
  );
  backSeam.name = "chair-back-seam";
  chair.add(seat, back, support, stem, gas, armrests, backSeam);
  for (let index = 0; index < 5; index += 1) {
    const angle = (index / 5) * Math.PI * 2;
    const end = [Math.sin(angle) * 0.72, 0.31, Math.cos(angle) * 0.72];
    chair.add(cylinderBetween(`chair-spoke-${index}`, [0, 0.36, 0], end, 0.044, materials.steel, 14));
    const center = new THREE.Vector3(end[0], 0.2, end[2]);
    const tangent = new THREE.Vector3(Math.cos(angle), 0, -Math.sin(angle)).multiplyScalar(0.09);
    chair.add(cylinderBetween(`chair-wheel-${index}`, center.clone().sub(tangent).toArray(), center.clone().add(tangent).toArray(), 0.092, materials.steel, 18));
  }
  return chair;
}

export function createPlant(materials, position, scale = 1) {
  const plant = new THREE.Group();
  plant.name = "plant";
  plant.position.set(...position);
  plant.scale.setScalar(scale);

  const isDeskPlant = scale < 0.7;
  const potMaterial = isDeskPlant ? materials.potWarm : materials.potGlaze;
  const pot = cylinder("plant-pot", 0.43, 0.31, 0.6, [0, 0.34, 0], potMaterial, 48);
  const foot = cylinder("plant-pot-foot", 0.27, 0.29, 0.07, [0, 0.055, 0], potMaterial, 40);
  const saucer = cylinder("plant-saucer", 0.44, 0.42, 0.055, [0, 0.035, 0], materials.paperShadow, 48);
  const rim = torus("plant-pot-rim", 0.43, 0.038, [0, 0.65, 0], potMaterial, { rotation: [Math.PI / 2, 0, 0] });
  const glazeBand = torus("plant-pot-band", 0.345, 0.012, [0, 0.2, 0], materials.paper, { rotation: [Math.PI / 2, 0, 0] });
  const soil = cylinder("plant-soil", 0.39, 0.39, 0.025, [0, 0.665, 0], materials.walnutDark, 36);
  plant.add(saucer, pot, foot, rim, glazeBand, soil);

  for (let index = 0; index < 9; index += 1) {
    const pebbleAngle = (index / 9) * Math.PI * 2;
    const pebble = new THREE.Mesh(new THREE.DodecahedronGeometry(0.055 + (index % 3) * 0.009, 1), index % 2 ? materials.paperShadow : materials.chrome);
    pebble.position.set(Math.cos(pebbleAngle) * (0.15 + (index % 2) * 0.08), 0.69, Math.sin(pebbleAngle) * (0.15 + (index % 2) * 0.08));
    pebble.scale.y = 0.5;
    pebble.castShadow = true;
    plant.add(pebble);
  }

  const leafCount = isDeskPlant ? 10 : 15;
  for (let index = 0; index < leafCount; index += 1) {
    const angle = (index / leafCount) * Math.PI * 2 + Math.sin(index * 1.7) * 0.22;
    const height = (isDeskPlant ? 0.42 : 0.58) + (index % 5) * (isDeskPlant ? 0.085 : 0.12);
    const reach = (isDeskPlant ? 0.14 : 0.2) + (index % 4) * 0.075;
    const start = new THREE.Vector3(Math.cos(angle) * 0.035, 0.67, Math.sin(angle) * 0.035);
    const end = new THREE.Vector3(Math.cos(angle) * reach, 0.67 + height, Math.sin(angle) * reach);
    const mid = start.clone().lerp(end, 0.54);
    mid.x += Math.cos(angle + Math.PI / 2) * (0.05 + (index % 2) * 0.025);
    mid.y += 0.08;
    const stemCurve = new THREE.CatmullRomCurve3([start, mid, end]);
    const stem = new THREE.Mesh(new THREE.TubeGeometry(stemCurve, 12, isDeskPlant ? 0.018 : 0.023, 8, false), materials.leafDark);
    stem.name = `plant-stem-${index}`;
    stem.castShadow = true;
    plant.add(stem);

    const leafLength = (isDeskPlant ? 0.55 : 0.72) + (index % 4) * (isDeskPlant ? 0.055 : 0.075);
    const leafWidth = leafLength * (0.38 + (index % 3) * 0.035);
    const leafMaterial = index % 5 === 0 ? materials.leafLight : index % 3 === 0 ? materials.leafDark : materials.leaf;
    const leaf = new THREE.Mesh(foliageLeafGeometry(leafLength, leafWidth), leafMaterial);
    leaf.name = `plant-leaf-${index}`;
    leaf.position.copy(end);
    leaf.rotation.set(
      Math.sin(index * 1.31) * 0.12,
      Math.sin(angle) * 0.42,
      -Math.cos(angle) * 0.48 + Math.sin(index * 0.8) * 0.08,
    );
    leaf.castShadow = true;
    plant.add(leaf);

    const vein = box(
      `leaf-vein-${index}`,
      [0.012, leafLength * 0.72, 0.009],
      [0, leafLength * 0.36, 0.012],
      materials.leafDark,
      { castShadow: false, receiveShadow: false },
    );
    leaf.add(vein);
  }
  return plant;
}

export function createDeskObjects(materials) {
  const group = new THREE.Group();
  const pinboard = new THREE.Group();
  pinboard.name = "inspiration-board";
  pinboard.position.set(-0.45, 5.62, -5.02);
  pinboard.add(box("pinboard-frame", [3.35, 1.42, 0.09], [0, 0, 0], materials.steel));
  const boardTexture = createLabelTexture([
    { text: "WELCOME TO MY ROOM", size: 35, x: 42, y: 62, color: "#393836", weight: 700 },
    { text: "Ideas become objects here.", size: 21, x: 42, y: 128, color: "#6b6763" },
    { text: "Observe  /  Write  /  Make", size: 19, x: 42, y: 190, color: "#765b58", weight: 700 },
    { text: "Xiaotong", size: 18, x: 610, y: 270, color: "#6b6763" },
  ], { width: 800, height: 340, background: "#e4e0da", border: false });
  const boardMaterial = new THREE.MeshStandardMaterial({ map: boardTexture, roughness: 0.8 });
  pinboard.add(box("pinboard-surface", [3.18, 1.25, 0.035], [0, 0, 0.066], boardMaterial, { castShadow: false }));
  pinboard.add(cylinder("whiteboard-marker", 0.025, 0.025, 0.54, [0.75, -0.7, 0.12], materials.graphite, 16, { rotation: [0, 0, Math.PI / 2] }));

  group.add(pinboard);

  const cup = new THREE.Group();
  cup.name = "desk-cup";
  cup.position.set(2.72, 2.5, 0.55);
  const cupBody = cylinder("cup-body", 0.2, 0.16, 0.48, [0, 0.24, 0], materials.paper, 36);
  const cupRim = torus("cup-rim", 0.2, 0.018, [0, 0.49, 0], materials.paperShadow, { rotation: [Math.PI / 2, 0, 0] });
  const coffee = cylinder("cup-coffee", 0.17, 0.17, 0.012, [0, 0.49, 0], materials.walnutDark, 32);
  const handle = torus("cup-handle", 0.14, 0.026, [0.19, 0.28, 0], materials.paper, { rotation: [Math.PI / 2, 0, 0], arc: Math.PI * 1.6 });
  handle.rotation.y = Math.PI / 2;
  cup.add(cupBody, cupRim, coffee, handle);
  group.add(cup);
  return group;
}
