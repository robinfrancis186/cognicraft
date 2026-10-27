const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#navigation");

function closeMenu() {
  menuButton.setAttribute("aria-expanded", "false");
  navigation.dataset.open = "false";
}

menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(open));
  navigation.dataset.open = String(open);
});
navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    menuButton.getAttribute("aria-expanded") === "true"
  ) {
    closeMenu();
    menuButton.focus();
  }
});

const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectDay(tab) {
  tabs.forEach((item) => {
    const selected = item === tab;
    item.setAttribute("aria-selected", String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute("aria-controls")).hidden =
      !selected;
  });
}
tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectDay(tab));
  tab.addEventListener("keydown", (event) => {
    let next;
    if (event.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
    if (event.key === "ArrowLeft")
      next = tabs[(index + tabs.length - 1) % tabs.length];
    if (event.key === "Home") next = tabs[0];
    if (event.key === "End") next = tabs[tabs.length - 1];
    if (next) {
      event.preventDefault();
      selectDay(next);
      next.focus();
    }
  });
});

const motionButton = document.querySelector("#motion-toggle");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
function updateMotion(paused) {
  document.body.classList.toggle("motion-paused", paused);
  motionButton.setAttribute("aria-pressed", String(paused));
  motionButton.disabled = reducedMotion.matches;
  motionButton.textContent = reducedMotion.matches
    ? "Reduced motion enabled"
    : paused
      ? "Motion paused · Resume ↗"
      : "Pause motion Ⅱ";
}
updateMotion(reducedMotion.matches);
motionButton.addEventListener("click", () =>
  updateMotion(!document.body.classList.contains("motion-paused")),
);
reducedMotion.addEventListener("change", (event) =>
  updateMotion(event.matches),
);

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  document
    .querySelectorAll(
      ".section-intro, .experience-main, .experience-list article, .organizer-grid, .partner-invitation, .venue-art, .venues article",
    )
    .forEach((element) => {
      element.classList.add("reveal");
      if (element.getBoundingClientRect().top > window.innerHeight) {
        element.classList.add("will-reveal");
        revealObserver.observe(element);
      }
    });
}
