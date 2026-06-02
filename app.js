/**
 * PDE TechnionPrep - Main Application Controller
 * Handles theme toggles, navigation state, localStorage progress tracking, quiz logic, and canvas loading.
 */

document.addEventListener('DOMContentLoaded', () => {
  // State variables
  let completedSubchapters = JSON.parse(localStorage.getItem('pde_completed_topics')) || [];
  let currentActiveSubchapter = null;
  let activeTab = 'summary';
  const totalSubchaptersCount = pdeCourseData.reduce((acc, ch) => acc + ch.subchapters.length, 0);

  // DOM Elements
  const sidebarNav = document.getElementById('chaptersNav');
  const progressBarRing = document.getElementById('progressBarRing');
  const progressPctText = document.getElementById('progressPctText');
  const progressSubText = document.getElementById('progressSubText');
  const welcomePanel = document.getElementById('welcomePanel');
  const studyConsole = document.getElementById('studyConsole');
  const welcomeChaptersGrid = document.getElementById('welcomeChaptersGrid');
  
  // Breadcrumbs
  const breadcrumbHome = document.getElementById('breadcrumbHome');
  const breadcrumbChapter = document.getElementById('breadcrumbChapter');
  const breadcrumbSubchapter = document.getElementById('breadcrumbSubchapter');
  
  // Console Header Controls
  const consoleTopicTitle = document.getElementById('consoleTopicTitle');
  const consoleChapterSubtitle = document.getElementById('consoleChapterSubtitle');
  const markCompletedBtn = document.getElementById('markCompletedBtn');
  const markCompletedIcon = document.getElementById('markCompletedIcon');
  
  // Tab Elements
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const summaryTextContainer = document.getElementById('summaryTextContainer');
  const formulasListContainer = document.getElementById('formulasListContainer');
  const quizContainer = document.getElementById('quizContainer');
  const simulatorControls = document.getElementById('simulatorControls');
  
  // Theme Toggle Elements
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeSunIcon = document.getElementById('themeSunIcon');
  const themeMoonIcon = document.getElementById('themeMoonIcon');
  
  // Search Elements
  const searchInput = document.getElementById('searchInput');
  const searchResultsOverlay = document.getElementById('searchResultsOverlay');
  const searchResultsList = document.getElementById('searchResultsList');
  const closeSearchBtn = document.getElementById('closeSearchBtn');

  // Hamburger Mobile Toggle
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const sidebar = document.getElementById('sidebar');

  // Welcome page buttons
  const startLearningBtn = document.getElementById('startLearningBtn');

  // ----------------------------------------------------
  // 1. INITIALIZATION & SETUP
  // ----------------------------------------------------
  
  function init() {
    renderSidebar();
    renderWelcomeGrid();
    updateProgressTracker();
    restoreTheme();
    setupEventListeners();
    
    // Auto-render math on initial page text
    renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false }
      ],
      throwOnError: false
    });
  }

  // ----------------------------------------------------
  // 2. THEME SWITCHING SYSTEM (Light / Dark)
  // ----------------------------------------------------
  
  function restoreTheme() {
    const savedTheme = localStorage.getItem('pde_theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    if (savedTheme === 'light') {
      themeSunIcon.style.display = 'block';
      themeMoonIcon.style.display = 'none';
    } else {
      themeSunIcon.style.display = 'none';
      themeMoonIcon.style.display = 'block';
    }
  }

  function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('pde_theme', newTheme);
    
    if (newTheme === 'light') {
      themeSunIcon.style.display = 'block';
      themeMoonIcon.style.display = 'none';
    } else {
      themeSunIcon.style.display = 'none';
      themeMoonIcon.style.display = 'block';
    }
    
    // Rerender active simulator colors if running
    if (simulatorManager.currentSim) {
      simulatorManager.currentSim.draw();
    }
  }

  // ----------------------------------------------------
  // 3. PROGRESS TRACKER SYSTEM
  // ----------------------------------------------------
  
  function updateProgressTracker() {
    const completedCount = completedSubchapters.length;
    const pct = totalSubchaptersCount > 0 ? Math.round((completedCount / totalSubchaptersCount) * 100) : 0;
    
    // Update text indicators
    progressPctText.textContent = `${pct}%`;
    progressSubText.textContent = `${completedCount} מתוך ${totalSubchaptersCount} נושאים הושלמו`;

    // SVG Circular Progress calculation
    // Circumference = 2 * PI * r = 2 * 3.14159 * 24 = 150.796
    const circumference = 150.796;
    const offset = circumference - (pct / 100) * circumference;
    progressBarRing.style.strokeDashoffset = offset;
  }

  function toggleSubchapterCompletion(subchapterId) {
    const index = completedSubchapters.indexOf(subchapterId);
    if (index > -1) {
      completedSubchapters.splice(index, 1);
    } else {
      completedSubchapters.push(subchapterId);
    }
    
    localStorage.setItem('pde_completed_topics', JSON.stringify(completedSubchapters));
    updateProgressTracker();
    
    // Update UI checkboxes
    updateSidebarCheckboxes();
    updateMainConsoleCompletedButton(subchapterId);
  }

  function updateSidebarCheckboxes() {
    document.querySelectorAll('.subchapter-checkbox').forEach(box => {
      const subId = box.getAttribute('data-sub-id');
      if (completedSubchapters.includes(subId)) {
        box.classList.add('checked');
      } else {
        box.classList.remove('checked');
      }
    });
  }

  function updateMainConsoleCompletedButton(subchapterId) {
    if (!currentActiveSubchapter || currentActiveSubchapter.id !== subchapterId) return;
    
    if (completedSubchapters.includes(subchapterId)) {
      markCompletedBtn.classList.add('checked');
      markCompletedIcon.className = "fas fa-check-circle";
      markCompletedBtn.querySelector('span').textContent = "הושלם!";
    } else {
      markCompletedBtn.classList.remove('checked');
      markCompletedIcon.className = "far fa-circle";
      markCompletedBtn.querySelector('span').textContent = "סמן כהושלם";
    }
  }

  // ----------------------------------------------------
  // 4. RENDERING VIEWS
  // ----------------------------------------------------

  // Sidebar Syllabus List
  function renderSidebar() {
    sidebarNav.innerHTML = '';
    
    pdeCourseData.forEach(chapter => {
      const chapterItem = document.createElement('div');
      chapterItem.className = 'chapter-item';
      chapterItem.id = `chapter-item-${chapter.id}`;
      
      const chapterHeader = document.createElement('div');
      chapterHeader.className = 'chapter-header';
      chapterHeader.innerHTML = `
        <div class="chapter-title-group">
          <span style="font-weight:600; font-size:0.95rem;">${chapter.title}</span>
        </div>
        <i class="fas fa-chevron-down chapter-chevron"></i>
      `;
      
      const subList = document.createElement('div');
      subList.className = 'subchapters-list';
      
      chapter.subchapters.forEach(sub => {
        const isCheckedClass = completedSubchapters.includes(sub.id) ? 'checked' : '';
        const subLink = document.createElement('div');
        subLink.className = 'subchapter-link';
        subLink.setAttribute('data-sub-id', sub.id);
        subLink.innerHTML = `
          <span>${sub.id} ${sub.title}</span>
          <div class="subchapter-checkbox ${isCheckedClass}" data-sub-id="${sub.id}"></div>
        `;
        
        // Handle click on sub-link vs checkbox
        subLink.addEventListener('click', (e) => {
          if (e.target.classList.contains('subchapter-checkbox')) {
            e.stopPropagation();
            toggleSubchapterCompletion(sub.id);
          } else {
            navigateToSubchapter(sub.id);
            if (window.innerWidth <= 992) {
              sidebar.classList.remove('mobile-open');
            }
          }
        });
        
        subList.appendChild(subLink);
      });
      
      chapterHeader.addEventListener('click', () => {
        chapterItem.classList.toggle('expanded');
      });
      
      chapterItem.appendChild(chapterHeader);
      chapterItem.appendChild(subList);
      sidebarNav.appendChild(chapterItem);
    });
  }

  // Large landing grid on Welcome Screen
  function renderWelcomeGrid() {
    welcomeChaptersGrid.innerHTML = '';
    pdeCourseData.forEach(chapter => {
      const card = document.createElement('div');
      card.className = 'chapter-card';
      card.innerHTML = `
        <h3>${chapter.title}</h3>
        <p>${chapter.description}</p>
        <span style="font-size:0.8rem; color:var(--color-secondary); font-weight:600; margin-top:12px; display:inline-block;">${chapter.subchapters.length} נושאי לימוד <i class="fas fa-arrow-left" style="font-size:0.75rem; margin-right:4px;"></i></span>
      `;
      card.addEventListener('click', () => {
        // Expand this chapter in sidebar and open its first subchapter
        const sidebarItem = document.getElementById(`chapter-item-${chapter.id}`);
        if (sidebarItem) sidebarItem.classList.add('expanded');
        navigateToSubchapter(chapter.subchapters[0].id);
      });
      welcomeChaptersGrid.appendChild(card);
    });
  }

  // ----------------------------------------------------
  // 5. ROUTING & CONTENT LOADING
  // ----------------------------------------------------
  
  function navigateToSubchapter(subchapterId) {
    // Find subchapter and parent chapter in database
    let foundChapter = null;
    let foundSub = null;
    
    pdeCourseData.forEach(ch => {
      ch.subchapters.forEach(sub => {
        if (sub.id === subchapterId) {
          foundChapter = ch;
          foundSub = sub;
        }
      });
    });
    
    if (!foundSub) return;
    
    currentActiveSubchapter = foundSub;
    
    // Switch panels visibility
    welcomePanel.style.display = 'none';
    studyConsole.style.display = 'flex';
    
    // Highlight sidebar link
    document.querySelectorAll('.subchapter-link').forEach(link => {
      if (link.getAttribute('data-sub-id') === subchapterId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Expand parent chapter container in sidebar
    const parentSidebarItem = document.getElementById(`chapter-item-${foundChapter.id}`);
    if (parentSidebarItem && !parentSidebarItem.classList.contains('expanded')) {
      parentSidebarItem.classList.add('expanded');
    }

    // Set Breadcrumbs and headers
    breadcrumbChapter.textContent = foundChapter.title;
    breadcrumbSubchapter.textContent = `${foundSub.id} ${foundSub.title}`;
    
    consoleTopicTitle.textContent = `${foundSub.id} ${foundSub.title}`;
    consoleChapterSubtitle.textContent = foundChapter.title;

    // Load active tab content
    loadTabContent();
    updateMainConsoleCompletedButton(subchapterId);
    
    // Scroll workspace back to top
    document.getElementById('mainWorkspace').scrollTop = 0;
  }

  function loadTabContent() {
    if (!currentActiveSubchapter) return;
    
    // Clear simulator state when moving tabs or topics
    simulatorManager.stop();

    if (activeTab === 'summary') {
      loadSummaryTab();
    } else if (activeTab === 'simulator') {
      loadSimulatorTab();
    } else if (activeTab === 'formulas') {
      loadFormulasTab();
    } else if (activeTab === 'quiz') {
      loadQuizTab();
    }
  }

  // Tab 1: Summary Text
  function loadSummaryTab() {
    summaryTextContainer.innerHTML = '';
    
    // Generate description paragraph
    const p = document.createElement('p');
    p.textContent = currentActiveSubchapter.summary;
    summaryTextContainer.appendChild(p);
    
    // Render key formula if present
    if (currentActiveSubchapter.formulas && currentActiveSubchapter.formulas.length > 0) {
      const f = currentActiveSubchapter.formulas[0];
      const formulaCard = document.createElement('div');
      formulaCard.className = 'formula-card';
      formulaCard.innerHTML = `
        <div class="formula-math">$$${f.tex}$$</div>
        <div class="formula-description">${f.desc}</div>
      `;
      summaryTextContainer.appendChild(formulaCard);
    }
    
    // Math syntax highlighting
    renderMathInElement(summaryTextContainer, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false }
      ],
      throwOnError: false
    });
  }

  // Tab 2: Interactive Equation Simulator
  function loadSimulatorTab() {
    simulatorControls.innerHTML = '';
    
    // Determine which simulator to boot based on active chapter ID
    let simType = 'wave';
    let title = 'סימולטור משוואת הגלים';
    let controlsHTML = '';
    
    const chapterId = parseInt(currentActiveSubchapter.id.split('.')[0]);

    if (chapterId === 7) {
      simType = 'laplace';
      title = 'פתרון לפלס בדו-מימד';
      controlsHTML = `
        <h4>הגדרות המערכת</h4>
        <div class="control-group">
          <label for="laplacePreset">תבנית התחלתית:</label>
          <select class="control-select" id="laplacePreset">
            <option value="default">מלבן עם גבולות חמים</option>
            <option value="center-hotspot">מקור חום פנימי קבוע</option>
            <option value="center-coldspot">מקור קור פנימי קבוע</option>
          </select>
        </div>
        <div style="font-size:0.78rem; color:var(--text-muted); line-height:1.4;">
          <p><i class="fas fa-info-circle"></i> <strong>הנחיות:</strong></p>
          <p>הקלק וגרור על לוח הסימולציה כדי לצייר קווי טמפרטורה חמים. המערכת תבצע רלקסציה בזמן אמת לפתרון משוואת לפלס $\\nabla^2 u = 0$.</p>
          <p><strong>קליק ימני (או Shift + גרור):</strong> מצייר גבולות קרים ($0^\\circ$).</p>
        </div>
      `;
    } else if (chapterId === 6 || chapterId === 5) {
      simType = 'heat';
      title = 'פיזור חום חד-ממדי';
      controlsHTML = `
        <h4>פרמטרים פיזיקליים</h4>
        <div class="control-group">
          <label for="heatDiff">מקדם דיפוזיה ($\\alpha$): <span class="value-display" id="heatDiffVal">0.15</span></label>
          <input type="range" class="control-input" id="heatDiff" min="0.02" max="0.4" step="0.01" value="0.15">
        </div>
        <div class="control-group">
          <label for="heatBC">תנאי שפה:</label>
          <select class="control-select" id="heatBC">
            <option value="insulated">מבודד בקצוות (Neumann)</option>
            <option value="cold">מקורר ל-0 בקצוות (Dirichlet)</option>
          </select>
        </div>
        <div style="font-size:0.78rem; color:var(--text-muted); line-height:1.4;">
          <p><i class="fas fa-info-circle"></i> <strong>הנחיות:</strong></p>
          <p>לחצו וגררו על המוט או על הגרף כדי להזריק אנרגיית חום נקודתית נוספת.</p>
        </div>
      `;
    } else {
      // Default: Wave equation (chapters 1, 2, 3, 4)
      simType = 'wave';
      title = 'תנודות מיתר (משוואת הגלים)';
      controlsHTML = `
        <h4>פרמטרים פיזיקליים</h4>
        <div class="control-group">
          <label for="waveSpeed">מהירות גל ($c$): <span class="value-display" id="waveSpeedVal">2.0</span></label>
          <input type="range" class="control-input" id="waveSpeed" min="0.5" max="4.0" step="0.1" value="2.0">
        </div>
        <div class="control-group">
          <label for="waveDamping">חיכוך / ריסון: <span class="value-display" id="waveDampingVal">0.002</span></label>
          <input type="range" class="control-input" id="waveDamping" min="0" max="0.015" step="0.0005" value="0.002">
        </div>
        <div class="control-group">
          <label for="waveBC">תנאי שפה:</label>
          <select class="control-select" id="waveBC">
            <option value="fixed">קצוות קשורים (Fixed)</option>
            <option value="free">קצוות חופשיים (Free)</option>
          </select>
        </div>
        <div style="font-size:0.78rem; color:var(--text-muted); line-height:1.4;">
          <p><i class="fas fa-info-circle"></i> <strong>הנחיות:</strong></p>
          <p>הקליקו ומשכו את המיתר באמצעות העכבר כדי ליצור הפרעה (תנאי התחלה) ולשחרר.</p>
        </div>
      `;
    }

    // Add header & buttons
    simulatorControls.innerHTML = `
      <h3 style="font-size: 1.1rem; margin-bottom: 5px;">${title}</h3>
      <p style="font-size: 0.78rem; color:var(--text-muted); margin-bottom:15px;">פתרון נומרי מבוסס הפרשים סופיים</p>
      
      ${controlsHTML}
      
      <div class="simulator-actions">
        <button class="sim-btn sim-btn-play" id="simPlayBtn"><i class="fas fa-pause"></i><span>עצור</span></button>
        <button class="sim-btn sim-btn-reset" id="simResetBtn"><i class="fas fa-redo"></i><span>אפס</span></button>
      </div>
    `;

    // Initialize simulation manager
    const activeParams = {};
    if (simType === 'wave') {
      activeParams.speed = 2.0;
      activeParams.damping = 0.002;
      activeParams.boundary = 'fixed';
    } else if (simType === 'heat') {
      activeParams.diffusion = 0.15;
      activeParams.boundary = 'insulated';
    } else if (simType === 'laplace') {
      activeParams.boundaryPreset = 'default';
    }

    simulatorManager.init('pdeCanvas', simType, activeParams);

    // Bind event listeners to simulation controls dynamically
    const simPlayBtn = document.getElementById('simPlayBtn');
    const simResetBtn = document.getElementById('simResetBtn');

    if (simPlayBtn) {
      simPlayBtn.addEventListener('click', () => {
        if (simulatorManager.isRunning) {
          simulatorManager.stop();
          simPlayBtn.classList.remove('sim-btn-play');
          simPlayBtn.classList.add('sim-btn-reset');
          simPlayBtn.innerHTML = '<i class="fas fa-play"></i><span>הפעל</span>';
        } else {
          simulatorManager.start();
          simPlayBtn.classList.add('sim-btn-play');
          simPlayBtn.classList.remove('sim-btn-reset');
          simPlayBtn.innerHTML = '<i class="fas fa-pause"></i><span>עצור</span>';
        }
      });
    }

    if (simResetBtn) {
      simResetBtn.addEventListener('click', () => {
        simulatorManager.reset();
      });
    }

    // Slider inputs listeners
    const waveSpeedSlider = document.getElementById('waveSpeed');
    if (waveSpeedSlider) {
      waveSpeedSlider.addEventListener('input', (e) => {
        document.getElementById('waveSpeedVal').textContent = e.target.value;
        simulatorManager.setParam('speed', e.target.value);
      });
    }

    const waveDampingSlider = document.getElementById('waveDamping');
    if (waveDampingSlider) {
      waveDampingSlider.addEventListener('input', (e) => {
        document.getElementById('waveDampingVal').textContent = e.target.value;
        simulatorManager.setParam('damping', e.target.value);
      });
    }

    const waveBCSelect = document.getElementById('waveBC');
    if (waveBCSelect) {
      waveBCSelect.addEventListener('change', (e) => {
        simulatorManager.setParam('boundary', e.target.value);
      });
    }

    const heatDiffSlider = document.getElementById('heatDiff');
    if (heatDiffSlider) {
      heatDiffSlider.addEventListener('input', (e) => {
        document.getElementById('heatDiffVal').textContent = e.target.value;
        simulatorManager.setParam('diffusion', e.target.value);
      });
    }

    const heatBCSelect = document.getElementById('heatBC');
    if (heatBCSelect) {
      heatBCSelect.addEventListener('change', (e) => {
        simulatorManager.setParam('boundary', e.target.value);
      });
    }

    const laplacePresetSelect = document.getElementById('laplacePreset');
    if (laplacePresetSelect) {
      laplacePresetSelect.addEventListener('change', (e) => {
        simulatorManager.setParam('boundaryPreset', e.target.value);
      });
    }

    // Render LaTeX formulas in simulator text descriptions
    renderMathInElement(simulatorControls, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false }
      ],
      throwOnError: false
    });
  }

  // Tab 3: Formula Sheets
  function loadFormulasTab() {
    formulasListContainer.innerHTML = '';
    
    // Draw all formulas in this subchapter
    if (currentActiveSubchapter.formulas && currentActiveSubchapter.formulas.length > 0) {
      currentActiveSubchapter.formulas.forEach(f => {
        const row = document.createElement('div');
        row.className = 'equation-row';
        row.innerHTML = `
          <div class="equation-meta">
            <h4>נוסחה תפעולית</h4>
            <p>${f.desc}</p>
          </div>
          <div class="equation-render">$$${f.tex}$$</div>
        `;
        formulasListContainer.appendChild(row);
      });
    } else {
      formulasListContainer.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding:2rem;">אין נוסחאות רשומות עבור תת-פרק זה.</div>';
    }

    // MathJax/KaTeX compilation
    renderMathInElement(formulasListContainer, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false }
      ],
      throwOnError: false
    });
  }

  // Tab 4: Interactive Quiz Card
  function loadQuizTab() {
    quizContainer.innerHTML = '';
    
    if (!currentActiveSubchapter.quiz || currentActiveSubchapter.quiz.length === 0) {
      quizContainer.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding:2rem;">אין שאלות תרגול פעילות עבור נושא זה עדיין.</div>';
      return;
    }

    const qData = currentActiveSubchapter.quiz[0]; // load first question
    let selectedOptionIndex = null;

    const quizCard = document.createElement('div');
    quizCard.className = 'quiz-card';
    
    const questionHeader = document.createElement('div');
    questionHeader.className = 'quiz-question-header';
    questionHeader.innerHTML = qData.q;
    quizCard.appendChild(questionHeader);

    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'quiz-options';
    
    qData.options.forEach((optText, idx) => {
      const option = document.createElement('div');
      option.className = 'quiz-option';
      option.innerHTML = `
        <div class="quiz-radio"></div>
        <span>${optText}</span>
      `;
      
      option.addEventListener('click', () => {
        // Prevent clicking after submit
        if (quizCard.classList.contains('submitted')) return;

        document.querySelectorAll('.quiz-option').forEach(el => el.classList.remove('selected'));
        option.classList.add('selected');
        selectedOptionIndex = idx;
        submitBtn.disabled = false;
      });

      optionsContainer.appendChild(option);
    });
    quizCard.appendChild(optionsContainer);

    // Explanation panel
    const explanationPanel = document.createElement('div');
    explanationPanel.className = 'quiz-explanation';
    explanationPanel.innerHTML = `
      <strong style="display:block; margin-bottom:6px;"><i class="fas fa-info-circle"></i> הסבר פתרון:</strong>
      <p>${qData.explanation}</p>
    `;
    quizCard.appendChild(explanationPanel);

    // Submit button
    const submitBtn = document.createElement('button');
    submitBtn.className = 'quiz-submit-btn';
    submitBtn.textContent = 'בדוק תשובה';
    submitBtn.disabled = true;
    
    submitBtn.addEventListener('click', () => {
      if (selectedOptionIndex === null) return;
      
      quizCard.classList.add('submitted');
      submitBtn.style.display = 'none';

      const options = document.querySelectorAll('.quiz-option');
      options.forEach((opt, idx) => {
        if (idx === qData.correct) {
          opt.classList.add('correct');
        } else if (idx === selectedOptionIndex) {
          opt.classList.add('wrong');
        }
      });

      // Show solution explanation
      explanationPanel.style.display = 'block';
      
      // Auto compile math in explanation
      renderMathInElement(explanationPanel, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false
      });
    });

    quizCard.appendChild(submitBtn);
    quizContainer.appendChild(quizCard);

    // MathJax compilation on question card
    renderMathInElement(quizCard, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false }
      ],
      throwOnError: false
    });
  }

  // ----------------------------------------------------
  // 6. EVENT LISTENERS BINDINGS
  // ----------------------------------------------------
  
  function setupEventListeners() {
    // Theme toggle click
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Breadcrumb home click
    breadcrumbHome.addEventListener('click', () => {
      studyConsole.style.display = 'none';
      welcomePanel.style.display = 'block';
      // remove active states
      document.querySelectorAll('.subchapter-link').forEach(link => link.classList.remove('active'));
    });

    // Start learning CTA click
    startLearningBtn.addEventListener('click', () => {
      // Find first subchapter of first chapter and navigate
      if (pdeCourseData.length > 0 && pdeCourseData[0].subchapters.length > 0) {
        navigateToSubchapter(pdeCourseData[0].subchapters[0].id);
      }
    });

    // Mark Completed Button click in console header
    markCompletedBtn.addEventListener('click', () => {
      if (currentActiveSubchapter) {
        toggleSubchapterCompletion(currentActiveSubchapter.id);
      }
    });

    // Console Tabs switching
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeTab = btn.getAttribute('data-tab');
        
        tabPanes.forEach(pane => pane.classList.remove('active'));
        document.getElementById(`tab-${activeTab}`).classList.add('active');
        
        loadTabContent();
      });
    });

    // Mobile Hamburger Sidebar Toggle
    mobileMenuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });

    // Close menu when clicking outside of it on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 992 && 
          !sidebar.contains(e.target) && 
          !mobileMenuToggle.contains(e.target) && 
          sidebar.classList.contains('mobile-open')) {
        sidebar.classList.remove('mobile-open');
      }
    });

    // Search bar functionality
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (q === '') {
        searchResultsOverlay.style.display = 'none';
        return;
      }
      
      performSearch(q);
    });

    // Close search overlay
    closeSearchBtn.addEventListener('click', () => {
      searchResultsOverlay.style.display = 'none';
      searchInput.value = '';
    });

    searchResultsOverlay.addEventListener('click', (e) => {
      if (e.target === searchResultsOverlay) {
        searchResultsOverlay.style.display = 'none';
        searchInput.value = '';
      }
    });

    // ESC closes search
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && searchResultsOverlay.style.display === 'flex') {
        searchResultsOverlay.style.display = 'none';
        searchInput.value = '';
      }
    });
  }

  // Search execution
  function performSearch(query) {
    searchResultsList.innerHTML = '';
    const matches = [];

    pdeCourseData.forEach(chapter => {
      chapter.subchapters.forEach(sub => {
        const titleMatch = sub.title.toLowerCase().includes(query) || sub.id.includes(query);
        const summaryMatch = sub.summary.toLowerCase().includes(query);
        let formulaMatch = false;
        
        if (sub.formulas) {
          formulaMatch = sub.formulas.some(f => f.desc.toLowerCase().includes(query) || f.tex.toLowerCase().includes(query));
        }

        if (titleMatch || summaryMatch || formulaMatch) {
          matches.push({
            subId: sub.id,
            title: `${sub.id} ${sub.title}`,
            chapterTitle: chapter.title,
            matchText: titleMatch ? 'התאמה בכותרת' : (summaryMatch ? 'התאמה בסיכום השיעור' : 'התאמה בדף הנוסחאות')
          });
        }
      });
    });

    if (matches.length === 0) {
      searchResultsList.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding:1rem;">לא נמצאו תוצאות עבור החיפוש שלך.</div>';
    } else {
      matches.forEach(m => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.innerHTML = `
          <h4>${m.title}</h4>
          <p style="font-size:0.78rem; color:var(--text-muted); margin-bottom:2px;">${m.chapterTitle}</p>
          <span style="font-size:0.7rem; background-color:var(--bg-input); padding:2px 6px; border-radius:4px; color:var(--color-secondary); font-weight:600;">${m.matchText}</span>
        `;
        item.addEventListener('click', () => {
          navigateToSubchapter(m.subId);
          searchResultsOverlay.style.display = 'none';
          searchInput.value = '';
        });
        searchResultsList.appendChild(item);
      });
    }

    searchResultsOverlay.style.display = 'flex';
  }

  // Run the initializer
  init();
});
