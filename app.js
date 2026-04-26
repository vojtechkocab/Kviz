const TASKS = [
  imageChoice("Najdi sněhuláka.", "☃️", ["🐶", "☃️", "🍎", "🚗"]),
  imageChoice("Najdi obrázek, který začíná na písmeno A.", "🍍", ["🐟", "🍍", "🏠", "🧦"]),
  imageChoice("Najdi obrázek, který začíná na písmeno S.", "☃️", ["☃️", "🍐", "🐸", "🚲"]),
  imageChoice("Najdi obrázek, který začíná na písmeno K.", "🐱", ["🦋", "🐱", "🌲", "🚁"]),
  samePair("Najdi dva stejné obrázky.", "🍓", ["🍓", "🍐", "🍓", "🍋"]),
  oddOne("Najdi obrázek, který je jiný.", "🚁", ["🚗", "🚗", "🚁", "🚗"]),
  oddOne("Najdi obrázek, který nepatří mezi ovoce.", "🐰", ["🍎", "🍌", "🐰", "🍓"]),
  countChoice("Kolik je na obrázku hvězdiček?", "⭐", 3, [2, 3, 4]),
  countChoice("Kolik je na obrázku balonků?", "🎈", 5, [4, 5, 6]),
  countChoice("Kolik je na obrázku autíček?", "🚗", 2, [1, 2, 3]),
  syllables("Vytleskej slovo kočka. Kolik má slabik?", "🐱", 2, [1, 2, 3]),
  syllables("Vytleskej slovo jahoda. Kolik má slabik?", "🍓", 3, [2, 3, 4]),
  syllables("Vytleskej slovo sluníčko. Kolik má slabik?", "☀️", 3, [2, 3, 4]),
  shapeChoice("Najdi kruh.", "●", ["▲", "■", "●", "◆"]),
  shapeChoice("Najdi trojúhelník.", "▲", ["■", "▲", "●", "◆"]),
  colorChoice("Najdi červený kruh.", "redCircle", ["blueCircle", "redSquare", "redCircle", "greenTriangle"]),
  colorChoice("Najdi zelený trojúhelník.", "greenTriangle", ["yellowCircle", "greenTriangle", "blueSquare", "redCircle"]),
  sizeChoice("Který obrázek je největší?", 2),
  sizeChoice("Který obrázek je nejmenší?", 0, true),
  pattern("Co patří na konec řady?", ["🔴", "🔵", "🔴", "🔵", "🔴"], "🔵", ["🔴", "🔵", "🟡"]),
  pattern("Co patří na konec řady?", ["🐱", "🐶", "🐱", "🐶", "🐱"], "🐶", ["🐰", "🐶", "🐱"]),
  shadow("Najdi obrázek podle stínu.", "🦋", ["🐝", "🦋", "🐌"]),
  imageChoice("Co létá ve vzduchu?", "✈️", ["🚜", "⛵", "✈️", "🏠"]),
  imageChoice("Co plave ve vodě?", "🐟", ["🐟", "🐕", "🚌", "🌳"]),
  imageChoice("Co si oblečeme na nohu?", "🧦", ["🧦", "🥄", "📚", "⚽"]),
  samePair("Najdi dva stejné dopravní prostředky.", "🚲", ["🚲", "🚗", "🚲", "🚂"]),
  oddOne("Najdi obrázek, který nepatří mezi zvířata.", "🏠", ["🐶", "🐱", "🏠", "🐭"]),
  countChoice("Kolik je na obrázku kytiček?", "🌼", 4, [3, 4, 5]),
  pattern("Co patří na konec řady?", ["⭐", "🌙", "⭐", "🌙", "⭐"], "🌙", ["☀️", "⭐", "🌙"]),
  imageChoice("Najdi věc, kterou píšeme.", "✏️", ["🍞", "✏️", "🧤", "🚗"]),
];

const POSITIVE = ["Výborně!", "Skvělé!", "Ano!", "Paráda!", "Povedlo se!"];

const state = {
  current: 0,
  score: 0,
  locked: false,
  shuffledTasks: [],
};

