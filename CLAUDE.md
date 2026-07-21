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

1. Neuen Branch anlegen, Änderung machen, lokal mit Playwright/Chromium screenshotten und prüfen, bevor committet wird.
2. Für Worker-Logik: schnelle Tests durch direktes Aufrufen von `worker.fetch()` in Node, statt sich auf `wrangler dev` zu verlassen (siehe oben).
3. Commit-Messages auf Deutsch, aussagekräftig, mit kurzer Begründung.
4. PR erstellen, dem Nutzer den PR-Link geben, auf Merge-Freigabe warten.
