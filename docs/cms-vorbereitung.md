# Sveltia CMS – Vorbereitung

Stand: 10.07.2026, Branch `content-update-kunde`. **Vorbereitung, keine finale Architekturentscheidung** — nichts davon ist scharf geschaltet.

## Was angelegt wurde

| Datei | Zweck |
|---|---|
| `admin/index.html` | Lädt Sveltia CMS vom offiziellen CDN (`https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js`, laut Doku bewusst ohne `type="module"` und ohne Stylesheet). `noindex` gesetzt. |
| `admin/config.yml` | CMS-Konfiguration: `locale: de`, deutsche Feld-Labels, eine File-Collection „Seiteninhalte" mit 12 Einträgen — exakt entlang der Sektionsstruktur des Onepagers (Hero, USP, Über uns, Dienstleistungen, Komponenten, Produkte, Konzept, Portfolio, Werte, Statistiken, Kontakt, Navigation/Footer). |
| `content/*.json` | 12 Inhaltsdateien mit dem **aktuellen Stand der Seite** (inkl. der neuen Kundentexte). Sie sind das Datenmodell fürs CMS. |

**Wichtig:** `index.html` liest diese JSON-Dateien **noch nicht** — die Texte stehen weiterhin hart im Markup. `content/` ist aktuell ein Spiegel, die Quelle der Wahrheit bleibt `index.html`, bis die Auslagerung (unten) umgesetzt ist. Bis dahin müssen Textänderungen an beiden Stellen erfolgen (oder besser: erst nach der Migration übers CMS arbeiten).

## Backend: bewusst im Test-Modus

`admin/config.yml` nutzt `backend: name: test-repo`: Das CMS ist unter `/admin/` voll bedienbar, speichert aber nur im Browser (OPFS) — **es wird nichts ins Repo geschrieben, keine Auth nötig**. So kann der Kunde die Oberfläche gefahrlos ansehen.

Zwei Hinweise aus dem lokalen Test (Formulare und alle 12 Sektionen wurden geprüft):

- Im Test-Modus arbeitet Sveltia auf einem leeren virtuellen Repo — die realen `content/*.json` werden **nicht** geladen, die Formulare starten leer. Die echten Inhalte erscheinen erst mit aktivem GitHub-Backend (oder lokal über Sveltias Local-Workflow mit Dateisystemzugriff).
- Die Option `locale: de` stammt aus Netlify/Decap CMS; Sveltia ignoriert sie (Konsolen-Hinweis) und wählt die UI-Sprache automatisch nach Browser-Einstellung. Der Eintrag bleibt bewusst in der config (Auftrag + Decap-Kompatibilität), die Feld-Labels sind ohnehin deutsch.

### Scharfschalten nach Freigabe (dokumentiert, nicht umgesetzt)

1. In `admin/config.yml` den `test-repo`-Block entfernen und den vorbereiteten, auskommentierten GitHub-Block aktivieren (`repo: 7p4yx8swt8-crypto/foodconnect`, `branch: main`).
2. Auth-Variante wählen:
   - **A — Sveltia CMS Authenticator** (empfohlen): kleiner OAuth-Client als Cloudflare Worker (passt zum bestehenden Cloudflare-Setup). GitHub-OAuth-App anlegen, Worker deployen, dessen URL als `base_url` eintragen. Redakteure melden sich mit ihrem GitHub-Account an (brauchen Schreibrechte aufs Repo).
   - **B — Personal Access Token**: ohne `base_url` bietet Sveltia „Sign In with Token" an. Kein zusätzlicher Dienst nötig, aber Token-Handling beim Redakteur — nur für den Übergang sinnvoll.
3. Optional: `/admin/*` per Cloudflare Access zusätzlich absichern.
4. Beachten: Commits des CMS landen direkt auf `main` → Auto-Deploy. Falls unerwünscht, eigenen Content-Branch in `backend.branch` eintragen.

## Migrationsplan: Texte aus dem Markup lösen

Die Auslagerung wurde **nicht** umgesetzt, weil sie ohne Framework-/Build-Umbau nicht möglich ist — genau die Architekturentscheidung, die erst nach Freigabe fallen soll. Der Onepager ist eine einzelne statische HTML-Datei; damit CMS-Änderungen an `content/*.json` auf der Seite ankommen, gibt es drei Wege:

### Option A — Kleiner Build-Schritt, Seite bleibt wie sie ist (empfohlen als nächster Schritt)
`index.html` wird zum Template (`template.html`) mit Platzhaltern; ein ~50-Zeilen-Node-Skript (ohne Dependencies) setzt beim Build die Werte aus `content/*.json` ein. In Cloudflare Pages wird als Build-Command `node build.js` hinterlegt — Pages führt das bei jedem Push aus, inkl. CMS-Commits.
**Pro:** minimalinvasiv, Design/Markup bleiben 1:1 erhalten, jederzeit reversibel. **Contra:** Eigenbau, kein Ökosystem.

### Option B — Static Site Generator (Astro oder Eleventy)
Sauberer Neuaufbau der Seite als Komponenten/Template mit `content/` als Datenquelle. Löst nebenbei die Findings aus dem Technik-Review (Base64-Bilder → Asset-Pipeline, Font-Self-Hosting, Impressum/Datenschutz als eigene Seiten).
**Pro:** langfristig wartbar, Standard-Setup mit Sveltia. **Contra:** größter Umbau, neues Tooling.

### Option C — Client-seitiges Nachladen per JS (nicht empfohlen)
`fetch('content/*.json')` beim Laden der Seite. Kein Build nötig, aber Texte flackern nach, SEO/Robustheit leiden. Nur der Vollständigkeit halber aufgeführt.

## Offene Entscheidungen

1. Architektur: Option A (Mini-Build) vs. B (SSG) — nach Freigabe der Seite.
2. Backend-Auth: Sveltia Authenticator (Worker) vs. PAT; wer bekommt Schreibzugriff?
3. CMS-Commits direkt auf `main` (Auto-Deploy) oder auf einen Content-Branch mit Review?
4. Medien: `media_folder` ist auf `assets/uploads` vorkonfiguriert — greift erst, wenn Bilder aus Base64 in Dateien ausgelagert sind (Technik-Review, Empfehlung 1).

## Ausprobieren

Lokal (`python3 -m http.server` im Projektordner) oder nach Deploy des Branches: `/admin/` öffnen → das CMS startet im Test-Modus, alle 12 Sektionen sind mit den aktuellen Texten editierbar (Änderungen bleiben im Browser).
