# Food Connect Ruhr — Projekt-Kontext für Claude Code

Kurzüberblick für jede neue Claude-Code-Session in diesem Repo.

## Was das ist

Website für **Food Connect Ruhr GbR** (Kinderverpflegung/Catering, Ruhrgebiet). Statische Ein-Seiten-Website, kein Framework.

⚠️ **Seit 21.07.2026 gibt es einen Build-Schritt.** `index.html` ist ein **Build-Artefakt** und darf **nicht mehr von Hand editiert** werden — jeder Build überschreibt sie. Texte gehören in `content/*.json`, Layout/CSS/JS in `template.html`.

- **Hosting:** Cloudflare Workers (statische Assets + eine Funktion für das Kontaktformular), konfiguriert über `wrangler.toml`. **Nicht mehr Cloudflare Pages** — das Projekt ist von Pages zu Workers migriert (Juli 2026).
- **Repo:** https://github.com/stefanfoodconnect/foodconnect (abgelöst: das ältere `7p4yx8swt8-crypto/foodconnect`, dort nicht mehr weiterarbeiten)
- **Live-URL:** https://foodconnect.stefanfoodconnect.workers.dev — canonical/og:url stehen in `template.html` bereits auf dieser Adresse. Eigene Domain (`food-connect.de`, aktuell bei Strato) ist geplant, aber noch nicht umgezogen (siehe Abschnitt „Aktueller Stand" unten).
- **Kontakt Betreiber:** info@food-connect.de — Food Connect Ruhr GbR, Mengeder Str. 13, 44805 Bochum. Gesellschafter: Stefan Aschemann, Stefan Schönig.

## Wichtigste Regel

**Nie direkt in `main` pushen oder mergen ohne Rückfrage beim Nutzer.** Ein Merge nach `main` triggert bei entsprechend eingerichteter CI/CD automatisch `npx wrangler deploy` und geht live. Immer auf einem Feature-Branch arbeiten, PR erstellen, den Nutzer vor dem Merge kurz das Ergebnis prüfen lassen (z. B. per Screenshot).

## Struktur

- `index.html` — **generiert, nicht editieren.** Ergebnis von `npm run build`.
- `template.html` — Layout, CSS und JS der Startseite, mit Platzhaltern `{{hero.headline_zeile1}}` und Listen-Markern `<!--USP-->`. Hier gehören Struktur- und Designänderungen hin.
- `build.js` — Node-Skript ohne Dependencies: `template.html` + `content/*.json` → `index.html`. Warnt, wenn ein Platzhalter unersetzt bleibt. Struktur-Assets (SVG-Icons, Bildpfade, Farbverläufe) liegen indexiert im Skript.
- `content/*.json` — **Quelle der Wahrheit für alle Texte** (12 Dateien). Über `/admin/` editierbar. Achtung: `konzept.headline` und `statistiken[].wert` enthalten bewusst Inline-HTML (`<br>`, `<em>`, `<span>`).
- `impressum.html`, `datenschutz.html` — rechtliche Seiten, mit echten Firmendaten befüllt. **Nicht** Teil des Builds, weiterhin von Hand pflegen.
- `assets/` — Bilder, Logo, Fonts (selbst gehostet, kein Google Fonts)
- `admin/` — Sveltia CMS, **produktiv**: `backend: github`, `repo: stefanfoodconnect/foodconnect`, `branch: main`. Speichern committet direkt auf `main` und löst den Deploy aus.
- `docs/` — `cms-vorbereitung.md` (Setup & Build, aktuell), `oauth-setup.md` (CMS-Login per GitHub), `resend-dns.md`, `dns-backup-strato.md`, `technik-review.md`, `text-abgleich.md`
- `wrangler.toml` — Workers-Konfiguration: statische Assets aus dem Repo-Root (`[assets] directory = "."`), Worker-Einstieg `worker/index.js`, `run_worker_first = true` (jede Anfrage geht zuerst durch den Worker)
- `worker/index.js` — Worker-Skript: leitet `/api/contact` (POST) an Resend weiter, alles andere an `env.ASSETS.fetch()` (= normale statische Auslieferung)
- `.assetsignore` — schließt `worker/`, `docs/`, `wrangler.toml`, `CLAUDE.md` sowie die Build-Quellen (`template.html`, `build.js`, `package.json`) von der Veröffentlichung als statische Assets aus

