// ==============================
// UI HELPERS
// ==============================

window.UI = {
  /**
   * Create a button element
   * @param {string} text
   * @param {Function} onClick
   * @returns HTMLElement
   */
  createButton(text, onClick) {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.style.padding = "6px 12px";
    btn.style.margin = "4px";
    btn.style.cursor = "pointer";
    btn.onclick = onClick;
    return btn;
  },

  /**
   * Create a modal window
   * @param {string} title
   * @param {HTMLElement} content
   */
  createModal(title, content) {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0,0,0,0.5)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";

    const modal = document.createElement("div");
    modal.style.background = "#1b1e26";
    modal.style.padding = "20px";
    modal.style.borderRadius = "8px";
    modal.style.minWidth = "300px";
    modal.style.color = "#e6e6e6";

    const header = document.createElement("h3");
    header.textContent = title;
    modal.appendChild(header);

    modal.appendChild(content);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });

    return overlay;
  },

  /**
   * Clear all children from an element
   */
  clearElement(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }
};
