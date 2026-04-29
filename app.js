const TARGET_SCORE = 100;
const STARTING_LIVES = 3;
const CORRECT_POINTS = 5;
const CORRECT_BONUS_THRESHOLD = 5;
const CORRECT_BONUS_POINTS = 15;
const SMALL_REWARD_THRESHOLD = 2;
const SMALL_REWARDS_BEFORE_BIG = 3;
const SPEED_BONUS_THRESHOLD = 3;
const SPEED_BONUS_POINTS = 15;
const SPEED_WINDOW_MS = 10_000;
const REWARD_DISPLAY_MS = 3400;
const MAX_SAVED_RABBITS = 3;

const DATA_SOURCES = {
  math: "./matematika_400_pro_deti_upraveno.json",
  top: "./TOP_500_dataset_OPRAVENY.json",
};

const RABBIT_ROOM_IMAGES = [
  "./assets/rabbit-prompt-04.png",
  "./assets/rabbit-prompt-03.png",
  "./assets/rabbit-prompt-04.png",
];

const IMAGE_QUESTIONS = [
  {
    id: "image-horse-name",
    text: "Co je to za zvíře?",
    image: "./assets/question-images/horse.jpg",
    imageAlt: "Bílý kůň u ohrady",
    options: ["kůň", "kráva", "pes"],
    correctAnswer: "kůň",
    acceptedAnswers: ["kun", "konik", "koník"],
    category: "zvířata",
    source: "image",
  },
  {
    id: "image-horse-group",
    text: "Do jaké skupiny živočichů patří zvíře na obrázku?",
    image: "./assets/question-images/horse.jpg",
    imageAlt: "Bílý kůň u ohrady",
    options: ["savec", "pták", "ryba"],
    correctAnswer: "savec",
    acceptedAnswers: ["savci"],
    category: "zvířata",
    source: "image",
  },
  {
    id: "image-dog-name",
    text: "Co je to za zvíře?",
    image: "./assets/question-images/dog.jpg",
    imageAlt: "Malý pes sedí venku v trávě",
    options: ["pes", "kočka", "kůň"],
    correctAnswer: "pes",
    acceptedAnswers: ["pejsek"],
    category: "zvířata",
    source: "image",
  },
  {
    id: "image-dog-group",
    text: "Do jaké skupiny živočichů patří zvíře na obrázku?",
    image: "./assets/question-images/dog.jpg",
    imageAlt: "Malý pes sedí venku v trávě",
    options: ["savec", "plaz", "hmyz"],
    correctAnswer: "savec",
    acceptedAnswers: ["savci"],
    category: "zvířata",
    source: "image",
  },
  {
    id: "image-cat-name",
    text: "Co je to za zvíře?",
    image: "./assets/question-images/cat.jpg",
    imageAlt: "Kočka leží na sešitě",
    options: ["kočka", "pes", "kráva"],
    correctAnswer: "kočka",
    acceptedAnswers: ["kocka", "kočička", "kocicka"],
    category: "zvířata",
    source: "image",
  },
  {
    id: "image-cat-group",
    text: "Do jaké skupiny živočichů patří zvíře na obrázku?",
    image: "./assets/question-images/cat.jpg",
    imageAlt: "Kočka leží na sešitě",
    options: ["savec", "obojživelník", "ryba"],
    correctAnswer: "savec",
    acceptedAnswers: ["savci"],
    category: "zvířata",
    source: "image",
  },
  {
    id: "image-cow-name",
    text: "Co je to za zvíře?",
    image: "./assets/question-images/cow.jpg",
    imageAlt: "Krávy stojí na louce",
    options: ["kráva", "kůň", "kočka"],
    correctAnswer: "kráva",
    acceptedAnswers: ["krava"],
    category: "zvířata",
    source: "image",
  },
  {
    id: "image-cow-group",
    text: "Do jaké skupiny živočichů patří zvíře na obrázku?",
    image: "./assets/question-images/cow.jpg",
    imageAlt: "Krávy stojí na louce",
    options: ["savec", "pták", "plaz"],
    correctAnswer: "savec",
    acceptedAnswers: ["savci"],
    category: "zvířata",
    source: "image",
  },
];

