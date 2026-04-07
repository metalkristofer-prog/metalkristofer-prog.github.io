(function () {
  "use strict";

  function ensureModal() {
    var existing = document.getElementById("imgModal");
    if (existing) return existing;

    var modal = document.createElement("div");
    modal.className = "img-modal";
    modal.id = "imgModal";
    modal.setAttribute("aria-hidden", "true");

    modal.innerHTML =
      '<div class="modal-shell" role="dialog" aria-modal="true" aria-label="Bildansicht">' +
        '<div class="modal-head">' +
          '<h3 id="imgModalTitle">Bild</h3>' +
          '<button class="modal-close" type="button" aria-label="Schließen" data-close>&times;</button>' +
        "</div>" +
        '<div class="modal-body">' +
          '<img id="imgModalImg" class="modal-img" alt="">' +
          '<div id="imgModalText" class="modal-text"></div>' +
        "</div>" +
      "</div>";

    document.body.appendChild(modal);
    return modal;
  }

  function setModalContent(title, imgSrc, alt, text) {
    document.getElementById("imgModalTitle").textContent = title || "Bild";

    var img = document.getElementById("imgModalImg");
    img.src = imgSrc;
    img.alt = alt || "";

    var textBox = document.getElementById("imgModalText");
    textBox.innerHTML = "";

    // Text in Absätze splitten (Leerzeile = neuer Absatz)
    var parts = (text || "").split(/\n\s*\n/);
    for (var i = 0; i < parts.length; i++) {
      var t = parts[i].trim();
      if (!t) continue;
      var p = document.createElement("p");
      p.textContent = t;
      textBox.appendChild(p);
    }

    if (!textBox.children.length) {
      var fallback = document.createElement("p");
      fallback.textContent = "Keine Beschreibung hinterlegt.";
      textBox.appendChild(fallback);
    }
  }

  function getTriggerData(trigger) {
    // Unterstützt:
    // 1) <img class="museum-zoomable" src="...">
    // 2) Wrapper-Element mit <img> drin
    // 3) Optional: data-img / data-alt / data-title / data-text

    var imgEl = trigger.tagName === "IMG" ? trigger : trigger.querySelector("img");
    var src =
      trigger.getAttribute("data-img") ||
      (imgEl ? imgEl.getAttribute("data-img") : null) ||
      (imgEl ? imgEl.getAttribute("src") : null);

    var title =
      trigger.getAttribute("data-title") ||
      (imgEl ? imgEl.getAttribute("data-title") : null) ||
      (imgEl ? imgEl.getAttribute("alt") : null) ||
      "Bild";

    var alt =
      trigger.getAttribute("data-alt") ||
      (imgEl ? imgEl.getAttribute("alt") : null) ||
      title;

    var text =
      trigger.getAttribute("data-text") ||
      (imgEl ? imgEl.getAttribute("data-text") : null) ||
      "";

    return { src: src, title: title, alt: alt, text: text };
  }

  function openModal(trigger) {
    var modal = ensureModal();
    var data = getTriggerData(trigger);

    if (!data.src) return;

    setModalContent(data.title, data.src, data.alt, data.text);

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    var modal = document.getElementById("imgModal");
    if (!modal) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.addEventListener("click", function (e) {
    // Öffnen: Klick auf Bild ODER Wrapper
    var trigger =
      e.target.closest("img.museum-zoomable") ||
      e.target.closest("[data-img-modal]") ||   // alte Variante bleibt kompatibel
      e.target.closest("[data-modal]");         // optional, falls du es nutzen willst

    if (trigger) {
      e.preventDefault();
      openModal(trigger);
      return;
    }

    // Schließen über X
    if (e.target.matches("[data-close]")) {
      e.preventDefault();
      closeModal();
      return;
    }

    // Klick auf Overlay (Hintergrund) schließt
    var modal = document.getElementById("imgModal");
    if (modal && modal.classList.contains("is-open")) {
      var shell = modal.querySelector(".modal-shell");
      if (e.target === modal) closeModal();
      if (shell && !shell.contains(e.target) && e.target !== shell) closeModal();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });

  document.addEventListener("DOMContentLoaded", ensureModal);
})();
