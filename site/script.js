// LinxIn site — scroll reveal + animated score rings. Vanilla, no deps.

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// reveal on scroll
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    e.target.classList.add("in");
    e.target.querySelectorAll?.(".ring").forEach(animateRing);
    io.unobserve(e.target);
  }
}, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });

document.querySelectorAll(".reveal").forEach((el) => {
  if (reduce) { el.classList.add("in"); el.querySelectorAll?.(".ring").forEach((r) => r.style.setProperty("--val", targetOf(r))); }
  else io.observe(el);
});

function targetOf(ring) {
  return Number(getComputedStyle(ring).getPropertyValue("--val")) || 0;
}

// count a score ring up from 0 to its target
function animateRing(ring) {
  if (reduce) return;
  const target = targetOf(ring);
  const start = performance.now();
  const dur = 1100;
  ring.style.setProperty("--val", 0);
  function step(now) {
    const t = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - t, 3);
    ring.style.setProperty("--val", (target * eased).toFixed(1));
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// subtle cursor spotlight on feature cards
document.querySelectorAll(".feat").forEach((el) => {
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
});

// interactive terminal — click a CLI tab, the launch command swaps
const termLaunch = document.getElementById("term-launch");
const termLaunchLine = document.querySelector(".term-launch-line");
const termTabs = document.querySelectorAll(".term-tab");
termTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    if (tab.classList.contains("is-active")) return;
    termTabs.forEach((t) => { t.classList.remove("is-active"); t.setAttribute("aria-selected", "false"); });
    tab.classList.add("is-active");
    tab.setAttribute("aria-selected", "true");
    const swap = () => { termLaunch.textContent = tab.dataset.cli; };
    if (reduce || !termLaunchLine) { swap(); return; }
    termLaunchLine.classList.add("swap");
    setTimeout(() => { swap(); termLaunchLine.classList.remove("swap"); }, 120);
  });
});

// FAQ accordion — click (or Enter/Space) a question to expand/collapse its answer.
// First item starts open so the interaction is discoverable at a glance.
document.querySelectorAll(".faq-item").forEach((item, i) => {
  const dt = item.querySelector("dt");
  if (!dt) return;
  dt.tabIndex = 0;
  dt.setAttribute("role", "button");
  const toggle = () => {
    const open = item.classList.toggle("is-open");
    dt.setAttribute("aria-expanded", String(open));
  };
  dt.addEventListener("click", toggle);
  dt.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
  });
  if (i === 0) toggle();
});

// scroll cue — click scrolls to the next section
document.querySelector(".scroll-cue")?.addEventListener("click", () => {
  document.querySelector("#how, .strip")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
});

// docs page: sidebar scrollspy — highlight the doc-nav link for the section in view
const docSections = document.querySelectorAll(".doc-section[id]");
const docNavLinks = document.querySelectorAll(".doc-nav a");
if (docSections.length && docNavLinks.length) {
  const spy = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const link = document.querySelector(`.doc-nav a[href="#${e.target.id}"]`);
      if (!link) continue;
      docNavLinks.forEach((a) => a.classList.remove("is-active"));
      link.classList.add("is-active");
    }
  }, { rootMargin: "-15% 0px -70% 0px", threshold: 0 });
  docSections.forEach((s) => spy.observe(s));

  // reveal doc sections on scroll, same pattern as the landing page
  const docReveal = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add("in");
      docReveal.unobserve(e.target);
    }
  }, { threshold: 0.1, rootMargin: "0px 0px -8% 0px" });
  docSections.forEach((s) => { reduce ? s.classList.add("in") : docReveal.observe(s); });
}
