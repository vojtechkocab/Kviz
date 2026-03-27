const DATA_URL = "./kviz_otazky_pro_aplikaci.json";

const state = {
  quizData: null,
  selectedPackId: null,
  selectedQuestionCount: null,
  selectedCategory: null,
  quizQuestions: [],
  currentQuestionIndex: 0,
  score: 0,
  answeredCurrent: false,
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
const progressFill = document.querySelector("#progressFill");
const questionText = document.querySelector("#questionText");
const answers = document.querySelector("#answers");
const feedback = document.querySelector("#feedback");
const nextQuestion = document.querySelector("#nextQuestion");
const resultHeading = document.querySelector("#resultHeading");
const resultSummary = document.querySelector("#resultSummary");
const finalScore = document.querySelector("#finalScore");
const finalPercentage = document.querySelector("#finalPercentage");
const finalRating = document.querySelector("#finalRating");
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
    button.addEventListener("click", () => showScreen("welcome"));
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

  const allQuestionsCount = pack.questions.length;
  const choices = [
    {
      id: "all",
      title: "Všechno",
      subtitle: `${allQuestionsCount} otázek`,
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
  state.answeredCurrent = false;

  scoreLabel.textContent = "0";
  quizPackName.textContent = pack.title;
  showScreen("quiz");
  renderCurrentQuestion();
}

function renderCurrentQuestion() {
  const currentQuestion = state.quizQuestions[state.currentQuestionIndex];
  if (!currentQuestion) {
    finishQuiz();
    return;
  }

  state.answeredCurrent = false;
  nextQuestion.disabled = true;
  feedback.hidden = true;
  feedback.textContent = "";
  feedback.className = "feedback";

  questionIndex.textContent = `${state.currentQuestionIndex + 1} / ${state.quizQuestions.length}`;
  questionText.textContent = currentQuestion.text;
  progressFill.style.width = `${(state.currentQuestionIndex / state.quizQuestions.length) * 100}%`;

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

  [...answers.querySelectorAll(".answer-button")].forEach((button, index) => {
    const option = currentQuestion.options[index];
    button.disabled = true;

    if (option.id === currentQuestion.correctOptionId) {
      button.classList.add("correct");
    }
  });

  if (isCorrect) {
    state.score += 1;
    scoreLabel.textContent = String(state.score);
    clickedButton.classList.add("correct");
    feedback.textContent = "Správně, máš bod.";
    feedback.classList.add("success");
  } else {
    clickedButton.classList.add("wrong");
    feedback.textContent = `Špatně. Správná odpověď je: ${currentQuestion.correctText}`;
    feedback.classList.add("error");
  }

  feedback.hidden = false;
  progressFill.style.width = `${((state.currentQuestionIndex + 1) / state.quizQuestions.length) * 100}%`;
}

function handleNextQuestion() {
  state.currentQuestionIndex += 1;

  if (state.currentQuestionIndex >= state.quizQuestions.length) {
    finishQuiz();
    return;
  }

  renderCurrentQuestion();
}

function finishQuiz() {
  const totalQuestions = state.quizQuestions.length;
  const percentage = totalQuestions === 0 ? 0 : (state.score / totalQuestions) * 100;
  const rating = getRating(percentage);

  resultHeading.textContent = rating.label;
  resultSummary.textContent = `Získala jsi ${state.score} bodů z ${totalQuestions}.`;
  finalScore.textContent = `${state.score} / ${totalQuestions}`;
  finalPercentage.textContent = `${Math.round(percentage)} %`;
  finalRating.textContent = rating.label;
  showScreen("result");
}

function getRating(percentage) {
  if (percentage >= 85) {
    return { label: "Výborně" };
  }

  if (percentage >= 60) {
    return { label: "Dobře" };
  }

  return { label: "Špatně" };
}

function resetToStart() {
  state.selectedPackId = null;
  state.selectedQuestionCount = null;
  state.currentQuestionIndex = 0;
  state.score = 0;
  state.quizQuestions = [];
  state.answeredCurrent = false;
  state.selectedCategory = null;
  scoreLabel.textContent = "0";
  goToQuestionCount.disabled = true;
  goToCategory.disabled = true;
  startQuiz.disabled = true;
  updateSelectedButton(packChoices, "");
  updateSelectedButton(questionCountChoices, "");
  categoryChoices.innerHTML = "";
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
