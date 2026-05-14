require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Email-Konfiguration prüfen
const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD;
const emailConfigured = emailUser && emailPassword && !emailPassword.toLowerCase().includes('dein-app-passwort');

if (!emailConfigured) {
  console.warn('⚠️ EMAIL_USER oder EMAIL_PASSWORD ist nicht korrekt gesetzt. Bitte setze ein gültiges Gmail App-Passwort in .env.');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPassword
  }
});

// Verifiziere Email-Verbindung beim Start
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email-Verbindung fehlgeschlagen:', error);
  } else {
    console.log('✓ Email-Verbindung erfolgreich');
  }
});

const fs = require('fs');

function parseNewsletterLine(line) {
  const match = line.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z) - Newsletter: ([^ ]+) \(([^)]+)\)/);
  if (!match) return null;
  return {
    date: match[1],
    email: match[2].toLowerCase(),
    language: match[3]
  };
}

function getSubscribers() {
  if (!fs.existsSync('newsletter-signups.log')) {
    return [];
  }

  const content = fs.readFileSync('newsletter-signups.log', 'utf8');
  const lines = content.trim().split('\n').filter(line => line.trim());
  const unique = {};

  lines.forEach(line => {
    const subscriber = parseNewsletterLine(line);
    if (subscriber && !unique[subscriber.email]) {
      unique[subscriber.email] = subscriber;
    }
  });

  return Object.values(unique);
}

function saveNewsletterSignup(email, language) {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = getSubscribers().some(sub => sub.email === normalizedEmail);
  if (existing) {
    return false;
  }

  const logEntry = `${new Date().toISOString()} - Newsletter: ${normalizedEmail} (${language})\n`;
  fs.appendFileSync('newsletter-signups.log', logEntry);
  return true;
}

// Newsletter-Anmeldung
app.post('/api/newsletter', async (req, res) => {
  const { email, language } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Ungültige Email-Adresse' });
  }

  const isNew = saveNewsletterSignup(email, language);

  try {
    // Email an dich selbst
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: '📧 Neue Newsletter-Anmeldung',
      html: `
        <h2>Neue Newsletter-Anmeldung</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Sprache:</strong> ${language === 'de' ? 'Deutsch' : 'English'}</p>
        <p><strong>Datum:</strong> ${new Date().toLocaleString('de-DE')}</p>
      `
    });

    // Bestätigungs-Email an Nutzer
    const subject = language === 'de' 
      ? 'Hey! Herzlich Willkommen zu meinem Newsletter!🌸' 
      : 'Hey! Welcome to my newsletter!🌸';
    
    const message = language === 'de'
      ? `<p>Ich bin Hanna, und ich freue mich sehr, dass du hier bist!</p>
         <p>Dies ist ein kleiner Ort im Internet, den ich mit viel Liebe erstellt habe — ein Raum, in dem ich verschiedene Dinge teile. </p>
         <p>Durch das Abonnieren meines Newsletters bleibst du immer auf dem Laufenden, wann immer etwas Neues veröffentlicht wird.</p>
         <p>Viel Spaß beim Lesen!🥰</p>
         <p>Liebe Grüße,<br>Hanna</p>`
      : `<p>I’m Hanna, and I’m so glad you’re here.,</p>
         <p>This little corner of the internet is a place I’ve created with a lot of love — a space where I share various things. </p>
         <p>By joining this newsletter, you’ll be the first to know whenever something new goes up</p>
         <p>Enjoy reading!🥰</p>
         <p>Best regards,<br>Hanna</p>`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: message
    });

    const messageText = isNew
      ? (language === 'de' ? 'Anmeldung erfolgreich!' : 'Successfully subscribed!')
      : (language === 'de' ? 'Du bist bereits angemeldet!' : 'You are already subscribed!');

    res.json({ success: true, message: messageText });
  } catch (error) {
    console.error('Email-Fehler:', error);
    // Falls Email-Versand scheitert, wurde die Anmeldung bereits gespeichert.
    res.json({ success: true, message: language === 'de' ? 'Anmeldung gespeichert (Email später)!' : 'Signup saved (email later)!' });
  }
});

