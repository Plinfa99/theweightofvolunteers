function togglePillar(clicked) {
  const all = document.querySelectorAll(".core");
  const isOpen = clicked.classList.contains("expanded");
  all.forEach(c => c.classList.remove("expanded"));
  if (!isOpen) clicked.classList.add("expanded");
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".core").forEach(el => {
    el.addEventListener("click", () => togglePillar(el));
  });
});
