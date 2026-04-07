const TARGET_SCORE = 100;
const STARTING_LIVES = 3;
const CORRECT_POINTS = 5;
const CORRECT_BONUS_THRESHOLD = 5;
const CORRECT_BONUS_POINTS = 15;
const SPEED_BONUS_THRESHOLD = 3;
const SPEED_BONUS_POINTS = 15;
const SPEED_WINDOW_MS = 10_000;

const DATA_SOURCES = {
  math: "./matematika_400_pro_deti_upraveno.json",
  top: "./TOP_500_dataset_OPRAVENY.json",
};

const SUBJECTS = [
  {
    id: "math",
    title: "Matika",
    description: "Počítání, násobení, dělení a slovní příklady.",
  },
  {
    id: "science",
    title: "Přírodověda",
    description: "Zvířata a příroda.",
  },
  {
    id: "other",
    title: "Ostatní",
    description: "Logika, svět a Česká republika.",
  },
  {
    id: "all",
    title: "Vše dohromady",
    description: "Smíchané otázky ze všech sad.",
  },
];

const PHASES = [
  {
    id: 0,
    introVideo: "./assets/rabbit-01.mp4",
    successVideo: "./assets/rabbit-02.mp4",
    promptLabel: "Králíček prosí o pomoc",
    promptTitle: "Je mi špatně a motá se mi hlava.",
    promptText: "Pomůžeš mi a uzdravíš mě?",
    promptImage: "./assets/rabbit-prompt-04.png",
  },
  {
    id: 1,
    successVideo: "./assets/rabbit-03.mp4",
    promptLabel: "Králíčkovi je lépe",
    promptTitle: "Už je mi lépe, ale ještě trošku jsem nemocný.",
    promptText: "Pomůžeš mi ještě?",
    promptImage: "./assets/rabbit-prompt-03.png",
  },
  {
    id: 2,
    successVideo: "./assets/rabbit-04.mp4",
    promptLabel: "Králíček je skoro zdravý",
    promptTitle: "Už jsem skoro zdravý, jen se mi ještě trošku motá hlava.",
    promptText: "Pomůžeš mi ještě?",
    promptImage: "./assets/rabbit-prompt-02.png",
  },
];

const state = {
  datasets: null,
  selectedGrade: null,
  selectedSubject: null,
  deck: [],
  questionIndex: 0,
  currentPhase: 0,
  phaseScore: 0,
  lives: STARTING_LIVES,
  phaseCorrectCount: 0,
  speedStreak: 0,
  speedTimestamps: [],
  answered: false,
  pendingAfterVideo: null,
};

const screens = [...document.querySelectorAll(".screen")];
const subjectChoices = document.querySelector("#subjectChoices");
const selectedSubjectLabel = document.querySelector("#selectedSubjectLabel");
const storyVideo = document.querySelector("#storyVideo");
const promptStageLabel = document.querySelector("#promptStageLabel");
const rabbitPromptImage = document.querySelector("#rabbitPromptImage");
const rabbitPromptTitle = document.querySelector("#rabbitPromptTitle");
const rabbitPromptText = document.querySelector("#rabbitPromptText");
const livesLabel = document.querySelector("#livesLabel");
const scoreLabel = document.querySelector("#scoreLabel");
const phaseLabel = document.querySelector("#phaseLabel");
const scoreFill = document.querySelector("#scoreFill");
const questionCounter = document.querySelector("#questionCounter");
const questionText = document.querySelector("#questionText");
const answers = document.querySelector("#answers");
const feedback = document.querySelector("#feedback");
const bonusPop = document.querySelector("#bonusPop");

initializeApp().catch((error) => {
  console.error(error);
  alert("Nepodařilo se načíst otázky. Zkontroluj prosím JSON soubory.");
});

