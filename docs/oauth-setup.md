# CMS-Login per OAuth (Sveltia CMS Authenticator)

Ziel: Redakteur:innen melden sich unter `/admin/` mit **„Mit GitHub anmelden"** an — kein Personal Access Token mehr, kein Kopieren langer Zeichenketten.

Dazu braucht es zwei Bausteine:
1. einen kleinen **Cloudflare Worker** (den „Authenticator") als OAuth-Vermittler,
2. eine **GitHub OAuth App**, die den Login erlaubt.

> **Wo einrichten?** Beim Kunden-Handover gehören **beide** Bausteine in die Accounts des Kunden (Cloudflare-Account + GitHub-Org des Kunden). Zum Testen kannst du es vorher in deinen eigenen Accounts durchspielen.

> **Wichtig zur Reihenfolge:** Der Worker muss **zuerst** deployt sein, weil seine URL in der OAuth-App als Callback gebraucht wird.

---

## Schritt 1 — Worker deployen

1. Projektseite öffnen: <https://github.com/sveltia/sveltia-cms-auth>
2. Dort den Button **„Deploy to Cloudflare"** klicken (alternativ lokal `wrangler deploy`).
3. Im Cloudflare-Account des Kunden deployen lassen.
4. Nach dem Deploy die **Worker-URL kopieren**, Format:
   ```
   https://sveltia-cms-auth.<SUBDOMAIN>.workers.dev
   ```
   Diese URL brauchst du in Schritt 2 und 4.

---

## Schritt 2 — GitHub OAuth App anlegen

In **GitHub des Kunden** (bei einer Organisation: *Organization Settings*, sonst persönliche Settings):

1. **Settings → Developer settings → OAuth Apps → New OAuth App**
2. Felder ausfüllen:

   | Feld | Wert |
   |---|---|
   | Application name | z. B. `Food Connect CMS` |
   | Homepage URL | die Website-URL, z. B. `https://foodconnectruhr.de` |
   | **Authorization callback URL** | **`<WORKER-URL>/callback`** |

   Beispiel Callback: `https://sveltia-cms-auth.xyz.workers.dev/callback`
   → Das `/callback` am Ende ist **zwingend**.

3. Anlegen → **Client ID** notieren.
4. **Generate a new client secret** → **Client Secret** sofort kopieren (wird nur einmal angezeigt).

> Diese beiden Werte sind Zugangsdaten. Nicht ins Repo committen, nicht per Chat/Mail teilen — sie werden ausschließlich in Schritt 3 direkt bei Cloudflare hinterlegt.

---

## Schritt 3 — Secrets am Worker hinterlegen

Cloudflare-Dashboard → **Workers & Pages** → den Worker `sveltia-cms-auth` öffnen → **Settings → Variables (and Secrets)**.

Diese Variablen anlegen (Namen exakt so schreiben):

| Variable | Wert | Hinweis |
|---|---|---|
| `GITHUB_CLIENT_ID` | Client ID aus Schritt 2 | normale Variable |
| `GITHUB_CLIENT_SECRET` | Client Secret aus Schritt 2 | **„Encrypt" klicken** → als Secret speichern |
| `ALLOWED_DOMAINS` | z. B. `foodconnectruhr.de,*.foodconnect.pages.dev` | siehe unten |
| `GITHUB_HOSTNAME` | *(weglassen)* | nur für GitHub Enterprise nötig |

**`ALLOWED_DOMAINS`** begrenzt, welche Websites diesen Worker zum Login benutzen dürfen — ohne das könnte fremder Code eure OAuth-App missbrauchen. Kommagetrennt, Wildcards erlaubt. Trage **alle** Hostnamen ein, unter denen `/admin/` erreichbar ist (echte Domain **und** die `*.pages.dev`-Vorschau-URLs).

Danach **speichern und den Worker neu deployen**, damit die Variablen greifen.

---

## Schritt 4 — CMS auf OAuth umstellen

In `admin/config.yml` die Zeile `base_url` aktivieren und die Worker-URL eintragen:

```yaml
backend:
  name: github
  repo: <kunden-org>/foodconnect
  branch: main
  base_url: https://sveltia-cms-auth.<SUBDOMAIN>.workers.dev
```

- **Ohne** `base_url` → Login per Token (PAT).
- **Mit** `base_url` → Login per „Mit GitHub anmelden".
- Die URL **ohne** `/callback` eintragen — das hängt der Worker selbst an.

Committen und pushen → Cloudflare Pages baut neu → Änderung ist live.

---

## Schritt 5 — Testen

1. `https://<deine-domain>/admin/` öffnen.
2. Es sollte jetzt **„Sign in with GitHub"** erscheinen (statt „Sign in with Token").
3. Anmelden → GitHub fragt einmalig nach Zustimmung → zurück im CMS.
4. Einen Text ändern → **Save/Publish** → nach ~1 Min auf der Live-Seite prüfen.

---

## Wer darf was?

Der OAuth-Login ersetzt nur die **Anmeldung**. Ob jemand speichern darf, entscheidet weiterhin GitHub:

> Jede Person braucht **Schreibrecht auf das Repo** (Collaborator bzw. Team-Mitglied mit `Write`).

Zugriff entziehen = Person aus dem Repo/Team entfernen. Kein Token muss widerrufen werden.

---

## Troubleshooting

| Symptom | Ursache / Lösung |
|---|---|
| Login-Fenster zeigt „redirect_uri mismatch" | Callback-URL in der OAuth-App stimmt nicht exakt mit `<WORKER-URL>/callback` überein (Tippfehler, fehlendes `/callback`, http statt https). |
| „Unauthorized domain" / Login bricht ab | Hostname der Website fehlt in `ALLOWED_DOMAINS`. Auch die `*.pages.dev`-Preview-Domains eintragen. |
| Immer noch „Sign in with Token" | `base_url` fehlt in `admin/config.yml`, oder der Pages-Build lief noch nicht durch. |
| Login klappt, Speichern schlägt fehl | Der GitHub-Account hat kein Schreibrecht aufs Repo. |
| Nach Worker-Änderung keine Wirkung | Worker nach dem Setzen der Variablen neu deployen. |

---

## Zurück auf PAT (Notfall-Rückweg)

`base_url` in `admin/config.yml` auskommentieren, committen, pushen. Dann ist wieder „Sign in with Token" aktiv — praktisch, falls beim Handover mal etwas klemmt.