const ADVENTURES = [
  { id: "rabbit", title: "Uzdrav králíčka" },
];

const GRADES = [
  { id: "preschool", title: "Předškolák", description: "Brzy", locked: true },
  { id: "1", title: "1. ročník", description: "Brzy", locked: true },
  { id: "2", title: "2. ročník", description: "Brzy", locked: true },
  { id: "3", title: "3. ročník", description: "Otevřeno", locked: false },
  { id: "4", title: "4. ročník", description: "Brzy", locked: true },
  { id: "5", title: "5. ročník", description: "Brzy", locked: true },
];

const SUBJECTS_BY_GRADE = {
  "3": [
    { id: "math", title: "Matika", description: "Počítání, násobení a dělení.", locked: false },
    { id: "czech", title: "Čeština", description: "Brzy", locked: true },
    { id: "science", title: "Přírodověda", description: "Zvířata a příroda.", locked: false },
    { id: "logic", title: "Logika", description: "Přemýšlení a řešení úkolů.", locked: false },
    { id: "other", title: "Ostatní", description: "Svět, ČR a všeobecné znalosti.", locked: false },
    { id: "all", title: "Vše dohromady", description: "Smíchané otázky ze všech sad.", locked: false },
  ],
};

const PHASES = [
  {
    id: 0,
    introVideo: "./assets/rabbit-story/1.mp4",
    treatmentVideo: "./assets/rabbit-story/6.mp4",
    treatmentLabel: "Velká léčba: králíček dostává první pomoc",
    successVideo: "./assets/rabbit-story/2.mp4",
    rewards: [
      { type: "tea", title: "Teplý čaj", text: "Mícháš králíčkovi léčivý čaj." },
      { type: "bottle", title: "Pitíčko", text: "Naléváš čaj do malého pitíčka." },
      { type: "vitamins", title: "Vitamíny", text: "Sbíráš první vitamíny na posílení." },
    ],
  },
  {
    id: 1,
    treatmentVideo: "./assets/rabbit-story/5.mp4",
    treatmentLabel: "Velká léčba: vitamíny začínají zabírat",
    successVideo: "./assets/rabbit-story/3.mp4",
    rewards: [
      { type: "medicine", title: "Medicína", text: "Mícháš kapku medicíny." },
      { type: "compress", title: "Obklad", text: "Přikládáš chladivý obklad." },
      { type: "blanket", title: "Deka", text: "Přikrýváš králíčka měkkou dekou." },
    ],
  },
  {
    id: 2,
    treatmentVideo: "./assets/rabbit-story/7.mp4",
    treatmentLabel: "Velká léčba: poslední dávka síly",
    successVideo: "./assets/rabbit-story/4.mp4",
    rewards: [
      { type: "carrot", title: "Mrkev", text: "Přinášíš králíčkovi kousek mrkve." },
      { type: "air", title: "Čerstvý vzduch", text: "Pouštíš do pelíšku čerstvý vzduch." },
      { type: "stars", title: "Síla", text: "Králíček dostává poslední kousek síly." },
    ],
  },
];

const state = {
  datasets: null,
  selectedAdventure: null,
  selectedGrade: null,
  selectedSubject: null,
  deck: [],
  questionIndex: 0,
  currentPhase: 0,
  phaseScore: 0,
  lives: STARTING_LIVES,
  phaseCorrectCount: 0,
  smallRewardCorrectCount: 0,
  smallRewardsEarned: 0,
  bigTreatmentSeen: false,
  speedStreak: 0,
  speedTimestamps: [],
  answered: false,
  currentAnswerMode: "choice",
  pendingAfterVideo: null,
  savedRabbits: loadSavedRabbits(),
  lastSavedRabbitIndex: null,
  runToken: 0,
};

