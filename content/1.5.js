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
        options: ["כן", "לא"],
        correct: 1,
        explanation: "התשובה היא <strong>לא</strong>. המשוואה היא מסדר ראשון, ולכן פתרון קלאסי חייב להיות ב-$C^1(\\mathbb{R}^2)$ (גזיר ברציפות פעם אחת). הפונקציה $u(x,y) = |x-y|$ אינה גזירה לאורך האלכסון $x=y$, ולכן היא אינה פתרון קלאסי בתחום הכולל קו זה."
      },
      {
        q: "האם הפונקציה $u(x,y) = x^2 - y^2$ היא פתרון קלאסי של משוואת לפלס $u_{xx} + u_{yy} = 0$ בתחום $\\mathbb{R}^2$?",
        options: ["כן", "לא"],
        correct: 0,
        explanation: "התשובה היא <strong>כן</strong>. הפונקציה היא פולינום ולכן שייכת ל-$C^\\infty(\\mathbb{R}^2)$ (ובפרט ל-$C^2$). הנגזרות השניות הן $u_{xx} = 2$ ו-$u_{yy} = -2$, ובהצבה נקבל $2 + (-2) = 0$, שזהו שוויון שמתקיים בכל נקודה במרחב."
      },
      {
        q: "עבור משוואת האדווקציה $u_t + u_x = 0$ בתחום $\\mathbb{R} \\times (0,\\infty)$, האם הפונקציה $u(x,t) = \\max(0, x-t)$ היא פתרון קלאסי?",
        options: ["כן", "לא"],
        correct: 1,
        explanation: "התשובה היא <strong>לא</strong>. הפונקציה $u(x,t) = \\max(0, x-t)$ אינה גזירה לאורך קו המאפיין $x=t$ (שם יש לה 'שפיץ'), ולכן היא אינה שייכת ל-$C^1$ ואינה מהווה פתרון קלאסי."
      },
      {
        q: "האם הפונקציה $u(x,y) = x^3 - 3xy^2$ היא פתרון קלאסי של משוואת לפלס $u_{xx} + u_{yy} = 0$ בתחום $\\mathbb{R}^2$?",
        options: ["כן", "לא"],
        correct: 0,
        explanation: "התשובה היא <strong>כן</strong>. הפונקציה היא פולינום (ולכן ב-$C^2$). נגזור: $u_x = 3x^2 - 3y^2 \\implies u_{xx} = 6x$, וכן $u_y = -6xy \\implies u_{yy} = -6x$. בהצבה נקבל $6x - 6x = 0$, השוויון מתקיים זהותית בכל נקודה."
      },
      {
        q: "נתונה המשוואה $u_x = 0$ בתחום הנתון על ידי אי-האיחוד של שני חצי-מישורים: $\\Omega = \\{(x,y) \\in \\mathbb{R}^2 \\mid x \\neq 0\\}$. האם הפונקציה $u(x,y) = 1$ עבור $x>0$ ו-$u(x,y) = -1$ עבור $x<0$ היא פתרון קלאסי בתחום זה?",
        options: [
          "כן, כי בכל נקודה בתחום $\\Omega$ מתקיים $u_x = 0$ והפונקציה חלקה שם",
          "לא, כי הפונקציה אינה רציפה לאורך ציר ה-y"
        ],
        correct: 0,
        explanation: "התשובה היא <strong>כן!</strong> שים לב למלכודת: ציר ה-$y$ ($x=0$) <strong>אינו</strong> חלק מהתחום הפתוח $\\Omega$. בתוך התחום $\\Omega$, הפונקציה קבועה מקומית (שווה ל-1 בכל חצי הימין הפתוח, ול- -1 בכל חצי השמאל הפתוח). לכן בכל נקודה בתוך התחום היא גזירה ברציפות ונגזרתה לפי $x$ היא 0. היא עונה על כל תנאי הגדרת הפתרון הקלאסי עבור התחום הספציפי הזה!"
      }
    ]
  }
};
