/**
 * PDE TechnionPrep - Main Application Controller
 * Handles theme toggles, navigation state, localStorage progress tracking, 
 * and inline rendering of study materials, equations, simulators, and quizzes in a continuous flow.
 */

// Global runtime error visualizer for easy debugging
window.addEventListener('error', (e) => {
  const errBox = document.createElement('div');
  errBox.style.position = 'fixed';
  errBox.style.bottom = '20px';
  errBox.style.left = '20px';
  errBox.style.backgroundColor = 'rgba(239, 68, 68, 0.95)';
  errBox.style.color = '#ffffff';
  errBox.style.padding = '16px';
  errBox.style.borderRadius = '8px';
  errBox.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.5)';
  errBox.style.zIndex = '999999';
  errBox.style.fontFamily = 'monospace';
  errBox.style.fontSize = '12px';
  errBox.style.maxWidth = '500px';
  errBox.style.lineHeight = '1.5';
  errBox.style.border = '1px solid #f87171';
  
  errBox.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">⚠️ Runtime Error Detected:</div>
    <div style="margin-bottom: 6px;"><strong>Msg:</strong> ${e.message}</div>
    <div style="margin-bottom: 6px;"><strong>File:</strong> ${e.filename ? e.filename.split('/').pop() : 'unknown'}</div>
    <div><strong>Line:</strong> ${e.lineno}:${e.colno}</div>
  `;
  document.body.appendChild(errBox);
});

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
  
  // Dynamic registry definition for modular content files
  window.pdeSubchapterRegistry = window.pdeSubchapterRegistry || {};
  const populatedSubchapters = ["1.1", "1.2", "1.3", "1.4"];

  function prefetchContent() {
    populatedSubchapters.forEach(subId => {
      const scriptId = `script-sub-${subId.replace('.', '_')}`;
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `content/${subId}.js?v=1.0.4`;
        script.onload = () => {
          // Sync content and quizzes to the local metadata outline for search and fast routing
          pdeCourseData.forEach(ch => {
            ch.subchapters.forEach(sub => {
              if (sub.id === subId && window.pdeSubchapterRegistry[subId]) {
                sub.content = window.pdeSubchapterRegistry[subId].content;
                sub.quizzes = window.pdeSubchapterRegistry[subId].quizzes;
              }
            });
          });
        };
        document.head.appendChild(script);
      }
    });
  }

  function init() {
    renderSidebar();
    renderWelcomeGrid();
    updateProgressTracker();
    restoreTheme();
    setupEventListeners();
    prefetchContent(); // Prefetch populated content files in the background
    
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
    simulatorManager.stopAll();
    studyContentFlow.innerHTML = '';

    const subId = currentActiveSubchapter.id;

    // 1. If content is already loaded in the global registry, render it immediately
    if (window.pdeSubchapterRegistry[subId]) {
      // Sync cache
      currentActiveSubchapter.content = window.pdeSubchapterRegistry[subId].content;
      currentActiveSubchapter.quizzes = window.pdeSubchapterRegistry[subId].quizzes;
      renderSubchapterContent(currentActiveSubchapter);
    } 
    // 2. If it is one of the populated subchapters, load it dynamically (if not finished prefetching)
    else if (populatedSubchapters.includes(subId)) {
      studyContentFlow.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:200px; color:var(--text-muted);">
          <i class="fas fa-spinner fa-spin" style="font-size:2rem; color:var(--color-secondary); margin-bottom:15px;"></i>
          <p>טוען את תוכן השיעור...</p>
        </div>
      `;

      const scriptId = `script-sub-${subId.replace('.', '_')}`;
      let script = document.getElementById(scriptId);
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = `content/${subId}.js?v=1.0.4`;
        document.head.appendChild(script);
      }

      const onLoadHandler = () => {
        if (window.pdeSubchapterRegistry[subId]) {
          currentActiveSubchapter.content = window.pdeSubchapterRegistry[subId].content;
          currentActiveSubchapter.quizzes = window.pdeSubchapterRegistry[subId].quizzes;
          renderSubchapterContent(currentActiveSubchapter);
        } else {
          renderComingSoonCard(subId);
        }
      };

      const onErrorHandler = () => {
        renderComingSoonCard(subId);
      };

      // Set or update event listeners
      script.onload = onLoadHandler;
      script.onerror = onErrorHandler;
    } 
    // 3. Otherwise, render the "Coming Soon" card
    else {
      renderComingSoonCard(subId);
    }
  }

  function renderSubchapterContent(subchapter) {
    const content = subchapter.content;
    if (!content || content.trim() === '') {
      renderComingSoonCard(subchapter.id);
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

  function renderComingSoonCard(subId) {
    studyContentFlow.innerHTML = '';
    const placeholder = document.createElement('div');
    placeholder.className = 'coming-soon-card';
    placeholder.innerHTML = `
      <i class="fas fa-graduation-cap"></i>
      <h3>תוכן תת-הפרק ייטען בקרוב</h3>
      <p>התוכן הלימודי, דוגמאות פתורות ותרגילים אינטראקטיביים עבור נושא זה (${subId}) ייכתבו בהנחייתך שלב אחר שלב.</p>
    `;
    studyContentFlow.appendChild(placeholder);
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
      let desc = 'פתרון נומרי מבוסס הפרשים סופיים';
      let hint = 'לחץ וגרור כדי להשפיע על המערכת';
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
      } else if (simType === 'transversality') {
        title = 'הדמיית תנאי הטרנסוורסליות';
        desc = 'בדיקת משיקיות והקבלה לאופיינים בזמן אמת';
        hint = '';
        controlsHTML = `
          <h4>בחירת המערכת</h4>
          <div class="control-group">
            <label for="transCharType">סוג הקווים האופייניים:</label>
            <select class="control-select" id="transCharType">
              <option value="horizontal">קווים אופקיים (ux = 0)</option>
              <option value="diagonal">קווים אלכסוניים (ux - uy = 0)</option>
              <option value="circular">מעגלים קונצנטריים (y ux - x uy = 0)</option>
            </select>
          </div>
          <div class="control-group">
            <label for="transCurveType">סוג עקום ההתחלה:</label>
            <select class="control-select" id="transCurveType">
              <option value="line">ישר (Line)</option>
              <option value="parabola">פרבולה (Parabola)</option>
              <option value="sine">עקום סינוסוידלי (Sine)</option>
            </select>
          </div>
          <div class="control-group">
            <label for="transAngle">זווית עקום ההתחלה: <span class="value-display" id="transAngleVal">90°</span></label>
            <input type="range" class="control-input" id="transAngle" min="0" max="180" step="5" value="90">
          </div>
          <div class="control-group">
            <label for="transOffset">הזזה (Offset): <span class="value-display" id="transOffsetVal">0</span></label>
            <input type="range" class="control-input" id="transOffset" min="-100" max="100" step="5" value="0">
          </div>
          <div style="font-size:0.78rem; color:var(--text-muted); line-height:1.4; margin-top:8px;">
            <p><i class="fas fa-info-circle"></i> <strong>הנחיות:</strong></p>
            <p>שנו את הפרמטרים של עקום ההתחלה (סגול) וראו מתי הוא הופך ל<strong>אדום</strong> (מפר את תנאי הטרנסוורסליות) ומציג הילה אדומה סביב נקודות המשיקיות/הקבלה לאופיינים (הכתומים).</p>
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
        <p style="font-size: 0.78rem; color:var(--text-muted); margin-bottom:15px;">${desc}</p>
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
              ${hint ? `<div class="canvas-hint">${hint}</div>` : ''}
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
      } else if (simType === 'transversality') {
        activeParams.charType = 'horizontal';
        activeParams.curveType = 'line';
        activeParams.angle = 90;
        activeParams.offset = 0;
      }

      simulatorManager.init(canvasId, simType, activeParams);

      // Bind buttons
      const playBtn = document.getElementById(`simPlayBtn-${idx}`);
      const resetBtn = document.getElementById(`simResetBtn-${idx}`);

      playBtn.addEventListener('click', () => {
        if (simulatorManager.isRunning[canvasId]) {
          simulatorManager.stop(canvasId);
          playBtn.classList.remove('sim-btn-play');
          playBtn.classList.add('sim-btn-reset');
          playBtn.innerHTML = '<i class="fas fa-play"></i><span>הפעל</span>';
        } else {
          simulatorManager.start(canvasId);
          playBtn.classList.add('sim-btn-play');
          playBtn.classList.remove('sim-btn-reset');
          playBtn.innerHTML = '<i class="fas fa-pause"></i><span>עצור</span>';
        }
      });

      resetBtn.addEventListener('click', () => {
        simulatorManager.reset(canvasId);
        if (simType === 'transversality') {
          const transCharType = placeholder.querySelector('#transCharType');
          const transCurveType = placeholder.querySelector('#transCurveType');
          const transAngle = placeholder.querySelector('#transAngle');
          const transOffset = placeholder.querySelector('#transOffset');
          if (transCharType) transCharType.value = 'horizontal';
          if (transCurveType) transCurveType.value = 'line';
          if (transAngle) {
            transAngle.value = 90;
            placeholder.querySelector('#transAngleVal').textContent = '90°';
          }
          if (transOffset) {
            transOffset.value = 0;
            placeholder.querySelector('#transOffsetVal').textContent = '0';
          }
          simulatorManager.setParam(canvasId, 'charType', 'horizontal');
          simulatorManager.setParam(canvasId, 'curveType', 'line');
          simulatorManager.setParam(canvasId, 'angle', 90);
          simulatorManager.setParam(canvasId, 'offset', 0);
        }
      });

      // Bind sliders
      const waveSpeed = placeholder.querySelector('#waveSpeed');
      if (waveSpeed) {
        waveSpeed.addEventListener('input', (e) => {
          placeholder.querySelector('#waveSpeedVal').textContent = e.target.value;
          simulatorManager.setParam(canvasId, 'speed', e.target.value);
        });
      }
      const waveDamping = placeholder.querySelector('#waveDamping');
      if (waveDamping) {
        waveDamping.addEventListener('input', (e) => {
          placeholder.querySelector('#waveDampingVal').textContent = e.target.value;
          simulatorManager.setParam(canvasId, 'damping', e.target.value);
        });
      }
      const waveBC = placeholder.querySelector('#waveBC');
      if (waveBC) {
        waveBC.addEventListener('change', (e) => {
          simulatorManager.setParam(canvasId, 'boundary', e.target.value);
        });
      }
      const heatDiff = placeholder.querySelector('#heatDiff');
      if (heatDiff) {
        heatDiff.addEventListener('input', (e) => {
          placeholder.querySelector('#heatDiffVal').textContent = e.target.value;
          simulatorManager.setParam(canvasId, 'diffusion', e.target.value);
        });
      }
      const heatBC = placeholder.querySelector('#heatBC');
      if (heatBC) {
        heatBC.addEventListener('change', (e) => {
          simulatorManager.setParam(canvasId, 'boundary', e.target.value);
        });
      }
      const laplacePreset = placeholder.querySelector('#laplacePreset');
      if (laplacePreset) {
        laplacePreset.addEventListener('change', (e) => {
          simulatorManager.setParam(canvasId, 'boundaryPreset', e.target.value);
        });
      }
      const transCharType = placeholder.querySelector('#transCharType');
      if (transCharType) {
        transCharType.addEventListener('change', (e) => {
          simulatorManager.setParam(canvasId, 'charType', e.target.value);
        });
      }
      const transCurveType = placeholder.querySelector('#transCurveType');
      if (transCurveType) {
        transCurveType.addEventListener('change', (e) => {
          simulatorManager.setParam(canvasId, 'curveType', e.target.value);
        });
      }
      const transAngle = placeholder.querySelector('#transAngle');
      if (transAngle) {
        transAngle.addEventListener('input', (e) => {
          placeholder.querySelector('#transAngleVal').textContent = e.target.value + '°';
          simulatorManager.setParam(canvasId, 'angle', e.target.value);
        });
      }
      const transOffset = placeholder.querySelector('#transOffset');
      if (transOffset) {
        transOffset.addEventListener('input', (e) => {
          placeholder.querySelector('#transOffsetVal').textContent = e.target.value;
          simulatorManager.setParam(canvasId, 'offset', e.target.value);
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

    placeholder.className = 'quiz-card';
    placeholder.innerHTML = `
      <div class="quiz-question-header">${qData.q}</div>
      <div class="quiz-options"></div>
      <div class="quiz-explanation">
        <strong style="display:block; margin-bottom:6px;"><i class="fas fa-info-circle"></i> הסבר פתרון:</strong>
        <p>${qData.explanation}</p>
      </div>
    `;

    const optionsContainer = placeholder.querySelector('.quiz-options');
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
        placeholder.classList.add('submitted');

        const options = optionsContainer.querySelectorAll('.quiz-option');
        options.forEach((opt, oIdx) => {
          if (oIdx === qData.correct) {
            opt.classList.add('correct');
          } else if (oIdx === idx) {
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

      optionsContainer.appendChild(option);
    });
  }

  function renderQuizCarousel(container) {
    const carouselId = container.getAttribute('data-carousel-id');
    let quizzes = [];
    
    if (carouselId) {
      if (currentActiveSubchapter.quizzes && currentActiveSubchapter.quizzes[carouselId]) {
        quizzes = currentActiveSubchapter.quizzes[carouselId];
      }
    } else {
      quizzes = currentActiveSubchapter.quizzes || [];
    }

    if (!quizzes || quizzes.length === 0) {
      container.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding:2rem;">אין שאלות תרגול פעילות.</div>';
      return;
    }

    const customTitle = container.getAttribute('data-carousel-title') || `נושא: ${currentActiveSubchapter.title}`;
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
      container.querySelector('.carousel-step').textContent = `שאלה ${activeIndex + 1} מתוך ${quizzes.length}`;
      container.querySelector('.carousel-progress-fill').style.width = `${((activeIndex + 1) / quizzes.length) * 100}%`;

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
      const prevBtn = container.querySelector('.carousel-prev-btn');
      const nextBtn = container.querySelector('.carousel-next-btn');
      prevBtn.disabled = activeIndex === 0;
      
      if (activeIndex === quizzes.length - 1) {
        nextBtn.style.visibility = 'hidden';
      } else {
        nextBtn.style.visibility = 'visible';
        nextBtn.innerHTML = 'הבא <i class="fas fa-arrow-left"></i>';
      }

      // Render slide content
      const slidesContainer = container.querySelector('.carousel-slides');
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
      `;

      const optionsContainer = quizCard.querySelector('.quiz-options');
      const explanationPanel = quizCard.querySelector('.quiz-explanation');

      // Check if it is a Yes/No question to apply a side-by-side flex layout
      const isYesNo = qData.options.length === 2 && 
                      (qData.options[0] === 'כן' || qData.options[0] === 'לא') && 
                      (qData.options[1] === 'כן' || qData.options[1] === 'לא');
      if (isYesNo) {
        optionsContainer.classList.add('yes-no');
      }

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
          state.selectedOptionIndex = idx;
          state.submitted = true;
          state.isCorrect = idx === qData.correct;
          
          // Refresh slide view to show correct/incorrect markers and explanation
          renderSlide();
        });

        optionsContainer.appendChild(option);
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
        <span class="carousel-title">${customTitle}</span>
        <span class="carousel-step">שאלה 1 מתוך ${quizzes.length}</span>
      </div>
      <div class="carousel-progress-bar">
        <div class="carousel-progress-fill" style="width: 0%;"></div>
      </div>
      <div class="carousel-slides"></div>
      <div class="carousel-navigation">
        <button class="sim-btn sim-btn-reset carousel-prev-btn" disabled><i class="fas fa-arrow-right"></i> הקודם</button>
        <div class="carousel-dots"></div>
        <button class="sim-btn sim-btn-play carousel-next-btn">הבא <i class="fas fa-arrow-left"></i></button>
      </div>
    `;

    // Render dots
    const dotsContainer = container.querySelector('.carousel-dots');
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
    container.querySelector('.carousel-prev-btn').addEventListener('click', () => {
      if (activeIndex > 0) {
        activeIndex--;
        renderSlide();
      }
    });

    container.querySelector('.carousel-next-btn').addEventListener('click', () => {
      if (activeIndex < quizzes.length - 1) {
        activeIndex++;
        renderSlide();
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
