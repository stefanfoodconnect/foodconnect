# DNS-Backup food-connect.de (Strato) — Stand 21.07.2026

Aufgenommen per `dig` gegen den autoritativen Strato-Nameserver
`shades17.rzone.de`, unmittelbar vor dem geplanten Umzug der DNS-Hoheit zu
Cloudflare. Dient als Referenz zum Wiederherstellen und zum Abgleich der in
Cloudflare angelegten Zone.

Nameserver bei Strato: `shades17.rzone.de`, `docks01.rzone.de`
SOA-Serial zum Zeitpunkt der Aufnahme: `2024110619`

## Records

| Name | Typ | Wert | Zweck |
|---|---|---|---|
| `@` | A | `81.169.145.156` | Website (Strato-Hosting) |
| `@` | AAAA | `2a01:238:20a:202:1156::` | Website IPv6 |
| `@` | MX 5 | `smtpin.rzone.de.` | **Posteingang info@food-connect.de** |
| `www` | CNAME | `food-connect.de.` | www-Weiterleitung |
| `autoconfig` | CNAME | `autoconfigure.strato.de.` | Mailprogramm-Autokonfiguration |
| `_dmarc` | TXT | `v=DMARC1;p=reject;` | Strato-Standard-DMARC-Regel |
| `_domainkey` | TXT | `o=~; t=y; r=dkim@rzone.de` | Strato-DKIM-Policy |
| `resend._domainkey` | TXT | `p=MIGf…IDAQAB` (218 Zeichen, s. resend-dns.md) | Resend DKIM |
| `send` | TXT | `v=spf1 include:amazonses.com ~all` | Resend SPF |
| `*` | MX 5 | `smtpin.rzone.de.` | Wildcard, Strato-Default |
| `_autodiscover._tcp` | SRV | `0 100 443 autoconfigure.strato.de.` | Outlook-Autodiscover |

Kein CAA-Record, kein TXT auf der Root-Domain (also auch kein SPF für die
Hauptdomain), kein Wildcard-A.

## Wichtige Hinweise für den Umzug

1. **Der Root-MX ist kritisch.** Daran hängt der Posteingang von
   `info@food-connect.de`. Geht er beim Umzug verloren, kommen keine Mails mehr
   an — inklusive der Kontaktanfragen, um die es hier eigentlich geht.
2. **Diese Liste ist per `dig` erraten, nicht ausgelesen.** Ein Zonentransfer
   (AXFR) ist bei Strato gesperrt, deshalb konnten nur geratene Namen geprüft
   werden. Vor dem Nameserver-Wechsel muss die Record-Liste in der
   Strato-Oberfläche gegengelesen werden — es kann Subdomains geben, die hier
   fehlen.
3. Der Wildcard-MX ist ein Strato-Default. In Cloudflare nicht zwingend
   nachzubauen, schadet aber auch nicht.
4. Der `autoconfig`-CNAME und der `_domainkey`-TXT sind Strato-Mailinfrastruktur.
   Solange die Postfächer bei Strato bleiben, mit übernehmen.

## Neu hinzuzufügen in Cloudflare (der eigentliche Grund des Umzugs)

| Name | Typ | Wert | Prio |
|---|---|---|---|
| `send` | MX | `feedback-smtp.eu-west-1.amazonses.com` | 10 |

Strato konnte diesen Record nicht anlegen: die Maske
„TXT- und CNAME-Records verwalten" bietet im Typ-Dropdown ausschließlich
`TXT` und `CNAME`. Ohne ihn verifiziert Resend die Domain nicht.
