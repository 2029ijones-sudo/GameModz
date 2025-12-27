// Generate a random player name for online mode
function generatePlayerName() {
  const randomNumber = Math.floor(Math.random() * 10000);
  return `Player_${randomNumber}`;
}

// Start offline mode
function startOffline() {
  sessionStorage.setItem("mode", "offline");
  sessionStorage.setItem("playerName", "Offline");
  window.location.href = "editor/editor.html";
}

// Start online mode
async function startOnline() {
  const playerName = generatePlayerName();
  sessionStorage.setItem("mode", "online");
  sessionStorage.setItem("playerName", playerName);

  // Initialize Supabase client
  const supabase = window.supabase.createClient(
    "https://trpgxqitfkpmteyjavuy.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRycGd4cWl0ZmtwbXRleWphdnV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxODA4NjksImV4cCI6MjA4MTc1Njg2OX0.oQLGCMI8uwvx1f6weqkqIViBi07ahlB7uN89UgTEOv8"
  );

  // Store player name in database (if not exists)
  const { data, error } = await supabase
    .from("players")
    .insert({ player_name: playerName })
    .select();

  if (error) {
    console.error("Error saving player:", error.message);
  } else {
    console.log("Player saved:", playerName);
  }

  // Redirect to editor
  window.location.href = "editor/editor.html";
}
