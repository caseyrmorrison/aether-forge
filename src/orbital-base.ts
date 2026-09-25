import * as THREE from "three";

/** A bounded, reusable station: one dock per structure, expanded at ownership milestones. */
export function createOrbitalBase() {
  const group = new THREE.Group();
  const hull = new THREE.MeshStandardMaterial({
    color: 0x99aebb,
    metalness: 0.8,
    roughness: 0.32,
  });
  const light = new THREE.MeshStandardMaterial({
    color: 0x8ce7be,
    emissive: 0x8ce7be,
    emissiveIntensity: 0.6,
  });
  const panel = new THREE.MeshStandardMaterial({
    color: 0x203f72,
    metalness: 0.65,
    roughness: 0.25,
  });
  const box = new THREE.BoxGeometry(1, 1, 1);
  const cylinder = new THREE.CylinderGeometry(0.13, 0.13, 0.32, 8);
  const sphere = new THREE.SphereGeometry(0.16, 12, 8);
  const ringGeo = new THREE.TorusGeometry(2.65, 0.025, 6, 96);
  const rings = [0, 1, 2].map((i) => {
    const mesh = new THREE.Mesh(ringGeo, hull);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.y = -0.25 + i * 0.16;
    group.add(mesh);
    return mesh;
  });
  const docks = Array.from({ length: 16 }, (_, i) => {
    const dock = new THREE.Group();
    const angle = (i / 16) * Math.PI * 2;
    dock.position.set(Math.cos(angle) * 2.65, -0.12, Math.sin(angle) * 2.65);
    dock.rotation.y = -angle;
    const body = new THREE.Mesh(i % 4 === 0 ? sphere : cylinder, hull);
    dock.add(body);
    const beacon = new THREE.Mesh(sphere, light);
    beacon.scale.setScalar(0.3);
    beacon.position.y = 0.25;
    dock.add(beacon);
    const upgrades = new THREE.Group();
    for (let side = -1; side <= 1; side += 2) {
      const wing = new THREE.Mesh(box, i % 4 === 1 ? panel : hull);
      wing.scale.set(i % 4 === 1 ? 0.4 : 0.12, 0.045, 0.24);
      wing.position.x = side * 0.27;
      dock.add(wing);
      const tower = new THREE.Mesh(cylinder, light);
      tower.scale.setScalar(0.6);
      tower.position.set(side * 0.24, 0.17, 0);
      upgrades.add(tower);
    }
    dock.add(upgrades);
    dock.scale.setScalar(0.001);
    group.add(dock);
    return { dock, upgrades, target: 0 };
  });
  let signature = "";
  return {
    group,
    setCounts(counts: number[]) {
      const next = counts.join(",");
      if (next === signature) return;
      signature = next;
      const total = counts.reduce((a, b) => a + b, 0);
      rings.forEach((ring, i) => (ring.visible = total >= [1, 100, 500][i]));
      docks.forEach((entry, i) => {
        const count = counts[i] || 0;
        entry.target = count
          ? 0.7 + Math.min(3, Math.floor(Math.log10(count))) * 0.25
          : 0;
        entry.upgrades.visible = count >= 10;
      });
    },
    animate(t: number, reduced: boolean) {
      group.rotation.y = reduced ? 0 : t * 0.035;
      docks.forEach(({ dock, target }) => {
        const scale = reduced
          ? target
          : THREE.MathUtils.lerp(dock.scale.x, target, 0.08);
        dock.scale.setScalar(Math.max(0.001, scale));
        dock.visible = scale > 0.01;
      });
    },
    setTheme(color: number) {
      light.color.setHex(color);
      light.emissive.setHex(color);
    },
  };
}
