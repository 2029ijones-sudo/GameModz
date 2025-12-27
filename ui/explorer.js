// ==============================
// WORLD EXPLORE LOGIC
// ==============================

const exploreContainer = document.getElementById("exploreContainer"); // a div in your explore.html

async function loadWorlds() {
  if (!window.supabase) {
    console.error("Supabase not initialized");
    return;
  }

  const { data, error } = await supabase
    .from("worlds")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("Error fetching worlds:", error);
    return;
  }

  UI.clearElement(exploreContainer);

  data.forEach(world => {
    const card = document.createElement("div");
    card.style.background = "#1a1d25";
    card.style.padding = "10px";
    card.style.margin = "6px";
    card.style.borderRadius = "6px";
    card.style.cursor = "pointer";

    card.innerHTML = `<strong>${world.world_name}</strong><br>By: ${world.player_name}`;

    card.onclick = () => {
      window.open(world.url, "_blank");
    };

    exploreContainer.appendChild(card);
  });
}

// Call this when the page loads
document.addEventListener("DOMContentLoaded", () => {
  loadWorlds();
});
