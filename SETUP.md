# 📧 Newsletter & Kontaktformular Setup

Dein Blog hat jetzt ein Backend-System für Newsletter-Anmeldungen und Kontaktformular mit Email-Benachrichtigungen.

## 🚀 Schnellanleitung

### Schritt 1: Gmail App-Password generieren

Da du dich nicht mit deinem echten Gmail-Passwort anmelden solltest, brauchst du ein "App Password":

1. **Gehe zu:** https://myaccount.google.com/apppasswords
2. **Wähle:** 
   - App: **Mail**
   - Device: **Windows PC** (oder dein Gerät)
3. **Kopiere das 16-stellige Passwort**

### Schritt 2: .env Datei konfigurieren

1. Öffne die Datei `.env` im Projekt
2. Ersetze `dein-app-passwort-hier` mit dem kopierten Passwort
   ```
   EMAIL_USER=hannaxblog@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  ← Dein 16-stelliges Passwort (ohne Leerzeichen)
   ```

**⚠️ WICHTIG:** Teile diese Datei niemals öffentlich! Sie ist bereits in `.gitignore` eingetragen.

### Schritt 3: Abhängigkeiten installieren

```bash
cd /Users/hannawang/Documents/GitHub/Hannas-Blog
npm install
```

### Schritt 4: Server starten

```bash
npm start
```

Du solltest sehen:
```
✓ Email-Verbindung erfolgreich
🚀 Server läuft auf http://localhost:3000
```

## 📝 Funktionen

### Newsletter-Anmeldung
- Automatische Bestätigungs-Email an Nutzer
- Benachrichtigung an dich (hannaxblog@gmail.com)
- Auf allen Seiten im Newsletter-Card verfügbar

### Kontaktformular
- Separate Seite: `/kontakt.html`
- Nachricht kommt zu dir
- Nutzer bekommt Bestätigungs-Email

## 🔧 Entwicklungsmodus

Für automatisches Neuladen bei Änderungen:
```bash
npm run dev
```

(Benötigt: `npm install -g nodemon`)

## 🌐 Produktive Nutzung

Wenn du den Server auf einen echten Server hochladen möchtest (z.B. Heroku, Railway, DigitalOcean):

1. **Environment-Variablen** auf dem Server setzen
2. **Port konfigurieren** (Cloud-Anbieter stellen diesen bereit)
3. **Domain/SSL** einrichten
4. **Auto-Start** konfigurieren

Kontaktiere mich, wenn du hier Hilfe brauchst!

## 🐛 Troubleshooting

**"Email-Verbindung fehlgeschlagen"**
- App-Password ist falsch → Überprüfe die .env Datei
- 2-Faktor-Authentifizierung nicht aktiviert → Aktiviere es in Gmail-Einstellungen

**Formular funktioniert nicht**
- Server läuft nicht → Führe `npm start` aus
- Falscher Port → Überprüfe, ob Port 3000 frei ist

**Newsletter funktioniert auf einer Seite nicht**
- JavaScript kann fehlen → Überprüfe die Browser-Konsole (F12)

---

**Fragen?** Schreib mir!
