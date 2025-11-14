(() => {
  const yearEls = document.querySelectorAll("#year");
  const y = String(new Date().getFullYear());
  yearEls.forEach(el => (el.textContent = y));
})();

(() => {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) return;

  const setOpen = (open) => {
    links.style.display = open ? "flex" : "none";
    toggle.setAttribute("aria-expanded", String(open));
  };
  setOpen(false);

  toggle.addEventListener("click", () => {
    const open = links.style.display === "flex";
    setOpen(!open);
  });

  links.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    setOpen(false);
  });
})();

/* === Nav Links === */

(() => {
  const header = document.querySelector(".site-header");

  function getHeaderOffset() {
    if (!header) return 0;
    const rect = header.getBoundingClientRect();
    return rect.height + 8;
  }

  function smoothScrollTo(target) {
    const top =
      target.getBoundingClientRect().top +
      window.pageYOffset -
      getHeaderOffset();

    window.scrollTo({ top, behavior: "smooth" });
  }

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      smoothScrollTo(target);
    });
  });

  window.addEventListener("load", () => {
    const { hash } = window.location;
    if (!hash) return;
    const target = document.querySelector(hash);
    if (target) setTimeout(() => smoothScrollTo(target), 0);
  });
})();

/* === Countdown === */

(() => {
  const WEDDING_DATE = "2026-04-25T15:00:00";
  const el = document.getElementById("countdown");
  if (!el) return;

  const plural = (n, s) => (n === 1 ? s : s + "s");

  function formatDelta(ms) {
    if (ms <= 0) return "It’s today!";
    const sec = Math.floor(ms / 1000);
    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${d} ${plural(d, "day")} • ${h} ${plural(h, "hr")} • ${m} ${plural(m, "min")}`;
  }

  function tick() {
    const now = new Date();
    const target = new Date(WEDDING_DATE);
    el.textContent = formatDelta(target - now);
  }

  tick();
  setInterval(tick, 30000);
})();


(() => {
  const dEl = document.getElementById('cd-days');
  const hEl = document.getElementById('cd-hours');
  const mEl = document.getElementById('cd-mins');
  const sEl = document.getElementById('cd-secs');
  if (!dEl || !hEl || !mEl || !sEl) return;
  
  const target = new Date(2026, 3, 26, 0, 0, 0);
  
  function pad(n) { return n.toString().padStart(2, '0'); }
  
  function tick() {
    const now = new Date();
    let diff = target - now;
    
    if (diff <= 0) {
      dEl.textContent = '00';
      hEl.textContent = '00';
      mEl.textContent = '00';
      sEl.textContent = '00';
      const note = document.querySelector('.count-note');
      if (note) note.textContent = "It's today! 💍";
      clearInterval(timer);
      return;
    }
    
    const sec = Math.floor(diff / 1000);
    const days = Math.floor(sec / 86400);
    const hours = Math.floor((sec % 86400) / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    
    dEl.textContent = String(days);
    hEl.textContent = pad(hours);
    mEl.textContent = pad(mins);
    sEl.textContent = pad(secs);
  }
  
  tick();
  const timer = setInterval(tick, 1000);
})();

/* === Scroll color change === */

(() => {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const THRESHOLD = window.innerHeight - 30;

  function onScroll() {
    const y = window.scrollY || window.pageYOffset || 0;
    header.classList.toggle("scrolled", y > THRESHOLD);
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
})();