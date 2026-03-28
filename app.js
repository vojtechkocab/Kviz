const DATA_URL = "./kviz_otazky_pro_aplikaci.json";
const TARGET_SCORE = 100;
const STARTING_LIVES = 3;
const CORRECT_POINTS = 5;
const STREAK_BONUS = 15;
const SPEED_BONUS = 15;
const STREAK_GOAL = 3;
const SPEED_WINDOW_MS = 10_000;

const state = {
  quizData: null,
  selectedPackId: null,
  selectedQuestionCount: null,
  selectedCategory: null,
  quizQuestions: [],
  currentQuestionIndex: 0,
  score: 0,
  lives: STARTING_LIVES,
  streak: 0,
  bestStreak: 0,
  streakTimestamps: [],
  answeredCurrent: false,
  timerIntervalId: null,
};

const screens = [...document.querySelectorAll(".screen")];
const packChoices = document.querySelector("#packChoices");
const questionCountChoices = document.querySelector("#questionCountChoices");
const categoryChoices = document.querySelector("#categoryChoices");
const selectedPackLabel = document.querySelector("#selectedPackLabel");
const selectedQuizSetupLabel = document.querySelector("#selectedQuizSetupLabel");
const goToQuestionCount = document.querySelector("#goToQuestionCount");
const goToCategory = document.querySelector("#goToCategory");
const startQuiz = document.querySelector("#startQuiz");
const questionIndex = document.querySelector("#questionIndex");
const quizPackName = document.querySelector("#quizPackName");
const scoreLabel = document.querySelector("#scoreLabel");
const livesLabel = document.querySelector("#livesLabel");
const streakLabel = document.querySelector("#streakLabel");
const progressFill = document.querySelector("#progressFill");
const timerLabel = document.querySelector("#timerLabel");
const rabbitAvatar = document.querySelector("#rabbitAvatar");
const rabbitStateLabel = document.querySelector("#rabbitStateLabel");
const rabbitStateText = document.querySelector("#rabbitStateText");
const questionText = document.querySelector("#questionText");
const answers = document.querySelector("#answers");
const feedback = document.querySelector("#feedback");
const nextQuestion = document.querySelector("#nextQuestion");
const resultHeading = document.querySelector("#resultHeading");
const resultSummary = document.querySelector("#resultSummary");
const resultRabbit = document.querySelector("#resultRabbit");
const finalScore = document.querySelector("#finalScore");
const finalLives = document.querySelector("#finalLives");
const finalStreak = document.querySelector("#finalStreak");
const finalRating = document.querySelector("#finalRating");
const resultMedia = document.querySelector("#resultMedia");
const winVideo = document.querySelector("#winVideo");
const choiceButtonTemplate = document.querySelector("#choiceButtonTemplate");

initializeApp().catch((error) => {
  console.error(error);
  alert("Nepodařilo se načíst otázky. Zkontroluj prosím JSON soubor.");
});

