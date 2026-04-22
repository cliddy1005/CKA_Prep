(() => {
  const { metrics, overviewModules, learnTopics, scenarios, quiz, reference, themeOptions } = window.NetForgeData;
  const UI = window.NetForgeUI;

  const storageKeys = {
    quiz: 'netforge.quiz.v1',
    scenarios: 'netforge.scenarios.v1',
    theme: 'netforge.theme.v1',
  };

  const state = {
    activeTab: 'overview',
    activeScenarioIndex: 0,
    activeCommandIndex: -1,
    answeredQuiz: loadJSON(storageKeys.quiz, {}),
    answeredScenarios: loadJSON(storageKeys.scenarios, {}),
    currentThemeIndex: loadJSON(storageKeys.theme, 0),
    deferredPrompt: null,
  };

  const els = {
    menuToggle: document.getElementById('menuToggle'),
    topNav: document.getElementById('topNav'),
    overviewMetrics: document.getElementById('overviewMetrics'),
    overviewModules: document.getElementById('overviewModules'),
    learnTopics: document.getElementById('learnTopics'),
    learnSearch: document.getElementById('learnSearch'),
    scenarioList: document.getElementById('scenarioList'),
    scenarioSummary: document.getElementById('scenarioSummary'),
    commandMenu: document.getElementById('commandMenu'),
    terminalOutput: document.getElementById('terminalOutput'),
    activeCommandLabel: document.getElementById('activeCommandLabel'),
    rootCauseOptions: document.getElementById('rootCauseOptions'),
    rootCauseResult: document.getElementById('rootCauseResult'),
    nextStepOptions: document.getElementById('nextStepOptions'),
    nextStepResult: document.getElementById('nextStepResult'),
    quizContainer: document.getElementById('quizContainer'),
    scoreBig: document.getElementById('scoreBig'),
    scoreSub: document.getElementById('scoreSub'),
    domainStats: document.getElementById('domainStats'),
    weaknessPanel: document.getElementById('weaknessPanel'),
    referenceGrid: document.getElementById('referenceGrid'),
    resetQuizBtn: document.getElementById('resetQuizBtn'),
    themeSwatches: document.getElementById('themeSwatches'),
    installBtn: document.getElementById('installBtn'),
    installHint: document.getElementById('installHint'),
    resetAllBtn: document.getElementById('resetAllBtn')
  };

  function init() {
    applyTheme(state.currentThemeIndex);
    renderOverview();
    renderLearnTopics(learnTopics);
    renderScenarioList();
    renderScenario();
    renderQuiz();
    renderReference();
    renderThemeSwatches();
    bindNav();
    bindActions();
    registerServiceWorker();
  }

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function saveJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function renderOverview() {
    els.overviewMetrics.innerHTML = metrics.map(UI.createMetricCard).join('');
    els.overviewModules.innerHTML = overviewModules.map(UI.createOverviewModule).join('');
  }

  function renderLearnTopics(data) {
    els.learnTopics.innerHTML = data.map(UI.createTopic).join('');
    els.learnTopics.querySelectorAll('.topic-card').forEach((card) => {
      card.querySelector('.topic-head').addEventListener('click', () => {
        card.classList.toggle('open');
      });
    });
  }

  function renderScenarioList() {
    els.scenarioList.innerHTML = scenarios
      .map((scenario, index) => UI.createScenarioCard(scenario, index === state.activeScenarioIndex))
      .join('');

    els.scenarioList.querySelectorAll('.scenario-card').forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.dataset.scenarioId;
        state.activeScenarioIndex = scenarios.findIndex((scenario) => scenario.id === id);
        state.activeCommandIndex = -1;
        renderScenarioList();
        renderScenario();
      });
    });
  }

  function renderScenario() {
    const scenario = scenarios[state.activeScenarioIndex];
    const saved = state.answeredScenarios[scenario.id] || {};

    els.scenarioSummary.innerHTML = `
      <h4>${scenario.title}</h4>
      <p>${scenario.context}</p>
      <div class="meta-row">${scenario.meta.map((item) => `<span class="meta-pill">${item}</span>`).join('')}</div>
    `;

    els.commandMenu.innerHTML = scenario.commands
      .map((command, index) => UI.createCommandButton(command, index, index === state.activeCommandIndex))
      .join('');

    els.commandMenu.querySelectorAll('.command-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.activeCommandIndex = Number(btn.dataset.commandIndex);
        const cmd = scenario.commands[state.activeCommandIndex];
        els.activeCommandLabel.textContent = cmd.label;
        els.terminalOutput.textContent = cmd.output;
        renderScenario();
      });
    });

    if (state.activeCommandIndex === -1) {
      els.activeCommandLabel.textContent = 'select a command';
      els.terminalOutput.textContent = 'Choose a command from the left to inspect the scenario state.';
    }

    els.rootCauseOptions.innerHTML = scenario.rootCauseOptions.map((text, index) => UI.createDiagOption(text, index, 'root')).join('');
    els.nextStepOptions.innerHTML = scenario.nextStepOptions.map((text, index) => UI.createDiagOption(text, index, 'next')).join('');

    els.rootCauseOptions.querySelectorAll('.diag-option').forEach((btn) => {
      const index = Number(btn.dataset.rootIndex);
      if (saved.rootAnswered) {
        if (index === scenario.rootCauseAnswer) btn.classList.add('correct');
        if (index === saved.rootSelected && index !== scenario.rootCauseAnswer) btn.classList.add('wrong');
        btn.disabled = true;
      }
      btn.addEventListener('click', () => answerScenario('root', index));
    });

    els.nextStepOptions.querySelectorAll('.diag-option').forEach((btn) => {
      const index = Number(btn.dataset.nextIndex);
      if (saved.nextAnswered) {
        if (index === scenario.nextStepAnswer) btn.classList.add('correct');
        if (index === saved.nextSelected && index !== scenario.nextStepAnswer) btn.classList.add('wrong');
        btn.disabled = true;
      }
      btn.addEventListener('click', () => answerScenario('next', index));
    });

    if (saved.rootAnswered) {
      els.rootCauseResult.classList.add('show');
      els.rootCauseResult.innerHTML = `<strong>Explanation:</strong> ${scenario.rootCauseExplanation}`;
    } else {
      els.rootCauseResult.classList.remove('show');
      els.rootCauseResult.textContent = '';
    }

    if (saved.nextAnswered) {
      els.nextStepResult.classList.add('show');
      els.nextStepResult.innerHTML = `<strong>Explanation:</strong> ${scenario.nextStepExplanation}`;
    } else {
      els.nextStepResult.classList.remove('show');
      els.nextStepResult.textContent = '';
    }
  }

  function answerScenario(kind, index) {
    const scenario = scenarios[state.activeScenarioIndex];
    const saved = state.answeredScenarios[scenario.id] || {};
    const keyAnswered = `${kind}Answered`;
    const keySelected = `${kind}Selected`;

    if (saved[keyAnswered]) return;

    state.answeredScenarios[scenario.id] = {
      ...saved,
      [keyAnswered]: true,
      [keySelected]: index,
    };

    saveJSON(storageKeys.scenarios, state.answeredScenarios);
    renderScenario();
  }

  function renderQuiz() {
    els.quizContainer.innerHTML = quiz.map(UI.createQuizCard).join('');

    els.quizContainer.querySelectorAll('.quiz-option').forEach((btn) => {
      const qIndex = Number(btn.dataset.quizIndex);
      const optIndex = Number(btn.dataset.optIndex);
      const saved = state.answeredQuiz[qIndex];

      if (saved !== undefined) {
        lockQuizQuestion(qIndex, saved);
      }

      btn.addEventListener('click', () => answerQuiz(qIndex, optIndex));
    });

    updateQuizStats();
  }

  function answerQuiz(qIndex, optIndex) {
    if (state.answeredQuiz[qIndex] !== undefined) return;
    state.answeredQuiz[qIndex] = optIndex;
    saveJSON(storageKeys.quiz, state.answeredQuiz);
    lockQuizQuestion(qIndex, optIndex);
    updateQuizStats();
  }

  function lockQuizQuestion(qIndex, selectedIndex) {
    const question = quiz[qIndex];
    const buttons = document.querySelectorAll(`[data-quiz-index="${qIndex}"]`);
    buttons.forEach((btn) => {
      const optIndex = Number(btn.dataset.optIndex);
      if (optIndex === question.ans) btn.classList.add('correct');
      else if (optIndex === selectedIndex && optIndex !== question.ans) btn.classList.add('wrong');
      btn.disabled = true;
    });
    const explain = document.getElementById(`quiz-explain-${qIndex}`);
    explain.classList.add('show');
  }

  function updateQuizStats() {
    const total = quiz.length;
    const answeredIndices = Object.keys(state.answeredQuiz).map(Number);
    const correct = answeredIndices.filter((index) => state.answeredQuiz[index] === quiz[index].ans).length;

    els.scoreBig.textContent = `${correct} / ${total}`;
    if (answeredIndices.length === 0) {
      els.scoreSub.textContent = 'Answer questions to see domain accuracy and recommendations.';
    } else {
      els.scoreSub.textContent = `Answered ${answeredIndices.length} of ${total}. Current live accuracy: ${Math.round((correct / answeredIndices.length) * 100)}%.`;
    }

    const byDomain = {};
    quiz.forEach((question, index) => {
      if (!byDomain[question.domain]) byDomain[question.domain] = { total: 0, answered: 0, correct: 0 };
      byDomain[question.domain].total += 1;
      if (state.answeredQuiz[index] !== undefined) {
        byDomain[question.domain].answered += 1;
        if (state.answeredQuiz[index] === question.ans) byDomain[question.domain].correct += 1;
      }
    });

    els.domainStats.innerHTML = Object.entries(byDomain)
      .map(([domain, stats]) => UI.createDomainStat(domain, stats.correct, stats.total, stats.answered))
      .join('');

    const weaknesses = Object.entries(byDomain)
      .filter(([, stats]) => stats.answered > 0)
      .sort((a, b) => {
        const accA = a[1].answered ? a[1].correct / a[1].answered : 1;
        const accB = b[1].answered ? b[1].correct / b[1].answered : 1;
        return accA - accB;
      })
      .slice(0, 2);

    if (weaknesses.length === 0) {
      els.weaknessPanel.innerHTML = `<div class="weakness-item"><div class="label">Recommendation</div><div class="value">Start validating</div><div class="muted">Once you answer questions, this area will show where to focus next.</div></div>`;
    } else {
      els.weaknessPanel.innerHTML = weaknesses.map(([domain, stats]) => {
        const pct = Math.round((stats.correct / stats.answered) * 100);
        return UI.createWeaknessItem(domain, `Current accuracy in ${domain} is ${pct}%. Review the related learning modules and troubleshooting scenarios.`);
      }).join('');
    }
  }

  function resetQuiz() {
    state.answeredQuiz = {};
    saveJSON(storageKeys.quiz, state.answeredQuiz);
    renderQuiz();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderReference() {
    els.referenceGrid.innerHTML = reference.map(UI.createReferenceCard).join('');
  }

  function renderThemeSwatches() {
    els.themeSwatches.innerHTML = themeOptions.map((theme, index) => UI.createThemeSwatch(theme, index, index === state.currentThemeIndex)).join('');
    els.themeSwatches.querySelectorAll('.swatch').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.currentThemeIndex = Number(btn.dataset.themeIndex);
        saveJSON(storageKeys.theme, state.currentThemeIndex);
        applyTheme(state.currentThemeIndex);
        renderThemeSwatches();
      });
    });
  }

  function applyTheme(index) {
    const theme = themeOptions[index] || themeOptions[0];
    const root = document.documentElement;
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--accent-rgb', theme.rgb);
  }

  function bindNav() {
    document.querySelectorAll('.nav-btn').forEach((btn) => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    document.querySelectorAll('[data-goto]').forEach((btn) => {
      btn.addEventListener('click', () => switchTab(btn.dataset.goto));
    });

    els.menuToggle.addEventListener('click', () => {
      const isOpen = els.topNav.classList.toggle('open');
      els.menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function switchTab(tab) {
    state.activeTab = tab;
    document.querySelectorAll('.page').forEach((page) => page.classList.remove('active'));
    document.getElementById(`page-${tab}`).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === tab));
    els.topNav.classList.remove('open');
    els.menuToggle.setAttribute('aria-expanded', 'false');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function bindActions() {
    els.learnSearch.addEventListener('input', () => {
      const query = els.learnSearch.value.trim().toLowerCase();
      if (!query) {
        renderLearnTopics(learnTopics);
        return;
      }
      const filtered = learnTopics.filter((topic) => {
        const haystack = [topic.title, topic.sub, ...(topic.keywords || [])].join(' ').toLowerCase();
        return haystack.includes(query);
      });
      renderLearnTopics(filtered);
    });

    els.resetQuizBtn.addEventListener('click', resetQuiz);
    els.resetAllBtn.addEventListener('click', () => {
      localStorage.removeItem(storageKeys.quiz);
      localStorage.removeItem(storageKeys.scenarios);
      state.answeredQuiz = {};
      state.answeredScenarios = {};
      renderScenario();
      renderQuiz();
    });

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      state.deferredPrompt = event;
      els.installBtn.disabled = false;
      els.installHint.textContent = 'Install is available on this device. Use the button above or, on iPhone Safari, use Share → Add to Home Screen.';
    });

    els.installBtn.addEventListener('click', async () => {
      if (!state.deferredPrompt) return;
      state.deferredPrompt.prompt();
      await state.deferredPrompt.userChoice;
      state.deferredPrompt = null;
      els.installBtn.disabled = true;
    });
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  }

  init();
})();
