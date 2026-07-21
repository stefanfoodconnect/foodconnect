# Sveltia CMS – Setup & Build

Stand: 21.07.2026. **Option A (Mini-Build) ist umgesetzt und das GitHub-Backend ist scharf** — die Seite wird aus `content/*.json` gebaut, Speichern im CMS committet auf `main` und löst den Deploy aus.

> **Zur Vorgeschichte:** Diese Arbeit entstand ursprünglich im inzwischen abgelösten Ordner `foodconnect/` (Repo `7p4yx8swt8-crypto/foodconnect`, Cloudflare Pages). Das aktive Projekt `foodconnect-neu/` wurde aus einem älteren Stand neu aufgesetzt und hatte den Mini-Build nicht. Am 21.07.2026 wurde er hierher portiert und dabei an Workers angepasst.

## Kurzfassung (TL;DR)

- Texte editieren → ausschließlich `content/*.json` (bzw. später über `/admin/` = Sveltia CMS).
- Danach `node build.js` (oder `npm run build`) → erzeugt `index.html` neu.
- `index.html` ist ab jetzt ein **Build-Artefakt** und wird **nicht mehr von Hand** bearbeitet.
- `template.html` = Layout mit Platzhaltern; `build.js` = dependency-freies Skript, das die JSON-Werte einsetzt.

## Was angelegt wurde

| Datei | Zweck |
|---|---|
| `admin/index.html` | Lädt Sveltia CMS vom offiziellen CDN (`https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js`, laut Doku bewusst ohne `type="module"` und ohne Stylesheet). `noindex` gesetzt. |
| `admin/config.yml` | CMS-Konfiguration: `locale: de`, deutsche Feld-Labels, eine File-Collection „Seiteninhalte" mit 12 Einträgen — exakt entlang der Sektionsstruktur des Onepagers (Hero, USP, Über uns, Dienstleistungen, Komponenten, Produkte, Konzept, Portfolio, Werte, Statistiken, Kontakt, Navigation/Footer). |
| `content/*.json` | 12 Inhaltsdateien mit dem **aktuellen Stand der Seite** (inkl. der neuen Kundentexte). Sie sind die **Quelle der Wahrheit** und das Datenmodell fürs CMS. |
| `template.html` | Layout der Seite mit Platzhaltern (`{{hero.headline_zeile1}}` u. ä. sowie Listen-Marker wie `<!--USP-->`). Design/CSS/JS unverändert gegenüber der alten `index.html`. |
| `build.js` | Node-Skript ohne Dependencies. Liest `template.html` + `content/*.json`, setzt die Werte ein und schreibt `index.html`. Struktur-Assets (SVG-Icons, Bildpfade, Farbverläufe) liegen indexiert im Skript. |
| `package.json` | nur `scripts.build = node build.js`, keine Dependencies. |

**Verifiziert:** `node build.js` reproduziert die zuvor ausgelieferte `index.html` **byte-identisch** (Diff leer) — die Umstellung ist also ohne jede sichtbare Änderung erfolgt. Ein Content-Edit → Build → erscheint auf der Seite (end-to-end getestet).

### Zwei Felder, die HTML enthalten dürfen
Damit das Design 1:1 bleibt, tragen zwei Content-Felder einfaches Inline-HTML:
- `konzept.headline` → `<br>` (Zeilenumbruch) und `<em>Wort</em>` (türkise Hervorhebung).
- `statistiken[].wert` → `<span>…</span>` markiert den türkis gefärbten Teil (z. B. `20<span>+</span>`, `<span>EU</span>`).
Beide Felder haben im CMS einen entsprechenden Hinweis (`hint`). Alle übrigen Felder sind reiner Text.

## Backend: bewusst im Test-Modus

`admin/config.yml` nutzt `backend: name: test-repo`: Das CMS ist unter `/admin/` voll bedienbar, speichert aber nur im Browser (OPFS) — **es wird nichts ins Repo geschrieben, keine Auth nötig**. So kann der Kunde die Oberfläche gefahrlos ansehen.

Zwei Hinweise aus dem lokalen Test (Formulare und alle 12 Sektionen wurden geprüft):

- Im Test-Modus arbeitet Sveltia auf einem leeren virtuellen Repo — die realen `content/*.json` werden **nicht** geladen, die Formulare starten leer. Die echten Inhalte erscheinen erst mit aktivem GitHub-Backend (oder lokal über Sveltias Local-Workflow mit Dateisystemzugriff).
- Die Option `locale: de` stammt aus Netlify/Decap CMS; Sveltia ignoriert sie (Konsolen-Hinweis) und wählt die UI-Sprache automatisch nach Browser-Einstellung. Der Eintrag bleibt bewusst in der config (Auftrag + Decap-Kompatibilität), die Feld-Labels sind ohnehin deutsch.

