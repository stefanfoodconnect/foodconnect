# Technik-Review: foodconnect.pages.dev

Stand: 10.07.2026, Branch `content-update-kunde`. Geprüft: Repo-Stand + Live-Verhalten (curl gegen foodconnect.pages.dev).

## Top-Findings (nach Priorität)

1. **SPA-Fallback lieferte für jede URL die komplette index.html (1,3 MB) mit Status 200** — auch für `/robots.txt` (Ursache des gemeldeten „Response too large"-Fehlers beim Crawlen) und `/favicon.ico`. Grund: Cloudflare Pages aktiviert den SPA-Fallback automatisch, wenn keine `404.html` existiert. **Behoben:** echte statische `robots.txt` + `404.html` + `sitemap.xml` angelegt.
2. **1,3 MB HTML-Datei durch Base64-Bilder:** 5 Bilder (~0,9 MB Rohdaten, als Base64 ~1,2 MB) sind direkt in die HTML eingebettet. Nichts davon kann der Browser cachen oder lazy-loaden, jeder Seitenaufruf lädt alles. Das Team-Foto ist 2048×2048/509 KB für einen 72-px-Avatar-Slot; das Logo (88 KB) ist **doppelt** eingebettet (Nav + Footer). → Empfehlung: Bilder als Dateien auslagern (siehe unten), nicht im Rahmen dieses Text-Updates umgesetzt.
3. **Kein Impressum, kein Datenschutz:** Der Footer nennt „Impressum · Datenschutz" nur als Text ohne Links/Seiten. Für eine deutsche Geschäftsseite rechtlich erforderlich (Impressumspflicht, DSGVO). → Muss vor Go-Live gelöst werden.
4. **Google Fonts vom Google-CDN** (`fonts.googleapis.com`): datenschutzrechtlich problematisch (LG München I, IP-Übertragung ohne Einwilligung). → Empfehlung: Inter self-hosten (woff2, 2–3 Gewichte statt 7).
5. **Fehlende Meta-/OG-Tags und aussagekräftiger Title** („Food Connect Ruhr · Onepager" war ein Mockup-Rest). **Behoben:** Title, Description, Open Graph ergänzt.
6. **Security-Header unvollständig:** Live nur `x-content-type-options` und `referrer-policy` (Cloudflare-Defaults); kein `X-Frame-Options`, kein `Permissions-Policy`, kein CSP. **Teilweise behoben:** `_headers` mit risikofreien Headern angelegt; CSP nur als Empfehlung (Inline-Skripte/-Styles müssten erst refaktoriert werden).

## Framework & Build-Setup

- **Kein Framework, kein Build:** Das Projekt besteht aus genau einer Datei (`index.html`, 888 Zeilen, 1,29 MB) mit Inline-CSS und Inline-JS. Kein `package.json`, keine Dependencies → `npm audit`/`npm outdated` entfallen (nichts zu prüfen, auch nichts verwundbar).
- Deployment: Cloudflare Pages, vermutlich Direct-Upload/Git ohne Build-Step.
- Externe Abhängigkeiten zur Laufzeit: Google Fonts (CSS + Fonts), 3 Unsplash-Hotlink-Bilder in der Produkt-Slideshow.

## Code-Struktur

- **Alle Texte sind hart im Markup verdrahtet** (keine Content-/Datendateien). Für das CMS-Vorhaben relevant → siehe `docs/cms-vorbereitung.md`.
- **Mockup-Reste / toter Code:** `.page-label` („… · Mockup", per CSS versteckt), `.browser-bar` mit macOS-Fensterpunkten und Fake-URL-Leiste (per CSS versteckt, Markup vorhanden), Kommentar „logo is inline HTML" im JS. → Empfehlung: bei nächster Gelegenheit entfernen (bewusst nicht im Text-Update angefasst).
- Inline-Event-Handler (`onclick`) für Slideshow und Formular-Submit; Formular verschickt per `mailto:` (öffnet Mailprogramm, kein serverseitiger Versand). Funktioniert, aber fragil auf Geräten ohne Mail-Client → Empfehlung: später Formular-Backend (z. B. Cloudflare Worker / Formspree).

## Performance

| Punkt | Befund |
|---|---|
| HTML-Größe | 1.288 KB, davon ~1.230 KB Base64-Bilder |
| Bild 1+5 (Logo, 2×) | PNG 2630×680, je 88 KB — identisch doppelt eingebettet, angezeigt mit 58 px/36 px Höhe |
| Bild 2 (Hero-Foto) | JPEG 2048×2048, 509 KB — Anzeige ~380 px breit |
| Bild 3+4 (Portraits) | JPEG ~1090×1440, 123/116 KB — Anzeige 72×72 px |
| **MIME-Typen falsch** | Alle 5 `data:`-URIs deklarieren den falschen Typ (PNG als `image/jpeg` und umgekehrt). Browser sniffen das weg, korrekt ist es nicht. |
| Lazy Loading | Nicht möglich für Base64-Bilder; Unsplash-Slides ohne `loading="lazy"` |
| Fonts | Inter mit 7 Gewichten (300–900) vom Google-CDN, kein `preconnect` |
| Unsplash-Hotlinks | 3 Slide-Bilder von images.unsplash.com (extern, nicht unter eigener Kontrolle; Motive passen zudem nicht mehr zur Neupositionierung — siehe text-abgleich.md) |

**Empfehlung Bilder:** In `/assets/` als Dateien auslagern (Logo als SVG oder verkleinertes PNG einmalig, Fotos als WebP in Anzeigegröße ×2). Erwartbare Ersparnis: index.html von 1,3 MB auf ~60 KB, Bilder cachebar. Kein Framework nötig, aber Markup-Eingriff → nach Freigabe.

## SEO & Meta

| Punkt | Vorher | Status |
|---|---|---|
| Title | „Food Connect Ruhr · Onepager" (Mockup-Rest) | **behoben** → „Food Connect Ruhr – Verpflegungskonzepte für KiTas, OGS und Betreuungseinrichtungen" |
| Meta Description | fehlte | **behoben** (aus Hero-Tagline) |
| Open Graph | fehlte | **behoben** (og:title/description/type/url/locale; og:image fehlt weiter — kein extern referenzierbares Bild vorhanden, Base64 geht nicht) |
| robots.txt | SPA-Fallback lieferte HTML | **behoben** — statische Datei, erlaubt alles, verweist auf Sitemap |
| sitemap.xml | fehlte | **behoben** (eine URL) |
| Canonical | fehlte | **behoben** → `https://foodconnect.pages.dev/` — **muss beim Umzug auf die finale Domain angepasst werden** |
| Favicon | fehlt (Request lief in SPA-Fallback) | offen — Empfehlung: aus Logo ableiten (16/32/180 px + SVG) |
| Struktur | 1× h1, dann h2 — sauber | ok |

## Accessibility

- `lang="de"` ✓, Viewport ✓, ein h1 ✓, Formular-Labels vorhanden ✓, Hamburger-Button mit `aria-label` ✓.
- **Alt-Texte:** vorhanden, beschreiben aber die alten Motive („Wild Burger", „Live Cooking") — inhaltlich korrekt fürs jeweilige Bild, passen nur nicht mehr zur Ausrichtung. Wird mit dem Bildertausch gelöst (offene Frage im Text-Abgleich).
- **CTAs sind `<div>`s ohne Rolle/Fokus** (`.btn-primary`, `.nav-cta`, `.wf-cta`, `.kontakt-btn`, Slide-Pfeile/-Dots): nicht per Tastatur bedienbar. → Empfehlung: `<a>`/`<button>` daraus machen (kleiner Eingriff, aber Markup-Änderung → nach Freigabe).
- Hamburger ohne `aria-expanded`, Slideshow ohne Pause-Möglichkeit (Auto-Rotate 5 s) → Empfehlung.
- **Kontraste:** Sekundärtexte mit Alpha-Werten (z. B. `.stat-desc` rgba(255,255,255,0.35), `.wf-logo-tm` 0.3) liegen unter WCAG-AA. → Empfehlung: Alpha ≥ 0.6 für Fließtexte auf dunklem Grund.

## Cloudflare Pages

- **404-Handling:** Ohne `404.html` aktiviert Pages den SPA-Fallback → jede unbekannte URL bekam Status 200 + index.html. **Behoben:** minimale `404.html` im Seitendesign; damit liefert Pages künftig echte 404er und statische Dateien wie robots.txt/sitemap.xml greifen sauber.
- **`_headers`:** neu angelegt — `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (Kamera/Mikro/Geolocation aus). Kein CSP (siehe oben), kein HSTS (erst mit finaler Domain sinnvoll entscheiden).
- **`_redirects`:** nicht nötig (eine Seite, keine Altpfade).
- Achtung Projektname: Deployment läuft unter foodconnect.pages.dev; bei Umzug auf Kundendomain Canonical/OG-URL/sitemap.xml aktualisieren.

## Nachtrag 10.07.2026: Empfehlungen umgesetzt

Auf Freigabe des Auftraggebers wurden die Empfehlungen 1–5 im selben Branch umgesetzt:

1. **Bilder ausgelagert** → `assets/`: Logo (1× statt 2× eingebettet, auf 160 px Höhe verkleinert, 31 KB), Hero-Foto (800 px, 141 KB), Team-Portraits (240 px, je 15 KB). Zusätzlich die 3 Unsplash-Slides lokal gespeichert (`assets/slide-*.jpg`) — kein Hotlinking/Drittserver mehr, `loading="lazy"` gesetzt. **index.html: 1.288 KB → ~60 KB.** Die MIME-Typ-Falschdeklarationen sind damit obsolet.
2. **Inter self-gehostet**: `assets/fonts/InterVariable.woff2` (Variable Font, deckt Gewichte 100–900 ab) mit `@font-face` + Preload; Google-Fonts-Link entfernt → keine Verbindung zu Google mehr (DSGVO).
3. **Impressum & Datenschutz**: `impressum.html` und `datenschutz.html` im Seitendesign angelegt und im Footer verlinkt. **Achtung: Entwürfe** — Pflichtangaben (Rechtsform, Anschrift, USt-ID …) sind als „[bitte ergänzen]" markiert und müssen vom Betreiber vervollständigt + rechtlich geprüft werden. Bis dahin `noindex`.
4. **CTAs sind echte Links/Buttons**: Nav-CTA, Hero-Buttons, „Mehr erfahren", Konzept-CTA → `<a href>` (Anker/mailto); Slideshow-Pfeile und -Dots → `<button>` mit `aria-label`; Hamburger mit `aria-expanded`. Minimale CSS-Ergänzung für Link-/Button-Resets.
5. **Favicon** (`assets/favicon.svg`, einfaches FC-Monogramm in Teal — bei Bedarf durch echtes Brand-Icon ersetzen), **Mockup-Markup entfernt** (`.page-label`, `.browser-bar` inkl. CSS), **CSP in `_headers`** gesetzt (`default-src 'self'`; `unsafe-inline` bleibt nötig, solange CSS/JS inline sind; für `/admin/*` deaktiviert, da Sveltia von unpkg lädt).

### Verbleibende Empfehlungen

1. **Formular-Backend statt `mailto:`** — braucht eine Anbieter-Entscheidung (z. B. Cloudflare Pages Function + Resend, oder Formspree). Nicht umsetzbar ohne Account/API-Key des Betreibers.
2. Impressum/Datenschutz: Platzhalter füllen, rechtlich prüfen, dann `noindex` entfernen.
3. Bildmotive passen weiter nicht zur Neupositionierung (siehe text-abgleich.md) — beim Bildertausch ggf. WebP-Varianten erzeugen.
4. CSP verschärfen (`unsafe-inline` entfernen), wenn CSS/JS in eigene Dateien wandern.
5. Kontrast-Feinschliff (Alpha-Texte), Slideshow-Pause-Funktion.
