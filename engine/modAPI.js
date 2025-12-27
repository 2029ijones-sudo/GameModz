// ==============================
// MOD API
// ==============================

window.GameMods = {
  // World API
  World: {
    /**
     * Spawn a cube at position
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} size optional
     */
    spawnCube(x, y, z, size = 1) {
      const geometry = new THREE.BoxGeometry(size, size, size);
      const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(x, y, z);
      Engine.scene.add(cube);

      // Add to world.objects
      const id = world.objects.length;
      world.objects.push({
        id,
        type: "cube",
        mesh: cube,
        position: cube.position.clone(),
        rotation: cube.rotation.clone(),
        scale: cube.scale.clone()
      });

      updateHierarchy();
      return cube;
    },

    /**
     * Spawn a sphere at position
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} radius optional
     */
    spawnSphere(x, y, z, radius = 0.5) {
      const geometry = new THREE.SphereGeometry(radius, 32, 32);
      const material = new THREE.MeshStandardMaterial({ color: 0x0077ff });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(x, y, z);
      Engine.scene.add(sphere);

      const id = world.objects.length;
      world.objects.push({
        id,
        type: "sphere",
        mesh: sphere,
        position: sphere.position.clone(),
        rotation: sphere.rotation.clone(),
        scale: sphere.scale.clone()
      });

      updateHierarchy();
      return sphere;
    },

    /**
     * Remove object from scene
     * @param {THREE.Mesh} mesh
     */
    removeObject(mesh) {
      Engine.scene.remove(mesh);
      world.objects = world.objects.filter(obj => obj.mesh !== mesh);
      updateHierarchy();
    },

    /**
     * Get all objects in the world
     */
    getObjects() {
      return world.objects;
    }
  },

  // Utilities
  Utils: {
    /**
     * Generate random integer
     */
    randomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Generate random float
     */
    randomFloat(min, max) {
      return Math.random() * (max - min) + min;
    }
  },

  // Script execution helper
  Scripts: {
    run(code) {
      try {
        new Function("GameMods", code)(window.GameMods);
      } catch (e) {
        console.error("Mod script error:", e);
      }
    }
  }
};
