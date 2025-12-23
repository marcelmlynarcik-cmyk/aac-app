let data = null;
let stepIndex = 0;
let sentence = [];

const titleEl = document.getElementById("title");
const cardsEl = document.getElementById("cards");
const sentenceEl = document.getElementById("sentence");
const resetBtn = document.getElementById("reset");

fetch("data.json")
  .then(res => res.json())
  .then(json => {
    data = json.steps;
    renderStep();
  });

function renderStep() {
  cardsEl.innerHTML = "";

  if (stepIndex >= data.length) {
    titleEl.innerText = "Veta";
    sentenceEl.innerText = sentence.join(" ");
    return;
  }

  const step = data[stepIndex];
  titleEl.innerText = step.title;

  step.items.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = item.img;
    img.alt = item.text;

    const label = document.createElement("div");
    label.className = "label";
    label.innerText = item.text;

    card.appendChild(img);
    card.appendChild(label);

    card.onclick = () => {
      sentence.push(item.text);
      stepIndex++;
      renderStep();
    };

    cardsEl.appendChild(card);
  });
}

resetBtn.onclick = () => {
  stepIndex = 0;
  sentence = [];
  sentenceEl.innerText = "";
  renderStep();
};