## Redaktions-Loop (CMS)

**CMS speichert `content/*.json` → Commit auf `main` → Workers Builds führt `npm run build` aus → live.** Dauert ein bis zwei Minuten.

- Lokal bauen: `npm run build` (oder `node build.js`), keine Dependencies nötig.
- Der Build muss in Cloudflare unter Settings → Build als **Build command `npm run build`** hinterlegt sein. Fehlt er, bleiben CMS-Änderungen unsichtbar, obwohl der Commit da ist — die Seite zeigt dann einfach die mitcommittete `index.html`.
- Login am CMS aktuell per Token („Sign In Using Access Token", Fine-grained PAT mit *Contents: Read and write*). Umstieg auf „Sign in with GitHub": `docs/oauth-setup.md`, danach nur noch die `base_url`-Zeile in `admin/config.yml` einkommentieren.
- **Neue Listen-Einträge** (5. USP, 4. Slide) funktionieren, greifen aber auf indexierte Struktur-Assets zurück; für Positionen ohne hinterlegtes Asset nutzt `build.js` einen Fallback. Bei Bedarf das Asset in `build.js` ergänzen.
- **Neue Sektionen oder Feldtypen** brauchen einen Eingriff in `template.html` + `build.js` + `admin/config.yml` — Entwickler-Task, nicht per CMS machbar.

⚠️ **Zwei Projektordner!** Unter `Website Projekte/FoodConnect/` liegt neben `foodconnect-neu/` (aktiv, dieses Repo) noch `foodconnect/` — der abgelöste Stand auf Repo `7p4yx8swt8-crypto/foodconnect` und Cloudflare Pages. Dort nicht weiterarbeiten. Der Mini-Build stammt ursprünglich von dort und wurde am 21.07.2026 hierher portiert.

## Kontaktformular (fertig umgesetzt)

Das Formular (`#fc-form`, Markup und JS in `template.html`) sendet per `fetch()` an `POST /api/contact`. Der Worker validiert (Pflichtfelder, E-Mail-Format, Honeypot-Feld `website` gegen Spam-Bots) und verschickt die Nachricht über die Resend-API, mit der Besucher-E-Mail als `reply_to`. Empfänger ist derzeit übergangsweise Stefan, siehe „Aktueller Stand".

- **Secret `RESEND_API_KEY`** muss in den Cloudflare-Projekteinstellungen (Settings → Variables and Secrets) hinterlegt sein, sonst antwortet die Funktion mit HTTP 500. Lokal zum Testen: `.dev.vars` mit `RESEND_API_KEY="..."` anlegen (nicht committen).
- Die Absenderdomain (`food-connect.de`) muss bei Resend verifiziert sein (DNS-Einträge), sonst kann Resend nur an die eigene Account-Adresse senden.
- Lokale Logiktests ohne echten Netzwerkzugriff: Worker-Modul direkt importieren und `worker.fetch(request, env)` mit gemocktem `fetch`/`env.ASSETS` aufrufen (Beispielansatz siehe Commit-Historie) — `wrangler dev` lief in der Cloud-Sandbox nicht zuverlässig (Proxy-Eigenheiten), auf einer normalen Maschine sollte `wrangler dev` aber funktionieren und ist der bessere End-to-End-Test.

## Aktueller Stand (21.07.2026): Kontaktformular funktioniert — mit Übergangsempfänger

**Das Formular ist live und funktioniert.** Live gegen `/api/contact` getestet: gültige Anfrage → HTTP 200 und Mail `delivered`, Honeypot → 200 ohne Versand, Validierungsfälle (leeres Feld, ungültige E-Mail, kaputtes JSON, zu lange Nachricht) → 400, GET → 405.

**Einschränkung:** Anfragen gehen derzeit an `stefan.aschemann@food-connect.de`, nicht an `info@food-connect.de`, und der Absender ist `onboarding@resend.dev`. Grund siehe unten. `reply_to` ist die Besucheradresse, Antworten funktionieren also normal.

**Was die Ursache des früheren HTTP 502 war:** Resend lehnte den Versand mit `403 · The food-connect.de domain is not verified` ab — die Absenderdomain war bei Resend gar nicht angelegt. Nützlicher Trick beim Debuggen: den Resend-Aufruf mit `curl` direkt nachstellen, statt im Cloudflare-Observability-Log zu suchen; die API nennt den Fehler im Klartext.

**Was inzwischen erledigt ist:**
- Domain `food-connect.de` bei Resend angelegt, Region `eu-west-1`, ID `f2949228-ca16-4b7d-b027-f8c040dfbb28`
- TXT `resend._domainkey` (DKIM) bei Strato gesetzt → **verified**
- TXT `send` (SPF) bei Strato gesetzt
- Records dokumentiert in `docs/resend-dns.md`, komplettes Zonen-Backup in `docs/dns-backup-strato.md`

**Warum die Domain trotzdem `pending` bleibt:** Resend verlangt auf `send.food-connect.de` zusätzlich einen MX auf `feedback-smtp.eu-west-1.amazonses.com`. **Strato kann das nicht** — geprüft in beiden Masken: „TXT- und CNAME-Records verwalten" bietet im Typ-Dropdown nur `TXT` und `CNAME`, und „MX-Record verwalten" kennt nur den primären Mailserver der gesamten Domain ohne Präfix-Feld. Dort etwas zu ändern würde den Root-MX ersetzen und den Posteingang `info@food-connect.de` stilllegen — **nicht anfassen**.

**Nächster Schritt zur endgültigen Lösung:** DNS-Hoheit zu Cloudflare umziehen (Nameserver-Wechsel bei Strato), dort den fehlenden MX anlegen, Resend verifizieren, danach in `worker/index.js` `EMAIL_TO`/`EMAIL_FROM` auf `info@food-connect.de` bzw. `no-reply@food-connect.de` zurückstellen. Alle dafür nötigen Records liegen in `docs/dns-backup-strato.md`.

## Deploy: läuft automatisch

Cloudflare **Workers Builds** ist mit dem GitHub-Repo verknüpft — ein Merge nach `main` deployed automatisch, innerhalb weniger Sekunden. Im Repo liegen **keine** GitHub-Actions-Workflows; wer nur dort nachsieht, hält das Projekt fälschlich für ohne CI/CD. Ein manuelles `wrangler deploy` ist im Normalfall nicht nötig.

## Offene Punkte

- **DNS-Umzug zu Cloudflare** — inzwischen nicht mehr nur „geplant", sondern die Voraussetzung dafür, dass Kontaktanfragen wieder bei `info@food-connect.de` ankommen (siehe „Aktueller Stand"). Backup der Zone liegt in `docs/dns-backup-strato.md`; der Root-MX `smtpin.rzone.de` ist dabei der kritische Record, an ihm hängt der Posteingang.
- **Nach dem Umzug:** MX `send` → `feedback-smtp.eu-west-1.amazonses.com` (Prio 10) anlegen, Resend verifizieren, dann `EMAIL_TO`/`EMAIL_FROM` in `worker/index.js` zurückstellen.
- **Datenschutzerklärung**, Abschnitt „Hosting" und „Kontaktformular": Hinweise zu AVV mit Cloudflare und mit Resend sind offen, muss der Betreiber selbst abschließen/dokumentieren. Zusätzlich zu bedenken: Solange der Übergangsempfänger aktiv ist, gehen die Anfragen an eine persönliche Adresse statt an das Firmenpostfach.
- Bilder sind für Web optimiert (JPEG, komprimiert) — beim Einsetzen neuer Kundenfotos genauso verfahren, nicht unkomprimierte PNGs committen.

## Arbeitsweise, die sich bewährt hat

1. Neuen Branch anlegen, Änderung machen, **`npm run build` laufen lassen**, dann lokal screenshotten und prüfen, bevor committet wird. Die gebaute `index.html` gehört mit in den Commit.
2. Nach Änderungen an `template.html` oder `build.js`: gegen die vorherige `index.html` diffen. Der Diff sollte **exakt** die beabsichtigte Änderung zeigen und sonst nichts — das fängt versehentliche Layout-Schäden zuverlässig ab.
3. Für Worker-Logik: schnelle Tests durch direktes Aufrufen von `worker.fetch()` in Node, statt sich auf `wrangler dev` zu verlassen (siehe oben).
4. Commit-Messages auf Deutsch, aussagekräftig, mit kurzer Begründung.
5. PR erstellen, dem Nutzer den PR-Link geben, auf Merge-Freigabe warten.