### Scharfgeschaltet (21.07.2026)

`admin/config.yml` nutzt jetzt `backend: name: github`, `repo: stefanfoodconnect/foodconnect`, `branch: main`. Der `test-repo`-Block steht auskommentiert darunter als Fallback zum gefahrlosen Ausprobieren.

Auth: Solange keine `base_url` gesetzt ist, bietet Sveltia „Sign In Using Access Token" an — Redakteure brauchen einen Fine-grained PAT mit „Contents: Read and write" auf das Repo. Der Umstieg auf OAuth („Sign in with GitHub", kein Token-Handling) ist in `docs/oauth-setup.md` beschrieben und nur ein Auskommentieren der `base_url`-Zeile, sobald der Authenticator-Worker deployed ist.

Beachten: Commits des CMS landen direkt auf `main` → Auto-Deploy. Falls das später unerwünscht ist, einen eigenen Content-Branch in `backend.branch` eintragen.

Optional zusätzlich absichern: `/admin/*` per Cloudflare Access.

## Build & Deploy (Option A – umgesetzt)

Der Onepager ist eine statische HTML-Datei. Damit CMS-Änderungen an `content/*.json` auf der Seite ankommen, wurde **Option A (Mini-Build)** gewählt und umgesetzt: `template.html` + `build.js` erzeugen `index.html`. Kein Framework, keine Dependencies, jederzeit reversibel (Design/Markup bleiben 1:1).

### Lokal bauen
```
node build.js        # oder: npm run build
```
Erzeugt `index.html` neu aus `template.html` + `content/*.json`. Warnt, falls ein Platzhalter unersetzt bleibt (z. B. neu angelegtes, aber im Template nicht verdrahtetes Feld).

### Cloudflare Workers Builds

Das Projekt läuft auf **Workers**, nicht mehr auf Pages. Workers Builds ist mit dem GitHub-Repo verknüpft und deployed bei jedem Push auf `main`.

- **Build command:** `npm run build` — muss in den Cloudflare-Projekteinstellungen (Settings → Build) eingetragen sein.
- **Install command:** leer, es gibt keine Dependencies.
- In `wrangler.toml` steht derselbe Befehl zusätzlich unter `[build]`, damit auch ein manuelles `npx wrangler deploy` vorher baut.

`template.html`, `build.js` und `package.json` sind über `.assetsignore` von der Auslieferung ausgeschlossen — sie gehören ins Repo, aber nicht ins Web.

Damit ist der Loop geschlossen: **CMS speichert `content/*.json` → Commit auf `main` → Workers Builds baut `index.html` → live.**

### Wichtig zum Umgang
- `index.html` **nicht mehr von Hand editieren** – wird bei jedem Build überschrieben. Textänderungen immer in `content/*.json`.
- Neue Sektionen oder neue Feld-Typen brauchen einen Eingriff in `template.html` + `build.js` (Entwickler-Task).
- Neue **Listen-Einträge** (z. B. eine 5. USP, ein 4. Slide) funktionieren, greifen aber auf indexierte Struktur-Assets (SVG-Icon, Bild, Farbverlauf) zurück; für Positionen ohne hinterlegtes Asset nutzt `build.js` einen Fallback. Bei echtem Bedarf das passende Asset in `build.js` ergänzen.

### Grenzen von Option A / möglicher Ausbau
Ein späterer Umstieg auf einen **Static Site Generator (Astro/Eleventy)** bleibt offen. Er würde nebenbei die Findings aus dem Technik-Review lösen (Base64-Bilder → Asset-Pipeline, Font-Self-Hosting, Impressum/Datenschutz als eigene Seiten) und Listen-Assets sauberer modellieren. Größerer Umbau, neues Tooling — nur wenn gewünscht.

## Offene Entscheidungen

1. ~~Architektur: Option A vs. B~~ → **entschieden: Option A (Mini-Build), umgesetzt.**
2. Backend-Auth: Sveltia Authenticator (Worker) vs. PAT; wer bekommt Schreibzugriff?
3. CMS-Commits direkt auf `main` (Auto-Deploy) oder auf einen Content-Branch mit Review?
4. Medien: `media_folder` ist auf `assets/uploads` vorkonfiguriert — greift erst, wenn Bilder aus Base64 in Dateien ausgelagert sind (Technik-Review, Empfehlung 1).

## Ausprobieren

Lokal (`python3 -m http.server` im Projektordner) oder nach Deploy des Branches: `/admin/` öffnen → das CMS startet im Test-Modus, alle 12 Sektionen sind mit den aktuellen Texten editierbar (Änderungen bleiben im Browser).
