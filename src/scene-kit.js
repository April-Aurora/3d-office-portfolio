import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export const palette = {
  chalk: 0xf0eeea,
  plaster: 0xb6b2b0,
  concrete: 0xd5d2cd,
  smoke: 0xe9e7e2,
  steel: 0x272a28,
  chrome: 0x555956,
  walnut: 0xb9a381,
  walnutDark: 0x85745d,
  paper: 0xf2f0eb,
  moss: 0x3a3d3a,
  leaf: 0x4e5b50,
  persimmon: 0x765b58,
  amber: 0xd6a766,
  skyDay: 0xc7cbc8,
  skyNight: 0x3d4748,
};

function proceduralTexture(size, draw) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  draw(context, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  return texture;
}

function createWalnutTexture() {
  return proceduralTexture(512, (context, size) => {
    context.fillStyle = "#b9a78d";
    context.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y += 2) {
      const wave = Math.sin(y * 0.075) * 12 + Math.sin(y * 0.019) * 26;
      const tone = 128 + Math.round(Math.sin(y * 0.11) * 8);
      context.strokeStyle = `rgba(${tone}, ${tone - 10}, ${tone - 22}, 0.16)`;
      context.lineWidth = y % 9 === 0 ? 2 : 0.7;
      context.beginPath();
      context.moveTo(0, y + wave);
      context.bezierCurveTo(size * 0.28, y - wave * 0.4, size * 0.68, y + wave * 0.6, size, y - wave * 0.2);
      context.stroke();
    }
    for (let index = 0; index < 9; index += 1) {
      const x = (index * 83 + 41) % size;
      const y = (index * 137 + 73) % size;
      context.strokeStyle = "rgba(112, 91, 69, 0.16)";
      context.lineWidth = 2;
      context.beginPath();
      context.ellipse(x, y, 9 + (index % 4) * 3, 3 + (index % 2), index * 0.2, 0, Math.PI * 2);
      context.stroke();
    }
  });
}

function createConcreteTexture() {
  return proceduralTexture(256, (context, size) => {
    context.fillStyle = "#e3e0da";
    context.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y += 4) {
      for (let x = 0; x < size; x += 4) {
        const noise = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        const alpha = 0.025 + Math.abs(noise - Math.floor(noise)) * 0.055;
        context.fillStyle = noise > 0 ? `rgba(255,255,255,${alpha})` : `rgba(20,25,24,${alpha})`;
        context.fillRect(x, y, 3, 3);
      }
    }
  });
}

function createFabricTexture() {
  return proceduralTexture(128, (context, size) => {
    context.fillStyle = "#3a3d3a";
    context.fillRect(0, 0, size, size);
    context.strokeStyle = "rgba(245,245,240,.09)";
    context.lineWidth = 1;
    for (let index = 0; index < size; index += 4) {
      context.beginPath();
      context.moveTo(index, 0);
      context.lineTo(index, size);
      context.stroke();
      context.beginPath();
      context.moveTo(0, index);
      context.lineTo(size, index);
      context.stroke();
    }
  });
}

function createRugTexture() {
  return proceduralTexture(256, (context, size) => {
    context.fillStyle = "#8b706c";
    context.fillRect(0, 0, size, size);
    for (let index = 0; index < size; index += 3) {
      context.strokeStyle = index % 9 === 0 ? "rgba(238,225,216,.12)" : "rgba(30,24,23,.08)";
      context.lineWidth = 0.65;
      context.beginPath();
      context.moveTo(index, 0);
      context.lineTo(index, size);
      context.stroke();
      context.beginPath();
      context.moveTo(0, index);
      context.lineTo(size, index);
      context.stroke();
    }
  });
}

function createPlasterTexture() {
  return proceduralTexture(512, (context, size) => {
    context.fillStyle = "#d2d1cc";
    context.fillRect(0, 0, size, size);

    for (let index = 0; index < 34; index += 1) {
      const x = (index * 97 + 43) % size;
      const y = (index * 149 + 61) % size;
      const radius = 48 + (index % 6) * 18;
      const wash = context.createRadialGradient(x, y, 0, x, y, radius);
      const light = index % 3 === 0;
      wash.addColorStop(0, light ? "rgba(255,255,252,.085)" : "rgba(88,86,81,.045)");
      wash.addColorStop(1, "rgba(255,255,255,0)");
      context.fillStyle = wash;
      context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }

    for (let y = 0; y < size; y += 3) {
      const sweep = Math.sin(y * 0.031) * 10 + Math.sin(y * 0.009) * 18;
      context.strokeStyle = `rgba(255,255,252,${0.035 + (y % 11) * 0.0025})`;
      context.lineWidth = 1.2;
      context.beginPath();
      context.moveTo(-20, y + sweep);
      context.bezierCurveTo(size * 0.34, y - sweep * 0.2, size * 0.7, y + sweep * 0.25, size + 20, y - sweep * 0.12);
      context.stroke();
    }

    for (let index = 0; index < 4600; index += 1) {
      const x = (index * 67 + 29) % size;
      const y = (index * 131 + 47) % size;
      const noise = Math.sin(index * 91.733) * 0.5 + 0.5;
      context.fillStyle = noise > 0.48 ? `rgba(255,255,252,${0.03 + noise * 0.045})` : `rgba(74,72,68,${0.022 + noise * 0.03})`;
      const grain = 0.45 + (index % 4) * 0.18;
      context.fillRect(x, y, grain, grain);
    }
  });
}

