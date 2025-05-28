# ✅ רשימת בדיקות לפני פריסה

## 🔍 בדיקות חובה

### 📱 קבצי PWA
- [ ] `manifest.json` - קיים ומוגדר נכון
- [ ] `sw.js` - Service Worker עובד
- [ ] `icon-192.png` - אייקון 192x192 (צור דרך create-icons.html)
- [ ] `icon-512.png` - אייקון 512x512 (צור דרך create-icons.html)

### 🌐 קבצי המשחק
- [ ] `index.html` - דף ראשי עם כל ה-meta tags
- [ ] `script.js` - המשחק עובד עם גרירת קווים
- [ ] `styles.css` - עיצוב מותאם למובייל
- [ ] קבצי תיעוד (DEPLOYMENT.md, MOBILE_SETUP.md)

### 🧪 בדיקות פונקציונליות

#### במחשב:
- [ ] גרירת קווים עובדת
- [ ] צלילים מתנגנים (אם מופעלים)
- [ ] אנימציות פועלות
- [ ] כפתורי בקרה עובדים
- [ ] מעבר בין רמות עובד

#### במובייל (Chrome/Safari):
- [ ] גרירה עובדת במגע
- [ ] אין זום לא רצוי
- [ ] טקסט קריא בגדלים שונים
- [ ] כפתורים נוחים למגע
- [ ] ביצועים טובים

#### PWA:
- [ ] הודעת התקנה מופיעה
- [ ] מתקין כאפליקציה
- [ ] עובד offline אחרי התקנה
- [ ] אייקון מופיע במסך הבית

## 🚀 שלבי פריסה

### 1️⃣ הכנה
```bash
cd line-game
# פתח create-icons.html והורד אייקונים
# בדוק שהכל עובד: python -m http.server 8080
```

### 2️⃣ Git
```bash
git init
git add .
git commit -m "Initial commit - English-Hebrew Line Drawing Game"
```

### 3️⃣ GitHub
1. צור repository ב-GitHub
2. חבר למאגר:
```bash
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

### 4️⃣ GitHub Pages
1. Settings → Pages
2. Source: Deploy from branch
3. Branch: main
4. Save

### 5️⃣ בדיקה
- [ ] האתר נטען בקישור GitHub Pages
- [ ] PWA עובד בטלפון
- [ ] כל הפונקציות תקינות

## 📞 מספרי חירום (לפתרון בעיות)

### הכל לא עובד?
1. בדוק ב-Developer Tools שאין שגיאות
2. ודא שכל הקבצים נטענו נכון
3. נסה פרטי/סודי mode

### PWA לא מתקין?
1. HTTPS נדרש (GitHub Pages מספק)
2. manifest.json חייב להיות תקין
3. Service Worker חייב לעבוד

### מובייל לא עובד?
1. נסה רענון קשה (Ctrl+F5)
2. נקה cache
3. ודא viewport meta tag נכון

---

## 🎯 מדדי הצלחה

✅ המשחק נטען תוך 3 שניות  
✅ גרירה חלקה במובייל  
✅ אפשר להתקין כאפליקציה  
✅ עובד offline  
✅ נראה טוב בכל המכשירים  

**כשכל הסימונים מסומנים - אתה מוכן לפרסום! 🚀** 