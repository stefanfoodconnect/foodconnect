# Text-Abgleich: Kundendokument ↔ Website

**Quelle:** `FoodConnectRuhr_Website_Premium_CMS_Version.docx` (Kunde, Juli 2026)
**Ziel:** `index.html` (Onepager, einzige Seite des Projekts)

## Grundsätzliche Einordnung

Das Kundendokument ist **keine punktuelle Textkorrektur, sondern eine inhaltliche Neupositionierung**: weg von „Handelsagentur — Beschaffung, Catering, Messen" hin zu **„Society Meal Solutions" — Verpflegungskonzepte für KiTas, OGS und Betreuungseinrichtungen (Ready-to-Heat-Kinderverpflegung)**. Nahezu alle Texte ändern sich. Die Sektionsreihenfolge des Dokuments entspricht aber exakt der bestehenden Seitenstruktur, daher ist die Zuordnung eindeutig:

| Dokument-Abschnitt | Sektion in `index.html` |
|---|---|
| 1 Hero | `#start .hero` |
| 2 USP-Leiste | `.usp-bar` |
| 3 Über uns | `#ueber-uns` |
| 4 Dienstleistungen | `#dienstleistungen` |
| 5 Komponenten | `.messe-section` (bisher „Messe & Event") |
| 6 Produkte – Slideshow | `#produkte` |
| 7 Konzept | `.wildfood-section` (bisher „Wildfood") |
| 8 Portfolio | `#portfolio` |
| 9 Werte | `.values-section` |
| 10 Statistiken | `.stats-row` |
| 11 Kontakt | `#kontakt` |
| 12 Footer | `.footer` |
| 13 Navigation | `nav#mainNav` |

Die `.logos-strip` (Edeka, Transgourmet, Wildfood, Selgros …) hat **keinen Gegenpart im Dokument** → siehe Offene Fragen.

## Abgleich im Detail

Status: **geändert** = neuer Text eingesetzt · **unverändert** = identisch bzw. kein neuer Text nötig · **offen** = im Dokument nicht enthalten, nicht geraten (siehe Offene Fragen)

### 1 | Hero (`#start`)

| Element | Alt | Neu | Status |
|---|---|---|---|
| Eyebrow (`.hero-label`) | Handelsagentur · Ruhrgebiet & Europa | Society Meal Solutions | geändert |
| Headline (`.hero-h1`) | Beschaffung. Catering. Messen. Alles aus einer Hand. | Gemeinsam besser essen. / Verpflegungskonzepte für KiTas, OGS und Betreuungseinrichtungen. | geändert |
| Tagline | Mit 30 Jahren Lebensmittelexpertise. | Food Connect entwickelt, beschafft und liefert moderne Ready-to-Heat-Menükonzepte – gesund, wirtschaftlich und nachhaltig. | geändert |
| Button 1 | Kontakt aufnehmen | Konzeptgespräch vereinbaren | geändert |
| Button 2 | Dienstleistungen | Leistungen entdecken | geändert |
| Bild-Overlay Label | Live Cooking · Messe & Event | Ready-to-Heat | geändert |
| Overlay-Headline | Frisch. Hochwertig. Direkt von der Quelle. | Gesund. Einfach. Kindgerecht. | geändert |
| Hero-Foto (Live-Cooking-Szene) | — | — | offen (Bildmotiv passt nicht mehr) |

Anmerkung: Das Dokument macht keine Angabe, welcher Headline-Teil farbig ist. Analog zum bestehenden Muster (Akzent auf der letzten Zeile) und zu Abschnitt 3 („Headline farbig" = zweite Zeile) wurde Zeile 2 als Akzentzeile gesetzt.

### 2 | USP-Leiste (`.usp-bar`)

| Element | Alt | Neu | Status |
|---|---|---|---|
| USP 1 | Direktzugang zur Quelle / Eigene Lieferkette … | Analyse / Wir verstehen die Anforderungen Ihrer Einrichtung. | geändert |
| USP 2 | Einzigartiger Marktzugang / Kein Wettbewerb … | Konzept / Individuelle Speisepläne statt Standardlösungen. | geändert |
| USP 3 | Getestete Qualität / Nur Produkte aus … | Versorgung / Hochwertige Menüs aus zertifizierten Produzentennetzwerken. | geändert |
| USP 4 | Full-Service aus einer Hand / Von der Beschaffung … | Partnerschaft / Ein Ansprechpartner von der Idee bis zur täglichen Belieferung. | geändert |
| Icons (SVG) | — | — | unverändert (Dokument enthält keine Icon-Vorgaben) |

### 3 | Über uns (`#ueber-uns`)

| Element | Alt | Neu | Status |
|---|---|---|---|
| Headline (`.uber-h2`) | Leidenschaft für Lebensmittel. *Stärke* durch Netzwerk. | Kinderverpflegung neu gedacht. *Kompetenz. Netzwerk. Verantwortung.* (farbig lt. Dokument) | geändert |
| Einleitung (`.uber-sub`) | Food Connect Ruhr – das sind Stefan Aschemann und Stefan Schönig … | Food Connect Ruhr verbindet Lebensmitteltechnologie, Gastronomie und europaweite Beschaffung. Wir entwickeln komplette Verpflegungskonzepte, die Kindern schmecken und Einrichtungen entlasten. | geändert |
| Badge 1 (`.highlight`) | Lebensmitteltechnologie & Wirtschaftspsychologie | Lebensmitteltechnologie & Wirtschaftspsychologie | **unverändert** |
| Badge 2 | 19+ Jahre im Lebensmittelgroßhandel, europaweites Netzwerk | 20+ Jahre Lebensmittelbranche | geändert |
| Badge 3 | 20+ Jahre Küche, Spitzengastronomie, Catering & Fleischerhandwerk | Europaweites Produzentennetzwerk | geändert |
| Badge 4 | Messe- & Eventorganisation für nationale und internationale Firmen | Gemeinschaftsverpflegung | geändert |
| Badge 5 | Seit 2018 als Handelsagentur im Einzelhandel tätig | Projektmanagement & Ausschreibungen | geändert |
| Teamkarte Aschemann – Chips | Lebensmitteltechnologie / Großhandel / EU-Netzwerk | Strategie / Beschaffung / Vertrieb | geändert |
| Teamkarte Schönig – Chips | Spitzengastronomie / Catering / Fleischerhandwerk | Produktentwicklung / Gastronomie / Praxis | geändert |
| Teamkarten – Fließtexte (`.team-text`) | Biografietexte | — | offen (kein neuer Text im Dokument; Bestandstexte belassen) |
| Abschluss (`.team-badge-row`) | Zusammen decken wir die gesamte Wertschöpfungskette ab – von der Quelle bis zum fertigen Event. | Gemeinsam begleiten wir die gesamte Wertschöpfungskette – vom Konzept bis zum servierfertigen Menü. | geändert |

### 4 | Dienstleistungen (`#dienstleistungen`)

| Element | Alt | Neu | Status |
|---|---|---|---|
| Headline (`.section-h2`) | Was wir für Sie tun | Mehr als ein Lieferant. | geändert |
| Einleitung (`.section-sub`) | Drei Kompetenzen, ein Partner … | Wir liefern nicht nur Mahlzeiten, sondern komplette Versorgungslösungen. | geändert |
| Karte 1 Titel | Handel & Beschaffung | Ernährungskonzepte & Speiseplanung | geändert |
| Karte 2 Titel | Catering | Ready-to-Heat-Menüs | geändert |
| Karte 3 Titel | Messe & Event | Nachhaltige Verpackungs- und Logistiklösungen | geändert |
| Karten-Beschreibungstexte (`.service-text`) | Beschaffungs-/Catering-/Messetexte | — | offen (Dokument liefert nur Titel; Alttexte passen nicht mehr → belassen, siehe Offene Fragen) |

### 5 | Komponenten (`.messe-section`, bisher „Messe & Event")

| Element | Alt | Neu | Status |
|---|---|---|---|
| Eyebrow | Messe & Event | Komponenten | geändert |
| Headline | Ihr Auftritt. Unsere Aufgabe. | Jedes Kind isst anders. | geändert |
| Einleitung | Wir übernehmen die gesamte Abwicklung Ihrer Messebeteiligung … | Mit unserem Komponentenprinzip entstehen individuelle Lieblingsmenüs bei minimalem Aufwand. | geändert |
| Punkt 01 | Planung & Konzeption + Text | Bedarfsanalyse | geändert (Titel; Beschreibung offen) |
| Punkt 02 | Lebensmittelversorgung + Text | Menüentwicklung | geändert (Titel; Beschreibung offen) |
| Punkt 03 | Durchführung vor Ort + Text | Auswahl hochwertiger Komponenten | geändert (Titel; Beschreibung offen) |
| Punkt 04 | Haus- & offene Messen + Text | Flexible Wochenplanung | geändert (Titel; Beschreibung offen) |
| Karte Titel | Für wen ist das ideal? | Zielgruppen | geändert (Interpretation, siehe Offene Fragen) |
| Karte Unterzeile | Große Firmen, die ihre Marke … | Für wen unser Komponentenprinzip entwickelt ist | geändert (neutraler Übergangssatz, **nicht aus dem Dokument** — Alttext war inhaltlich falsch; bitte bestätigen/ersetzen) |
| Karten-Liste (5 Einträge) | Markenartikler & Produzenten … | KiTas / OGS / Schulen / Tagespflege / Kinderheime | geändert |

### 6 | Produkte (`#produkte`)

| Element | Alt | Neu | Status |
|---|---|---|---|
| Eyebrow | Produkte | Produkte | unverändert |
| Headline | Convenience-Produkte | — | offen (kein neuer Text im Dokument) |
| Einleitung | Hochwertige Convenience-Produkte für Einzelhandel … | — | offen |
| Slide 1 | Wild & Premium / Wild-Burger Patties / Saftige Patties … | Kids Classics / Beliebte Hauptgerichte wie Frikadellen, Hähnchen, Pasta und vegetarische Klassiker. | geändert (Tag offen) |
| Slide 2 | Convenience / Marinierte Grillspezialitäten / … | Komponenten / Fleisch, Gemüse, Beilagen und vegetarische Alternativen frei kombinierbar. | geändert (Tag offen) |
| Slide 3 | Retail Ready / Retail-Verpackungen / … | Special Nutrition / Allergiker-, vegetarische, religiöse und altersgerechte Menüvarianten. | geändert (Tag offen) |
| Slide-Bilder (Unsplash: Wildburger, Grill, Verpackung) | — | — | offen (Motive passen nicht zu Kinderverpflegung) |
| Info-Karte 1 Titel | Tiefkühl & Frisch | Kurze Regenerationszeit. | geändert |
| Info-Karte 2 Titel | Flexible Gebindegrößen | Flexible Menüplanung. | geändert |
| Info-Karte 3 Titel | Private Label möglich | Private Label möglich. | **unverändert** |
| Info-Karten-Texte | — | — | offen (keine neuen Texte im Dokument; belassen) |

### 7 | Konzept (`.wildfood-section`, bisher „Wildfood")

| Element | Alt | Neu | Status |
|---|---|---|---|
| Headline (`.wf-h2`) | Exklusive Repräsentation der Marke *Wildfood.* | Ein System statt einzelner *Produkte.* (Akzent auf letztem Wort analog Bestandsmuster) | geändert |
| Einleitung (`.wf-sub`) | Food Connect Ruhr ist exklusiver Handelspartner der WILDFOODGROUP … | Food Connect entwickelt wirtschaftliche Versorgungssysteme mit hoher Akzeptanz bei Kindern. | geändert |
| ✓-Punkte (4) | 100% nachhaltiges Wildfleisch / Fettfrei … / Reh, Hirsch … / Handmade … | Hohe Akzeptanz / Weniger Lebensmittelverschwendung / Planbare Kosten / Nachhaltige Beschaffung | geändert |
| CTA | Wildfood-Produkte anfragen | Konzept anfragen | geändert |
| Badge-Pill | Exklusive Markenrepräsentation | — | offen |
| USP-Box (`.wf-usp`) | Kein Caterer und kein Händler verfügt über … | — | offen |
| Logo-Box rechts (WILDFOOD, „Trademark by Interfood GmbH", Partner-Badge) | — | — | offen (gesamter Block obsolet bei Neupositionierung?) |

### 8 | Portfolio (`#portfolio`)

| Element | Alt | Neu | Status |
|---|---|---|---|
| Headline | Unsere Referenzen | Lösungen für jede Einrichtung. | geändert |
| Einleitung | Ausgewählte Projekte – ein Auszug … | — | offen (belassen) |
| Karte 1 | Beschaffung / Großhandel Ruhrgebiet / Text | KiTas / Vollverpflegung | geändert (Beschreibung offen) |
| Karte 2 | Messe & Event / Hausmesse Lebensmittelhandel / Text | OGS / Flexible Mittagsversorgung | geändert (Beschreibung offen) |
| Karte 3 | Catering / Corporate Catering / Text | Soziale Einrichtungen / Individuelle Versorgung | geändert (Beschreibung offen) |

### 9 | Werte (`.values-section`)

| Element | Alt | Neu | Status |
|---|---|---|---|
| Eyebrow / Headline | Unsere Werte / Was uns antreibt | — | unverändert (kein neuer Text im Dokument) |
| Wert 01 | Verlässlichkeit / In der Handelsbranche zählt das Wort … | Kind im Mittelpunkt / Geschmack und Ernährung gehören zusammen. | geändert |
| Wert 02 | Einzigartigkeit / Diese Kombination … | Partnerschaft / Langfristige Zusammenarbeit auf Augenhöhe. | geändert |
| Wert 03 | Qualität / Nur Produkte die wir selbst … | Verantwortung / Qualität, Nachhaltigkeit und Transparenz. | geändert |

### 10 | Statistiken (`.stats-row`)

Das Dokument nennt **drei** Statistiken, die Seite hat **vier** Blöcke:

| Element | Alt | Neu | Status |
|---|---|---|---|
| Block 1 | 30+ / Jahre Lebensmittelexpertise | 20+ / Jahre Lebensmittelkompetenz | geändert |
| Block 2 | 3 / Kompetenzen aus einer Hand | — | offen (kein Gegenpart im Dokument) |
| Block 3 | EU / Beschaffungsnetzwerk | EU / -weites Beschaffungsnetzwerk (sinngleich) | unverändert |
| Block 4 | 1× / Diese Kombination am Markt | 100 % / Individuelle Verpflegungskonzepte | geändert |

### 11 | Kontakt (`#kontakt`)

| Element | Alt | Neu | Status |
|---|---|---|---|
| Headline | Bereit für eine Zusammenarbeit? | Lassen Sie uns die Kinderverpflegung gemeinsam neu denken. | geändert |
| Subtext | Ob Beschaffung, Catering oder Messe – wir freuen uns … | Wir beraten Sie unverbindlich und entwickeln ein passendes Versorgungskonzept. | geändert |
| Formular-Button | Anfrage absenden → | Anfrage senden → | geändert |
| Großer Button links (`.kontakt-btn`) | Jetzt Kontakt aufnehmen | — | offen (Dokument nennt nur einen Button „Anfrage senden") |
| E-Mail (mailto im Formular) | info@foodconnectruhr.de | info@foodconnectruhr.de | **unverändert** |
| Formular-Labels/Platzhalter | Name / E-Mail / Nachricht | — | unverändert (nicht im Dokument) |

### 12 | Footer (`.footer`)

| Element | Alt | Neu | Status |
|---|---|---|---|
| Copyright-Zeile | © 2026 · Handelsagentur · Impressum · Datenschutz | © 2026 Food Connect Ruhr · Impressum · Datenschutz | geändert („Handelsagentur" entfernt; Impressum/Datenschutz aus rechtlichen Gründen belassen) |
| Taglines „society meal solutions" / „Healthy Kids. Smart Catering." | — | — | offen (Footer hat aktuell nur Logo + Copyright; Einbau wäre Strukturänderung) |

### 13 | Navigation (`nav#mainNav`)

| Element | Alt | Neu | Status |
|---|---|---|---|
| Menüpunkte | Startseite / Über uns / Dienstleistungen / Produkte / Portfolio / Kontakt | identisch | **unverändert** |
| CTA-Button | Anfrage senden | Beratung anfragen | geändert |

## Offene Fragen

Nicht geraten, bitte mit dem Kunden klären:

1. **Logos-Leiste** („Vertrauen von führenden Unternehmen": Einzelhandel, Großhandel, Edeka, Transgourmet, Wildfood, Selgros) — kommt im Dokument nicht vor. Bei der Neupositionierung auf Kinderverpflegung vermutlich obsolet. Entfernen oder neue Referenzen?
2. **Beschreibungstexte fehlen im Dokument** für: die 3 Dienstleistungs-Karten, die 4 Komponenten-Schritte (01–04), die 3 Portfolio-Karten und die 3 Produkt-Info-Karten. Die alten Texte (Handelsagentur-Bezug) stehen dort noch und passen inhaltlich nicht mehr. Neue Kurztexte liefern oder Beschreibungen ersatzlos streichen?
3. **Wildfood-Logo-Box** (WILDFOOD-Logo, „Trademark by Interfood GmbH", Badge „Exklusiver Handelspartner") sowie Badge-Pill „Exklusive Markenrepräsentation" und die USP-Box in dieser Sektion — kein Gegenpart im Dokument. Bleibt die Wildfood-Partnerschaft Teil des Angebots oder entfällt der Block komplett?
4. **Produkte-Sektion: Headline/Einleitung** („Convenience-Produkte") und die **Slide-Tags** (Wild & Premium / Convenience / Retail Ready) haben keinen neuen Text. Vorschlag erbeten.
5. **Bilder passen nicht zur neuen Ausrichtung:** Hero-Foto (Live-Cooking/Messe) und die 3 Slideshow-Fotos (Wild-Burger, Grillfleisch, Fleisch-Verpackung, extern von Unsplash geladen). Neue Bilder (Kinderverpflegung) nötig.
6. **Statistik-Block 2** („3 Kompetenzen aus einer Hand") — kein Gegenpart; das Dokument nennt nur 3 Statistiken für 4 Blöcke. Vierten Block entfernen (Layout-Eingriff) oder Text liefern?
7. **Teamkarten-Fließtexte** (Biografien Aschemann/Schönig) — im Dokument nur die Chip-Begriffe. Biografietexte so belassen?
8. **Footer-Taglines** „society meal solutions" und „Healthy Kids. Smart Catering." — aktueller Footer ist einzeilig (Logo + Copyright). Einbau erfordert kleine Strukturänderung — gewünscht?
9. **Großer Kontakt-Button links** („Jetzt Kontakt aufnehmen") — Dokument nennt nur einen Button „Anfrage senden" (auf das Formular gemappt). Linken Button umbenennen oder belassen?
10. **Teamkarten-Rollenzeile** „Partner · Food Connect Ruhr" — nicht im Dokument, belassen.
11. **Hero-Headline-Farbakzent:** Dokument macht keine Angabe, welche Hero-Zeile farbig ist; gesetzt wurde Zeile 2 (analog „Über uns"). Bei Bedarf tauschen.