const screens = [...document.querySelectorAll(".screen")];
const homeButton = document.querySelector("#homeButton");
const speakButton = document.querySelector("#speakButton");
const gradeChoices = document.querySelector("#gradeChoices");
const subjectChoices = document.querySelector("#subjectChoices");
const selectedAdventureLabel = document.querySelector("#selectedAdventureLabel");
const selectedGradeLabel = document.querySelector("#selectedGradeLabel");
const selectedSubjectLabel = document.querySelector("#selectedSubjectLabel");
const storyVideo = document.querySelector("#storyVideo");
const videoCaption = document.querySelector("#videoCaption");
const livesLabel = document.querySelector("#livesLabel");
const scoreLabel = document.querySelector("#scoreLabel");
const phaseLabel = document.querySelector("#phaseLabel");
const scoreFill = document.querySelector("#scoreFill");
const questionCard = document.querySelector(".question-card");
const questionCounter = document.querySelector("#questionCounter");
const questionImageWrap = document.querySelector("#questionImageWrap");
const questionImage = document.querySelector("#questionImage");
const questionText = document.querySelector("#questionText");
const answers = document.querySelector("#answers");
const feedback = document.querySelector("#feedback");
const rewardStrip = document.querySelector("#rewardStrip");
const rewardPop = document.querySelector("#rewardPop");
const roomScene = document.querySelector("#roomScene");
const roomTitle = document.querySelector("#roomTitle");
const roomText = document.querySelector("#roomText");
const roomAction = document.querySelector("#roomAction");
const roomHome = document.querySelector("#roomHome");

initializeApp().catch((error) => {
  console.error(error);
  alert("Nepodařilo se načíst otázky. Zkontroluj prosím JSON soubory.");
});

async function initializeApp() {
  registerServiceWorker();
  bindEvents();
  state.datasets = await loadDatasets();
  renderGradeChoices();
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
  document.querySelector("[data-adventure='rabbit']").addEventListener("click", () => {
    state.selectedAdventure = "rabbit";
    selectedAdventureLabel.textContent = ADVENTURES[0].title;
    showScreen("grade");
  });

  document.querySelector("[data-action='start-intro']").addEventListener("click", () => {
    startGameRun();
    playVideo(PHASES[0].introVideo, "start-phase");
  });

  document.querySelector("[data-action='skip-video']").addEventListener("click", finishVideoStep);
  storyVideo.addEventListener("ended", finishVideoStep);
  homeButton.addEventListener("click", goHome);
  speakButton.addEventListener("click", speakCurrentScreen);
  roomAction.addEventListener("click", startAnotherRabbit);
  roomHome.addEventListener("click", goHome);

  document.querySelector("[data-action='restart-game']").addEventListener("click", () => {
    startGameRun();
    beginPhaseQuestions();
  });

  document.querySelectorAll("[data-screen-target]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.screenTarget === "adventure") {
        resetNavigationToHome();
      }
      showScreen(button.dataset.screenTarget);
    });
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
    correctAnswer: question.options[question.correct_index],
    acceptedAnswers: question.acceptedAnswers ?? question.accepted_answers ?? [],
    image: question.image ?? null,
    imageAlt: question.imageAlt ?? "",
    category: question.category,
    source,
  }));
}

function renderGradeChoices() {
  gradeChoices.innerHTML = "";

  GRADES.forEach((grade) => {
    const button = buildChoiceButton(grade.title, grade.description, grade.locked);
    button.addEventListener("click", () => {
      if (grade.locked) {
        return;
      }

      state.selectedGrade = grade.id;
      selectedGradeLabel.textContent = grade.title;
      renderSubjectChoices();
      showScreen("subject");
    });
    gradeChoices.appendChild(button);
  });
}

function renderSubjectChoices() {
  subjectChoices.innerHTML = "";
  const subjects = SUBJECTS_BY_GRADE[state.selectedGrade] ?? [];

  subjects.forEach((subject) => {
    const button = buildChoiceButton(subject.title, subject.description, subject.locked);
    button.addEventListener("click", () => {
      if (subject.locked) {
        return;
      }

      state.selectedSubject = subject.id;
      selectedSubjectLabel.textContent = subject.title;
      showScreen("description");
    });
    subjectChoices.appendChild(button);
  });
}

function buildChoiceButton(title, description, locked) {
  const button = document.createElement("button");
  button.className = locked ? "choice-card locked" : "choice-card";
  button.type = "button";
  button.disabled = locked;
  button.innerHTML = `<span>${locked ? "🔒 " : ""}${title}</span><small>${description}</small>`;
  return button;
}

