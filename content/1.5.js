window.pdeSubchapterRegistry = window.pdeSubchapterRegistry || {};
window.pdeSubchapterRegistry["1.5"] = {
  content: `
    <h3>פתרון אמיתי (קלאסי) של מד"ח</h3>
    <p>בלמידה למבחן בטכניון, ההגדרה של <strong>פתרון אמיתי (קלאסי - Classical Solution)</strong> היא פשוטה ופרקטית:</p>

    <div style="background-color: rgba(var(--hue-primary), 0.02); border-right: 4px solid var(--color-primary); padding: 1.25rem; margin: 1.5rem 0; border-radius: 0 var(--border-radius-sm) var(--border-radius-sm) 0; box-shadow: var(--shadow-main); line-height: 1.8;">
      <strong>הגדרה:</strong> פונקציה תיקרא פתרון אמיתי (קלאסי) של מד"ח בתחום מסוים אם היא מקיימת:
      <ol style="margin-right: 1.5rem; margin-top: 0.5rem;">
        <li><strong>גזירות רציפה ($C^k$):</strong> היא גזירה ברציפות מסדר המשוואה ($k$) בתחום.</li>
        <li><strong>קיום נקודתי:</strong> היא מקיימת את המשוואה בכל נקודה ונקודה בתחום.</li>
        <li><strong>תנאי שפה/התחלה (אם קיימים):</strong> היא מקיימת אותם ורציפה עד לשפה.</li>
      </ol>
    </div>

    <h4 style="color: var(--color-secondary); margin-top: 1.5rem; font-size: 1.15rem; font-weight: 600;"><i class="fas fa-exclamation-triangle"></i> דוגמת מלכודת נפוצה ממבחנים</h4>
    <p>נתבונן במד"ח $u_x = 0$ בתחום $\\Omega = (-1, 1) \\times (-1, 1)$.
    <br>האם $u(x,y) = |x|$ היא פתרון קלאסי?
    <br><strong>תשובה: לא!</strong> למרות שעבור $x \\neq 0$ מתקיים $u_x = 0$, בנקודה $x=0$ הפונקציה אינה גזירה. מאחר שהיא לא גזירה ברציפות פעם אחת בכל התחום ($u \\notin C^1$), היא אינה פתרון קלאסי.</p>

    <h4 style="color: var(--color-primary-glow); margin-top: 1.5rem; font-size: 1.15rem; font-weight: 600;">דוגמה לפתרון קלאסי תקין</h4>
    <p>עבור משוואת הגלים $u_{tt} - 4u_{xx} = 0$ בתחום $t > 0, x \\in \\mathbb{R}$:
    <br>האם $u(x,t) = \\cos(x - 2t)$ היא פתרון קלאסי?
    <br><strong>תשובה: כן.</strong> הפונקציה גזירה אינסוף פעמים ברציפות ($C^\\infty$, ובפרט $C^2$ שהוא סדר המשוואה). בהצבה נקבל:
    $$u_{tt} = -4\\cos(x-2t), \\quad u_{xx} = -\\cos(x-2t)$$
    $$-4\\cos(x-2t) - 4(-\\cos(x-2t)) = 0$$
    המשוואה מתקיימת בכל נקודה בתחום.</p>

    <h3>בוחן תרגול: האם זהו פתרון אמיתי?</h3>
    <p>בדקו את הבנתכם עם השאלות הבאות (שימו לב היטב לתחומי ההגדרה ולגזירות):</p>

    <div class="inline-quiz-carousel-placeholder" data-carousel-id="real_solution" data-carousel-title="בחינת פתרונות קלאסיים"></div>
  `,
  quizzes: {
    real_solution: [
      {
        q: "האם הפונקציה $u(x,y) = |x-y|$ היא פתרון קלאסי של המד\"ח $u_x + u_y = 0$ בתחום $\\mathbb{R}^2$?",
        graph: `
          <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
            <svg viewBox="0 0 400 160" width="100%" height="160" style="background: #15181f; border-radius: var(--border-radius-sm); border: 1px solid var(--border-color);">
              <g stroke="#232731" stroke-width="1">
                <line x1="40" y1="0" x2="40" y2="160" /><line x1="80" y1="0" x2="80" y2="160" /><line x1="120" y1="0" x2="120" y2="160" /><line x1="160" y1="0" x2="160" y2="160" />
                <line x1="240" y1="0" x2="240" y2="160" /><line x1="280" y1="0" x2="280" y2="160" /><line x1="320" y1="0" x2="320" y2="160" /><line x1="360" y1="0" x2="360" y2="160" />
                <line x1="0" y1="20" x2="400" y2="20" /><line x1="0" y1="50" x2="400" y2="50" /><line x1="0" y1="110" x2="400" y2="110" /><line x1="0" y1="140" x2="400" y2="140" />
              </g>
              <line x1="200" y1="0" x2="200" y2="160" stroke="#4b5563" stroke-width="2" />
              <line x1="0" y1="80" x2="400" y2="80" stroke="#4b5563" stroke-width="2" />
              <line x1="40" y1="10" x2="200" y2="80" stroke="var(--color-primary)" stroke-width="3.5" stroke-linecap="round" />
              <line x1="200" y1="80" x2="360" y2="10" stroke="var(--color-primary)" stroke-width="3.5" stroke-linecap="round" />
              <circle cx="200" cy="80" r="5" fill="var(--color-secondary)" />
            </svg>
            <div style="margin-top: 0.6rem; font-size: 0.88rem; text-align: center; color: var(--text-main); line-height: 1.5;">
              <strong>גרף החתך $u(x,0) = |x|$:</strong>
              ניתן לראות בבירור את ה<strong>שפיץ (הפינה החדה)</strong> בראשית <span style="color: var(--color-secondary); font-size: 1.1rem; vertical-align: middle;">●</span> שבו הנגזרת אינה קיימת. בגלל נקודות אלו, הפונקציה אינה גזירה ברציפות ($C^1$) ואינה פתרון קלאסי.
            </div>
          </div>
        `,
        options: ["כן", "לא"],
        correct: 1,
        explanation: "התשובה היא <strong>לא</strong>. המשוואה היא מסדר ראשון, ולכן פתרון קלאסי חייב להיות ב-$C^1(\\mathbb{R}^2)$ (גזיר ברציפות פעם אחת). הפונקציה $u(x,y) = |x-y|$ אינה גזירה לאורך האלכסון $x=y$, ולכן היא אינה פתרון קלאסי בתחום הכולל קו זה."
      },
      {
        q: "האם הפונקציה $u(x,y) = x^2 - y^2$ היא פתרון קלאסי של משוואת לפלס $u_{xx} + u_{yy} = 0$ בתחום $\\mathbb{R}^2$?",
        graph: `
          <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
            <svg viewBox="0 0 400 160" width="100%" height="160" style="background: #15181f; border-radius: var(--border-radius-sm); border: 1px solid var(--border-color);">
              <g stroke="#232731" stroke-width="1">
                <line x1="40" y1="0" x2="40" y2="160" /><line x1="80" y1="0" x2="80" y2="160" /><line x1="120" y1="0" x2="120" y2="160" /><line x1="160" y1="0" x2="160" y2="160" />
                <line x1="240" y1="0" x2="240" y2="160" /><line x1="280" y1="0" x2="280" y2="160" /><line x1="320" y1="0" x2="320" y2="160" /><line x1="360" y1="0" x2="360" y2="160" />
                <line x1="0" y1="20" x2="400" y2="20" /><line x1="0" y1="50" x2="400" y2="50" /><line x1="0" y1="110" x2="400" y2="110" /><line x1="0" y1="140" x2="400" y2="140" />
              </g>
              <line x1="200" y1="0" x2="200" y2="160" stroke="#4b5563" stroke-width="2" />
              <line x1="0" y1="80" x2="400" y2="80" stroke="#4b5563" stroke-width="2" />
              <path d="M 60,21.2 Q 200,80 340,21.2" fill="none" stroke="var(--color-primary)" stroke-width="3" />
              <path d="M 60,138.8 Q 200,80 340,138.8" fill="none" stroke="var(--color-secondary)" stroke-width="3" stroke-dasharray="4,4" />
              <circle cx="200" cy="80" r="4" fill="white" />
            </svg>
            <div style="margin-top: 0.6rem; font-size: 0.88rem; text-align: center; color: var(--text-main); line-height: 1.5;">
              <strong>חתכי האוכף של לפלס:</strong>
              <span style="margin: 0 8px;"><span style="color: var(--color-primary); font-size: 1.1rem; vertical-align: middle;">■</span> חתך $u(x,0) = x^2$ (קעירות למעלה)</span>
              <span style="margin: 0 8px;"><span style="color: var(--color-secondary); font-size: 1.1rem; vertical-align: middle;">■</span> חתך $u(0,y) = -y^2$ (קעירות למטה)</span>
              <br>שני החתכים מוגדרים על ידי פרבולות חלקות לחלוטין ללא פינות. הכל גזיר ברציפות ולכן זהו פתרון קלאסי.
            </div>
          </div>
        `,
        options: ["כן", "לא"],
        correct: 0,
        explanation: "התשובה היא <strong>כן</strong>. הפונקציה היא פולינום ולכן שייכת ל-$C^\\infty(\\mathbb{R}^2)$ (ובפרט ל-$C^2$). הנגזרות השניות הן $u_{xx} = 2$ ו-$u_{yy} = -2$, ובהצבה נקבל $2 + (-2) = 0$, שזהו שוויון שמתקיים בכל נקודה במרחב."
      },
      {
        q: "עבור משוואת האדווקציה $u_t + u_x = 0$ בתחום $\\mathbb{R} \\times (0,\\infty)$, האם הפונקציה $u(x,t) = \\max(0, x-t)$ היא פתרון קלאסי?",
        graph: `
          <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
            <svg viewBox="0 0 400 160" width="100%" height="160" style="background: #15181f; border-radius: var(--border-radius-sm); border: 1px solid var(--border-color);">
              <g stroke="#232731" stroke-width="1">
                <line x1="40" y1="0" x2="40" y2="160" /><line x1="80" y1="0" x2="80" y2="160" /><line x1="120" y1="0" x2="120" y2="160" /><line x1="160" y1="0" x2="160" y2="160" />
                <line x1="240" y1="0" x2="240" y2="160" /><line x1="280" y1="0" x2="280" y2="160" /><line x1="320" y1="0" x2="320" y2="160" /><line x1="360" y1="0" x2="360" y2="160" />
                <line x1="0" y1="20" x2="400" y2="20" /><line x1="0" y1="50" x2="400" y2="50" /><line x1="0" y1="110" x2="400" y2="110" /><line x1="0" y1="140" x2="400" y2="140" />
              </g>
              <line x1="200" y1="0" x2="200" y2="160" stroke="#4b5563" stroke-width="2" />
              <line x1="0" y1="110" x2="400" y2="110" stroke="#4b5563" stroke-width="2" />
              <line x1="40" y1="110" x2="240" y2="110" stroke="var(--color-primary)" stroke-width="4" stroke-linecap="round" />
              <line x1="240" y1="110" x2="340" y2="20" stroke="var(--color-primary)" stroke-width="4" stroke-linecap="round" />
              <circle cx="240" cy="110" r="5.5" fill="var(--color-secondary)" />
            </svg>
            <div style="margin-top: 0.6rem; font-size: 0.88rem; text-align: center; color: var(--text-main); line-height: 1.5;">
              <strong>חתך פתרון האדווקציה בזמן $t=1$:</strong>
              בגלל תנאי ה-$\\max$, נוצר <strong>שפיץ (פינה חדה)</strong> בנקודה $x=t$ <span style="color: var(--color-secondary); font-size: 1.1rem; vertical-align: middle;">●</span>. הגל שומר על צורתו ונע ימינה, כך שהשפיץ נע לאורך קו המאפיין $x-t=0$. לכן הפונקציה אינה גזירה שם ואינה פתרון קלאסי.
            </div>
          </div>
        `,
        options: ["כן", "לא"],
        correct: 1,
        explanation: "התשובה היא <strong>לא</strong>. הפונקציה $u(x,t) = \\max(0, x-t)$ אינה גזירה לאורך קו המאפיין $x=t$ (שם יש לה 'שפיץ'), ולכן היא אינה שייכת ל-$C^1$ ואינה מהווה פתרון קלאסי."
      },
      {
        q: "האם הפונקציה $u(x,y) = x^3 - 3xy^2$ היא פתרון קלאסי של משוואת לפלס $u_{xx} + u_{yy} = 0$ בתחום $\\mathbb{R}^2$?",
        graph: `
          <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
            <svg viewBox="0 0 400 160" width="100%" height="160" style="background: #15181f; border-radius: var(--border-radius-sm); border: 1px solid var(--border-color);">
              <g stroke="#232731" stroke-width="1">
                <line x1="40" y1="0" x2="40" y2="160" /><line x1="80" y1="0" x2="80" y2="160" /><line x1="120" y1="0" x2="120" y2="160" /><line x1="160" y1="0" x2="160" y2="160" />
                <line x1="240" y1="0" x2="240" y2="160" /><line x1="280" y1="0" x2="280" y2="160" /><line x1="320" y1="0" x2="320" y2="160" /><line x1="360" y1="0" x2="360" y2="160" />
                <line x1="0" y1="20" x2="400" y2="20" /><line x1="0" y1="50" x2="400" y2="50" /><line x1="0" y1="110" x2="400" y2="110" /><line x1="0" y1="140" x2="400" y2="140" />
              </g>
              <line x1="200" y1="0" x2="200" y2="160" stroke="#4b5563" stroke-width="2" />
              <line x1="0" y1="80" x2="400" y2="80" stroke="#4b5563" stroke-width="2" />
              <path d="M 80,131.8 C 140,131.8 160,80 200,80 C 240,80 260,28.2 320,28.2" fill="none" stroke="var(--color-primary)" stroke-width="3.5" />
              <circle cx="200" cy="80" r="4.5" fill="var(--color-primary)" />
            </svg>
            <div style="margin-top: 0.6rem; font-size: 0.88rem; text-align: center; color: var(--text-main); line-height: 1.5;">
              <strong>חתך פתרון האוכף $u(x,0) = x^3$:</strong>
              גרף פונקציה מעריכית ממעלה שלישית ($x^3$). היא <strong>חלקה לחלוטין</strong>, בעלת נקודת פיתול מוגדרת היטב בראשית, גזירה אינסוף פעמים ומקיימת את המשוואה בכל נקודה. לכן היא פתרון קלאסי.
            </div>
          </div>
        `,
        options: ["כן", "לא"],
        correct: 0,
        explanation: "התשובה היא <strong>כן</strong>. הפונקציה היא פולינום (ולכן ב-$C^2$). נגזור: $u_x = 3x^2 - 3y^2 \\implies u_{xx} = 6x$, וכן $u_y = -6xy \\implies u_{yy} = -6x$. בהצבה נקבל $6x - 6x = 0$, השוויון מתקיים זהותית בכל נקודה."
      },
      {
        q: "נתונה המשוואה $u_x = 0$ בתחום הנתון על ידי אי-האיחוד של שני חצי-מישורים: $\\Omega = \\{(x,y) \\in \\mathbb{R}^2 \\mid x \\neq 0\\}$. האם הפונקציה $u(x,y) = 1$ עבור $x>0$ ו-$u(x,y) = -1$ עבור $x<0$ היא פתרון קלאסי בתחום זה?",
        graph: `
          <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
            <svg viewBox="0 0 400 160" width="100%" height="160" style="background: #15181f; border-radius: var(--border-radius-sm); border: 1px solid var(--border-color);">
              <g stroke="#232731" stroke-width="1">
                <line x1="40" y1="0" x2="40" y2="160" /><line x1="80" y1="0" x2="80" y2="160" /><line x1="120" y1="0" x2="120" y2="160" /><line x1="160" y1="0" x2="160" y2="160" />
                <line x1="240" y1="0" x2="240" y2="160" /><line x1="280" y1="0" x2="280" y2="160" /><line x1="320" y1="0" x2="320" y2="160" /><line x1="360" y1="0" x2="360" y2="160" />
                <line x1="0" y1="20" x2="400" y2="20" /><line x1="0" y1="50" x2="400" y2="50" /><line x1="0" y1="110" x2="400" y2="110" /><line x1="0" y1="140" x2="400" y2="140" />
              </g>
              <line x1="200" y1="0" x2="200" y2="160" stroke="#4b5563" stroke-width="2" />
              <line x1="0" y1="80" x2="400" y2="80" stroke="#4b5563" stroke-width="2" />
              <line x1="40" y1="110" x2="196" y2="110" stroke="var(--color-secondary)" stroke-width="4.5" stroke-linecap="round" />
              <line x1="204" y1="50" x2="360" y2="50" stroke="var(--color-primary)" stroke-width="4.5" stroke-linecap="round" />
              <circle cx="200" cy="110" r="4.5" fill="#15181f" stroke="var(--color-secondary)" stroke-width="2" />
              <circle cx="200" cy="50" r="4.5" fill="#15181f" stroke="var(--color-primary)" stroke-width="2" />
            </svg>
            <div style="margin-top: 0.6rem; font-size: 0.88rem; text-align: center; color: var(--text-main); line-height: 1.5;">
              <strong>גרף פונקציית המדרגה בקפיצה:</strong>
              יש קפיצה חדה ב-$x=0$. אבל, מכיוון שהתחום הנתון $\\Omega$ <strong>אינו כולל את $x=0$</strong> (התחום מוגדר כ-$x \\neq 0$), הקפיצה נופלת מחוץ לתחום ההגדרה! בכל נקודה בתוך התחום עצמו הפונקציה קבועה מקומית, ולכן היא חלקה ומקיימת את המשוואה. זהו פתרון קלאסי.
            </div>
          </div>
        `,
        options: [
          "כן, כי בכל נקודה בתחום $\\Omega$ מתקיים $u_x = 0$ והפונקציה חלקה שם",
          "לא, כי הפונקציה אינה רציפה לאורך ציר ה-y"
        ],
        correct: 0,
        explanation: "התשובה היא <strong>כן!</strong> שים לב למלכודת: ציר ה-$y$ ($x=0$) <strong>אינו</strong> חלק מהתחום הפתוח $\\Omega$. בתוך התחום $\\Omega$, הפונקציה קבועה מקומית (שווה ל-1 בכל חצי הימין הפתוח, ול- -1 בכל חצי השמאל הפתוח). לכן בכל נקודה בתוך התחום היא גזירה ברציפות ונגזרתה לפי $x$ היא 0. היא עונה על כל תנאי הגדרת הפתרון הקלאסי עבור התחום הספציפי הזה!"
      },
      {
        q: "האם הפונקציה $u(x,y) = (x^2 + y^2)^{1/3}$ היא פתרון קלאסי של המשוואה $3x u_x + 3y u_y = 2u$ בתחום כל המישור $\\mathbb{R}^2$?",
        graph: `
          <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
            <svg viewBox="0 0 400 160" width="100%" height="160" style="background: #15181f; border-radius: var(--border-radius-sm); border: 1px solid var(--border-color);">
              <g stroke="#232731" stroke-width="1">
                <line x1="40" y1="0" x2="40" y2="160" /><line x1="80" y1="0" x2="80" y2="160" /><line x1="120" y1="0" x2="120" y2="160" /><line x1="160" y1="0" x2="160" y2="160" />
                <line x1="240" y1="0" x2="240" y2="160" /><line x1="280" y1="0" x2="280" y2="160" /><line x1="320" y1="0" x2="320" y2="160" /><line x1="360" y1="0" x2="360" y2="160" />
                <line x1="0" y1="20" x2="400" y2="20" /><line x1="0" y1="50" x2="400" y2="50" /><line x1="0" y1="110" x2="400" y2="110" /><line x1="0" y1="140" x2="400" y2="140" />
              </g>
              <line x1="200" y1="0" x2="200" y2="160" stroke="#4b5563" stroke-width="2" />
              <line x1="0" y1="110" x2="400" y2="110" stroke="#4b5563" stroke-width="2" />
              <path d="M 60,30 C 120,70 170,110 200,110 C 230,110 280,70 340,30" fill="none" stroke="var(--color-primary)" stroke-width="3.5" />
              <circle cx="200" cy="110" r="5" fill="var(--color-secondary)" />
              <line x1="200" y1="110" x2="200" y2="70" stroke="var(--color-secondary)" stroke-width="1.5" stroke-dasharray="2,2" />
            </svg>
            <div style="margin-top: 0.6rem; font-size: 0.88rem; text-align: center; color: var(--text-main); line-height: 1.5;">
              <strong>חתך פתרון הקערה $u(x,0) = x^{2/3}$:</strong>
              גרף הפונקציה מציג <strong>שפיץ קוצני (Cusp)</strong> בראשית <span style="color: var(--color-secondary); font-size: 1.1rem; vertical-align: middle;">●</span>. הנגזרות הראשונות שואפות לאינסוף ככל שמתקרבים לאפס. לכן הפונקציה אינה גזירה בראשית ואינה פתרון קלאסי בתחום שמכיל אותה.
            </div>
          </div>
        `,
        options: ["כן", "לא"],
        correct: 1,
        explanation: "התשובה היא <strong>לא</strong>. למרות שהשוויון מתקיים בכל נקודה $x^2+y^2 \\neq 0$, בראשית $(0,0)$ יש לפונקציה שפיץ חד בצורת חרוט/קערה, ונגזרותיה החלקיות אינן מוגדרות שם. לכן היא אינה שייכת ל-$C^1(\\mathbb{R}^2)$ ואינה פתרון קלאסי של המשוואה."
      },
      {
        q: "האם הפונקציה $u(x,y) = \\ln(x^2 + y^2)$ היא פתרון קלאסי של משוואת לפלס $u_{xx} + u_{yy} = 0$ בתחום הדיסק המנוקב $D^* = \\{(x,y) \\in \\mathbb{R}^2 \\mid 0 < x^2+y^2 < 1\\}$?",
        graph: `
          <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
            <svg viewBox="0 0 400 160" width="100%" height="160" style="background: #15181f; border-radius: var(--border-radius-sm); border: 1px solid var(--border-color);">
              <g stroke="#232731" stroke-width="1">
                <line x1="40" y1="0" x2="40" y2="160" /><line x1="80" y1="0" x2="80" y2="160" /><line x1="120" y1="0" x2="120" y2="160" /><line x1="160" y1="0" x2="160" y2="160" />
                <line x1="240" y1="0" x2="240" y2="160" /><line x1="280" y1="0" x2="280" y2="160" /><line x1="320" y1="0" x2="320" y2="160" /><line x1="360" y1="0" x2="360" y2="160" />
                <line x1="0" y1="20" x2="400" y2="20" /><line x1="0" y1="50" x2="400" y2="50" /><line x1="0" y1="110" x2="400" y2="110" /><line x1="0" y1="140" x2="400" y2="140" />
              </g>
              <line x1="200" y1="0" x2="200" y2="160" stroke="#4b5563" stroke-width="2" />
              <line x1="0" y1="40" x2="400" y2="40" stroke="#4b5563" stroke-width="2" />
              <path d="M 60,35 Q 160,40 185,150" fill="none" stroke="var(--color-primary)" stroke-width="3.5" />
              <path d="M 340,35 Q 240,40 215,150" fill="none" stroke="var(--color-primary)" stroke-width="3.5" />
              <circle cx="200" cy="150" r="5" fill="#15181f" stroke="var(--color-secondary)" stroke-width="2.5" />
            </svg>
            <div style="margin-top: 0.6rem; font-size: 0.88rem; text-align: center; color: var(--text-main); line-height: 1.5;">
              <strong>חתך הפתרון הסינגולרי $u(x,0) = 2\\ln|x|$:</strong>
              הערכים צוללים ל-$-\\infty$ ככל שמתקרבים לציר האנכי. אך מאחר שנקודת הסינגולריות בראשית <span style="color: var(--color-secondary); font-size: 1.1rem; vertical-align: middle;">○</span> <strong>הוצאה מראש מהתחום הניקוב</strong>, הפונקציה חלקה לחלוטין בכל נקודה בתוך התחום ומקיימת את לפלס.
            </div>
          </div>
        `,
        options: ["כן", "לא"],
        correct: 0,
        explanation: "התשובה היא <strong>כן!</strong> שימו לב: התחום הוא הדיסק המנוקב $D^*$, שבו נקודת הסינגולריות $(0,0)$ הוסרה מראש. בכל נקודה אלא בתחום, הפונקציה חלקה אינסוף ($C^\\infty$) ומקיימת את משוואת לפלס זהותית, ולכן היא עונה בצורה מלאה על הגדרת הפתרון הקלאסי בתחום זה."
      },
      {
        q: "עבור משוואת האדווקציה $u_t + 2u_x = 0$, נתונה הפונקציה $u(x,t) = (x-2t)^3$. האם היא פתרון קלאסי בתחום $\\mathbb{R} \\times \\mathbb{R}$?",
        graph: `
          <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
            <svg viewBox="0 0 400 160" width="100%" height="160" style="background: #15181f; border-radius: var(--border-radius-sm); border: 1px solid var(--border-color);">
              <g stroke="#232731" stroke-width="1">
                <line x1="40" y1="0" x2="40" y2="160" /><line x1="80" y1="0" x2="80" y2="160" /><line x1="120" y1="0" x2="120" y2="160" /><line x1="160" y1="0" x2="160" y2="160" />
                <line x1="240" y1="0" x2="240" y2="160" /><line x1="280" y1="0" x2="280" y2="160" /><line x1="320" y1="0" x2="320" y2="160" /><line x1="360" y1="0" x2="360" y2="160" />
                <line x1="0" y1="20" x2="400" y2="20" /><line x1="0" y1="50" x2="400" y2="50" /><line x1="0" y1="110" x2="400" y2="110" /><line x1="0" y1="140" x2="400" y2="140" />
              </g>
              <line x1="200" y1="0" x2="200" y2="160" stroke="#4b5563" stroke-width="2" />
              <line x1="0" y1="80" x2="400" y2="80" stroke="#4b5563" stroke-width="2" />
              <path d="M 70,130 C 120,130 120,70 150,70 C 180,70 180,10 230,10" fill="none" stroke="var(--color-primary)" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="3,3" />
              <path d="M 120,130 C 170,130 170,70 200,70 C 230,70 240,30 280,30" fill="none" stroke="var(--color-primary)" stroke-width="3.5" />
              <path d="M 170,130 C 220,130 230,70 260,70 C 290,70 300,30 340,30" fill="none" stroke="var(--color-primary)" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="3,3" />
              <line x1="215" y1="70" x2="235" y2="70" stroke="var(--color-secondary)" stroke-width="2.5" />
              <polygon points="230,66 238,70 230,74" fill="var(--color-secondary)" />
            </svg>
            <div style="margin-top: 0.6rem; font-size: 0.88rem; text-align: center; color: var(--text-main); line-height: 1.5;">
              <strong>התקדמות גל האדווקציה החלק $u = (x-2t)^3$:</strong>
              הגל שומר על פרופיל מעוקם וחלק לחלוטין ($C^\\infty$) ללא שום שפיצים או פינות חדות, ונע ימינה בכיוון החץ. לכן זהו פתרון קלאסי תקין.
            </div>
          </div>
        `,
        options: ["כן", "לא"],
        correct: 0,
        explanation: "התשובה היא <strong>כן</strong>. הפונקציה היא פולינום של המשתנים, לכן היא שייכת ל-$C^\\infty$ (ובפרט $C^1$ שהוא סדר המשוואה). נגזור: $u_t = -6(x-2t)^2$ ו-$u_x = 3(x-2t)^2$. בהצבה נקבל: $u_t + 2u_x = -6(x-2t)^2 + 2(3(x-2t)^2) = 0$ בכל המרחב."
      },
      {
        q: "האם הפונקציה $u(x,y) = y \\cdot |y|$ היא פתרון קלאסי של המד\"ח $u_{xx} + u_{yy} = 2 \\cdot \\text{sgn}(y)$ בתחום $\\mathbb{R}^2$?",
        graph: `
          <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
            <svg viewBox="0 0 400 160" width="100%" height="160" style="background: #15181f; border-radius: var(--border-radius-sm); border: 1px solid var(--border-color);">
              <g stroke="#232731" stroke-width="1">
                <line x1="40" y1="0" x2="40" y2="160" /><line x1="80" y1="0" x2="80" y2="160" /><line x1="120" y1="0" x2="120" y2="160" /><line x1="160" y1="0" x2="160" y2="160" />
                <line x1="240" y1="0" x2="240" y2="160" /><line x1="280" y1="0" x2="280" y2="160" /><line x1="320" y1="0" x2="320" y2="160" /><line x1="360" y1="0" x2="360" y2="160" />
                <line x1="0" y1="20" x2="400" y2="20" /><line x1="0" y1="50" x2="400" y2="50" /><line x1="0" y1="110" x2="400" y2="110" /><line x1="0" y1="140" x2="400" y2="140" />
              </g>
              <line x1="200" y1="0" x2="200" y2="160" stroke="#4b5563" stroke-width="2" />
              <line x1="0" y1="80" x2="400" y2="80" stroke="#4b5563" stroke-width="2" />
              <path d="M 80,120 Q 140,80 200,80" fill="none" stroke="var(--color-primary)" stroke-width="3.5" />
              <path d="M 200,80 Q 260,80 320,40" fill="none" stroke="var(--color-primary)" stroke-width="3.5" />
              <circle cx="200" cy="80" r="4.5" fill="var(--color-secondary)" />
              <line x1="200" y1="80" x2="200" y2="115" stroke="var(--color-secondary)" stroke-width="1.5" stroke-dasharray="2,2" />
            </svg>
            <div style="margin-top: 0.6rem; font-size: 0.88rem; text-align: center; color: var(--text-main); line-height: 1.5;">
              <strong>גרף הפונקציה המחוברת $u = y|y|$:</strong>
              הפונקציה נראית חלקה לחלוטין בראשית <span style="color: var(--color-secondary); font-size: 1.1rem; vertical-align: middle;">●</span> והנגזרת הראשונה שלה רציפה ($C^1$). אולם הנגזרת השנייה $u_{yy}$ קופצת בפתאומיות ב-$y=0$ מ- -2 ל- 2. במשוואה מסדר שני היא אינה ב-$C^2$ ולכן אינה פתרון קלאסי.
            </div>
          </div>
        `,
        options: ["כן", "לא"],
        correct: 1,
        explanation: "התשובה היא <strong>לא</strong>. נגזור פעם אחת לפי $y$: נקבל $u_y = 2|y|$ (פונקציה רציפה, $u \\in C^1$). נגזור פעם נוספת: $u_{yy} = 2\\text{sgn}(y)$ (עבור $y \\neq 0$). מאחר שהנגזרת השנייה היא פונקציית הסימן שאינה רציפה לאורך הישר $y=0$ (יש לה קפיצה מ- -2 ל- 2), הפונקציה אינה שייכת ל-$C^2(\\mathbb{R}^2)$ ולכן אינה מהווה פתרון קלאסי של משוואה מסדר שני."
      },
      {
        q: "נתונה המשוואה $u_x + u_y = 0$ בתחום $x>0, y>0$ עם תנאי שפה $u(x,0) = \\sin(x)$ ו-$u(0,y) = \\sin(y)$. האם הפונקציה $u(x,y) = \\sin(x-y)$ היא פתרון קלאסי של הבעיה?",
        graph: `
          <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
            <svg viewBox="0 0 400 160" width="100%" height="160" style="background: #15181f; border-radius: var(--border-radius-sm); border: 1px solid var(--border-color);">
              <rect x="180" y="10" width="180" height="110" fill="rgba(var(--hue-primary), 0.05)" />
              <g stroke="#232731" stroke-width="1">
                <line x1="220" y1="0" x2="220" y2="160" /><line x1="260" y1="0" x2="260" y2="160" /><line x1="300" y1="0" x2="300" y2="160" /><line x1="340" y1="0" x2="340" y2="160" />
                <line x1="0" y1="40" x2="400" y2="40" /><line x1="0" y1="80" x2="400" y2="80" />
              </g>
              <line x1="180" y1="120" x2="360" y2="120" stroke="var(--color-primary)" stroke-width="3.5" />
              <line x1="180" y1="10" x2="180" y2="120" stroke="var(--color-secondary)" stroke-width="3.5" />
              <g stroke="rgba(255,255,255,0.15)" stroke-width="1.5" stroke-dasharray="3,3">
                <line x1="180" y1="90" x2="210" y2="60" />
                <line x1="180" y1="60" x2="240" y2="0" />
                <line x1="220" y1="120" x2="280" y2="60" />
                <line x1="260" y1="120" x2="360" y2="20" />
              </g>
              <circle cx="180" cy="120" r="5" fill="white" />
              <g stroke="red" stroke-width="2.5">
                <line x1="174" y1="54" x2="186" y2="66" />
                <line x1="186" y1="54" x2="174" y2="66" />
              </g>
            </svg>
            <div style="margin-top: 0.6rem; font-size: 0.88rem; text-align: center; color: var(--text-main); line-height: 1.5;">
              <strong>בעיית שפה ברביע הראשון:</strong>
              הערכים זורמים לאורך המאפיינים (קווים מנוקדים). תנאי השפה התחתון <span style="color: var(--color-primary); font-size: 1.1rem; vertical-align: middle;">■</span> מעביר את $\\sin(x)$ פנימה. תנאי השפה שמאלי <span style="color: var(--color-secondary); font-size: 1.1rem; vertical-align: middle;">■</span> מעביר את $\\sin(y)$ פנימה. בגלל המאפיינים, הפתרון המוצע נותן $-\\sin(y)$ לאורך הציר השמאלי, מה שיוצר <strong>סתירה ישירה (X)</strong> עם תנאי השפה הנתון.
            </div>
          </div>
        `,
        options: ["כן, כי היא גזירה ומקיימת את המד\"ח ואת תנאי השפה", "לא, כי היא אינה מתאימה לתנאי השפה לאורך ציר ה-y"],
        correct: 1,
        explanation: "התשובה היא <strong>לא</strong>. נבדוק את תנאי השפה שמאלי: $u(0,y) = \\sin(0-y) = -\\sin(y)$. אך הנתון דורש $u(0,y) = \\sin(y)$. מכיוון ש-\\sin(y) \\neq -\\sin(y)$ (עבור $y \\neq \\pi k$), הפונקציה אינה מקיימת את תנאי השפה שהוגדרו, ולכן אינה מהווה פתרון של בעיית התנאים הנתונה."
      }
    ]
  }
};
