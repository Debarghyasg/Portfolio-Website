/* Debarghya Sengupta Portfolio — main.js
 * Handles: scroll-reveal, mobile nav toggle, click-to-copy email,
 *          skill bar fill on view, and toast notifications.
 */
(function () {
  "use strict";

  // ---------- Toast ----------
  const toastEl = document.createElement("div");
  toastEl.className = "toast";
  toastEl.setAttribute("role", "status");
  toastEl.setAttribute("aria-live", "polite");
  document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(toastEl);
  });

  let toastTimer;
  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-show"), 2200);
  }
  window.__showToast = showToast;

  // ---------- Scroll reveal ----------
  function initReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
  }

  // ---------- Skill bar fill ----------
  function initSkillBars() {
    const bars = document.querySelectorAll(".skill-bar > i[data-pct]");
    if (!bars.length) return;
    if (!("IntersectionObserver" in window)) {
      bars.forEach((b) => (b.style.width = b.dataset.pct + "%"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            requestAnimationFrame(() => {
              el.style.width = el.dataset.pct + "%";
            });
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.4 }
    );
    bars.forEach((b) => io.observe(b));
  }

  // ---------- Mobile nav toggle ----------
  function initNavToggle() {
    const nav = document.querySelector(".nav");
    const toggle = document.querySelector(".nav-toggle");
    if (!nav || !toggle) return;
    toggle.addEventListener("click", () => {
      nav.classList.toggle("nav-mobile-open");
    });
    // Close when a link is clicked
    nav.querySelectorAll(".nav-link").forEach((a) => {
      a.addEventListener("click", () =>
        nav.classList.remove("nav-mobile-open")
      );
    });
  }

  // ---------- Copy email ----------
  function initCopyEmail() {
    const triggers = document.querySelectorAll("[data-copy-email]");
    triggers.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const email = btn.getAttribute("data-copy-email");
        if (!email) return;
        // On mobile, fall back to mailto
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isMobile) {
          window.location.href = "mailto:" + email;
          return;
        }
        e.preventDefault();
        try {
          await navigator.clipboard.writeText(email);
          showToast("Email copied to clipboard");
          const original = btn.textContent;
          btn.textContent = "Copied!";
          setTimeout(() => (btn.textContent = original), 1500);
        } catch (_) {
          window.location.href = "mailto:" + email;
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initReveal();
    initSkillBars();
    initNavToggle();
    initCopyEmail();
  });
})();


/* ---------- Project demo video toggle ----------
 * Each card with a video has:
 *   <button data-toggle-video="<id>" class="btn-pill is-active" aria-pressed="true">
 *   <div data-video-for="<id>" data-video-embed-url="..." data-video-type="youtube|file">
 *     <iframe src="..."> | <video src="...">
 *
 * Toggling OFF hides the container AND clears the iframe src / pauses the video,
 * so YouTube audio doesn't keep playing in the background. Toggling ON restores it.
 */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll("[data-toggle-video]");
    if (!buttons.length) return;

    buttons.forEach((btn) => {
      const id = btn.getAttribute("data-toggle-video");
      const container = document.querySelector(`[data-video-for="${id}"]`);
      if (!container) return;

      // remember the original embed URL so we can restore it on re-toggle
      const embedUrl = container.getAttribute("data-video-embed-url");
      const type = container.getAttribute("data-video-type"); // "youtube" | "file"

      btn.addEventListener("click", () => {
        const wasActive = btn.classList.contains("is-active");
        const nextActive = !wasActive;

        btn.classList.toggle("is-active", nextActive);
        btn.setAttribute("aria-pressed", String(nextActive));
        container.hidden = !nextActive;

        if (type === "youtube") {
          const iframe = container.querySelector("iframe");
          if (!iframe) return;
          if (nextActive) {
            if (iframe.src !== embedUrl) iframe.src = embedUrl;
          } else {
            // clear src to fully stop YouTube playback & audio
            iframe.removeAttribute("src");
          }
        } else if (type === "file") {
          const video = container.querySelector("video");
          if (!video) return;
          if (nextActive) {
            const wantsSrc = embedUrl || video.dataset.src;
            if (wantsSrc && video.src !== wantsSrc) video.src = wantsSrc;
            video.play().catch(() => { /* autoplay may be blocked, ignore */ });
          } else {
            video.pause();
          }
        }
      });
    });
  });
})();