function startGameRun() {
  state.runToken += 1;
  state.deck = shuffle(getQuestionsForSubject(state.selectedSubject));
  state.questionIndex = 0;
  state.currentPhase = 0;
  resetPhaseState();
}

function getQuestionsForSubject(subjectId) {
  const math = state.datasets.math;
  const top = state.datasets.top;
  const scienceCategories = new Set(["zvířata", "příroda"]);
  const logicCategories = new Set(["logika"]);
  const otherCategories = new Set(["svět", "ČR"]);

  if (subjectId === "math") {
    return math;
  }

  if (subjectId === "science") {
    return [
      ...top.filter((question) => scienceCategories.has(question.category)),
      ...IMAGE_QUESTIONS,
    ];
  }

  if (subjectId === "logic") {
    return top.filter((question) => logicCategories.has(question.category));
  }

  if (subjectId === "other") {
    return top.filter((question) => otherCategories.has(question.category));
  }

  return [...math, ...top, ...IMAGE_QUESTIONS];
}

function playVideo(src, afterVideo, caption = "") {
  state.pendingAfterVideo = afterVideo;
  storyVideo.src = src;
  storyVideo.currentTime = 0;
  videoCaption.textContent = caption;
  videoCaption.hidden = !caption;
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
  videoCaption.hidden = true;
  const pendingStep = state.pendingAfterVideo;
  state.pendingAfterVideo = null;

  if (pendingStep === "start-phase") {
    beginPhaseQuestions();
    return;
  }

  if (pendingStep === "resume-quiz") {
    showScreen("quiz");
    renderQuestion();
    return;
  }

  if (pendingStep === "phase-complete") {
    const nextPhaseIndex = state.currentPhase + 1;
    if (nextPhaseIndex >= PHASES.length) {
      completeRabbitRescue();
      return;
    }

    state.currentPhase = nextPhaseIndex;
    beginPhaseQuestions();
  }
}

function beginPhaseQuestions() {
  resetPhaseState();
  showScreen("quiz");
  renderQuestion();
}

function completeRabbitRescue() {
  const nextCount = Math.min(MAX_SAVED_RABBITS, state.savedRabbits + 1);
  state.lastSavedRabbitIndex = nextCount - 1;
  state.savedRabbits = nextCount;
  saveSavedRabbits();
  renderRabbitRoom();
  showScreen("room");
}

function startAnotherRabbit() {
  if (state.savedRabbits >= MAX_SAVED_RABBITS) {
    goHome();
    return;
  }

  startGameRun();
  playVideo(PHASES[0].introVideo, "start-phase");
}

function renderRabbitRoom() {
  const savedCount = state.savedRabbits;
  const allSaved = savedCount >= MAX_SAVED_RABBITS;

  roomTitle.textContent = allSaved
    ? "Všichni tři králíčci jsou v bezpečí"
    : savedCount === 1
      ? "První králíček je v pokoji"
      : "Dva králíčci už jsou v pokoji";
  roomText.textContent = allSaved
    ? "Pokoj je plný radosti. Všichni tři králíčci jsou zdraví a odpočívají."
    : "Chceš zachránit dalšího králíčka?";
  roomAction.textContent = allSaved ? "Zpět na začátek" : "Zachránit dalšího králíčka";

  roomScene.innerHTML = `
    <div class="room-window">
      <span></span>
      <span></span>
    </div>
    <div class="room-shelf">
      <span class="room-plant"></span>
      <span class="room-book one"></span>
      <span class="room-book two"></span>
    </div>
    <div class="room-floor"></div>
    <div class="room-rug"></div>
    <div class="room-rabbits">
      ${Array.from({ length: MAX_SAVED_RABBITS }, (_, index) => renderRoomRabbit(index)).join("")}
    </div>
  `;
}

