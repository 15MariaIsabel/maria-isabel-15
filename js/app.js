/**
 * Mis XV Años — Amelia
 * Scene toggle with View Transition API (+ CSS fallback)
 */

(() => {
  const card = document.getElementById("card");
  const panelCover = document.getElementById("panel-cover");
  const panelVenue = document.getElementById("panel-venue");
  const hint = document.getElementById("hint");

  if (!card) return;

  const supportsVT =
    typeof document.startViewTransition === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let busy = false;
  let scene = "cover";

  // After entrance animations settle, enable float + clean transforms
  const readyDelay = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? 0
    : 1600;

  window.setTimeout(() => {
    card.classList.add("entered", "ready");
  }, readyDelay);

  function updateHint() {
    if (!hint) return;
    hint.textContent =
      scene === "cover" ? "Toca para continuar" : "Toca para volver";
  }

  function applyScene(next) {
    scene = next;
    card.dataset.scene = next;

    if (next === "venue") {
      panelCover.hidden = true;
      panelVenue.hidden = false;
    } else {
      panelVenue.hidden = true;
      panelCover.hidden = false;
    }

    updateHint();
  }

  function fallbackToggle(next) {
    const goingVenue = next === "venue";
    card.classList.add(goingVenue ? "fallback-out" : "fallback-out-venue");

    window.setTimeout(() => {
      applyScene(next);
      card.classList.remove("fallback-out", "fallback-out-venue");
      card.classList.add(goingVenue ? "fallback-in" : "fallback-in-cover");

      window.setTimeout(() => {
        card.classList.remove("fallback-in", "fallback-in-cover");
        busy = false;
      }, 500);
    }, 420);
  }

  async function toggleScene() {
    if (busy) return;
    busy = true;

    const next = scene === "cover" ? "venue" : "cover";

    if (supportsVT) {
      try {
        const transition = document.startViewTransition(() => {
          applyScene(next);
        });
        await transition.finished;
      } catch {
        applyScene(next);
      }
      busy = false;
    } else {
      fallbackToggle(next);
    }
  }

  const guestInput = document.getElementById("guest-count");

  const guestsFromUrl = Number.parseInt(
    new URLSearchParams(window.location.search).get("invitados"),
    10
  );
  if (guestInput && Number.isFinite(guestsFromUrl) && guestsFromUrl >= 1) {
    guestInput.value = String(Math.min(guestsFromUrl, 20));
  }

  function buildWhatsAppUrl(phone) {
    let guests = Number.parseInt(guestInput?.value, 10);
    if (!Number.isFinite(guests) || guests < 1) guests = 1;
    if (guests > 20) guests = 20;
    if (guestInput) guestInput.value = String(guests);

    const noun = guests === 1 ? "invitado" : "invitados";
    const message =
      `¡Hola! Confirmo con mucho gusto mi asistencia a los XV años de Maria Isabel. ` +
      `Seremos ${guests} ${noun}. ¡Muchas gracias por la invitación!`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  card.addEventListener("click", (e) => {
    const rsvpBtn = e.target.closest(".rsvp-btn");
    if (rsvpBtn) {
      e.stopPropagation();
      const phone = rsvpBtn.dataset.phone;
      if (phone) rsvpBtn.href = buildWhatsAppUrl(phone);
      return;
    }
    if (e.target.closest(".rsvp-guests")) {
      e.stopPropagation();
      return;
    }
    toggleScene();
  });

  card.addEventListener("keydown", (e) => {
    if (e.target.closest(".rsvp-guests-input")) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleScene();
    }
  });

  updateHint();
})();
