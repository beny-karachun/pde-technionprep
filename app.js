/**
 * PDE TechnionPrep - Main Application Controller
 * Handles theme toggles, navigation state, localStorage progress tracking, 
 * and inline rendering of study materials, equations, simulators, and quizzes in a continuous flow.
 */

document.addEventListener('DOMContentLoaded', () => {
  // State variables
  let completedSubchapters = JSON.parse(localStorage.getItem('pde_completed_topics')) || [];
  let currentActiveSubchapter = null;
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
  
  // Content flow pane
  const studyContentFlow = document.getElementById('studyContentFlow');
  
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
  // 4. RENDERING SYLLABUS VIEWS
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
        <p>${chapter.description || 'סילבוס הלימודים המלא ונושאי התרגול.'}</p>
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

    // Load active topic continuous content
    loadSubchapterFlow();
    updateMainConsoleCompletedButton(subchapterId);
    
    // Scroll workspace back to top
    document.getElementById('mainWorkspace').scrollTop = 0;
  }

  function loadSubchapterFlow() {
    if (!currentActiveSubchapter) return;
    
    // Clear simulator state before rendering new page
    simulatorManager.stop();
    studyContentFlow.innerHTML = '';

    const content = currentActiveSubchapter.content;
    
    // If no content, render a Coming Soon card
    if (!content || content.trim() === '') {
      const placeholder = document.createElement('div');
      placeholder.className = 'coming-soon-card';
      placeholder.innerHTML = `
        <i class="fas fa-graduation-cap"></i>
        <h3>תוכן תת-הפרק ייטען בקרוב</h3>
        <p>התוכן הלימודי, דוגמאות פתורות ותרגילים אינטראקטיביים עבור נושא זה (${currentActiveSubchapter.id}) ייכתבו בהנחייתך שלב אחר שלב.</p>
      `;
      studyContentFlow.appendChild(placeholder);
      return;
    }

    // Inject HTML content
    studyContentFlow.innerHTML = content;

    // Bootstrap inline components
    bootInlineSimulators();
    bootInlineQuizzes();

    // Render LaTeX equations in the injected content flow
    renderMathInElement(studyContentFlow, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false }
      ],
      throwOnError: false
    });
  }

  // ----------------------------------------------------
  // 6. DYNAMIC COMPONENT LOADER (Simulators & Quizzes)
  // ----------------------------------------------------

  function bootInlineSimulators() {
    const placeholders = document.querySelectorAll('.inline-simulator-placeholder');
    placeholders.forEach((placeholder, idx) => {
      const simType = placeholder.getAttribute('data-sim') || 'wave';
      const canvasId = `canvas-sim-${idx}`;
      
      let title = 'סימולטור משוואת הגלים';
      let controlsHTML = '';
      if (simType === 'laplace') {
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
          <div style="font-size:0.78rem; color:var(--text-muted); line-height:1.4; margin-top:8px;">
            <p><i class="fas fa-info-circle"></i> <strong>הנחיות:</strong></p>
            <p>הקלק וגרור על לוח הסימולציה כדי לצייר קווי טמפרטורה חמים. המערכת תבצע רלקסציה בזמן אמת לפתרון משוואת לפלס $\\nabla^2 u = 0$.</p>
            <p><strong>קליק ימני (או Shift + גרור):</strong> מצייר גבולות קרים ($0^\\circ$).</p>
          </div>
        `;
      } else if (simType === 'heat') {
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
          <div style="font-size:0.78rem; color:var(--text-muted); line-height:1.4; margin-top:8px;">
            <p><i class="fas fa-info-circle"></i> <strong>הנחיות:</strong></p>
            <p>לחצו וגררו על המוט או על הגרף כדי להזריק אנרגיית חום נקודתית נוספת.</p>
          </div>
        `;
      } else {
        // Wave
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
          <div style="font-size:0.78rem; color:var(--text-muted); line-height:1.4; margin-top:8px;">
            <p><i class="fas fa-info-circle"></i> <strong>הנחיות:</strong></p>
            <p>הקליקו ומשכו את המיתר באמצעות העכבר כדי ליצור הפרעה (תנאי התחלה) ולשחרר.</p>
          </div>
        `;
      }

      placeholder.className = 'inline-simulator-card';
      placeholder.innerHTML = `
        <h3 style="font-size: 1.1rem; margin-bottom: 2px;">${title}</h3>
        <p style="font-size: 0.78rem; color:var(--text-muted); margin-bottom:15px;">פתרון נומרי מבוסס הפרשים סופיים</p>
        <div class="simulator-layout">
          <div class="simulator-controls">
            ${controlsHTML}
            <div class="simulator-actions">
              <button class="sim-btn sim-btn-play" id="simPlayBtn-${idx}"><i class="fas fa-pause"></i><span>עצור</span></button>
              <button class="sim-btn sim-btn-reset" id="simResetBtn-${idx}"><i class="fas fa-redo"></i><span>אפס</span></button>
            </div>
          </div>
          <div class="simulator-display">
            <div class="simulator-canvas-wrapper">
              <canvas class="simulator-canvas" id="${canvasId}"></canvas>
              <div class="canvas-hint">לחץ וגרור כדי להשפיע על המערכת</div>
            </div>
          </div>
        </div>
      `;

      // Init simulation
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

      simulatorManager.init(canvasId, simType, activeParams);

      // Bind buttons
      const playBtn = document.getElementById(`simPlayBtn-${idx}`);
      const resetBtn = document.getElementById(`simResetBtn-${idx}`);

      playBtn.addEventListener('click', () => {
        if (simulatorManager.isRunning) {
          simulatorManager.stop();
          playBtn.classList.remove('sim-btn-play');
          playBtn.classList.add('sim-btn-reset');
          playBtn.innerHTML = '<i class="fas fa-play"></i><span>הפעל</span>';
        } else {
          simulatorManager.start();
          playBtn.classList.add('sim-btn-play');
          playBtn.classList.remove('sim-btn-reset');
          playBtn.innerHTML = '<i class="fas fa-pause"></i><span>עצור</span>';
        }
      });

      resetBtn.addEventListener('click', () => {
        simulatorManager.reset();
      });

      // Bind sliders
      const waveSpeed = placeholder.querySelector('#waveSpeed');
      if (waveSpeed) {
        waveSpeed.addEventListener('input', (e) => {
          placeholder.querySelector('#waveSpeedVal').textContent = e.target.value;
          simulatorManager.setParam('speed', e.target.value);
        });
      }
      const waveDamping = placeholder.querySelector('#waveDamping');
      if (waveDamping) {
        waveDamping.addEventListener('input', (e) => {
          placeholder.querySelector('#waveDampingVal').textContent = e.target.value;
          simulatorManager.setParam('damping', e.target.value);
        });
      }
      const waveBC = placeholder.querySelector('#waveBC');
      if (waveBC) {
        waveBC.addEventListener('change', (e) => {
          simulatorManager.setParam('boundary', e.target.value);
        });
      }
      const heatDiff = placeholder.querySelector('#heatDiff');
      if (heatDiff) {
        heatDiff.addEventListener('input', (e) => {
          placeholder.querySelector('#heatDiffVal').textContent = e.target.value;
          simulatorManager.setParam('diffusion', e.target.value);
        });
      }
      const heatBC = placeholder.querySelector('#heatBC');
      if (heatBC) {
        heatBC.addEventListener('change', (e) => {
          simulatorManager.setParam('boundary', e.target.value);
        });
      }
      const laplacePreset = placeholder.querySelector('#laplacePreset');
      if (laplacePreset) {
        laplacePreset.addEventListener('change', (e) => {
          simulatorManager.setParam('boundaryPreset', e.target.value);
        });
      }
    });
  }

  function bootInlineQuizzes() {
    // 1. Single Quiz loaders
    const placeholders = document.querySelectorAll('.inline-quiz-placeholder');
    placeholders.forEach((placeholder) => {
      const qIdx = parseInt(placeholder.getAttribute('data-quiz-index') || '0');
      renderSingleQuiz(placeholder, qIdx);
    });

    // 2. Carousel Quiz loaders
    const carousels = document.querySelectorAll('.inline-quiz-carousel-placeholder');
    carousels.forEach((carousel) => {
      renderQuizCarousel(carousel);
    });
  }

  function renderSingleQuiz(placeholder, qIdx) {
    if (!currentActiveSubchapter.quizzes || !currentActiveSubchapter.quizzes[qIdx]) return;
    
    const qData = currentActiveSubchapter.quizzes[qIdx];
    let selectedOptionIndex = null;

    placeholder.className = 'quiz-card';
    placeholder.innerHTML = `
      <div class="quiz-question-header">${qData.q}</div>
      <div class="quiz-options"></div>
      <div class="quiz-explanation">
        <strong style="display:block; margin-bottom:6px;"><i class="fas fa-info-circle"></i> הסבר פתרון:</strong>
        <p>${qData.explanation}</p>
      </div>
      <button class="quiz-submit-btn" disabled>בדוק תשובה</button>
    `;

    const optionsContainer = placeholder.querySelector('.quiz-options');
    const submitBtn = placeholder.querySelector('.quiz-submit-btn');
    const explanationPanel = placeholder.querySelector('.quiz-explanation');

    qData.options.forEach((optText, idx) => {
      const option = document.createElement('div');
      option.className = 'quiz-option';
      option.innerHTML = `
        <div class="quiz-radio"></div>
        <span>${optText}</span>
      `;
      
      option.addEventListener('click', () => {
        if (placeholder.classList.contains('submitted')) return;
        placeholder.querySelectorAll('.quiz-option').forEach(el => el.classList.remove('selected'));
        option.classList.add('selected');
        selectedOptionIndex = idx;
        submitBtn.disabled = false;
      });

      optionsContainer.appendChild(option);
    });

    submitBtn.addEventListener('click', () => {
      if (selectedOptionIndex === null) return;
      placeholder.classList.add('submitted');
      submitBtn.style.display = 'none';

      const options = placeholder.querySelectorAll('.quiz-option');
      options.forEach((opt, idx) => {
        if (idx === qData.correct) {
          opt.classList.add('correct');
        } else if (idx === selectedOptionIndex) {
          opt.classList.add('wrong');
        }
      });

      explanationPanel.style.display = 'block';
      renderMathInElement(explanationPanel, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false
      });
    });
  }

  function renderQuizCarousel(container) {
    if (!currentActiveSubchapter.quizzes || currentActiveSubchapter.quizzes.length === 0) {
      container.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding:2rem;">אין שאלות תרגול פעילות.</div>';
      return;
    }

    const quizzes = currentActiveSubchapter.quizzes;
    let activeIndex = 0;
    
    // Store user answers/states for the carousel session
    const quizStates = quizzes.map(() => ({
      selectedOptionIndex: null,
      submitted: false,
      isCorrect: null
    }));

    function renderSlide() {
      const qData = quizzes[activeIndex];
      const state = quizStates[activeIndex];
      
      // Update header
      container.querySelector('#carouselStepText').textContent = `שאלה ${activeIndex + 1} מתוך ${quizzes.length}`;
      container.querySelector('#carouselProgressFill').style.width = `${((activeIndex + 1) / quizzes.length) * 100}%`;

      // Update dots
      const dots = container.querySelectorAll('.carousel-dot');
      dots.forEach((dot, idx) => {
        dot.className = 'carousel-dot';
        if (idx === activeIndex) dot.classList.add('active');
        if (quizStates[idx].submitted) {
          if (quizStates[idx].isCorrect) dot.classList.add('correct');
          else dot.classList.add('wrong');
        }
      });

      // Update buttons
      const prevBtn = container.querySelector('#carouselPrevBtn');
      const nextBtn = container.querySelector('#carouselNextBtn');
      prevBtn.disabled = activeIndex === 0;
      
      if (activeIndex === quizzes.length - 1) {
        nextBtn.innerHTML = 'סיום תרגול <i class="fas fa-flag-checkered"></i>';
      } else {
        nextBtn.innerHTML = 'הבא <i class="fas fa-arrow-left"></i>';
      }

      // Render slide content
      const slidesContainer = container.querySelector('#carouselSlides');
      slidesContainer.innerHTML = '';

      const quizCard = document.createElement('div');
      quizCard.className = 'quiz-card';
      quizCard.style.border = 'none';
      quizCard.style.padding = '0';
      quizCard.style.backgroundColor = 'transparent';
      quizCard.style.boxShadow = 'none';
      quizCard.style.margin = '0';

      if (state.submitted) quizCard.classList.add('submitted');

      quizCard.innerHTML = `
        <div class="quiz-question-header">${qData.q}</div>
        <div class="quiz-options"></div>
        <div class="quiz-explanation" style="${state.submitted ? 'display: block;' : ''}">
          <strong style="display:block; margin-bottom:6px;"><i class="fas fa-info-circle"></i> הסבר פתרון:</strong>
          <p>${qData.explanation}</p>
        </div>
        <button class="quiz-submit-btn" ${state.selectedOptionIndex !== null && !state.submitted ? '' : 'style="display:none;"'}>בדוק תשובה</button>
      `;

      const optionsContainer = quizCard.querySelector('.quiz-options');
      const submitBtn = quizCard.querySelector('.quiz-submit-btn');
      const explanationPanel = quizCard.querySelector('.quiz-explanation');

      qData.options.forEach((optText, idx) => {
        const option = document.createElement('div');
        option.className = 'quiz-option';
        
        if (state.submitted) {
          if (idx === qData.correct) option.classList.add('correct');
          else if (idx === state.selectedOptionIndex) option.classList.add('wrong');
        } else if (idx === state.selectedOptionIndex) {
          option.classList.add('selected');
        }

        option.innerHTML = `
          <div class="quiz-radio"></div>
          <span>${optText}</span>
        `;

        option.addEventListener('click', () => {
          if (state.submitted) return;
          quizCard.querySelectorAll('.quiz-option').forEach(el => el.classList.remove('selected'));
          option.classList.add('selected');
          state.selectedOptionIndex = idx;
          submitBtn.style.display = 'block';
          submitBtn.disabled = false;
        });

        optionsContainer.appendChild(option);
      });

      submitBtn.addEventListener('click', () => {
        if (state.selectedOptionIndex === null) return;
        
        state.submitted = true;
        state.isCorrect = state.selectedOptionIndex === qData.correct;
        
        // Refresh slide view to show correct/incorrect markers and explanation
        renderSlide();
      });

      slidesContainer.appendChild(quizCard);

      // Compile math in slide
      renderMathInElement(quizCard, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false
      });
    }

    // Outer layout of carousel
    container.className = 'quiz-carousel';
    container.innerHTML = `
      <div class="carousel-header">
        <span class="carousel-title">תרגול נושא: ${currentActiveSubchapter.title}</span>
        <span class="carousel-step" id="carouselStepText">שאלה 1 מתוך ${quizzes.length}</span>
      </div>
      <div class="carousel-progress-bar">
        <div class="carousel-progress-fill" id="carouselProgressFill" style="width: 0%;"></div>
      </div>
      <div class="carousel-slides" id="carouselSlides"></div>
      <div class="carousel-navigation">
        <button class="sim-btn sim-btn-reset" id="carouselPrevBtn" disabled><i class="fas fa-arrow-right"></i> הקודם</button>
        <div class="carousel-dots" id="carouselDots"></div>
        <button class="sim-btn sim-btn-play" id="carouselNextBtn">הבא <i class="fas fa-arrow-left"></i></button>
      </div>
    `;

    // Render dots
    const dotsContainer = container.querySelector('#carouselDots');
    quizzes.forEach((_, idx) => {
      const dot = document.createElement('div');
      dot.className = 'carousel-dot';
      dot.addEventListener('click', () => {
        activeIndex = idx;
        renderSlide();
      });
      dotsContainer.appendChild(dot);
    });

    // Navigation bindings
    container.querySelector('#carouselPrevBtn').addEventListener('click', () => {
      if (activeIndex > 0) {
        activeIndex--;
        renderSlide();
      }
    });

    container.querySelector('#carouselNextBtn').addEventListener('click', () => {
      if (activeIndex < quizzes.length - 1) {
        activeIndex++;
        renderSlide();
      } else {
        // Complete the topic
        toggleSubchapterCompletion(currentActiveSubchapter.id);
        alert('כל הכבוד! סיימת את תרגול הנושא בהצלחה.');
      }
    });

    renderSlide();
  }

  // ----------------------------------------------------
  // 7. EVENT LISTENERS BINDINGS
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
        const contentMatch = sub.content && sub.content.toLowerCase().includes(query);

        if (titleMatch || contentMatch) {
          matches.push({
            subId: sub.id,
            title: `${sub.id} ${sub.title}`,
            chapterTitle: chapter.title,
            matchText: titleMatch ? 'התאמה בכותרת' : 'התאמה בתוכן השיעור'
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