export function createMaterials() {
  const walnutTexture = createWalnutTexture();
  walnutTexture.repeat.set(3, 1);
  const concreteTexture = createConcreteTexture();
  concreteTexture.repeat.set(8, 6);
  const fabricTexture = createFabricTexture();
  fabricTexture.repeat.set(5, 5);
  const rugTexture = createRugTexture();
  rugTexture.repeat.set(8, 5);
  const plasterTexture = createPlasterTexture();
  plasterTexture.repeat.set(5, 2.5);

  return {
    wall: new THREE.MeshStandardMaterial({ color: 0xddd9d4, map: plasterTexture, bumpMap: plasterTexture, bumpScale: 0.042, roughness: 0.98 }),
    wallInset: new THREE.MeshStandardMaterial({ color: 0xc9c6c1, map: plasterTexture, bumpMap: plasterTexture, bumpScale: 0.028, roughness: 0.96 }),
    floor: new THREE.MeshStandardMaterial({ color: palette.concrete, map: concreteTexture, roughness: 0.83, metalness: 0.04 }),
    shadowFloor: new THREE.ShadowMaterial({ color: 0x332e2c, opacity: 0.105, transparent: true }),
    steel: new THREE.MeshStandardMaterial({ color: palette.steel, roughness: 0.43, metalness: 0.58 }),
    smoke: new THREE.MeshStandardMaterial({ color: palette.smoke, roughness: 0.56, metalness: 0.04 }),
    chrome: new THREE.MeshStandardMaterial({ color: palette.chrome, roughness: 0.3, metalness: 0.72 }),
    aluminum: new THREE.MeshStandardMaterial({ color: 0x4b4f4c, roughness: 0.28, metalness: 0.7 }),
    blackMetal: new THREE.MeshPhysicalMaterial({ color: 0x151515, roughness: 0.3, metalness: 0.78, clearcoat: 0.14, clearcoatRoughness: 0.4 }),
    blackMatte: new THREE.MeshStandardMaterial({ color: 0x1b1a1a, roughness: 0.74, metalness: 0.14 }),
    graphite: new THREE.MeshStandardMaterial({ color: 0x2d2d2c, roughness: 0.46, metalness: 0.54 }),
    darkEdge: new THREE.MeshStandardMaterial({ color: 0x5b5f5b, roughness: 0.3, metalness: 0.72 }),
    screenGlass: new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.12, metalness: 0.08, clearcoat: 0.72, clearcoatRoughness: 0.15 }),
    warmWhite: new THREE.MeshStandardMaterial({ color: 0xebe9e4, roughness: 0.68, metalness: 0.03 }),
    mutedRed: new THREE.MeshStandardMaterial({ color: 0x765b58, roughness: 0.78 }),
    walnut: new THREE.MeshStandardMaterial({ color: 0xffffff, map: walnutTexture, roughness: 0.62 }),
    walnutDark: new THREE.MeshStandardMaterial({ color: 0x756a5d, roughness: 0.7 }),
    paper: new THREE.MeshStandardMaterial({ color: palette.paper, roughness: 0.9 }),
    paperShadow: new THREE.MeshStandardMaterial({ color: 0xcfc9bd, roughness: 0.93 }),
    moss: new THREE.MeshStandardMaterial({ color: palette.moss, map: fabricTexture, roughness: 0.96 }),
    rug: new THREE.MeshStandardMaterial({ color: 0xffffff, map: rugTexture, bumpMap: rugTexture, bumpScale: 0.018, roughness: 0.99 }),
    leaf: new THREE.MeshStandardMaterial({ color: palette.leaf, roughness: 0.84, side: THREE.DoubleSide }),
    leafLight: new THREE.MeshStandardMaterial({ color: 0x5b685d, roughness: 0.84, side: THREE.DoubleSide }),
    leafDark: new THREE.MeshStandardMaterial({ color: 0x3c483e, roughness: 0.88, side: THREE.DoubleSide }),
    accent: new THREE.MeshStandardMaterial({ color: palette.persimmon, roughness: 0.63 }),
    sunny: new THREE.MeshStandardMaterial({ color: 0xc5beb4, roughness: 0.68 }),
    softBlue: new THREE.MeshStandardMaterial({ color: 0x555b57, roughness: 0.56, metalness: 0.22 }),
    potGlaze: new THREE.MeshPhysicalMaterial({ color: 0xbab8b3, roughness: 0.38, clearcoat: 0.28, clearcoatRoughness: 0.48 }),
    potWarm: new THREE.MeshPhysicalMaterial({ color: 0xe1ded8, roughness: 0.42, clearcoat: 0.22, clearcoatRoughness: 0.5 }),
    cork: new THREE.MeshStandardMaterial({ color: 0x817a72, roughness: 0.98 }),
    amberMetal: new THREE.MeshStandardMaterial({ color: 0x1a1c1b, roughness: 0.34, metalness: 0.72 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0xaeb8b7, roughness: 0.12, metalness: 0.02, transmission: 0.42, transparent: true, opacity: 0.5 }),
    screen: new THREE.MeshPhysicalMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.16, roughness: 0.12, clearcoat: 0.65, clearcoatRoughness: 0.16 }),
    bulb: new THREE.MeshStandardMaterial({ color: 0xffd6a2, emissive: palette.amber, emissiveIntensity: 0.18, roughness: 0.38 }),
  };
}

