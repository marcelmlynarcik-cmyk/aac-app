// === ELEMENTY ===
const sentenceEl = document.querySelector(".sentence");
const btnChci = document.querySelector(".choice.yes");
const btnNechci = document.querySelector(".choice.no");
const quickYes = document.querySelector(".quick.yes");
const quickNo = document.querySelector(".quick.no");
const resetBtn = document.querySelector(".reset");
const categoriesEl = document.getElementById("categories");
const gridEl = document.getElementById("grid");

// === STAV ===
let data = null;
let currentCategory = null;
let mode = null;
let selectedCard = null;

// === LOAD DATA ===
fetch("data.json")
  .then(r => r.json())
  .then(json => {
    data = json;
    renderCategories();
    selectCategory(data.categories[0].id);
  });

// === KATEGÓRIE ===
function renderCategories() {
  categoriesEl.innerHTML = "";

  data.categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "category-btn";
    btn.textContent = cat.label;
    btn.onclick = () => selectCategory(cat.id);
    btn.dataset.id = cat.id;
    categoriesEl.appendChild(btn);
  });
}

function selectCategory(id) {
  currentCategory = data.categories.find(c => c.id === id);

  document.querySelectorAll(".category-btn").forEach(b =>
    b.classList.toggle("active", b.dataset.id === id)
  );

  renderGrid();
}

// === GRID ===
function renderGrid() {
  gridEl.innerHTML = "";

  currentCategory.items.forEach(item => {
    const card = document.createElement("button");
    card.className = "card";
    card.innerHTML = `${item.icon}<span>${item.text}</span>`;

    card.onclick = () => {
      document.querySelectorAll(".card").forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      selectedCard = item;
      updateSentence();
    };

    gridEl.appendChild(card);
  });
}

// === MODE ===
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

// === VETA ===
function updateSentence() {
  if (!mode || !selectedCard) {
    sentenceEl.textContent = "";
    return;
  }

  const text = `${mode === "chci" ? "Chci" : "Nechci"} ${selectedCard.text}`;
  sentenceEl.textContent = text;
  speak(text, 500);
}

// === QUICK ===
quickYes.onclick = () => {
  clearAll();
  sentenceEl.textContent = "Ano, chci";
  speak("Ano, chci");
  quickYes.classList.add("active");
};

quickNo.onclick = () => {
  clearAll();
  sentenceEl.textContent = "Ne, nechci";
  speak("Ne, nechci");
  quickNo.classList.add("active");
};

// === RESET ===
resetBtn.onclick = clearAll;

function clearAll() {
  mode = null;
  selectedCard = null;
  sentenceEl.textContent = "";

  btnChci.classList.remove("active");
  btnNechci.classList.remove("active");
  quickYes.classList.remove("active");
  quickNo.classList.remove("active");
  document.querySelectorAll(".card").forEach(c => c.classList.remove("active"));
}

// === TTS ===
function speak(text, delay = 0) {
  speechSynthesis.cancel();
  setTimeout(() => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "cs-CZ";
    u.rate = 0.9;
    speechSynthesis.speak(u);
  }, delay);
}