const startScreen = document.querySelector("#startScreen");
const taskScreen = document.querySelector("#taskScreen");
const finishScreen = document.querySelector("#finishScreen");
const startButton = document.querySelector("#startButton");
const againButton = document.querySelector("#againButton");
const homeButton = document.querySelector("#homeButton");
const speakButton = document.querySelector("#speakButton");
const taskStage = document.querySelector("#taskStage");
const answerGrid = document.querySelector("#answerGrid");
const spokenInstruction = document.querySelector("#spokenInstruction");
const progressFill = document.querySelector("#progressFill");
const progressLabel = document.querySelector("#progressLabel");
const finishText = document.querySelector("#finishText");
const toast = document.querySelector("#toast");

registerServiceWorker();

startButton.addEventListener("click", startGame);
againButton.addEventListener("click", startGame);
homeButton.addEventListener("click", showStart);
speakButton.addEventListener("click", () => speakCurrentTask());

function startGame() {
  state.current = 0;
  state.score = 0;
  state.locked = false;
  state.shuffledTasks = shuffle(TASKS).slice(0, 24);
  showOnly(taskScreen);
  renderTask();
}

function showStart() {
  stopSpeaking();
  state.locked = false;
  showOnly(startScreen);
}

function renderTask() {
  stopSpeaking();
  state.locked = false;
  const task = state.shuffledTasks[state.current];
  spokenInstruction.textContent = task.prompt;
  taskStage.innerHTML = task.stage;
  answerGrid.innerHTML = "";
  answerGrid.className = `answer-grid ${task.gridClass ?? ""}`;

  task.answers.forEach((answer) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = answer.className ? `answer-card ${answer.className}` : "answer-card";
    button.dataset.value = answer.value;
    button.setAttribute("aria-label", answer.label ?? answer.value);
    button.innerHTML = answer.html;
    button.addEventListener("click", () => chooseAnswer(answer, button));
    answerGrid.appendChild(button);
  });

  const total = state.shuffledTasks.length;
  progressLabel.textContent = `${state.current + 1}/${total}`;
  progressFill.style.width = `${(state.current / total) * 100}%`;
  window.setTimeout(() => speakCurrentTask(), 350);
}

function chooseAnswer(answer, button) {
  if (state.locked) return;
  state.locked = true;
  stopSpeaking();

  const task = state.shuffledTasks[state.current];
  const isCorrect = answer.value === task.correct;

  [...answerGrid.children].forEach((child) => {
    child.disabled = true;
    if (child.dataset.value === task.correct) child.classList.add("is-correct");
  });

  if (isCorrect) {
    state.score += 1;
    button.classList.add("is-correct");
    showToast(randomItem(POSITIVE), "good");
    speak("Správně. " + randomItem(POSITIVE));
  } else {
    button.classList.add("is-wrong");
    showToast("Zkusíme další.", "soft");
    speak("To nevadí. Zkusíme další úkol.");
  }

  window.setTimeout(nextTask, 1250);
}

function nextTask() {
  state.current += 1;
  if (state.current >= state.shuffledTasks.length) {
    progressFill.style.width = "100%";
    finishText.textContent = `Máš ${state.score} správně z ${state.shuffledTasks.length}.`;
    showOnly(finishScreen);
    speak(`Hotovo. Máš ${state.score} správně z ${state.shuffledTasks.length}.`);
    return;
  }
  renderTask();
}