function renderRoomRabbit(index) {
  if (index >= state.savedRabbits) {
    return `
      <div class="room-rabbit-slot empty slot-${index + 1}">
        <span>volný pelíšek</span>
      </div>
    `;
  }

  const isNew = index === state.lastSavedRabbitIndex;
  return `
    <div class="room-rabbit-slot filled slot-${index + 1} ${isNew ? "new-arrival" : ""}">
      <img src="${RABBIT_ROOM_IMAGES[index]}" alt="Zachráněný králíček ${index + 1}" />
      <span class="room-pillow"></span>
    </div>
  `;
}

function goHome() {
  resetNavigationToHome();
  showScreen("adventure");
}

function loadSavedRabbits() {
  try {
    const value = Number(window.localStorage.getItem("savedRabbits") ?? 0);
    return Number.isFinite(value) ? Math.min(MAX_SAVED_RABBITS, Math.max(0, value)) : 0;
  } catch {
    return 0;
  }
}

function saveSavedRabbits() {
  try {
    window.localStorage.setItem("savedRabbits", String(state.savedRabbits));
  } catch {
    // Hra funguje i bez localStorage, jen se pokoj po zavření neuloží.
  }
}

function resetPhaseState() {
  state.phaseScore = 0;
  state.lives = STARTING_LIVES;
  state.phaseCorrectCount = 0;
  state.smallRewardCorrectCount = 0;
  state.smallRewardsEarned = 0;
  state.bigTreatmentSeen = false;
  state.speedStreak = 0;
  state.speedTimestamps = [];
  state.answered = false;
  state.currentAnswerMode = "choice";
  updateHud();
  renderRewardStrip();
}

function renderQuestion() {
  const question = getNextQuestion();
  const questionNumber = state.questionIndex;
  state.currentAnswerMode = questionNumber % 3 === 0 ? "text" : "choice";
  state.answered = false;
  feedback.hidden = true;
  feedback.textContent = "";
  feedback.className = "feedback";

  phaseLabel.textContent = `Léčení ${state.currentPhase + 1}/3`;
  questionCounter.textContent = state.currentAnswerMode === "text"
    ? `Otázka ${questionNumber} - napiš odpověď`
    : `Otázka ${questionNumber}`;
  questionText.textContent = question.text;
  answers.innerHTML = "";
  answers.className = state.currentAnswerMode === "text" ? "answers text-mode" : "answers";
  renderQuestionImage(question);

  if (state.currentAnswerMode === "text") {
    renderTextAnswer(question);
  } else {
    renderChoiceAnswers(question);
  }

  updateHud();
}

function renderQuestionImage(question) {
  questionCard.classList.toggle("has-image", Boolean(question.image));
  questionImageWrap.hidden = !question.image;
  questionImage.src = question.image ?? "";
  questionImage.alt = question.imageAlt ?? "";
}

function renderChoiceAnswers(question) {
  const shuffledOptions = shuffle(
    question.options.map((option) => ({
      text: option,
      isCorrect: option === question.correctAnswer,
    })),
  );

  shuffledOptions.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-button";
    button.textContent = `${String.fromCharCode(65 + index)}. ${option.text}`;
    button.dataset.answerText = option.text;
    button.addEventListener("click", () => answerQuestion(option, button, question));
    answers.appendChild(button);
  });
}

function renderTextAnswer(question) {
  const inputMode = /^[0-9\s.,:-]+$/.test(String(question.correctAnswer)) ? "decimal" : "text";
  const form = document.createElement("form");
  form.className = "written-answer";
  form.innerHTML = `
    <label for="writtenAnswer">Napiš odpověď</label>
    <input id="writtenAnswer" class="written-input" type="text" autocomplete="off" inputmode="${inputMode}" enterkeyhint="done" />
    <button class="written-submit" type="submit">Zkontrolovat</button>
  `;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = form.querySelector(".written-input");
    const value = input.value.trim();

    if (!value) {
      input.focus();
      return;
    }

    answerQuestion(
      {
        text: value,
        isCorrect: isWrittenAnswerCorrect(question, value),
      },
      form,
      question,
    );
  });

  answers.appendChild(form);
  form.querySelector(".written-input").focus({ preventScroll: true });
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

