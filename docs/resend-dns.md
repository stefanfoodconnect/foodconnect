# Resend-DNS für food-connect.de

Domain bei Resend angelegt am 21.07.2026, Region `eu-west-1`.
Domain-ID: `f2949228-ca16-4b7d-b027-f8c040dfbb28`

DNS liegt (Stand 21.07.2026) bei **Strato**: Kundenlogin → Domains →
Domainverwaltung → Zahnrad bei `food-connect.de` → „DNS" →
„TXT- und CNAME-Records verwalten".

Beim geplanten Umzug zu Cloudflare müssen diese Einträge mit übernommen werden.

## 1. DKIM (TXT) — zwingend

Präfix: `resend._domainkey`

Wert (eine Zeile, keine Umbrüche, keine Leerzeichen):

```
p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCpWxPm1H+vuLxwxfyzbQH/stBfvS87N+2X+VCBsRSv4dKiIl0E5NbrvBcR8hV/yPQV77VcqhKwr1Hii3GbOqVp8Nu2/cwij+Vo6Hx4zJp5hC1pP7O6wyxggt2gqiPUC1RLXGLeNkiqKyj4Nimae8u91PZmlguzCnLDV0godDUjpwIDAQAB
```

## 2. SPF (TXT) — zwingend

Präfix: `send`

```
v=spf1 include:amazonses.com ~all
```

## 3. Return-Path (MX) — zwingend, offener Blocker

Präfix: `send`, Priorität `10`

```
feedback-smtp.eu-west-1.amazonses.com
```

**Dieser Record ist entgegen erster Annahme nicht optional.** Resend fasst MX
und TXT auf `send` zu einem gemeinsamen „SPF"-Block zusammen und verifiziert die
Domain erst, wenn beide vorhanden sind. Am 21.07.2026 getestet: mit verifiziertem
DKIM, aber fehlendem MX antwortet die API weiterhin mit
`403 · The food-connect.de domain is not verified`.

**Strato kann diesen Record nicht anlegen** — am 21.07.2026 in beiden dafür in
Frage kommenden Masken geprüft:

- „TXT- und CNAME-Records verwalten": Das Typ-Dropdown bietet ausschließlich
  `TXT` und `CNAME`.
- „MX-Record verwalten": Kennt nur „Primärer Mailserver" für die gesamte Domain
  (Auswahl STRATO-Mailserver / eigener Mailserver), kein Präfix-Feld und keine
  Möglichkeit für weitere Records. **Finger weg** — eine Änderung dort ersetzt
  den Root-MX und legt den Posteingang `info@food-connect.de` still.

Damit bleibt nur der DNS-Umzug zu Cloudflare; dort ist der Record trivial
anzulegen. Siehe `dns-backup-strato.md`.

Randnotiz: Vor dem Anlegen des TXT-Records lieferte `send.food-connect.de` einen
MX auf `smtpin.rzone.de` (Strato-Default für nicht existierende Subdomains).
Seit die Subdomain real existiert, ist dort kein MX mehr.

Wichtig: Den MX der **Hauptdomain** (`smtpin.rzone.de`) nicht anfassen — daran
hängt der Posteingang von `info@food-connect.de`.

## DMARC

Bereits vorhanden und streng: `_dmarc` = `v=DMARC1;p=reject;`

Muss **nicht** geändert werden. Absender ist `no-reply@food-connect.de`, DKIM
signiert mit `d=food-connect.de` und der SPF-Return-Path liegt auf
`send.food-connect.de` — beides ist unter der Standard-Ausrichtung („relaxed")
zur Absenderdomain aligned, DMARC passt also durch. Solange DKIM/SPF aber
fehlen oder falsch sind, wird jede Mail wegen `p=reject` hart abgelehnt.

## Prüfen

```sh
dig +short TXT resend._domainkey.food-connect.de
dig +short TXT send.food-connect.de
```

Danach bei Resend verifizieren (Full-Access-Key aus `.dev.vars`):

```sh
curl -X POST https://api.resend.com/domains/f2949228-ca16-4b7d-b027-f8c040dfbb28/verify \
  -H "Authorization: Bearer $RESEND_API_KEY"
```
