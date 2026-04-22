window.NetForgeUI = (() => {
  function createMetricCard(metric) {
    return `
      <article class="metric-card">
        <div class="metric-label">${metric.label}</div>
        <div class="metric-value">${metric.value}</div>
        <div class="metric-sub">${metric.sub}</div>
      </article>
    `;
  }

  function createOverviewModule(module, index) {
    return `
      <article class="module-card">
        <div class="module-domain">${module.domain} • M${index + 1}</div>
        <h4>${module.title}</h4>
        <div class="module-summary">${module.summary}</div>
        <div class="module-tags">${module.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
      </article>
    `;
  }

  function createTopic(topic, index) {
    return `
      <article class="topic-card ${index === 0 ? 'open' : ''}" data-topic-index="${index}">
        <div class="topic-head">
          <div class="topic-icon">${topic.icon}</div>
          <div class="topic-title">
            <h4>${topic.title}</h4>
            <p>${topic.sub}</p>
          </div>
          <div class="topic-chevron">▼</div>
        </div>
        <div class="topic-body">
          <div class="topic-content">${topic.content}</div>
        </div>
      </article>
    `;
  }

  function createScenarioCard(scenario, isActive) {
    return `
      <article class="scenario-card ${isActive ? 'active' : ''}" data-scenario-id="${scenario.id}">
        <div class="small">${scenario.domain} • ${scenario.severity}</div>
        <h4>${scenario.title}</h4>
        <p>${scenario.summary}</p>
      </article>
    `;
  }

  function createCommandButton(command, index, isActive) {
    return `<button class="command-btn ${isActive ? 'active' : ''}" data-command-index="${index}">${command.label}</button>`;
  }

  function createDiagOption(text, index, kind) {
    return `<button class="diag-option" data-${kind}-index="${index}">${text}</button>`;
  }

  function createQuizCard(question, index) {
    return `
      <article class="quiz-card" id="quiz-${index}">
        <div class="quiz-meta">${question.domain} • Question ${index + 1}</div>
        <h4>${question.q}</h4>
        <div class="quiz-options">
          ${question.opts.map((opt, optIndex) => `<button class="quiz-option" data-quiz-index="${index}" data-opt-index="${optIndex}">${opt}</button>`).join('')}
        </div>
        <div class="quiz-explain" id="quiz-explain-${index}"><strong>Explanation:</strong> ${question.explain}</div>
      </article>
    `;
  }

  function createDomainStat(domain, correct, total, answered) {
    const accuracy = answered === 0 ? '—' : `${Math.round((correct / answered) * 100)}% live accuracy`;
    return `
      <div class="domain-item">
        <div class="label">${domain}</div>
        <div class="value">${correct} / ${total} possible • ${accuracy}</div>
      </div>
    `;
  }

  function createWeaknessItem(domain, message) {
    return `
      <div class="weakness-item">
        <div class="label">Focus area</div>
        <div class="value">${domain}</div>
        <div class="muted">${message}</div>
      </div>
    `;
  }

  function createReferenceCard(group) {
    return `
      <article class="ref-card">
        <h4>${group.title}</h4>
        ${group.items.map((item) => `
          <div class="ref-item">
            <div class="ref-term">${item.term}</div>
            <div class="ref-def">${item.def}</div>
          </div>
        `).join('')}
      </article>
    `;
  }

  function createThemeSwatch(theme, index, active) {
    return `<button class="swatch ${active ? 'active' : ''}" title="${theme.name}" data-theme-index="${index}" style="background:${theme.accent}"></button>`;
  }

  return {
    createMetricCard,
    createOverviewModule,
    createTopic,
    createScenarioCard,
    createCommandButton,
    createDiagOption,
    createQuizCard,
    createDomainStat,
    createWeaknessItem,
    createReferenceCard,
    createThemeSwatch
  };
})();
