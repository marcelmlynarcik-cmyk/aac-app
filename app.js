function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "cs-CZ";
  utterance.rate = 0.9;   // pomalšie, lepšie pre deti
  speechSynthesis.cancel(); // zastaví predchádzajúci hlas
  speechSynthesis.speak(utterance);
}


let steps = [];
let stepIndex = 0;
let sentence = [];

const titleEl = document.getElementById("title");
const cardsEl = document.getElementById("cards");
const sentenceEl = document.getElementById("sentence");
const resetBtn = document.getElementById("reset");

fetch("data.json")
  .then(r => r.json())
  .then(data => {
    steps = data.steps;
    render();
  });

function render() {
  cardsEl.innerHTML = "";

 if (stepIndex >= steps.length) {
  titleEl.innerText = "Věta";

  const fullSentence = sentence.join(" ");
  sentenceEl.innerText = fullSentence;

  setTimeout(() => {
    speak(fullSentence);
  }, 500); // rovnaké tempo ako medzi kartami

  return;
}


  const step = steps[stepIndex];
  titleEl.innerText = step.title;

  step.items.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
  <div class="icon">${item.icon}</div>
  <div class="text">${item.text}</div>
`;


    card.onclick = () => {
  speak(item.text);

  setTimeout(() => {
    sentence.push(item.text);
    stepIndex++;
    render();
  }, 1000); // 300 ms = ideálne oneskorenie pre deti
};



    cardsEl.appendChild(card);
  });
}

resetBtn.onclick = () => {
  stepIndex = 0;
  sentence = [];
  sentenceEl.innerText = "";
  render();
};
