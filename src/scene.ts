import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
export function createScene(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x080c12, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 3.4, 10);
  camera.lookAt(0, 0, 0);
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.45, 0.6, 0.8);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  scene.add(new THREE.AmbientLight(0x8ebcbf, 2));
  const key = new THREE.DirectionalLight(0xc7ffe9, 4);
  key.position.set(-3, 5, 4);
  scene.add(key);
  const rim = new THREE.PointLight(0x46d9ca, 65, 15);
  rim.position.set(3, 0, 2);
  scene.add(rim);
  const world = new THREE.Group();
  scene.add(world);
  const rockMat = new THREE.MeshStandardMaterial({
    color: 0x263e45,
    roughness: 0.82,
    metalness: 0.3,
    flatShading: true,
  });
  const base = new THREE.Mesh(new THREE.IcosahedronGeometry(1.55, 1), rockMat);
  base.scale.set(1, 0.57, 1);
  base.position.y = -0.25;
  world.add(base);
  const lower = new THREE.Mesh(new THREE.ConeGeometry(1.35, 1.7, 7), rockMat);
  lower.rotation.z = Math.PI;
  lower.position.y = -0.85;
  world.add(lower);
  const surface = new THREE.Mesh(
    new THREE.CylinderGeometry(1.25, 1.55, 0.22, 7),
    new THREE.MeshStandardMaterial({
      color: 0x517b70,
      roughness: 0.9,
      flatShading: true,
    }),
  );
  surface.position.y = 0.16;
  world.add(surface);
  const glowMat = new THREE.MeshStandardMaterial({
    color: 0x7ef7ca,
    emissive: 0x31d6aa,
    emissiveIntensity: 0.28,
    metalness: 0.32,
    roughness: 0.22,
    flatShading: true,
  });
  const crystals: THREE.Mesh[] = [];
  function crystal(x: number, z: number, h: number, w: number) {
    const geo = new THREE.LatheGeometry(
      [
        new THREE.Vector2(0, -h / 2),
        new THREE.Vector2(w * 0.8, -h / 2),
        new THREE.Vector2(w, h * 0.18),
        new THREE.Vector2(0, h / 2),
      ],
      5,
    );
    const m = new THREE.Mesh(geo, glowMat);
    m.position.set(x, 0.25 + h * 0.5, z);
    m.rotation.z = x * -0.18;
    world.add(m);
    crystals.push(m);
    const foot = new THREE.Mesh(
      new THREE.CylinderGeometry(w, w * 0.8, h * 0.3, 5),
      glowMat,
    );
    foot.position.set(x, 0.27, z);
    world.add(foot);
  }
  crystal(0, 0, 2.25, 0.46);
  crystal(-0.58, 0.13, 1.35, 0.29);
  crystal(0.53, 0.2, 1.05, 0.25);
  crystal(0.1, 0.68, 0.8, 0.22);
  crystal(-0.45, -0.65, 0.75, 0.23);
  crystal(0.7, -0.55, 0.65, 0.19);
  let seed = 73;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < 38; i++) {
    const a = rand() * Math.PI * 2,
      r = 0.65 + rand() * 0.9;
    const stone = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.07 + rand() * 0.19, 0),
      rockMat,
    );
    stone.position.set(Math.cos(a) * r, 0.15 + rand() * 0.15, Math.sin(a) * r);
    stone.rotation.set(rand() * 3, rand() * 3, rand() * 3);
    world.add(stone);
  }
  for (let i = 0; i < 10; i++) {
    const shard = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.09 + rand() * 0.12),
      rockMat,
    );
    const a = (i / 10) * Math.PI * 2;
    shard.position.set(
      Math.cos(a) * 2.05,
      -0.9 + rand() * 1.3,
      Math.sin(a) * 2.05,
    );
    world.add(shard);
  }
  const orbit = new THREE.Group();
  orbit.rotation.z = -0.18;
  scene.add(orbit);
  [2.35, 2.48, 3.05].forEach((r, i) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.006, 6, 160),
      new THREE.MeshBasicMaterial({
        color: i === 2 ? 0x314d5d : 0x578d86,
        transparent: true,
        opacity: i === 2 ? 0.28 : 0.5,
      }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.4;
    orbit.add(ring);
  });
  const drones = new THREE.Group();
  orbit.add(drones);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const drone = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.06),
      new THREE.MeshBasicMaterial({ color: 0xaeffe5 }),
    );
    drone.position.set(Math.cos(a) * 2.4, -0.4, Math.sin(a) * 2.4);
    drones.add(drone);
  }
  const starGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(500 * 3);
  for (let i = 0; i < 500; i++) {
    positions[i * 3] = (rand() - 0.5) * 30;
    positions[i * 3 + 1] = (rand() - 0.5) * 20;
    positions[i * 3 + 2] = -3 - rand() * 16;
  }
  starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({
      color: 0x9bbdcc,
      size: 0.025,
      transparent: true,
      opacity: 0.65,
    }),
  );
  scene.add(stars);
  const colony = new THREE.Group();
  scene.add(colony);
  const moduleGeometry = new THREE.OctahedronGeometry(0.11);
  const moduleMaterial = new THREE.MeshStandardMaterial({
    color: 0xb5ebdf,
    metalness: 0.7,
    roughness: 0.25,
    emissive: 0x22574e,
  });
  for (let i = 0; i < 16; i++) {
    const module = new THREE.Mesh(moduleGeometry, moduleMaterial);
    const angle = (i / 16) * Math.PI * 2;
    module.position.set(
      Math.cos(angle) * 2.8,
      -0.1 + Math.sin(angle * 3) * 0.25,
      Math.sin(angle) * 2.8,
    );
    module.visible = false;
    colony.add(module);
  }
  const shockMaterial = new THREE.MeshBasicMaterial({
    color: 0xb2ffe1,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const shock = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.025, 8, 96),
    shockMaterial,
  );
  shock.rotation.x = Math.PI / 2;
  scene.add(shock);
  const comet = new THREE.Group();
  const cometMaterial = new THREE.MeshBasicMaterial({ color: 0xffe3a0 });
  comet.add(
    new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), cometMaterial),
  );
  const tail = new THREE.Mesh(
    new THREE.ConeGeometry(0.075, 1.2, 8),
    new THREE.MeshBasicMaterial({
      color: 0x9bdfff,
      transparent: true,
      opacity: 0.45,
    }),
  );
  tail.rotation.z = Math.PI / 2;
  tail.position.x = -0.6;
  comet.add(tail);
  scene.add(comet);
  comet.visible = false;
  let burstStrength = 0,
    overdrive = false;
  let pulse = 0,
    pointerX = 0,
    pointerY = 0,
    frame = 0;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const resize = () => {
    const w = canvas.clientWidth,
      h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();
  canvas.addEventListener("pointermove", (e) => {
    const rect = canvas.getBoundingClientRect();
    pointerX = (e.clientX - rect.left) / rect.width - 0.5;
    pointerY = (e.clientY - rect.top) / rect.height - 0.5;
  });
  canvas.addEventListener("pointerleave", () => {
    pointerX = pointerY = 0;
  });
  const clock = new THREE.Clock();
  function animate() {
    frame = requestAnimationFrame(animate);
    if (document.hidden) return;
    const t = clock.getElapsedTime();
    world.rotation.y = reduced ? 0.3 : t * 0.1;
    world.position.y = reduced ? 0 : Math.sin(t * 0.8) * 0.09;
    world.rotation.x += (pointerY * 0.09 - world.rotation.x) * 0.03;
    scene.rotation.y += (pointerX * 0.08 - scene.rotation.y) * 0.03;
    drones.rotation.y = reduced ? 0 : t * (overdrive ? 0.65 : 0.2);
    colony.rotation.y = reduced ? 0 : -t * 0.07;
    colony.children.forEach((module, i) => {
      module.rotation.y = reduced ? 0 : t * 0.4 + i;
    });
    comet.position.set(
      reduced ? 2 : Math.sin(t * 0.65) * 3.2,
      2.1 + (reduced ? 0 : Math.cos(t * 0.65) * 0.4),
      -1,
    );
    burstStrength *= 0.94;
    shock.visible = !reduced && burstStrength > 0.01;
    shock.scale.setScalar(1 + (1 - burstStrength) * 3);
    shockMaterial.opacity = burstStrength * 0.65;
    bloom.strength = overdrive ? 0.8 : 0.45;
    stars.rotation.z = reduced ? 0 : Math.sin(t * 0.015) * 0.025;
    pulse *= 0.92;
    world.scale.setScalar(1 + pulse * 0.035);
    glowMat.emissiveIntensity = (overdrive ? 0.48 : 0.28) + pulse * 0.5;
    composer.render();
  }
  animate();
  return {
    setActivity(count: number, boosted: boolean, cometVisible: boolean) {
      overdrive = boosted;
      comet.visible = cometVisible;
      colony.children.forEach((module, i) => {
        module.visible = count > i * 25;
      });
    },
    burst() {
      burstStrength = 1;
      pulse = 1;
    },
    pulse() {
      pulse = 1;
    },
    setWorld(color: number, index = 0) {
      burstStrength = 1;
      shockMaterial.color.setHex(color);
      moduleMaterial.emissive.setHex(color).multiplyScalar(0.2);
      rockMat.color.setHex(color).multiplyScalar(0.19);
      surface.material.color.setHex(color).multiplyScalar(0.4);
      orbit.rotation.z = -0.18 + index * 0.13;
      orbit.scale.setScalar(1 + (index % 3) * 0.08);
      crystals.forEach((crystal, i) => {
        crystal.scale.y = 1 + Math.sin(index * 2 + i) * index * 0.045;
      });
      stars.material.color.setHex(color);
      glowMat.color.setHex(color);
      glowMat.emissive.setHex(color);
      rim.color.setHex(color);
    },
    dispose() {
      cancelAnimationFrame(frame);
      observer.disconnect();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.Points) {
          o.geometry.dispose();
          const materials = Array.isArray(o.material)
            ? o.material
            : [o.material];
          materials.forEach((m) => m.dispose());
        }
      });
      composer.dispose();
      renderer.dispose();
    },
  };
}
