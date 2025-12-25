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

    // vizuálne zvýraznenie (to už máš)
    cards.forEach(c => c.classList.remove("active"));
    card.classList.add("active");

    selectedCard = card;

    // 1️⃣ povedz LEN slovo
    const word = card.dataset.form;
    speak(word);

    // 2️⃣ aktualizuj vetu (bez hovorenia)
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

  const fullSentence = `${verb} ${word}`;
  sentenceEl.textContent = fullSentence;

  // 2️⃣ po krátkej pauze povedz CELÚ vetu
  speak(fullSentence, 800);
}