async function answerQuestion(selectedOption, clickedButton, question) {
  if (state.answered) {
    return;
  }

  state.answered = true;
  const activeRun = state.runToken;
  const isCorrect = selectedOption.isCorrect;

  [...answers.querySelectorAll(".answer-button")].forEach((button) => {
    button.disabled = true;
    if (button.dataset.answerText === question.correctAnswer) {
      button.classList.add("correct");
    }
  });

  [...answers.querySelectorAll("input, button")].forEach((control) => {
    control.disabled = true;
  });

  let shouldPlayBigTreatment = false;

  if (isCorrect) {
    clickedButton.classList.add("correct");
    shouldPlayBigTreatment = await handleCorrectAnswer();
  } else {
    clickedButton.classList.add("wrong");
    handleWrongAnswer(question.correctAnswer);
  }

  updateHud();

  if (activeRun !== state.runToken) {
    return;
  }

  if (state.lives <= 0) {
    window.setTimeout(() => {
      if (activeRun === state.runToken) {
        showScreen("fail");
      }
    }, 900);
    return;
  }

  if (state.phaseScore >= TARGET_SCORE) {
    window.setTimeout(() => {
      if (activeRun === state.runToken) {
        playVideo(PHASES[state.currentPhase].successVideo, "phase-complete");
      }
    }, 900);
    return;
  }

  if (shouldPlayBigTreatment) {
    window.setTimeout(() => {
      if (activeRun === state.runToken) {
        const phase = PHASES[state.currentPhase];
        playVideo(phase.treatmentVideo, "resume-quiz", phase.treatmentLabel);
      }
    }, 500);
    return;
  }

  window.setTimeout(() => {
    if (activeRun === state.runToken) {
      renderQuestion();
    }
  }, 900);
}

async function handleCorrectAnswer() {
  const now = Date.now();
  let shouldPlayBigTreatment = false;

  state.phaseScore = Math.min(TARGET_SCORE, state.phaseScore + CORRECT_POINTS);
  state.phaseCorrectCount += 1;
  state.smallRewardCorrectCount += 1;
  state.speedStreak += 1;
  state.speedTimestamps.push(now);
  feedback.textContent = `Správně. Králíček získal ${CORRECT_POINTS} bodů.`;
  feedback.classList.add("good");

  if (state.smallRewardCorrectCount >= SMALL_REWARD_THRESHOLD) {
    const reward = getCurrentReward();
    state.smallRewardCorrectCount = 0;
    state.smallRewardsEarned += 1;
    await showSmallReward(reward);
    renderRewardStrip();
  }

  if (state.phaseCorrectCount % CORRECT_BONUS_THRESHOLD === 0) {
    await showSmallReward({
      type: "stars",
      title: `Bonus +${CORRECT_BONUS_POINTS}`,
      text: "Pět správných odpovědí po sobě dodalo králíčkovi sílu.",
    });
    state.phaseScore = Math.min(TARGET_SCORE, state.phaseScore + CORRECT_BONUS_POINTS);
  }

  if (state.speedStreak % SPEED_BONUS_THRESHOLD === 0) {
    const startIndex = state.speedTimestamps.length - SPEED_BONUS_THRESHOLD;
    if (now - state.speedTimestamps[startIndex] <= SPEED_WINDOW_MS) {
      await showSmallReward({
        type: "vitamins",
        title: `Rychlost +${SPEED_BONUS_POINTS}`,
        text: "Tři rychlé odpovědi přinesly vitamínovou energii.",
      });
      state.phaseScore = Math.min(TARGET_SCORE, state.phaseScore + SPEED_BONUS_POINTS);
    }
  }

  if (
    !state.bigTreatmentSeen &&
    state.smallRewardsEarned >= SMALL_REWARDS_BEFORE_BIG
  ) {
    state.bigTreatmentSeen = true;
    shouldPlayBigTreatment = true;
  }

  return shouldPlayBigTreatment;
}

function getCurrentReward() {
  const phase = PHASES[state.currentPhase];
  const rewardIndex = Math.min(state.smallRewardsEarned, phase.rewards.length - 1);
  return phase.rewards[rewardIndex];
}

function handleWrongAnswer(correctAnswer) {
  state.lives -= 1;
  state.speedStreak = 0;
  state.speedTimestamps = [];
  feedback.textContent = `To nevyšlo. Správná odpověď je: ${correctAnswer}`;
  feedback.classList.add("bad");
}

