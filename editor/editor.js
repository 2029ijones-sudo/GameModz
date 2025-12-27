// ==============================
// 1️⃣ SESSION SETUP
// ==============================
let mode = sessionStorage.getItem("mode") || "offline";
sessionStorage.setItem("mode", mode);

let playerName = "Offline";
if (mode === "online") {
    playerName = sessionStorage.getItem("playerName") || "Player_" + Math.floor(Math.random()*10000);
    sessionStorage.setItem("playerName", playerName);
}

// ==============================
// 2️⃣ UI DISPLAY
// ==============================
const sessionLabel = document.getElementById("session");
sessionLabel.textContent = mode === "online" ? `ONLINE | ${playerName}` : "OFFLINE MODE";

// ==============================
// 3️⃣ ENGINE INIT
// ==============================
const viewport = document.getElementById("viewport");
initEngine(viewport); // Make sure this creates `scene`, `camera`, `renderer`

// Add lights if not already in initEngine
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(5,10,7);
scene.add(dirLight);

// Orbit Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target.set(0,1,0);
controls.update();

// Transform Controls
const transformControls = new THREE.TransformControls(camera, renderer.domElement);
scene.add(transformControls);
transformControls.addEventListener('dragging-changed', e => { controls.enabled = !e.value; });

// ==============================
// 4️⃣ SUPABASE SETUP (ONLINE)
// ==============================
let supabase = null;
if (mode === "online") {
    supabase = window.supabase.createClient(
        "https://trpgxqitfkpmteyjavuy.supabase.co",
        "YOUR_SUPABASE_KEY"
    );
}

// ==============================
// 5️⃣ WORLD OBJECTS
// ==============================
let world = { name:"MyWorld", objects:[], scripts:[], assets:[] };
let selectedObject = null;
const explorerDiv = document.getElementById("explorer");

// ==============================
// 6️⃣ SPAWN FLOOR & CUBE
// ==============================
function spawnDefaultObjects() {
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(20,20),
        new THREE.MeshStandardMaterial({ color:0x444444 })
    );
    floor.rotation.x = -Math.PI/2;
    scene.add(floor);

    const cube = new THREE.Mesh(
        new THREE.BoxGeometry(),
        new THREE.MeshStandardMaterial({ color:0x00ff00 })
    );
    cube.position.set(0,1,0);
    scene.add(cube);
    addObject("cube", cube.position.clone(), cube);
}

// ==============================
// 7️⃣ ADD OBJECT
// ==============================
function addObject(type, position, mesh) {
    const id = world.objects.length;
    world.objects.push({ id, type, mesh, position: mesh.position.clone(), rotation: mesh.rotation.clone(), scale: mesh.scale.clone() });
    selectObject(mesh);
    updateHierarchy();
}

// ==============================
// 8️⃣ SCENE HIERARCHY
// ==============================
function updateHierarchy() {
    explorerDiv.innerHTML = "";
    world.objects.forEach(obj => {
        const div = document.createElement("div");
        div.textContent = `${obj.type} [${obj.id}]`;
        div.style.cursor = "pointer";
        if(obj.mesh===selectedObject) div.style.backgroundColor="#333";
        div.onclick = ()=>selectObject(obj.mesh);
        explorerDiv.appendChild(div);
    });
}
function selectObject(mesh) {
    selectedObject = mesh;
    transformControls.attach(mesh);
    updateHierarchy();
}

// ==============================
// 9️⃣ FBX IMPORTER
// ==============================
function attachFBXImporter() {
    const input = document.querySelector("#leftDock input[type=file]");
    const loader = new THREE.FBXLoader();
    input.addEventListener("change", (event)=>{
        const file = event.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = e=>{
            loader.parse(e.target.result, '', fbx=>{
                fbx.scale.set(0.01,0.01,0.01); // scale down typical FBX
                fbx.position.set(0,1,0);
                scene.add(fbx);
                addObject("fbx", fbx.position.clone(), fbx);
                world.assets.push({name:file.name, mesh:fbx});
            });
        };
        reader.readAsArrayBuffer(file);
    });
}

// ==============================
// 🔟 SCRIPT EDITOR
// ==============================
const codeEditor = document.getElementById("codeEditor");
window.runScript = function() {
    try { new Function("world", codeEditor.value)(world); } catch(e){ console.error(e); }
}

// ==============================
// 1️⃣1️⃣ SAVE & EXPORT
// ==============================
window.saveWorld = async function() {
    if(mode!=="online") return;
    const githubToken="YOUR_PERSONAL_ACCESS_TOKEN";

    const owner="2029ijones-sudo";
    const repo="GameModz";
    const path=`Worlds/${playerName}/${world.name}/public/world.json`;
    const content=btoa(unescape(encodeURIComponent(JSON.stringify(world,null,2))));
    let sha=null;
    try { const getResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`);
          if(getResp.ok) sha=(await getResp.json()).sha;
    } catch{}

    const resp = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        method:"PUT",
        headers:{Authorization:`token ${githubToken}`, "Content-Type":"application/json"},
        body:JSON.stringify({message:`Publish world ${world.name}`, content, sha})
    });
    if(!resp.ok) alert("GitHub push failed");
    else alert("World published!");

    if(supabase){
        await supabase.from("worlds").insert({world_name:world.name, player_name:playerName, url:`https://${owner}.github.io/${repo}/${path}`});
    }
}
window.exportWorld = function() {
    const data = JSON.stringify(world);
    const blob = new Blob([data],{type:"application/json"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${world.name}.world`;
    link.click();
}

// ==============================
// 1️⃣2️⃣ UI BUTTONS
// ==============================
function attachUIButtons(){
    const btn1=document.createElement("button");
    btn1.textContent="Publish World"; btn1.style.position="absolute";
    btn1.style.top="6px"; btn1.style.right="10px"; btn1.onclick=saveWorld;
    document.body.appendChild(btn1);

    const btn2=document.createElement("button");
    btn2.textContent="Export World"; btn2.style.position="absolute";
    btn2.style.top="40px"; btn2.style.right="10px"; btn2.onclick=exportWorld;
    document.body.appendChild(btn2);
}

// ==============================
// 1️⃣3️⃣ INITIALIZE
// ==============================
spawnDefaultObjects();
attachUIButtons();
attachFBXImporter();

// ==============================
// 1️⃣4️⃣ RENDER LOOP
// ==============================
function animate(){
    requestAnimationFrame(animate);
    renderer.render(scene,camera);
}
animate();