async function initializeApp() {
  registerServiceWorker();
  bindGlobalEvents();

  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Chyba při načítání dat: ${response.status}`);
  }

  state.quizData = await response.json();
  renderPackChoices();
  renderQuestionCountChoices();
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

function bindGlobalEvents() {
  goToQuestionCount.addEventListener("click", () => {
    const pack = getSelectedPack();
    if (!pack) {
      return;
    }

    selectedPackLabel.textContent = `Vybraná sada: ${pack.title}`;
    showScreen("count");
  });

  goToCategory.addEventListener("click", () => {
    const pack = getSelectedPack();
    if (!pack || !state.selectedQuestionCount) {
      return;
    }

    selectedQuizSetupLabel.textContent =
      `Vybraná sada: ${pack.title}, počet otázek: ${state.selectedQuestionCount}`;
    renderCategoryChoices();
    showScreen("category");
  });

  startQuiz.addEventListener("click", startNewQuiz);
  nextQuestion.addEventListener("click", handleNextQuestion);

  document.querySelectorAll("[data-action='back-to-welcome']").forEach((button) => {
    button.addEventListener("click", resetToStart);
  });

  document.querySelectorAll("[data-action='back-to-count']").forEach((button) => {
    button.addEventListener("click", () => showScreen("count"));
  });

  document.querySelectorAll("[data-action='restart']").forEach((button) => {
    button.addEventListener("click", resetToStart);
  });
}

function renderPackChoices() {
  const packs = state.quizData.packs ?? [];
  packChoices.innerHTML = "";

  packs.forEach((pack) => {
    const button = buildChoiceButton(
      pack.title,
      `${pack.questionCount} otázek`,
      () => {
        state.selectedPackId = pack.id;
        updateSelectedButton(packChoices, pack.id);
        goToQuestionCount.disabled = false;
      },
    );

    button.dataset.value = pack.id;
    packChoices.appendChild(button);
  });
}

function renderQuestionCountChoices() {
  const questionCounts = state.quizData.settings?.defaultQuestionCounts ?? [10, 20, 30];
  questionCountChoices.innerHTML = "";

  questionCounts.forEach((count) => {
    const button = buildChoiceButton(`${count}`, "otázek", () => {
      state.selectedQuestionCount = count;
      state.selectedCategory = null;
      updateSelectedButton(questionCountChoices, String(count));
      goToCategory.disabled = false;
      startQuiz.disabled = true;
    });

    button.dataset.value = String(count);
    questionCountChoices.appendChild(button);
  });
}

function renderCategoryChoices() {
  const pack = getSelectedPack();
  if (!pack) {
    return;
  }

  const grouped = groupQuestionsByCategory(pack.questions);
  categoryChoices.innerHTML = "";
  startQuiz.disabled = true;

  const choices = [
    {
      id: "all",
      title: "Všechno",
      subtitle: `${pack.questions.length} otázek`,
    },
    ...grouped.map((item) => ({
      id: item.id,
      title: formatCategoryLabel(item.id),
      subtitle: `${item.count} otázek`,
    })),
  ];

  choices.forEach((choice) => {
    const button = buildChoiceButton(choice.title, choice.subtitle, () => {
      state.selectedCategory = choice.id;
      updateSelectedButton(categoryChoices, choice.id);
      startQuiz.disabled = false;
    });

    button.dataset.value = choice.id;
    categoryChoices.appendChild(button);
  });
}

function buildChoiceButton(title, subtitle, onClick) {
  const button = choiceButtonTemplate.content.firstElementChild.cloneNode(true);
  button.innerHTML = `
    <span class="choice-title">${title}</span>
    <span class="choice-subtitle">${subtitle}</span>
  `;
  button.addEventListener("click", onClick);
  return button;
}

function updateSelectedButton(container, selectedValue) {
  [...container.querySelectorAll(".choice-button")].forEach((button) => {
    button.classList.toggle("selected", button.dataset.value === selectedValue);
  });
}

function startNewQuiz() {
  const pack = getSelectedPack();
  if (!pack || !state.selectedQuestionCount || !state.selectedCategory) {
    return;
  }

  const sourceQuestions =
    state.selectedCategory === "all"
      ? [...pack.questions]
      : pack.questions.filter((question) => question.category === state.selectedCategory);

  const randomizedQuestions = state.quizData.settings?.shuffleQuestions
    ? shuffle(sourceQuestions)
    : sourceQuestions;

  state.quizQuestions = randomizedQuestions.slice(0, state.selectedQuestionCount);
  state.currentQuestionIndex = 0;
  state.score = 0;
  state.lives = STARTING_LIVES;
  state.streak = 0;
  state.bestStreak = 0;
  state.streakTimestamps = [];
  state.answeredCurrent = false;

  quizPackName.textContent = pack.title;
  updateHud();
  showScreen("quiz");
  renderCurrentQuestion();
}

function renderCurrentQuestion() {
  const currentQuestion = state.quizQuestions[state.currentQuestionIndex];
  if (!currentQuestion) {
    finishQuiz("questions-finished");
    return;
  }

  state.answeredCurrent = false;
  nextQuestion.disabled = true;
  feedback.hidden = true;
  feedback.textContent = "";
  feedback.className = "feedback";

  questionIndex.textContent = `${state.currentQuestionIndex + 1} / ${state.quizQuestions.length}`;
  questionText.textContent = currentQuestion.text;
  updateHud();
  startQuestionTimer();

  answers.innerHTML = "";
  currentQuestion.options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-button";
    button.textContent = option.text;
    button.addEventListener("click", () => handleAnswer(option.id, button));
    answers.appendChild(button);
  });
}

function handleAnswer(selectedOptionId, clickedButton) {
  if (state.answeredCurrent) {
    return;
  }

  const currentQuestion = state.quizQuestions[state.currentQuestionIndex];
  const isCorrect = selectedOptionId === currentQuestion.correctOptionId;
  state.answeredCurrent = true;
  nextQuestion.disabled = false;
  stopQuestionTimer();

  [...answers.querySelectorAll(".answer-button")].forEach((button, index) => {
    const option = currentQuestion.options[index];
    button.disabled = true;

    if (option.id === currentQuestion.correctOptionId) {
      button.classList.add("correct");
    }
  });

  if (isCorrect) {
    clickedButton.classList.add("correct");
    handleCorrectAnswer();
  } else {
    clickedButton.classList.add("wrong");
    handleWrongAnswer(currentQuestion.correctText);
  }

  feedback.hidden = false;
  updateHud();

  if (state.score >= TARGET_SCORE) {
    finishQuiz("healed");
    return;
  }

  if (state.lives <= 0) {
    finishQuiz("no-lives");
  }
}

function handleCorrectAnswer() {
  const now = Date.now();
  state.streak += 1;
  state.bestStreak = Math.max(state.bestStreak, state.streak);
  state.streakTimestamps.push(now);

  let gainedPoints = CORRECT_POINTS;
  const messages = [`Správně. Králíček získal ${CORRECT_POINTS} bodů.`];

  if (state.streak % STREAK_GOAL === 0) {
    gainedPoints += STREAK_BONUS;
    messages.push(`Série 3 správných odpovědí: bonus +${STREAK_BONUS}.`);

    const thirdFromLastIndex = state.streakTimestamps.length - STREAK_GOAL;
    const streakWindowStart = state.streakTimestamps[thirdFromLastIndex];
    if (now - streakWindowStart <= SPEED_WINDOW_MS) {
      gainedPoints += SPEED_BONUS;
      messages.push(`Rychlá série do 10 sekund: bonus +${SPEED_BONUS}.`);
    }
  }

  state.score = Math.min(TARGET_SCORE, state.score + gainedPoints);
  feedback.textContent = messages.join(" ");
  feedback.classList.add("success");
}

function handleWrongAnswer(correctText) {
  state.lives -= 1;
  state.streak = 0;
  state.streakTimestamps = [];

  feedback.textContent =
    `To nevyšlo. Králíček přišel o jeden život. Správná odpověď je: ${correctText}`;
  feedback.classList.add("error");
}

function handleNextQuestion() {
  state.currentQuestionIndex += 1;

  if (state.currentQuestionIndex >= state.quizQuestions.length) {
    finishQuiz("questions-finished");
    return;
  }

  renderCurrentQuestion();
}

function finishQuiz(reason) {
  stopQuestionTimer();

  const result = getResultState(reason);
  resultHeading.textContent = result.heading;
  resultSummary.textContent = result.summary;
  resultRabbit.textContent = result.rabbit;
  finalScore.textContent = `${state.score} / ${TARGET_SCORE}`;
  finalLives.textContent = `${Math.max(state.lives, 0)} / ${STARTING_LIVES}`;
  finalStreak.textContent = String(state.bestStreak);
  finalRating.textContent = result.state;
  resultMedia.hidden = !result.showVideo;
  winVideo.pause();
  winVideo.currentTime = 0;

  if (result.showVideo) {
    const playPromise = winVideo.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {
        /* Prohlížeč může automatické přehrání zablokovat, ovládání zůstane viditelné. */
      });
    }
  }

  showScreen("result");
}

function getResultState(reason) {
  if (reason === "healed") {
    return {
      heading: "Králíček je zdravý",
      summary: "Povedlo se. Díky správným odpovědím získal plných 100 bodů a uzdravil se.",
      state: "Uzdravený",
      rabbit: "🐰✨",
      showVideo: true,
    };
  }

  if (reason === "no-lives") {
    return {
      heading: "Králíček se neuzdravil",
      summary: "Tři chyby byly moc. Zkus to znovu a pomoz mu být silnější.",
      state: "Pořád nemocný",
      rabbit: "😵🐰",
      showVideo: false,
    };
  }

  return {
    heading: "Došly otázky",
    summary:
      "Otázky skončily dřív, než měl králíček 100 bodů. Příště to určitě zvládneš.",
    state: state.score >= 60 ? "Zlepšuje se" : "Pořád slabý",
    rabbit: state.score >= 60 ? "🙂🐰" : "🤕🐰",
    showVideo: false,
  };
}

function updateHud() {
  scoreLabel.textContent = `${state.score} / ${TARGET_SCORE}`;
  livesLabel.textContent = "❤️".repeat(Math.max(state.lives, 0)) + "🩶".repeat(Math.max(STARTING_LIVES - state.lives, 0));
  streakLabel.textContent = String(state.streak);
  progressFill.style.width = `${(state.score / TARGET_SCORE) * 100}%`;

  const rabbitState = getRabbitState();
  rabbitAvatar.textContent = rabbitState.avatar;
  rabbitStateLabel.textContent = rabbitState.label;
  rabbitStateText.textContent = rabbitState.text;
}

function getRabbitState() {
  if (state.score >= TARGET_SCORE) {
    return {
      avatar: "🐰✨",
      label: "Zdravý králíček",
      text: "Je veselý, silný a úplně v pořádku.",
    };
  }

  if (state.lives <= 1 || state.score < 20) {
    return {
      avatar: "🤒🐰",
      label: "Nemocný králíček",
      text: "Potřebuje pomoc a správné odpovědi co nejdřív.",
    };
  }

  if (state.score < 60) {
    return {
      avatar: "🥕🐰",
      label: "Králíček se zlepšuje",
      text: "Už má víc síly, ale ještě potřebuje péči.",
    };
  }

  return {
    avatar: "😊🐰",
    label: "Skoro zdravý králíček",
    text: "Ještě pár správných odpovědí a bude úplně zdravý.",
  };
}

function startQuestionTimer() {
  stopQuestionTimer();
  updateTimerLabel();
  state.timerIntervalId = window.setInterval(updateTimerLabel, 100);
}

function stopQuestionTimer() {
  if (state.timerIntervalId) {
    window.clearInterval(state.timerIntervalId);
    state.timerIntervalId = null;
  }
}

function updateTimerLabel() {
  const speedWindowStart = getCurrentSpeedWindowStart();
  const remainingMs = speedWindowStart
    ? Math.max(SPEED_WINDOW_MS - (Date.now() - speedWindowStart), 0)
    : SPEED_WINDOW_MS;
  timerLabel.textContent = `Čas na bonus: ${(remainingMs / 1000).toFixed(1)} s`;
}

function getCurrentSpeedWindowStart() {
  if (state.streak === 0 || state.streak % STREAK_GOAL === 0) {
    return null;
  }

  const chunkIndex = state.streakTimestamps.length - (state.streak % STREAK_GOAL);
  return state.streakTimestamps[chunkIndex] ?? null;
}

function resetToStart() {
  stopQuestionTimer();
  winVideo.pause();
  winVideo.currentTime = 0;
  resultMedia.hidden = true;
  state.selectedPackId = null;
  state.selectedQuestionCount = null;
  state.selectedCategory = null;
  state.currentQuestionIndex = 0;
  state.score = 0;
  state.lives = STARTING_LIVES;
  state.streak = 0;
  state.bestStreak = 0;
  state.streakTimestamps = [];
  state.quizQuestions = [];
  state.answeredCurrent = false;
  goToQuestionCount.disabled = true;
  goToCategory.disabled = true;
  startQuiz.disabled = true;
  updateSelectedButton(packChoices, "");
  updateSelectedButton(questionCountChoices, "");
  categoryChoices.innerHTML = "";
  updateHud();
  timerLabel.textContent = "Čas na bonus: 10.0 s";
  showScreen("welcome");
}

function getSelectedPack() {
  return state.quizData?.packs?.find((pack) => pack.id === state.selectedPackId) ?? null;
}

function showScreen(screenName) {
  screens.forEach((screen) => {
    screen.classList.toggle("screen-active", screen.dataset.screen === screenName);
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

function groupQuestionsByCategory(questions) {
  const counts = new Map();

  questions.forEach((question) => {
    const category = question.category || "ostatni";
    counts.set(category, (counts.get(category) ?? 0) + 1);
  });

  return [...counts.entries()]
    .map(([id, count]) => ({ id, count }))
    .sort((left, right) => right.count - left.count);
}

function formatCategoryLabel(category) {
  const labels = {
    matematika: "Matematika",
    logika: "Logika",
    ostatni: "Prvouka a ostatní",
  };

  return labels[category] ?? category.charAt(0).toUpperCase() + category.slice(1);
}
