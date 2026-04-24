const LOVE_OPTIONS = [
  "Взаимопонимание",
  "Уважение",
  "Доверие",
  "Забота",
  "Честность",
  "Жертва",
  "Химия",
  "другое..."
];

const FORGIVE_OPTIONS = [
  "Измену",
  "Обман",
  "Предательство",
  "Безразличие",
  "Ложь",
  "Папу",
  "Маму",
  "другое..."
];

const tabLove = document.getElementById("tab-love");
const tabForgive = document.getElementById("tab-forgive");
const screenLove = document.getElementById("screen-love");
const screenForgive = document.getElementById("screen-forgive");
const optionsPool = document.getElementById("options-pool");

const loveDropzone = document.getElementById("love-dropzone");
const forgiveZone = document.getElementById("forgive-zone");
const notForgiveZone = document.getElementById("not-forgive-zone");

let draggedId = "";
let selectedChipId = "";
let currentScreen = "love";
let touchDraggedId = "";

function createChip(text, index) {
  const chip = document.createElement("button");
  chip.className = "chip";
  chip.type = "button";
  chip.draggable = true;
  chip.textContent = text;
  chip.id = `chip-${index}-${text.replace(/\s+/g, "-").toLowerCase()}`;
  chip.addEventListener("dragstart", () => {
    draggedId = chip.id;
  });
  chip.addEventListener("dragend", () => {
    chip.classList.remove("chip-dragging");
  });
  chip.addEventListener("touchstart", () => {
    touchDraggedId = chip.id;
    chip.classList.add("chip-dragging");
  }, { passive: true });
  chip.addEventListener("click", () => {
    toggleChipSelection(chip.id);
  });
  return chip;
}

function renderPool(options) {
  optionsPool.innerHTML = "";
  options.forEach((value, i) => {
    optionsPool.appendChild(createChip(value, i));
  });
}

function resetAll() {
  selectedChipId = "";
  renderPool(currentScreen === "love" ? LOVE_OPTIONS : FORGIVE_OPTIONS);
  [loveDropzone, forgiveZone, notForgiveZone].forEach((zone) => {
    zone.innerHTML = "";
  });
}

function clearChipSelection() {
  selectedChipId = "";
  document.querySelectorAll(".chip").forEach((chip) => {
    chip.classList.remove("chip-selected");
  });
}

function toggleChipSelection(chipId) {
  if (selectedChipId === chipId) {
    clearChipSelection();
    return;
  }
  clearChipSelection();
  selectedChipId = chipId;
  const chip = document.getElementById(chipId);
  if (chip) {
    chip.classList.add("chip-selected");
  }
}

function moveSelectedChipTo(zone) {
  if (!selectedChipId) {
    return;
  }
  const chip = document.getElementById(selectedChipId);
  if (chip) {
    zone.appendChild(chip);
  }
  clearChipSelection();
}

function activateScreen(name) {
  currentScreen = name;
  const isLove = name === "love";
  tabLove.classList.toggle("tab-active", isLove);
  tabForgive.classList.toggle("tab-active", !isLove);
  screenLove.classList.toggle("screen-active", isLove);
  screenForgive.classList.toggle("screen-active", !isLove);
  resetAll();
}

function setupDropzone(zone) {
  zone.addEventListener("dragover", (event) => {
    event.preventDefault();
    zone.classList.add("drag-over");
  });
  zone.addEventListener("dragleave", () => {
    zone.classList.remove("drag-over");
  });
  zone.addEventListener("drop", (event) => {
    event.preventDefault();
    zone.classList.remove("drag-over");
    const dragged = document.getElementById(draggedId);
    if (dragged) {
      zone.appendChild(dragged);
    }
    clearChipSelection();
  });
  zone.addEventListener("click", () => {
    moveSelectedChipTo(zone);
  });
}

function setupPoolDropzone() {
  optionsPool.addEventListener("dragover", (event) => {
    event.preventDefault();
    optionsPool.classList.add("drag-over");
  });
  optionsPool.addEventListener("dragleave", () => {
    optionsPool.classList.remove("drag-over");
  });
  optionsPool.addEventListener("drop", (event) => {
    event.preventDefault();
    optionsPool.classList.remove("drag-over");
    const dragged = document.getElementById(draggedId);
    if (dragged) {
      optionsPool.appendChild(dragged);
    }
    clearChipSelection();
  });
  optionsPool.addEventListener("click", () => {
    moveSelectedChipTo(optionsPool);
  });
}

function getTouchTargetZone(touch) {
  const element = document.elementFromPoint(touch.clientX, touch.clientY);
  if (!element) {
    return null;
  }
  return element.closest(".dropzone, .options-pool");
}

function setupTouchDrag() {
  document.addEventListener("touchmove", (event) => {
    if (!touchDraggedId) {
      return;
    }
    const touch = event.changedTouches[0];
    if (!touch) {
      return;
    }
    event.preventDefault();
    document.querySelectorAll(".drag-over").forEach((el) => {
      el.classList.remove("drag-over");
    });
    const zone = getTouchTargetZone(touch);
    if (zone) {
      zone.classList.add("drag-over");
    }
  }, { passive: false });

  document.addEventListener("touchend", (event) => {
    if (!touchDraggedId) {
      return;
    }
    const touch = event.changedTouches[0];
    const chip = document.getElementById(touchDraggedId);
    const zone = touch ? getTouchTargetZone(touch) : null;

    document.querySelectorAll(".drag-over").forEach((el) => {
      el.classList.remove("drag-over");
    });

    if (chip && zone) {
      zone.appendChild(chip);
      clearChipSelection();
    }

    if (chip) {
      chip.classList.remove("chip-dragging");
    }
    touchDraggedId = "";
  });

  document.addEventListener("touchcancel", () => {
    const chip = document.getElementById(touchDraggedId);
    if (chip) {
      chip.classList.remove("chip-dragging");
    }
    document.querySelectorAll(".drag-over").forEach((el) => {
      el.classList.remove("drag-over");
    });
    touchDraggedId = "";
  });
}

tabLove.addEventListener("click", () => activateScreen("love"));
tabForgive.addEventListener("click", () => activateScreen("forgive"));

setupDropzone(loveDropzone);
setupDropzone(forgiveZone);
setupDropzone(notForgiveZone);
setupPoolDropzone();
setupTouchDrag();

activateScreen("love");

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}
