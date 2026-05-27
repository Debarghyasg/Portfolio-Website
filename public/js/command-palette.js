/* Command Palette (Cmd+K / Ctrl+K)
 * Searchable index of pages, projects, skills, certificates, and external links.
 */
(function () {
  "use strict";

  const INDEX = [
    // Pages
    { group: "Pages", title: "Home", sub: "/", url: "/", keywords: "home overview about" },
    { group: "Pages", title: "Projects", sub: "/projects", url: "/projects", keywords: "projects work portfolio" },
    { group: "Pages", title: "Skills", sub: "/skills", url: "/skills", keywords: "skills tech stack" },

    // Projects
    { group: "Projects", title: "Nyatik Nayan", sub: "AI fraud detection at checkout", url: "https://github.com/Debarghyasg/Team-Schrodinger", external: true, keywords: "yolov8 fastapi react ai retail" },
    { group: "Projects", title: "Fin-Eye", sub: "RAG for financial documents", url: "https://github.com/Debarghyasg/Fin-Eye", external: true, keywords: "rag groq llama chromadb financial" },
    { group: "Projects", title: "Medi-Hub", sub: "Digital medical records", url: "https://github.com/Debarghyasg/Medi-Hub", external: true, keywords: "ejs healthcare prescription" },
    { group: "Projects", title: "PotatoScan", sub: "AI crop disease diagnosis", url: "https://github.com/Debarghyasg/Potato-Leaf-Disease-prediction", external: true, keywords: "cnn tensorflow flask" },
    { group: "Projects", title: "Mahakash Club Website", sub: "Space club at GNIT", url: "https://mahakash-club.vercel.app/", external: true, keywords: "club space" },
    { group: "Projects", title: "Portfolio Website", sub: "This site", url: "https://debarghyasg.vercel.app/", external: true, keywords: "portfolio personal" },

    // Skills
    { group: "Skills", title: "Full Stack Web Development", sub: "/skills", url: "/skills#fullstack", keywords: "html css javascript react node express" },
    { group: "Skills", title: "Cloud Platforms", sub: "AWS, Azure, OCI", url: "/skills#cloud", keywords: "aws azure oracle cloud" },
    { group: "Skills", title: "Databases", sub: "MySQL, MongoDB, PostgreSQL", url: "/skills#databases", keywords: "sql mongo postgres" },
    { group: "Skills", title: "DevOps Tools", sub: "Git, Docker, Kubernetes", url: "/skills#tools", keywords: "git docker kubernetes" },
    { group: "Skills", title: "Data Structures & Algorithms", sub: "Java", url: "/skills#dsa", keywords: "java dsa array linked list" },

    // Certificates
    { group: "Certificates", title: "Azure management tasks", sub: "Microsoft", url: "https://learn.microsoft.com/en-gb/users/debarghyasengupta-8651/credentials/74750622131f20c4?ref=https%3A%2F%2Fwww.linkedin.com%2F", external: true },
    { group: "Certificates", title: "OCI 2025 Certified Developer Professional", sub: "Oracle", url: "https://catalog-education.oracle.com/ords/certview/sharebadge?id=210FB9758EE5CB78DCB091A2C45E3912B9642194C67D5045B6458DD9811F8B7E", external: true },
    { group: "Certificates", title: "OCI 2025 Generative AI Professional", sub: "Oracle", url: "https://catalog-education.oracle.com/ords/certview/sharebadge?id=7B82CA855F2E3117E86F8B1B409E5577832453A248597E50F1E20F79F7F6D70C", external: true },
    { group: "Certificates", title: "Oracle AI Autonomous Database 2025", sub: "Oracle", url: "https://catalog-education.oracle.com/ords/certview/sharebadge?id=591514EF20FD20BC84E336AC2819225FF26433988D10B1E6C71630806AE2C2B7", external: true },
    { group: "Certificates", title: "Fundamentals of Cybersecurity", sub: "Zscaler", url: "https://verify.skilljar.com/c/sjfwr9ry9uuv", external: true },

    // Connect
    { group: "Connect", title: "GitHub", sub: "@Debarghyasg", url: "https://github.com/Debarghyasg", external: true, keywords: "github code" },
    { group: "Connect", title: "LinkedIn", sub: "Debarghya Sengupta", url: "https://www.linkedin.com/in/debarghya-sengupta-890863168/", external: true, keywords: "linkedin" },
    { group: "Connect", title: "X / Twitter", sub: "@DebarghyaSengu6", url: "https://x.com/DebarghyaSengu6?t=W4zSmDHutEokINiy47Ff8A&s=08", external: true, keywords: "twitter x" },
    { group: "Connect", title: "Email", sub: "debarghya817@gmail.com", url: "mailto:debarghya817@gmail.com", external: true, keywords: "email contact" },
    { group: "Connect", title: "Instagram", sub: "@_thesengupta_", url: "https://www.instagram.com/_thesengupta_?igsh=Mnhma2xpcjc5YXcz", external: true, keywords: "instagram" },
    { group: "Connect", title: "Facebook", sub: "Profile", url: "https://www.facebook.com/share/1SVp84Kjo3/", external: true, keywords: "facebook" },
    { group: "Connect", title: "Resume / CV", sub: "Download PDF", url: "/resume.pdf", external: true, keywords: "cv resume pdf download" },
  ];

  let activeIndex = 0;
  let filtered = INDEX.slice();
  let openState = false;

  let panel, input, list;

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function render() {
    if (!list) return;
    if (!filtered.length) {
      list.innerHTML = '<div class="cmdk-empty">No matches</div>';
      return;
    }
    let html = "";
    let lastGroup = "";
    filtered.forEach((item, i) => {
      if (item.group !== lastGroup) {
        html += `<div class="cmdk-group-label">${escapeHtml(item.group)}</div>`;
        lastGroup = item.group;
      }
      const cls = i === activeIndex ? "cmdk-item is-active" : "cmdk-item";
      const arrow = item.external
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M17 7H8M17 7v9"/></svg>'
        : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>';
      html += `<div class="${cls}" data-i="${i}">
        <span>${escapeHtml(item.title)}</span>
        <span class="cmdk-item-sub">${escapeHtml(item.sub || "")}</span>
        ${arrow}
      </div>`;
    });
    list.innerHTML = html;
  }

  function filter(query) {
    const q = (query || "").trim().toLowerCase();
    if (!q) {
      filtered = INDEX.slice();
    } else {
      filtered = INDEX.filter((item) => {
        const hay = (
          item.title +
          " " +
          (item.sub || "") +
          " " +
          (item.group || "") +
          " " +
          (item.keywords || "")
        ).toLowerCase();
        return hay.includes(q);
      });
    }
    activeIndex = 0;
    render();
  }

  function open() {
    if (!panel) return;
    openState = true;
    panel.classList.add("is-open");
    setTimeout(() => input && input.focus(), 30);
  }

  function close() {
    if (!panel) return;
    openState = false;
    panel.classList.remove("is-open");
    if (input) input.value = "";
    filtered = INDEX.slice();
    activeIndex = 0;
    render();
  }

  function go(item) {
    if (!item) return;
    if (item.external) {
      window.open(item.url, "_blank", "noopener");
    } else {
      window.location.href = item.url;
    }
    close();
  }

  function onKeydown(e) {
    // global toggle
    if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      openState ? close() : open();
      return;
    }
    if (!openState) return;
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, filtered.length - 1);
      render();
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      render();
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      go(filtered[activeIndex]);
      return;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    panel = document.getElementById("cmdk");
    input = document.getElementById("cmdk-input");
    list = document.getElementById("cmdk-list");
    if (!panel || !input || !list) return;

    render();

    input.addEventListener("input", (e) => filter(e.target.value));

    list.addEventListener("click", (e) => {
      const target = e.target.closest(".cmdk-item");
      if (!target) return;
      const i = parseInt(target.getAttribute("data-i"), 10);
      go(filtered[i]);
    });

    panel.addEventListener("click", (e) => {
      if (e.target === panel) close();
    });

    document
      .querySelectorAll("[data-cmdk-open]")
      .forEach((el) => el.addEventListener("click", (e) => {
        e.preventDefault();
        open();
      }));

    document.addEventListener("keydown", onKeydown);
  });
})();