async function initializeApp() {
  registerServiceWorker();
  bindEvents();
  state.datasets = await loadDatasets();
  renderSubjects();
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

function bindEvents() {
  document.querySelector("[data-grade='3']").addEventListener("click", () => {
    state.selectedGrade = 3;
    showScreen("subject");
  });

  document.querySelector("[data-mode='heal-rabbit']").addEventListener("click", () => {
    showScreen("description");
  });

  document.querySelector("[data-action='start-intro']").addEventListener("click", () => {
    startGameRun();
    playVideo(PHASES[0].introVideo, "intro-prompt");
  });

  document.querySelector("[data-action='confirm-rabbit-help']").addEventListener("click", () => {
    beginPhaseQuestions();
  });

  document.querySelector("[data-action='skip-video']").addEventListener("click", finishVideoStep);
  storyVideo.addEventListener("ended", finishVideoStep);

  document.querySelectorAll("[data-action='home']").forEach((button) => {
    button.addEventListener("click", goHome);
  });

  document.querySelector("[data-action='restart-game']").addEventListener("click", () => {
    startGameRun();
    beginPhaseQuestions();
  });

  document.querySelectorAll("[data-screen-target]").forEach((button) => {
    button.addEventListener("click", () => showScreen(button.dataset.screenTarget));
  });
}

async function loadDatasets() {
  const [mathData, topData] = await Promise.all([
    fetch(DATA_SOURCES.math).then((response) => response.json()),
    fetch(DATA_SOURCES.top).then((response) => response.json()),
  ]);

  return {
    math: normalizeQuestions(mathData.questions, "math"),
    top: normalizeQuestions(topData.questions, "top"),
  };
}

function normalizeQuestions(questions, source) {
  return questions.map((question) => ({
    id: `${source}-${question.id}`,
    text: question.question,
    options: question.options,
    correctIndex: question.correct_index,
    category: question.category,
    source,
  }));
}

function renderSubjects() {
  subjectChoices.innerHTML = "";

  SUBJECTS.forEach((subject) => {
    const button = document.createElement("button");
    button.className = "choice-card";
    button.type = "button";
    button.innerHTML = `<span>${subject.title}</span><small>${subject.description}</small>`;
    button.addEventListener("click", () => selectSubject(subject));
    subjectChoices.appendChild(button);
  });
}

function selectSubject(subject) {
  state.selectedSubject = subject.id;
  selectedSubjectLabel.textContent = subject.title;
  showScreen("mode");
}

function startGameRun() {
  state.deck = shuffle(getQuestionsForSubject(state.selectedSubject));
  state.questionIndex = 0;
  state.currentPhase = 0;
  resetPhaseState();
}

function getQuestionsForSubject(subjectId) {
  const math = state.datasets.math;
  const top = state.datasets.top;
  const scienceCategories = new Set(["zvířata", "příroda"]);
  const otherCategories = new Set(["logika", "svět", "ČR"]);

  if (subjectId === "math") {
    return math;
  }

  if (subjectId === "science") {
    return top.filter((question) => scienceCategories.has(question.category));
  }

  if (subjectId === "other") {
    return top.filter((question) => otherCategories.has(question.category));
  }

  return [...math, ...top];
}

function playVideo(src, afterVideo) {
  state.pendingAfterVideo = afterVideo;
  storyVideo.src = src;
  storyVideo.currentTime = 0;
  showScreen("video");

  const playPromise = storyVideo.play();
  if (playPromise?.catch) {
    playPromise.catch(() => {
      storyVideo.setAttribute("controls", "controls");
    });
  }
}

function finishVideoStep() {
  storyVideo.pause();
  storyVideo.removeAttribute("controls");

  if (state.pendingAfterVideo === "intro-prompt") {
    renderRabbitPrompt(PHASES[0]);
    showScreen("rabbit-prompt");
    return;
  }

  if (state.pendingAfterVideo === "phase-complete") {
    const nextPhaseIndex = state.currentPhase + 1;
    if (nextPhaseIndex >= PHASES.length) {
      showScreen("complete");
      return;
    }

    state.currentPhase = nextPhaseIndex;
    renderRabbitPrompt(PHASES[state.currentPhase]);
    showScreen("rabbit-prompt");
  }
}

function renderRabbitPrompt(phase) {
  promptStageLabel.textContent = phase.promptLabel;
  rabbitPromptImage.src = phase.promptImage;
  rabbitPromptTitle.textContent = phase.promptTitle;
  rabbitPromptText.textContent = phase.promptText;
}

function beginPhaseQuestions() {
  resetPhaseState();
  showScreen("quiz");
  renderQuestion();
}

function resetPhaseState() {
  state.phaseScore = 0;
  state.lives = STARTING_LIVES;
  state.phaseCorrectCount = 0;
  state.speedStreak = 0;
  state.speedTimestamps = [];
  state.answered = false;
  updateHud();
}

function renderQuestion() {
  const question = getNextQuestion();
  state.answered = false;
  feedback.hidden = true;
  feedback.textContent = "";
  feedback.className = "feedback";

  phaseLabel.textContent = `Léčení ${state.currentPhase + 1}/3`;
  questionCounter.textContent = `Otázka ${state.questionIndex}`;
  questionText.textContent = question.text;
  answers.innerHTML = "";

  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-button";
    button.textContent = option;
    button.addEventListener("click", () => answerQuestion(index, button, question));
    answers.appendChild(button);
  });

  updateHud();
}

