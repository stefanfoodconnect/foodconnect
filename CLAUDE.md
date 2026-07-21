# Food Connect Ruhr — Projekt-Kontext für Claude Code

Kurzüberblick für jede neue Claude-Code-Session in diesem Repo.

## Was das ist

Website für **Food Connect Ruhr GbR** (Kinderverpflegung/Catering, Ruhrgebiet). Statische Ein-Seiten-Website, kein Build-Prozess, kein Framework — `index.html` ist die einzige Quelle der Wahrheit für Struktur, Styles (inline `<style>`) und Texte.

- **Hosting:** Cloudflare Workers (statische Assets + eine Funktion für das Kontaktformular), konfiguriert über `wrangler.toml`. **Nicht mehr Cloudflare Pages** — das Projekt ist von Pages zu Workers migriert (Juli 2026).
- **Repo:** https://github.com/stefanfoodconnect/foodconnect (abgelöst: das ältere `7p4yx8swt8-crypto/foodconnect`, dort nicht mehr weiterarbeiten)
- **Live-URL:** https://foodconnect.stefanfoodconnect.workers.dev — canonical/og:url in `index.html` sind bereits auf diese Adresse aktualisiert (Commit `aeed6f2`). Eigene Domain (`food-connect.de`, aktuell bei Strato) ist geplant, aber noch nicht umgezogen (siehe Abschnitt „Aktueller Stand" unten).
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

## Aktueller Stand (21.07.2026): Kontaktformular sendet noch keine E-Mails

**Symptom:** Formular auf der Live-Seite zeigt „Nachricht konnte nicht gesendet werden...". Das ist die generische Fehlermeldung aus `worker/index.js` (HTTP 502-Zweig), die bei jedem Fehlschlag des Resend-Aufrufs erscheint — sagt für sich genommen nichts über die Ursache.

**Bereits geprüft/ausgeschlossen:**
- `RESEND_API_KEY`-Secret ist in den Cloudflare-Projekteinstellungen gesetzt.
- `[observability] enabled = true` ist in `wrangler.toml` gesetzt und erfolgreich deployed (Version `07b9cf5c`). Cloudflare Observability → Events sollte damit bei einem erneuten Formular-Versuch die Zeile `Resend-Fehler: <status> <errText>` zeigen (Runtime-Log, nicht der Deploy-Log).
- Dass `env.RESEND_API_KEY` in der Deploy-Log-Bindings-Tabelle nicht auftaucht, ist **kein Problem** — diese Tabelle listet nur in `wrangler.toml` deklarierte Ressourcen-Bindings (bei uns `env.ASSETS`), Secrets werden separat über das Dashboard verwaltet und von `wrangler deploy` nicht angetastet/gelöscht.

**Gefundene Ursache:** Bei Resend (resend.com → Domains) steht **„No domains yet"** — es ist noch gar keine Absenderdomain hinterlegt/verifiziert. Damit kann Resend unmöglich von `no-reply@food-connect.de` (unsere `EMAIL_FROM` in `worker/index.js`) senden.

**Nächste Schritte:**
1. Bei Resend → Domains → „+ Add domain" → `food-connect.de` hinzufügen. Resend zeigt dann die nötigen DNS-Einträge an (i. d. R. TXT für SPF, 1–3× CNAME für DKIM, ggf. TXT/MX für DMARC).
2. Die Domain-DNS liegt aktuell bei **Strato** (Kundenlogin → Domains → Domainverwaltung → Zahnrad bei `food-connect.de` → Reiter „DNS" → „TXT- und CNAME-Records verwalten"). Dort die von Resend angezeigten Einträge 1:1 übertragen (Präfix ohne den Domain-Teil, den ergänzt Strato automatisch).
3. Bis zu 24 Std. auf DNS-Propagation warten (oft schneller), dann bei Resend auf „Verify" klicken.
4. Erst danach das Live-Formular erneut testen.

Hinweis: Der Domain-Umzug zu Cloudflare ist geplant, aber noch nicht erfolgt — die DNS-Einträge für Resend müssen deshalb jetzt bei Strato gesetzt werden, nicht bei Cloudflare.

## Offene Punkte

- **Resend-Domainverifizierung** für `food-connect.de` abschließen (siehe „Aktueller Stand" oben) — das ist aktuell der Blocker für ein funktionierendes Kontaktformular.
- **Datenschutzerklärung**, Abschnitt „Hosting" und „Kontaktformular": Hinweise zu AVV mit Cloudflare und mit Resend sind offen, muss der Betreiber selbst abschließen/dokumentieren.
- Bilder sind für Web optimiert (JPEG, komprimiert) — beim Einsetzen neuer Kundenfotos genauso verfahren, nicht unkomprimierte PNGs committen.
- Domain-Umzug `food-connect.de` von Strato zu Cloudflare ist angekündigt, aber noch nicht terminiert/umgesetzt — sobald das ansteht, DNS-Einträge (inkl. der neuen Resend-Einträge!) beim Umzug mit übernehmen.

## Arbeitsweise, die sich bewährt hat

1. Neuen Branch anlegen, Änderung machen, lokal mit Playwright/Chromium screenshotten und prüfen, bevor committet wird.
2. Für Worker-Logik: schnelle Tests durch direktes Aufrufen von `worker.fetch()` in Node, statt sich auf `wrangler dev` zu verlassen (siehe oben).
3. Commit-Messages auf Deutsch, aussagekräftig, mit kurzer Begründung.
4. PR erstellen, dem Nutzer den PR-Link geben, auf Merge-Freigabe warten.
