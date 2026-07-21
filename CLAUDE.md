# Food Connect Ruhr — Projekt-Kontext für Claude Code

Kurzüberblick für jede neue Claude-Code-Session in diesem Repo.

## Was das ist

Website für **Food Connect Ruhr GbR** (Kinderverpflegung/Catering, Ruhrgebiet). Statische Ein-Seiten-Website, kein Build-Prozess, kein Framework — `index.html` ist die einzige Quelle der Wahrheit für Struktur, Styles (inline `<style>`) und Texte.

- **Hosting:** Cloudflare Workers (statische Assets + eine Funktion für das Kontaktformular), konfiguriert über `wrangler.toml`. **Nicht mehr Cloudflare Pages** — das Projekt ist von Pages zu Workers migriert (Juli 2026).
- **Repo:** https://github.com/stefanfoodconnect/foodconnect (abgelöst: das ältere `7p4yx8swt8-crypto/foodconnect`, dort nicht mehr weiterarbeiten)
- **Live-URL:** noch offen — TODO nach dem ersten erfolgreichen Deploy: die tatsächliche `workers.dev`-Adresse (oder eine später eingerichtete eigene Domain) in `index.html` bei `<link rel="canonical">` und `og:url` eintragen (aktuell noch Platzhalter `foodconnect.pages.dev`, siehe TODO-Kommentar im `<head>`).
- **Kontakt Betreiber:** info@food-connect.de — Food Connect Ruhr GbR, Mengeder Str. 13, 44805 Bochum. Gesellschafter: Stefan Aschemann, Stefan Schönig.

## Wichtigste Regel

**Nie direkt in `main` pushen oder mergen ohne Rückfrage beim Nutzer.** Ein Merge nach `main` triggert bei entsprechend eingerichteter CI/CD automatisch `npx wrangler deploy` und geht live. Immer auf einem Feature-Branch arbeiten, PR erstellen, den Nutzer vor dem Merge kurz das Ergebnis prüfen lassen (z. B. per Screenshot).

## Struktur

- `index.html` — komplette Startseite (Markup, CSS, JS inline)
- `impressum.html`, `datenschutz.html` — rechtliche Seiten, mit echten Firmendaten befüllt
- `assets/` — Bilder, Logo, Fonts (selbst gehostet, kein Google Fonts)
- `content/*.json` — **Spiegel** der aktuellen Texte, als Datenmodell für ein zukünftiges CMS vorbereitet. `index.html` liest diese Dateien noch **nicht** zur Laufzeit — Textänderungen müssen aktuell in `index.html` gemacht werden (und der Konsistenz halber auch im passenden JSON nachgezogen werden).
- `admin/` — Sveltia CMS, läuft im **Test-Modus** (`backend: test-repo` in `admin/config.yml`), schreibt nichts ins echte Repo. Finale CMS-Architektur ist noch nicht entschieden.
- `docs/` — bisherige Analysen/Entscheidungen: `technik-review.md`, `cms-vorbereitung.md`, `text-abgleich.md` (Stand teilweise noch aus der Pages-Zeit, Grundaussagen zur Codestruktur gelten weiter)
- `wrangler.toml` — Workers-Konfiguration: statische Assets aus dem Repo-Root (`[assets] directory = "."`), Worker-Einstieg `worker/index.js`, `run_worker_first = true` (jede Anfrage geht zuerst durch den Worker)
- `worker/index.js` — Worker-Skript: leitet `/api/contact` (POST) an Resend weiter, alles andere an `env.ASSETS.fetch()` (= normale statische Auslieferung)
- `.assetsignore` — schließt `worker/`, `docs/`, `wrangler.toml`, `CLAUDE.md` von der Veröffentlichung als statische Assets aus

## Kontaktformular (fertig umgesetzt)

Das Formular in `index.html` (`#fc-form`) sendet per `fetch()` an `POST /api/contact`. Der Worker validiert (Pflichtfelder, E-Mail-Format, Honeypot-Feld `website` gegen Spam-Bots) und verschickt die Nachricht über die Resend-API an `info@food-connect.de`, mit der Besucher-E-Mail als `reply_to`.

- **Secret `RESEND_API_KEY`** muss in den Cloudflare-Projekteinstellungen (Settings → Variables and Secrets) hinterlegt sein, sonst antwortet die Funktion mit HTTP 500. Lokal zum Testen: `.dev.vars` mit `RESEND_API_KEY="..."` anlegen (nicht committen).
- Die Absenderdomain (`food-connect.de`) muss bei Resend verifiziert sein (DNS-Einträge), sonst kann Resend nur an die eigene Account-Adresse senden.
- Lokale Logiktests ohne echten Netzwerkzugriff: Worker-Modul direkt importieren und `worker.fetch(request, env)` mit gemocktem `fetch`/`env.ASSETS` aufrufen (Beispielansatz siehe Commit-Historie) — `wrangler dev` lief in der Cloud-Sandbox nicht zuverlässig (Proxy-Eigenheiten), auf einer normalen Maschine sollte `wrangler dev` aber funktionieren und ist der bessere End-to-End-Test.

## Offene Punkte

- **Datenschutzerklärung**, Abschnitt „Hosting" und „Kontaktformular": Hinweise zu AVV mit Cloudflare und mit Resend sind offen, muss der Betreiber selbst abschließen/dokumentieren.
- **Canonical-/OG-URL** in `index.html` auf die echte Live-Adresse aktualisieren, sobald bekannt (siehe TODO-Kommentar dort).
- Bilder sind für Web optimiert (JPEG, komprimiert) — beim Einsetzen neuer Kundenfotos genauso verfahren, nicht unkomprimierte PNGs committen.

## Arbeitsweise, die sich bewährt hat

1. Neuen Branch anlegen, Änderung machen, lokal mit Playwright/Chromium screenshotten und prüfen, bevor committet wird.
2. Für Worker-Logik: schnelle Tests durch direktes Aufrufen von `worker.fetch()` in Node, statt sich auf `wrangler dev` zu verlassen (siehe oben).
3. Commit-Messages auf Deutsch, aussagekräftig, mit kurzer Begründung.
4. PR erstellen, dem Nutzer den PR-Link geben, auf Merge-Freigabe warten.
