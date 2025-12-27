// ==============================
// 1️⃣ GLOBAL VARIABLES
// ==============================

let scene, camera, renderer, clock;

// ==============================
// 2️⃣ INIT ENGINE FUNCTION
// ==============================

function initEngine(container) {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x20232a);

  // Camera
  camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(5, 5, 5);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Clock
  clock = new THREE.Clock();

  // Lighting
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 10, 7);
  scene.add(directionalLight);

  const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
  scene.add(ambientLight);

  // Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  scene.add(floor);

  // Handle window resize
  window.addEventListener("resize", () => onWindowResize(container), false);

  // Start animation loop
  animate();
}

// ==============================
// 3️⃣ WINDOW RESIZE
// ==============================

function onWindowResize(container) {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

// ==============================
// 4️⃣ ANIMATION LOOP
// ==============================

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

// ==============================
// 5️⃣ EXPORT ENGINE OBJECTS
// ==============================

window.Engine = {
  scene,
  camera,
  renderer,
  clock,
  addToScene: (obj) => scene.add(obj)
};
