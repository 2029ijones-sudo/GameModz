// ==============================
// FBX & ASSET LOADER
// ==============================

class AssetLoader {
  constructor(scene) {
    this.scene = scene;
    this.loader = new THREE.FBXLoader();
  }

  /**
   * Load an FBX file from a File object (from input)
   * @param {File} file
   * @param {Function} callback - called with the loaded mesh
   */
  loadFBXFromFile(file, callback) {
    const reader = new FileReader();

    reader.onload = (event) => {
      const arrayBuffer = event.target.result;

      try {
        this.loader.parse(arrayBuffer, '', (fbx) => {
          // Optional: normalize scale
          fbx.scale.set(0.01, 0.01, 0.01);
          this.scene.add(fbx);

          if (callback) callback(fbx);
        });
      } catch (err) {
        console.error("FBX parse error:", err);
      }
    };

    reader.readAsArrayBuffer(file);
  }

  /**
   * Load FBX from URL
   * @param {string} url
   * @param {Function} callback
   */
  loadFBXFromURL(url, callback) {
    this.loader.load(
      url,
      (fbx) => {
        fbx.scale.set(0.01, 0.01, 0.01);
        this.scene.add(fbx);
        if (callback) callback(fbx);
      },
      (xhr) => {
        console.log(`FBX Loading: ${(xhr.loaded / xhr.total) * 100}%`);
      },
      (err) => {
        console.error("FBX Load Error:", err);
      }
    );
  }
}

// ==============================
// EXPORT LOADER
// ==============================

window.AssetLoader = AssetLoader;
