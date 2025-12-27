// ==============================
// 1️⃣ SESSION SETUP
// ==============================

let mode = sessionStorage.getItem("mode") || "offline";
sessionStorage.setItem("mode", mode);

let playerName = "Offline";

if (mode === "online") {
  playerName = sessionStorage.getItem("playerName");
  if (!playerName) {
    playerName = "Player_" + Math.floor(Math.random() * 10000);
    sessionStorage.setItem("playerName", playerName);
  }
}

// ==============================
// 2️⃣ UI DISPLAY
// ==============================

const sessionLabel = document.getElementById("session");
sessionLabel.textContent = mode === "online"
  ? `ONLINE | ${playerName}`
  : "OFFLINE MODE";

// ==============================
// 3️⃣ ENGINE INIT
// ==============================

const viewport = document.getElementById("viewport");
initEngine(viewport);

// ==============================
// 4️⃣ SUPABASE SETUP (ONLINE)
// ==============================

let supabase = null;
if (mode === "online") {
  supabase = window.supabase.createClient(
    "https://trpgxqitfkpmteyjavuy.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRycGd4cWl0ZmtwbXRleWphdnV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxODA4NjksImV4cCI6MjA4MTc1Njg2OX0.oQLGCMI8uwvx1f6weqkqIViBi07ahlB7uN89UgTEOv8"
  );
}

// ==============================
// 5️⃣ WORLD OBJECTS
// ==============================

let world = {
  name: "MyWorld",
  objects: [],
  scripts: [],
  assets: []
};

// ==============================
// 6️⃣ MODE HANDLERS
// ==============================

if (mode === "offline") loadOfflineWorld();
else loadOnlineWorld();

function loadOfflineWorld() {
  spawnDefaultObjects();
}

function loadOnlineWorld() {
  spawnDefaultObjects();
  attachSaveButton();
  attachExportButton();
  attachFBXImporter();
}

// ==============================
// 7️⃣ BASIC WORLD SPAWN
// ==============================

function spawnDefaultObjects() {
  // Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({ color: 0x444444 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // Example cube
  addObject("cube", new THREE.Vector3(0, 1, 0));
}

function addObject(type, position, mesh = null) {
  if (!mesh) {
    if (type === "cube") {
      mesh = new THREE.Mesh(
        new THREE.BoxGeometry(),
        new THREE.MeshStandardMaterial({ color: 0x00ff00 })
      );
    }
  }

  mesh.position.copy(position);
  scene.add(mesh);

  const id = world.objects.length;
  world.objects.push({
    id,
    type,
    mesh,
    position: mesh.position.clone(),
    rotation: mesh.rotation.clone(),
    scale: mesh.scale.clone()
  });

  selectObject(mesh);
  updateHierarchy();
}

// ==============================
// 8️⃣ SCENE HIERARCHY + SELECTION
// ==============================

const explorerDiv = document.getElementById("explorer");
let selectedObject = null;

function updateHierarchy() {
  explorerDiv.innerHTML = "";
  world.objects.forEach(obj => {
    const div = document.createElement("div");
    div.textContent = `${obj.type} [${obj.id}]`;
    div.style.cursor = "pointer";
    div.onclick = () => selectObject(obj.mesh);
    if (obj.mesh === selectedObject) div.style.backgroundColor = "#333";
    explorerDiv.appendChild(div);
  });
}

function selectObject(mesh) {
  selectedObject = mesh;
  transformControls.attach(mesh);
  updateHierarchy();
}

// ==============================
// 9️⃣ TRANSFORM GIZMOS
// ==============================

const transformControls = new THREE.TransformControls(camera, viewport);
scene.add(transformControls);

// Enable switching gizmos with keys: W=move, E=rotate, R=scale
window.addEventListener("keydown", (e) => {
  switch(e.key.toLowerCase()) {
    case "w": transformControls.setMode("translate"); break;
    case "e": transformControls.setMode("rotate"); break;
    case "r": transformControls.setMode("scale"); break;
  }
});

// Prevent camera orbit while transforming
transformControls.addEventListener('dragging-changed', function (event) {
  controls.enabled = !event.value;
});

// ==============================
// 🔧 10️⃣ FBX IMPORTER
// ==============================

function attachFBXImporter() {
  const input = document.querySelector("#leftDock input[type=file]");
  const loader = new THREE.FBXLoader();

  input.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      const arrayBuffer = e.target.result;
      loader.parse(arrayBuffer, '', function(fbx) {
        scene.add(fbx);
        addObject("fbx", fbx.position.clone(), fbx);
        world.assets.push({ name: file.name, mesh: fbx });
      });
    };
    reader.readAsArrayBuffer(file);
  });
}

// ==============================
// 11️⃣ SCRIPT EXECUTION
// ==============================

const codeEditor = document.getElementById("codeEditor");

function runScript() {
  const code = codeEditor.value;
  try {
    new Function("world", code)(world);
  } catch (e) {
    console.error(e);
  }
}

// ==============================
// 12️⃣ SAVE & EXPORT
// ==============================

async function pushWorldToGitHub(world, playerName, githubToken) {
  const owner = "2029ijones-sudo";
  const repo = "GameModz";
  const path = `Worlds/${playerName}/${world.name}/public/world.json`;

  const content = btoa(unescape(encodeURIComponent(JSON.stringify(world, null, 2)))); // Base64

  // Check if file exists to get sha for update
  let sha = null;
  try {
    const getResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`);
    if (getResp.ok) {
      const data = await getResp.json();
      sha = data.sha;
    }
  } catch (err) {
    console.log("File does not exist, creating new...");
  }

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: "PUT",
    headers: {
      "Authorization": `token ${githubToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: `Publish world ${world.name} by ${playerName}`,
      content,
      sha
    })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.message || "GitHub API error");
  }

  // Return GitHub Pages URL for world
  return `https://${owner}.github.io/${repo}/${path}`;
}

// Save and publish world
async function saveWorld() {
  if (mode !== "online") return;

  const githubToken = "YOUR_PERSONAL_ACCESS_TOKEN"; // ⚠️ do NOT expose publicly

  try {
    const url = await pushWorldToGitHub(world, playerName, githubToken);

    // Save in Supabase
    const { error } = await supabase.from("worlds").insert({
      world_name: world.name,
      player_name: playerName,
      url
    });

    if (error) alert("Supabase save failed: " + error.message);
    else alert("World published! URL: " + url);

  } catch (err) {
    console.error("GitHub push failed:", err);
    alert("Failed to publish world: " + err.message);
  }
}


// ==============================
// 13️⃣ UI BUTTONS
// ==============================

function attachSaveButton() {
  const btn = document.createElement("button");
  btn.textContent = "Publish World";
  btn.style.position = "absolute";
  btn.style.top = "6px";
  btn.style.right = "10px";
  btn.onclick = saveWorld;
  document.body.appendChild(btn);
}

function attachExportButton() {
  const btn = document.createElement("button");
  btn.textContent = "Export World";
  btn.style.position = "absolute";
  btn.style.top = "40px";
  btn.style.right = "10px";
  btn.onclick = exportWorld;
  document.body.appendChild(btn);
}

// ==============================
// 14️⃣ CAMERA CONTROLS
// ==============================

const controls = new THREE.OrbitControls(camera, viewport);
controls.target.set(0, 1, 0);
controls.update();