/* ---------- About modal: open / close / off-topic toggle ---------- */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("about-modal");
    if (!modal) return;

    const openTriggers = document.querySelectorAll("[data-expand-about]");
    const closeTriggers = document.querySelectorAll("[data-close-about]");

    function openModal() {
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-modal-open");
      const closeBtn = modal.querySelector("[data-close-about]");
      if (closeBtn) setTimeout(function () { closeBtn.focus(); }, 80);
    }

    function closeModal() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-modal-open");
    }

    openTriggers.forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.preventDefault();
        openModal();
      });
    });

    closeTriggers.forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.preventDefault();
        closeModal();
      });
    });

    modal.addEventListener("click", function (e) {
      // backdrop click closes
      if (e.target === modal) closeModal();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) {
        closeModal();
      }
    });

    // Off-topic toggle (inside the modal)
    const offBtns = modal.querySelectorAll("[data-toggle-offtopic]");
    offBtns.forEach(function (btn) {
      const targetId = btn.getAttribute("aria-controls");
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (!target) return;
      const showLabel = btn.querySelector("[data-offtopic-show]");
      const hideLabel = btn.querySelector("[data-offtopic-hide]");
      btn.addEventListener("click", function () {
        const open = !target.hasAttribute("hidden");
        if (open) {
          target.setAttribute("hidden", "");
          btn.setAttribute("aria-expanded", "false");
          if (showLabel) showLabel.removeAttribute("hidden");
          if (hideLabel) hideLabel.setAttribute("hidden", "");
        } else {
          target.removeAttribute("hidden");
          btn.setAttribute("aria-expanded", "true");
          if (showLabel) showLabel.setAttribute("hidden", "");
          if (hideLabel) hideLabel.removeAttribute("hidden");
        }
      });
    });
  });
})();



/* ---------- Typewriter (hero rotating tagline) ----------
 * Markup:
 *   <span class="typewriter" data-words='["foo","bar"]'>
 *     <span class="tw-text"></span><span class="tw-cursor">|</span>
 *   </span>
 *
 * - Types each phrase character-by-character (~75 ms / char)
 * - Holds for 1.5 s
 * - Deletes character-by-character (~40 ms / char)
 * - Pauses 250 ms, then types the next phrase
 * - Loops indefinitely
 *
 * If the user has prefers-reduced-motion enabled, leaves the first
 * phrase static (no animation).
 */
(function () {
  "use strict";

  function runTypewriter(el, words) {
    const textEl = el.querySelector(".tw-text");
    if (!textEl) return;

    const TYPING_MS = 75;
    const DELETING_MS = 40;
    const HOLD_AFTER_TYPE_MS = 1500;
    const HOLD_AFTER_DELETE_MS = 250;

    let wordIdx = 0;
    let charIdx = 0;
    let deleting = false;

    // Start with an empty string so the typing animation is visible from t=0
    textEl.textContent = "";

    function tick() {
      const word = words[wordIdx];
      if (!deleting) {
        charIdx++;
        textEl.textContent = word.slice(0, charIdx);
        if (charIdx === word.length) {
          deleting = true;
          setTimeout(tick, HOLD_AFTER_TYPE_MS);
          return;
        }
        setTimeout(tick, TYPING_MS);
      } else {
        charIdx--;
        textEl.textContent = word.slice(0, Math.max(0, charIdx));
        if (charIdx <= 0) {
          deleting = false;
          charIdx = 0;
          wordIdx = (wordIdx + 1) % words.length;
          setTimeout(tick, HOLD_AFTER_DELETE_MS);
          return;
        }
        setTimeout(tick, DELETING_MS);
      }
    }

    tick();
  }

  document.addEventListener("DOMContentLoaded", function () {
    const reduceMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.querySelectorAll(".typewriter[data-words]").forEach(function (el) {
      let words;
      try {
        words = JSON.parse(el.getAttribute("data-words"));
      } catch (e) {
        console.warn("[typewriter] invalid data-words JSON", e);
        return;
      }
      if (!Array.isArray(words) || !words.length) return;

      // Respect prefers-reduced-motion: just show the first word.
      if (reduceMotion) {
        const textEl = el.querySelector(".tw-text");
        if (textEl) textEl.textContent = words[0];
        return;
      }

      runTypewriter(el, words);
    });
  });
})();