// Kontaktformular
app.post('/api/contact', async (req, res) => {
  const { name, email, message, language } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Alle Felder sind erforderlich' });
  }

  try {
    // Email an dich selbst
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `❓ Neue Nachricht von ${name}`,
      html: `
        <h2>Neue Kontaktanfrage</h2>
        <p><strong>Von:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Nachricht:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <p><strong>Datum:</strong> ${new Date().toLocaleString('de-DE')}</p>
      `
    });

    // Bestätigungs-Email an Nutzer
    const subject = language === 'de'
      ? 'Danke für deine Nachricht'
      : 'Thank you for your message';
    
    const message_text = language === 'de'
      ? `<p>Hallo ${name},</p>
         <p>danke für deine Nachricht! Ich antworte dir so schnell wie möglich.</p>
         <p>Liebe Grüße,<br>Hanna</p>`
      : `<p>Hello ${name},</p>
         <p>thank you for your message! I'll get back to you as soon as possible.</p>
         <p>Best regards,<br>Hanna</p>`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: message_text
    });

    res.json({ success: true, message: language === 'de' ? 'Nachricht gesendet!' : 'Message sent!' });
  } catch (error) {
    console.error('Email-Fehler:', error);
    // Fallback: Speichere die Nachricht in eine Datei
    const fs = require('fs');
    const logEntry = `${new Date().toISOString()} - Kontakt: ${name} <${email}>\nNachricht: ${message}\n\n`;
    fs.appendFileSync('contact-messages.log', logEntry);
    res.json({ success: true, message: language === 'de' ? 'Nachricht gespeichert (Email später)!' : 'Message saved (email later)!' });
  }
});

// Admin Statistiken
app.get('/api/admin/stats', (req, res) => {
  try {
    // Lese einzigartige Newsletter-Abonnenten
    const subscribers = getSubscribers();

    // Lese Newsletter-Count (später aus einer separaten Datei)
    let newsletters = 0;
    if (fs.existsSync('newsletter-count.txt')) {
      newsletters = parseInt(fs.readFileSync('newsletter-count.txt', 'utf8').trim()) || 0;
    }

    res.json({
      subscribers: subscribers.length,
      newsletters: newsletters,
      subscribersList: subscribers
    });
  } catch (error) {
    console.error('Admin Stats Fehler:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Statistiken' });
  }
});

// Newsletter versenden
app.post('/api/admin/send-newsletter', async (req, res) => {
  const { subject, content } = req.body;

  if (!subject || !content) {
    return res.status(400).json({ error: 'Betreff und Inhalt sind erforderlich' });
  }

  try {
    const fs = require('fs');

    // Lese Abonnenten
    const subscribers = getSubscribers();

    if (subscribers.length === 0) {
      return res.status(400).json({ error: 'Keine Abonnenten gefunden' });
    }

    // Versuche Emails zu senden
    let sentCount = 0;
    let failedCount = 0;

    for (const subscriber of subscribers) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: subscriber.email,
          subject: subject,
          html: content
        });
        sentCount++;
      } catch (emailError) {
        console.error(`Email-Fehler an ${subscriber.email}:`, emailError.message);
        failedCount++;
      }
    }

    // Speichere Newsletter in Log
    const newsletterEntry = `${new Date().toISOString()} - Newsletter versendet: "${subject}" - ${sentCount} erfolgreich, ${failedCount} fehlgeschlagen\n`;
    fs.appendFileSync('newsletter-history.log', newsletterEntry);

    // Erhöhe Newsletter-Count
    let currentCount = 0;
    if (fs.existsSync('newsletter-count.txt')) {
      currentCount = parseInt(fs.readFileSync('newsletter-count.txt', 'utf8').trim()) || 0;
    }
    fs.writeFileSync('newsletter-count.txt', (currentCount + 1).toString());

    res.json({
      success: true,
      message: `Newsletter an ${sentCount} Abonnenten versendet${failedCount > 0 ? ` (${failedCount} fehlgeschlagen)` : ''}!`
    });
  } catch (error) {
    console.error('Newsletter Send Fehler:', error);
    res.status(500).json({ error: 'Fehler beim Versenden des Newsletters' });
  }
});

// Starte den Server
app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf http://localhost:${PORT}`);
});
