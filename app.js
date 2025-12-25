

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
    cards.forEach(c => c.classList.remove("active"));
    card.classList.add("active");
    selectedCard = card;
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


  const word = selectedCard.dataset.form;
  const verb = mode === "chci" ? "Chci" : "Nechci";

  sentenceEl.textContent = `${verb} ${word}`;
}
