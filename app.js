let data = null;
let currentCategory = null;

fetch("data.json")
  .then(res => res.json())
  .then(json => {
    data = json;
    renderCategories();
    selectCategory(data.categories[0].id); // prvá kategória
  });
const categoriesEl = document.getElementById("categories");
const gridEl = document.getElementById("grid");

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
function selectCategory(catId) {
  currentCategory = data.categories.find(c => c.id === catId);

  document.querySelectorAll(".category-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.id === catId);
  });

  renderGrid();
}
function renderGrid() {
  gridEl.innerHTML = "";

  currentCategory.items.forEach(item => {
    const card = document.createElement("button");
    card.className = "card";
    card.innerHTML = `${item.icon}<span>${item.text}</span>`;

    card.onclick = () => {
      document.querySelectorAll(".card").forEach(c => c.classList.remove("active"));
      card.classList.add("active");

      selectedCard = {
        text: item.text,
        form: item.text
      };

      updateSentence();
    };

    gridEl.appendChild(card);
  });
}




const quickYes = document.querySelector(".quick.yes");
const quickNo = document.querySelector(".quick.no");

function speak(text, delay = 0) {
  if (!text) return;

  speechSynthesis.cancel();

  setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "cs-CZ";
    utterance.rate = 0.9;   // príjemné pre deti
    utterance.pitch = 1;

    speechSynthesis.speak(utterance);
  }, delay);
}


let mode = null;        // ŽIADNE chci / nechci na začiatku
let selectedCard = null;

const sentenceEl = document.querySelector(".sentence");
const cards = document.querySelectorAll(".card");
const btnChci = document.querySelector(".choice.yes");
const btnNechci = document.querySelector(".choice.no");
const resetBtn = document.querySelector(".reset");

// --- MODE ---
btnChci.addEventListener("click", () => {
  mode = "chci";
  btnChci.classList.add("active");
  btnNechci.classList.remove("active");
  updateSentence();
});

btnNechci.addEventListener("click", () => {
  mode = "nechci";
  btnNechci.classList.add("active");
  btnChci.classList.remove("active");
  updateSentence();
});



// --- KARTY ---
cards.forEach(card => {
  card.addEventListener("click", () => {

    // zvýraznenie karty
    cards.forEach(c => c.classList.remove("active"));
    card.classList.add("active");

    selectedCard = card;

    // LEN aktualizácia vety
    updateSentence();
  });
});



// --- RESET ---
resetBtn.addEventListener("click", () => {
  mode = null;
  selectedCard = null;
  sentenceEl.textContent = "";

  btnChci.classList.remove("active");
  btnNechci.classList.remove("active");

  cards.forEach(c => c.classList.remove("active"));
});


// --- VETA ---
function updateSentence() {
  if (!mode || !selectedCard) {
    sentenceEl.textContent = "";
    return;
  }

  const word = selectedCard.form;

  const verb = mode === "chci" ? "Chci" : "Nechci";
  const fullSentence = `${verb} ${word}`;

  sentenceEl.textContent = fullSentence;

  // 🔊 povieme IBA CELÚ vetu
  speak(fullSentence, 500);
}

quickYes.addEventListener("click", () => {
  clearSelection();

  const text = "Ano, chci";
  sentenceEl.textContent = text;
  speak(text);

  quickYes.classList.add("active");
  quickNo.classList.remove("active");
});
quickNo.addEventListener("click", () => {
  clearSelection();

  const text = "Ne, nechci";
  sentenceEl.textContent = text;
  speak(text);

  quickNo.classList.add("active");
  quickYes.classList.remove("active");
});
function clearSelection() {
  mode = null;
  selectedCard = null;

  btnChci.classList.remove("active");
  btnNechci.classList.remove("active");

  quickYes.classList.remove("active");
  quickNo.classList.remove("active");

  cards.forEach(c => c.classList.remove("active"));
}

