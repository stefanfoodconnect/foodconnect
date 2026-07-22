#!/usr/bin/env node
/*
 * Food Connect Ruhr – Static Build (Option A, ohne Dependencies)
 * -------------------------------------------------------------
 * Liest template.html + content/*.json und schreibt index.html.
 * Aufruf:  node build.js
 *
 * Textänderungen laufen ausschließlich über content/*.json (die
 * Quelle der Wahrheit, editierbar über /admin/ = Sveltia CMS).
 * index.html ist ab jetzt ein Build-Artefakt und wird NICHT mehr
 * von Hand bearbeitet – bei jedem Build neu erzeugt.
 *
 * Struktur/Design (SVG-Icons, Bildpfade, Farbverläufe) liegen als
 * Assets hier im Skript, indexiert pro Listenposition. Werden über
 * das CMS mehr Einträge angelegt als Assets existieren, greift ein
 * Fallback (letztes bzw. neutrales Asset).
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const CONTENT = path.join(ROOT, 'content');

function readJSON(name) {
  return JSON.parse(fs.readFileSync(path.join(CONTENT, name + '.json'), 'utf8'));
}

// content/*.json -> Token-Präfixe (ueber-uns.json -> {{ueber_uns.*}})
const data = {
  hero:            readJSON('hero'),
  usps:            readJSON('usps'),
  ueber_uns:       readJSON('ueber-uns'),
  dienstleistungen:readJSON('dienstleistungen'),
  komponenten:     readJSON('komponenten'),
  produkte:        readJSON('produkte'),
  konzept:         readJSON('konzept'),
  portfolio:       readJSON('portfolio'),
  werte:           readJSON('werte'),
  statistiken:     readJSON('statistiken'),
  kontakt:         readJSON('kontakt'),
  allgemein:       readJSON('allgemein'),
};

// ---------- Helfer ----------
const pad2 = (n) => String(n).padStart(2, '0');
// robuster Ersatz (String-Replacement, keine $-Sonderzeichen-Fallen)
const replaceAll = (haystack, needle, value) => haystack.split(needle).join(value);
// verbindet gerenderte Listen-Items mit passender Einrückung
const joinItems = (arr) => arr.join('\n');

// ---------- Struktur-Assets (indexiert pro Listenposition) ----------
const SVG = {
  usp: [
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#076666" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#076666" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M6 9H4a2 2 0 0 1-2-2V5h4"/><path d="M18 9h2a2 2 0 0 0 2-2V5h-4"/><path d="M12 17v4"/><path d="M8 21h8"/><path d="M6 9a6 6 0 0 0 12 0V3H6v6z"/></svg>',
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#076666" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#076666" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="8" y2="14" stroke-width="2.5"/><line x1="12" y1="14" x2="12" y2="14" stroke-width="2.5"/><line x1="16" y1="14" x2="16" y2="14" stroke-width="2.5"/></svg>',
  ],
  highlight: [
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#076666" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#076666" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#076666" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>',
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#076666" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="8" y2="14" stroke-width="2.5"/><line x1="12" y1="14" x2="12" y2="14" stroke-width="2.5"/><line x1="16" y1="14" x2="16" y2="14" stroke-width="2.5"/></svg>',
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#076666" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><line x1="9" y1="12" x2="9" y2="12" stroke-width="2.5"/><line x1="15" y1="12" x2="15" y2="12" stroke-width="2.5"/></svg>',
  ],
  service: [
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#076666" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#076666" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>',
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#076666" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="14" x2="8" y2="14" stroke-width="2.5"/><line x1="12" y1="14" x2="12" y2="14" stroke-width="2.5"/><line x1="16" y1="14" x2="16" y2="14" stroke-width="2.5"/></svg>',
  ],
  produkt: [
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#076666" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 7l-5-5-5 5"/><path d="M17 17l-5 5-5-5"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M7 7l-5 5 5 5"/><path d="M17 7l5 5-5 5"/></svg>',
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#076666" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#076666" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7" stroke-width="2.5"/></svg>',
  ],
  portfolio: [
    '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>',
    '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>',
  ],
};

// Farbverläufe der Portfolio-Karten (pro Position)
const PORTFOLIO_BG = [
  'background:linear-gradient(135deg,#1A7070,#076666)',
  'background:linear-gradient(135deg,#2A4A1A,#076666)',
  'background:linear-gradient(135deg,#3A1A4A,#076666)',
];

// Slide-Bilder + Alt-Texte (pro Position)
const SLIDE_ASSETS = [
  { img: 'assets/slide-1.jpg', alt: 'Frikadellen mit Mac & Cheese und Gemüse' },
  { img: 'assets/slide-2.jpg', alt: 'Vegane Bowls mit Tofu, Linsen und Penne' },
  { img: 'assets/slide-3.jpg', alt: 'Hähnchen mit Gemüse, Kartoffeln und Tofu' },
];

// Team-Portraits (pro Position)
const TEAM_ASSETS = [
  { img: 'assets/team-aschemann.jpg', pos: 'center top' },
  { img: 'assets/team-schoenig.jpg', pos: 'center 15%' },
];

const pick = (arr, i, fallback) => (i < arr.length ? arr[i] : (fallback !== undefined ? fallback : arr[arr.length - 1]));

// ---------- Sektions-Renderer (Einrückung exakt wie im Original) ----------
const nav = data.allgemein.navigation.map((n, i) =>
  `      <a class="nav-link${i === 0 ? ' active' : ''}" href="${n.ziel}">${n.label}</a>`
).concat(`      <a class="nav-cta" href="#kontakt">${data.allgemein.nav_cta}</a>`);

const usp = data.usps.usps.map((u, i) =>
`      <div class="usp-item">
        <div class="usp-icon">${pick(SVG.usp, i)}</div>
        <div class="usp-title">${u.titel}</div>
        <div class="usp-desc">${u.text}</div>
      </div>`);

const highlights = data.ueber_uns.badges.map((b, i) =>
  `          <div class="highlight"><div class="h-icon">${pick(SVG.highlight, i)}</div>${b}</div>`);

const team = data.ueber_uns.team.map((m, i) => {
  const a = pick(TEAM_ASSETS, i, { img: 'assets/logo.png', pos: 'center' });
  // Bild + Ausschnitt kommen aus der JSON (CMS-editierbar); Fallback = altes Asset.
  const img = m.bild || a.img;
  const pos = m.bild_position || a.pos;
  const chips = m.chips.map((c) => `            <div class="chip">${c}</div>`).join('\n');
  return `        <div class="team-card">
          <div class="team-header">
            <img src="${img}" alt="${m.name}" style="width:72px;height:72px;border-radius:14px;object-fit:cover;object-position:${pos};flex-shrink:0;">
            <div><div class="team-name">${m.name}</div><div class="team-role">${m.rolle}</div></div>
          </div>
          <p class="team-text">${m.text}</p>
          <div class="chips">
${chips}
          </div>
        </div>`;
});

const services = data.dienstleistungen.leistungen.map((s, i) =>
`      <div class="service-card">
        <div class="service-icon">${pick(SVG.service, i)}</div>
        <div class="service-title">${s.titel}</div>
        <div class="service-text">${s.text}</div>
        <a class="service-link" href="#kontakt">${s.link_text}</a>
      </div>`);

const steps = data.komponenten.schritte.map((s, i) =>
`        <div class="messe-point">
          <div class="messe-num">${pad2(i + 1)}</div>
          <div><div class="messe-point-title">${s.titel}</div><div class="messe-point-text">${s.text}</div></div>
        </div>`);

const zielgruppen = data.komponenten.zielgruppen.map((z) =>
  `          <div class="messe-feature">${z}</div>`);

const slides = data.produkte.slides.map((s, i) => {
  const a = pick(SLIDE_ASSETS, i, { img: 'assets/hero.jpg', alt: s.titel });
  // Bild + Alt-Text kommen aus der JSON (CMS-editierbar); Fallback = altes Asset.
  const img = s.bild || a.img;
  const alt = s.bild_alt || a.alt;
  return `        <div class="slide">
          <img src="${img}" alt="${alt}" loading="lazy">
          <div class="slide-overlay"></div>
          <div class="slide-content">
            <div class="slide-tag">${s.tag}</div>
            <div class="slide-title">${s.titel}</div>
            <div class="slide-desc">${s.text}</div>
          </div>
        </div>`;
});

const slideDots = data.produkte.slides.map((s, i) =>
  `      <button type="button" class="slide-dot${i === 0 ? ' active' : ''}" onclick="goToSlide(${i})" aria-label="Slide ${i + 1} anzeigen"></button>`);

const produktInfos = data.produkte.infos.map((p, i) =>
  `      <div class="produkt-card"><div class="produkt-icon">${pick(SVG.produkt, i)}</div><div class="produkt-title">${p.titel}</div><div class="produkt-text">${p.text}</div></div>`);

const konzeptPunkte = data.konzept.punkte.map((p) =>
  `          <div class="wf-point"><div class="wf-dot">✓</div>${p}</div>`);

const portfolio = data.portfolio.referenzen.map((r, i) =>
`      <div class="portfolio-card">
        <div class="portfolio-img" style="${pick(PORTFOLIO_BG, i, 'background:linear-gradient(135deg,#1A7070,#076666)')}">${pick(SVG.portfolio, i)}</div>
        <div class="portfolio-body"><div class="portfolio-tag">${r.tag}</div><div class="portfolio-title">${r.titel}</div><div class="portfolio-desc">${r.text}</div></div>
      </div>`);

const werte = data.werte.werte.map((w, i) =>
  `      <div class="value-card"><div class="value-num">${pad2(i + 1)}</div><div class="value-title">${w.titel}</div><div class="value-text">${w.text}</div></div>`);

const stats = data.statistiken.statistiken.map((s) =>
  `    <div class="stat-block"><div class="stat-big">${s.wert}</div><div class="stat-desc">${s.beschreibung}</div></div>`);

// Footer-Zeile: Impressum/Datenschutz verlinken
const footerCopy = data.allgemein.footer_copyright
  .replace('Impressum', '<a href="impressum.html">Impressum</a>')
  .replace('Datenschutz', '<a href="datenschutz.html">Datenschutz</a>');

// Scrollspy-Sektionen aus der Navigation ableiten (#anker -> 'anker')
const sections = data.allgemein.navigation.map((n) => `'${n.ziel.replace(/^#/, '')}'`).join(',');
const slideCount = String(data.produkte.slides.length);

// ---------- Template füllen ----------
let html = fs.readFileSync(path.join(ROOT, 'template.html'), 'utf8');

const regions = {
  '<!--NAV-->':          joinItems(nav),
  '<!--USP-->':          joinItems(usp),
  '<!--HIGHLIGHTS-->':   joinItems(highlights),
  '<!--TEAM-->':         joinItems(team),
  '<!--SERVICES-->':     joinItems(services),
  '<!--STEPS-->':        joinItems(steps),
  '<!--ZIELGRUPPEN-->':  joinItems(zielgruppen),
  '<!--SLIDES-->':       joinItems(slides),
  '<!--SLIDEDOTS-->':    joinItems(slideDots),
  '<!--PRODUKTINFOS-->': joinItems(produktInfos),
  '<!--KONZEPTPUNKTE-->':joinItems(konzeptPunkte),
  '<!--PORTFOLIO-->':    joinItems(portfolio),
  '<!--WERTE-->':        joinItems(werte),
  '<!--STATS-->':        joinItems(stats),
  '<!--FOOTERCOPY-->':   footerCopy,
  '<!--SECTIONS-->':     sections,
  '<!--SLIDECOUNT-->':   slideCount,
};
for (const [marker, value] of Object.entries(regions)) {
  html = replaceAll(html, marker, value);
}

// Skalare Tokens {{prefix.key}} aus allen String-Feldern der JSONs
for (const [prefix, obj] of Object.entries(data)) {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      html = replaceAll(html, `{{${prefix}.${key}}}`, value);
    }
  }
}

// Warnung, falls Tokens übrig blieben (fehlendes Feld o.ä.)
const leftover = html.match(/\{\{[^}]+\}\}|<!--[A-Z]+-->/g);
if (leftover) {
  console.warn('⚠  Nicht ersetzte Platzhalter:', [...new Set(leftover)].join(', '));
}

fs.writeFileSync(path.join(ROOT, 'index.html'), html);
console.log('✓ index.html gebaut aus template.html + content/*.json');
