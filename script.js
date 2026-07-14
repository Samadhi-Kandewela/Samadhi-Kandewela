document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-links");
  const navLinks = document.querySelectorAll(".nav-links a");
  const sections = document.querySelectorAll("main section[id]");
  const year = document.getElementById("year");

  if (year) year.textContent = new Date().getFullYear();

  const setHeaderState = () => {
    header?.classList.toggle("scrolled", window.scrollY > 24 || nav?.classList.contains("open"));
  };

  const closeMenu = () => {
    nav?.classList.remove("open");
    document.body.classList.remove("menu-open");
    menuButton?.setAttribute("aria-expanded", "false");
    menuButton?.setAttribute("aria-label", "Open navigation");
    const icon = menuButton?.querySelector("i");
    icon?.classList.replace("fa-xmark", "fa-bars");
    setHeaderState();
  };

  menuButton?.addEventListener("click", () => {
    const isOpen = nav?.classList.toggle("open") ?? false;
    document.body.classList.toggle("menu-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    const icon = menuButton.querySelector("i");
    icon?.classList.toggle("fa-bars", !isOpen);
    icon?.classList.toggle("fa-xmark", isOpen);
    setHeaderState();
  });

  navLinks.forEach(link => link.addEventListener("click", closeMenu));
  window.addEventListener("scroll", setHeaderState, { passive: true });
  setHeaderState();

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach(element => revealObserver.observe(element));

  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
    });
  }, { rootMargin: "-35% 0px -55%", threshold: 0 });

  sections.forEach(section => navObserver.observe(section));

  document.querySelectorAll("details.more-projects").forEach(details => {
    details.addEventListener("toggle", () => {
      const summary = details.querySelector("summary");
      if (summary) summary.setAttribute("aria-expanded", String(details.open));
    });
  });
});
