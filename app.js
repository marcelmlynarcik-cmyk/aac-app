let mode = "chci"; // alebo "nechci"
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
    cards.forEach(c => c.classList.remove("active"));
    card.classList.add("active");
    selectedCard = card;
    updateSentence();
  });
});

// --- RESET ---
resetBtn.addEventListener("click", () => {
  mode = "chci";
  selectedCard = null;
  sentenceEl.textContent = "";
  cards.forEach(c => c.classList.remove("active"));
});

// --- VETA ---
function updateSentence() {
  if (!selectedCard) return;

  const word = selectedCard.dataset.form;
  const verb = mode === "chci" ? "Chci" : "Nechci";

  sentenceEl.textContent = `${verb} ${word}`;
}