function speakCurrentTask() {
  const task = state.shuffledTasks[state.current];
  if (task) speak(task.prompt);
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  stopSpeaking();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "cs-CZ";
  utterance.rate = 0.72;
  utterance.pitch = 1.02;
  const voices = window.speechSynthesis.getVoices();
  const czechVoice = voices.find((voice) => voice.lang?.toLowerCase().startsWith("cs"));
  if (czechVoice) utterance.voice = czechVoice;
  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

function showOnly(screen) {
  [startScreen, taskScreen, finishScreen].forEach((item) => {
    item.classList.toggle("is-active", item === screen);
  });
}

function showToast(text, tone) {
  toast.textContent = text;
  toast.className = `toast ${tone}`;
  toast.hidden = false;
  window.setTimeout(() => {
    toast.hidden = true;
  }, 1000);
}

function imageChoice(prompt, correct, values) {
  return {
    prompt,
    correct,
    stage: `<div class="picture-cloud">${values.map((value) => `<span>${value}</span>`).join("")}</div>`,
    answers: values.map((value) => ({
      value,
      html: `<span class="emoji">${value}</span>`,
      label: `Obrázek ${value}`,
    })),
  };
}

function samePair(prompt, correct, values) {
  return {
    prompt,
    correct,
    stage: `<div class="picture-row">${values.map((value) => `<span>${value}</span>`).join("")}</div>`,
    answers: values.map((value, index) => ({
      value: value === correct ? correct : `${value}-${index}`,
      html: `<span class="emoji">${value}</span>`,
      label: `Obrázek ${value}`,
    })),
  };
}

function oddOne(prompt, correct, values) {
  return imageChoice(prompt, correct, values);
}

function countChoice(prompt, symbol, count, options) {
  return {
    prompt,
    correct: String(count),
    stage: `<div class="count-scene">${Array.from({ length: count }, () => `<span>${symbol}</span>`).join("")}</div>`,
    answers: options.map((value) => ({
      value: String(value),
      html: `<strong class="number">${value}</strong>`,
      label: String(value),
    })),
    gridClass: "numbers",
  };
}

function syllables(prompt, symbol, count, options) {
  return {
    prompt,
    correct: String(count),
    stage: `<div class="word-picture"><span>${symbol}</span><div class="clap-dots">${Array.from({ length: count }, () => "<i></i>").join("")}</div></div>`,
    answers: options.map((value) => ({
      value: String(value),
      html: `<strong class="number">${value}</strong>`,
      label: String(value),
    })),
    gridClass: "numbers",
  };
}

function shapeChoice(prompt, correct, shapes) {
  return {
    prompt,
    correct,
    stage: `<div class="shape-board">${shapes.map((shape) => `<span>${shape}</span>`).join("")}</div>`,
    answers: shapes.map((shape) => ({
      value: shape,
      html: `<span class="shape-option">${shape}</span>`,
      label: shape,
    })),
  };
}

function colorChoice(prompt, correct, values) {
  return {
    prompt,
    correct,
    stage: `<div class="color-board">${values.map((value) => `<span class="color-shape ${value}"></span>`).join("")}</div>`,
    answers: values.map((value) => ({
      value,
      html: `<span class="color-shape ${value}"></span>`,
      label: value,
    })),
  };
}

function sizeChoice(prompt, correctIndex, reverse = false) {
  const values = reverse ? ["small", "middle", "big"] : ["small", "middle", "big"];
  return {
    prompt,
    correct: values[correctIndex],
    stage: `<div class="size-board">${values.map((value) => `<span class="size-ball ${value}"></span>`).join("")}</div>`,
    answers: values.map((value) => ({
      value,
      html: `<span class="size-ball ${value}"></span>`,
      label: value,
    })),
  };
}

function pattern(prompt, sequence, correct, options) {
  return {
    prompt,
    correct,
    stage: `<div class="pattern-row">${sequence.map((item) => `<span>${item}</span>`).join("")}<span class="missing">?</span></div>`,
    answers: options.map((value) => ({
      value,
      html: `<span class="emoji">${value}</span>`,
      label: value,
    })),
  };
}

function shadow(prompt, correct, options) {
  return {
    prompt,
    correct,
    stage: `<div class="shadow-stage"><span>${correct}</span><span>${correct}</span></div>`,
    answers: options.map((value) => ({
      value,
      html: `<span class="emoji">${value}</span>`,
      label: value,
    })),
  };
}

function shuffle(items) {
  const array = [...items];
  for (let index = array.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[swapIndex]] = [array[swapIndex], array[index]];
  }
  return array;
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch((error) => {
        console.error("Registrace service workeru selhala:", error);
      });
    });
  }
}