function isWrittenAnswerCorrect(question, value) {
  const normalizedValue = normalizeWrittenAnswer(value);
  const acceptedAnswers = [question.correctAnswer, ...(question.acceptedAnswers ?? [])]
    .map(normalizeWrittenAnswer)
    .filter(Boolean);

  return acceptedAnswers.includes(normalizedValue);
}

function normalizeWrittenAnswer(value) {
  return String(value)
    .toLocaleLowerCase("cs-CZ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,;:!?()[\]{}"'`´]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function showSmallReward(reward) {
  return new Promise((resolve) => {
    rewardPop.innerHTML = `
      <div class="reward-card">
        <div class="reward-animation reward-${reward.type}">
          <span class="steam one"></span>
          <span class="steam two"></span>
          <span class="vitamin v1"></span>
          <span class="vitamin v2"></span>
          <span class="vitamin v3"></span>
          <span class="cup"></span>
          <span class="bottle"></span>
          <span class="blanket"></span>
          <span class="carrot"></span>
          <span class="spark s1"></span>
          <span class="spark s2"></span>
        </div>
        <h2>${reward.title}</h2>
        <p>${reward.text}</p>
      </div>
    `;
    rewardPop.hidden = false;
    window.setTimeout(() => {
      rewardPop.hidden = true;
      rewardPop.innerHTML = "";
      resolve();
    }, REWARD_DISPLAY_MS);
  });
}

function renderRewardStrip() {
  const phase = PHASES[state.currentPhase];
  rewardStrip.innerHTML = "";

  phase.rewards.forEach((reward, index) => {
    const item = document.createElement("span");
    item.className = index < state.smallRewardsEarned ? "reward-token earned" : "reward-token";
    item.textContent = reward.title;
    rewardStrip.appendChild(item);
  });
}

function updateHud() {
  livesLabel.textContent = "❤️".repeat(state.lives) + "🤍".repeat(STARTING_LIVES - state.lives);
  scoreLabel.textContent = `${state.phaseScore}/${TARGET_SCORE}`;
  scoreFill.style.width = `${state.phaseScore}%`;
}

function resetNavigationToHome() {
  state.runToken += 1;
  storyVideo.pause();
  storyVideo.removeAttribute("controls");
  videoCaption.hidden = true;
  rewardPop.hidden = true;
  rewardPop.innerHTML = "";
  state.selectedGrade = null;
  state.selectedSubject = null;
  state.deck = [];
  state.questionIndex = 0;
  state.currentPhase = 0;
  state.pendingAfterVideo = null;
  resetPhaseState();
}

function speakCurrentScreen() {
  if (!("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();
  const activeScreen = document.querySelector(".screen.is-active");
  const text = getSpeakText(activeScreen);
  if (!text) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "cs-CZ";
  utterance.rate = 0.92;
  window.speechSynthesis.speak(utterance);
}

function getSpeakText(screen) {
  if (!screen) {
    return "";
  }

  if (screen.dataset.screen === "quiz") {
    const imageText = questionImageWrap.hidden ? "" : `Na obrázku je: ${questionImage.alt}. `;
    const options = state.currentAnswerMode === "text"
      ? "Napiš odpověď do políčka."
      : [...answers.querySelectorAll(".answer-button")]
        .map((button, index) => `Možnost ${index + 1}: ${button.dataset.answerText}`)
        .join(". ");
    return `${imageText}${questionText.textContent}. ${options}`;
  }

  return [...screen.querySelectorAll(".eyebrow, h1, h2, .lead, .choice-card span, .choice-card small")]
    .filter((element) => !element.closest("[disabled]"))
    .map((element) => element.textContent.trim())
    .filter(Boolean)
    .join(". ");
}

function showScreen(screenName) {
  screens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.dataset.screen === screenName);
  });

  homeButton.hidden = screenName === "adventure";

  if (screenName !== "video") {
    storyVideo.pause();
  }
}

function shuffle(items) {
  const array = [...items];

  for (let index = array.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[swapIndex]] = [array[swapIndex], array[index]];
  }

  return array;
}