function getNextQuestion() {
  if (state.questionIndex >= state.deck.length) {
    state.deck = shuffle(getQuestionsForSubject(state.selectedSubject));
    state.questionIndex = 0;
  }

  const question = state.deck[state.questionIndex];
  state.questionIndex += 1;
  return question;
}

async function answerQuestion(selectedIndex, clickedButton, question) {
  if (state.answered) {
    return;
  }

  state.answered = true;
  const isCorrect = selectedIndex === question.correctIndex;

  [...answers.querySelectorAll(".answer-button")].forEach((button, index) => {
    button.disabled = true;
    if (index === question.correctIndex) {
      button.classList.add("correct");
    }
  });

  if (isCorrect) {
    clickedButton.classList.add("correct");
    await handleCorrectAnswer();
  } else {
    clickedButton.classList.add("wrong");
    handleWrongAnswer(question.options[question.correctIndex]);
  }

  updateHud();

  if (state.lives <= 0) {
    window.setTimeout(() => showScreen("fail"), 900);
    return;
  }

  if (state.phaseScore >= TARGET_SCORE) {
    window.setTimeout(() => {
      playVideo(PHASES[state.currentPhase].successVideo, "phase-complete");
    }, 900);
    return;
  }

  window.setTimeout(renderQuestion, 900);
}

async function handleCorrectAnswer() {
  const now = Date.now();
  state.phaseScore = Math.min(TARGET_SCORE, state.phaseScore + CORRECT_POINTS);
  state.phaseCorrectCount += 1;
  state.speedStreak += 1;
  state.speedTimestamps.push(now);
  feedback.textContent = `Správně. Králíček získal ${CORRECT_POINTS} bodů.`;
  feedback.classList.add("good");

  if (state.phaseCorrectCount % CORRECT_BONUS_THRESHOLD === 0) {
    await showBonus(`BONUS ZA SPRÁVNÉ ODPOVĚDI\n+${CORRECT_BONUS_POINTS}`);
    state.phaseScore = Math.min(TARGET_SCORE, state.phaseScore + CORRECT_BONUS_POINTS);
  }

  if (state.speedStreak % SPEED_BONUS_THRESHOLD === 0) {
    const startIndex = state.speedTimestamps.length - SPEED_BONUS_THRESHOLD;
    if (now - state.speedTimestamps[startIndex] <= SPEED_WINDOW_MS) {
      await showBonus(`BONUS ZA RYCHLOST\n+${SPEED_BONUS_POINTS}`);
      state.phaseScore = Math.min(TARGET_SCORE, state.phaseScore + SPEED_BONUS_POINTS);
    }
  }
}

function handleWrongAnswer(correctAnswer) {
  state.lives -= 1;
  state.speedStreak = 0;
  state.speedTimestamps = [];
  feedback.textContent = `To nevyšlo. Správná odpověď je: ${correctAnswer}`;
  feedback.classList.add("bad");
}

function showBonus(text) {
  return new Promise((resolve) => {
    bonusPop.textContent = text;
    bonusPop.hidden = false;
    window.setTimeout(() => {
      bonusPop.hidden = true;
      resolve();
    }, 950);
  });
}

function updateHud() {
  livesLabel.textContent = "❤️".repeat(state.lives) + "🤍".repeat(STARTING_LIVES - state.lives);
  scoreLabel.textContent = `${state.phaseScore}/${TARGET_SCORE}`;
  scoreFill.style.width = `${state.phaseScore}%`;
}

function goHome() {
  storyVideo.pause();
  state.selectedGrade = null;
  state.selectedSubject = null;
  state.deck = [];
  state.questionIndex = 0;
  state.currentPhase = 0;
  state.pendingAfterVideo = null;
  resetPhaseState();
  showScreen("grade");
}

function showScreen(screenName) {
  screens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.dataset.screen === screenName);
  });
}

function shuffle(items) {
  const array = [...items];

  for (let index = array.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[swapIndex]] = [array[swapIndex], array[index]];
  }

  return array;
}