export function box(name, size, position, material, options = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  if (options.rotation) mesh.rotation.set(...options.rotation);
  return mesh;
}

export function roundedBox(name, size, position, material, radius = 0.06, options = {}) {
  const safeRadius = Math.min(radius, Math.min(...size) * 0.45);
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(...size, 4, safeRadius), material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  if (options.rotation) mesh.rotation.set(...options.rotation);
  return mesh;
}

export function cylinder(name, radiusTop, radiusBottom, height, position, material, segments = 28, options = {}) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  if (options.rotation) mesh.rotation.set(...options.rotation);
  return mesh;
}

export function cylinderBetween(name, start, end, radius, material, segments = 18) {
  const from = new THREE.Vector3(...start);
  const to = new THREE.Vector3(...end);
  const direction = to.clone().sub(from);
  const mesh = cylinder(name, radius, radius, direction.length(), from.clone().add(to).multiplyScalar(0.5).toArray(), material, segments);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  return mesh;
}

export function torus(name, radius, tube, position, material, options = {}) {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 12, 40, options.arc ?? Math.PI * 2), material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = true;
  if (options.rotation) mesh.rotation.set(...options.rotation);
  return mesh;
}

export function createLabelTexture(lines, options = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = options.width ?? 512;
  canvas.height = options.height ?? 320;
  const context = canvas.getContext("2d");
  if (options.background !== null) {
    context.fillStyle = options.background ?? "#152225";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  if (options.border !== false) {
    context.strokeStyle = options.rule ?? "rgba(225,232,228,.2)";
    context.lineWidth = 2;
    context.strokeRect(18, 18, canvas.width - 36, canvas.height - 36);
  }
  context.textBaseline = "middle";
  lines.forEach((line, index) => {
    context.fillStyle = line.color ?? "#e8ece8";
    context.font = `${line.weight ?? 500} ${line.size ?? 34}px Arial`;
    context.fillText(line.text, line.x ?? 42, line.y ?? 70 + index * 58);
  });
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

export function markInteractive(group, id, label, focusPosition, targetPosition) {
  group.userData.interactiveId = id;
  group.userData.label = label;
  group.userData.focusPosition = new THREE.Vector3(...focusPosition);
  group.userData.targetPosition = new THREE.Vector3(...targetPosition);
  if (id === "book") {
    group.userData.focusPosition.set(-5.25, 10.8, -1.15);
    group.userData.targetPosition.set(-5.25, 1.72, -1.82);
  }
  group.traverse((child) => {
    if (child.isMesh) child.userData.interactiveRoot = group;
  });
  return group;
}

export function leafGeometry(scale = 1) {
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.42 * scale);
  shape.bezierCurveTo(0.35 * scale, -0.22 * scale, 0.38 * scale, 0.2 * scale, 0, 0.48 * scale);
  shape.bezierCurveTo(-0.38 * scale, 0.2 * scale, -0.35 * scale, -0.22 * scale, 0, -0.42 * scale);
  return new THREE.ShapeGeometry(shape, 10);
}
