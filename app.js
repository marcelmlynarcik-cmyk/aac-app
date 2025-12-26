let data = null;
let currentCategory = null;
let mode = null;
let selectedItem = null;

const sentenceEl = document.querySelector(".sentence");
const categoriesEl = document.getElementById("categories");
const gridEl = document.getElementById("grid");

const btnChci = document.querySelector(".choice.yes");
const btnNechci = document.querySelector(".choice.no");
const quickYes = document.querySelector(".quick.yes");
const quickNo = document.querySelector(".quick.no");
const resetBtn = document.querySelector(".reset");

// ===== SPEAK =====
function speak(text, delay = 300) {
  if (!text) return;
  speechSynthesis.cancel();

  setTimeout(() => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "cs-CZ";
    u.rate = 0.9;
    speechSynthesis.speak(u);
  }, delay);
}

// ===== LOAD DATA =====
fetch("data.json")
  .then(res => res.json())
  .then(json => {
    data = json;
    renderCategories();
    selectCategory("all");
  });

// ===== CATEGORIES =====
function renderCategories() {
  categoriesEl.innerHTML = "";

  data.categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "category-btn";
    btn.innerHTML = `${cat.icon} ${cat.label}`;
    btn.onclick = () => selectCategory(cat.id);
    btn.dataset.id = cat.id;
    categoriesEl.appendChild(btn);
  });
}

function selectCategory(catId) {
  currentCategory = data.categories.find(c => c.id === catId);

  document.querySelectorAll(".category-btn").forEach(b =>
    b.classList.toggle("active", b.dataset.id === catId)
  );

  clearSelection();
  updateControls();
  renderGrid();
}

// ===== GRID =====
function renderGrid() {
  gridEl.innerHTML = "";

  let items = [];

  if (currentCategory.id === "all") {
    data.categories.forEach(c => {
      if (c.items) items.push(...c.items.map(i => ({ ...i, mode: c.mode })));
    });
  } else {
    items = currentCategory.items.map(i => ({ ...i, mode: currentCategory.mode }));
  }

  items.forEach(item => {
    const card = document.createElement("button");
    card.className = "card";
    card.innerHTML = `${item.icon}<span>${item.text}</span>`;

    card.onclick = () => onItemClick(item, card);
    gridEl.appendChild(card);
  });
}

// ===== ITEM CLICK =====
function onItemClick(item, card) {
  document.querySelectorAll(".card").forEach(c => c.classList.remove("active"));
  card.classList.add("active");

  selectedItem = item;

  if (item.mode === "statement") {
    sentenceEl.textContent = item.text;
    speak(item.text);
  } else {
    updateSentence();
  }
}

// ===== MODE BUTTONS =====
btnChci.onclick = () => {
  mode = "chci";
  btnChci.classList.add("active");
  btnNechci.classList.remove("active");
  updateSentence();
};

btnNechci.onclick = () => {
  mode = "nechci";
  btnNechci.classList.add("active");
  btnChci.classList.remove("active");
  updateSentence();
};

// ===== QUICK ANSWERS =====
quickYes.onclick = () => {
  clearSelection();
  sentenceEl.textContent = "Ano, chci";
  speak(sentenceEl.textContent);
  quickYes.classList.add("active");
};

quickNo.onclick = () => {
  clearSelection();
  sentenceEl.textContent = "Ne, nechci";
  speak(sentenceEl.textContent);
  quickNo.classList.add("active");
};

// ===== SENTENCE =====
function updateSentence() {
  if (!mode || !selectedItem) {
    sentenceEl.textContent = "";
    return;
  }

  const verb = mode === "chci" ? "Chci" : "Nechci";
  const text = `${verb} ${selectedItem.text}`;
  sentenceEl.textContent = text;
  speak(text);
}

// ===== UI CONTROL =====
function updateControls() {
  const showWant = currentCategory.mode !== "statement";

  document.querySelector(".choices").style.display = showWant ? "flex" : "none";
}

// ===== RESET =====
function clearSelection() {
  mode = null;
  selectedItem = null;

  btnChci.classList.remove("active");
  btnNechci.classList.remove("active");
  quickYes.classList.remove("active");
  quickNo.classList.remove("active");

  document.querySelectorAll(".card").forEach(c => c.classList.remove("active"));
  sentenceEl.textContent = "";
}

resetBtn.onclick = clearSelection;
