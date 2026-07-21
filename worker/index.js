/**
 * Food Connect Ruhr — Worker
 *
 * Liefert die statische Seite aus (über das ASSETS-Binding) und
 * beantwortet zusätzlich POST /api/contact, um Formularanfragen
 * per Resend als E-Mail zu verschicken.
 */

// ÜBERGANGSLÖSUNG (21.07.2026) — siehe docs/resend-dns.md
//
// Solange `food-connect.de` bei Resend nicht verifiziert ist, darf nur über
// Resends geteilte Domain `resend.dev` gesendet werden, und ausschließlich an
// die Adresse des Account-Inhabers. Deshalb gehen Anfragen vorübergehend an
// Stefan statt an info@. Die Verifizierung scheitert derzeit am fehlenden
// MX-Record auf `send.food-connect.de`, den Strato nicht anlegen kann.
//
// Sobald die DNS-Hoheit bei Cloudflare liegt und die Domain verifiziert ist,
// beide Konstanten zurückstellen auf:
//   EMAIL_TO   = "info@food-connect.de"
//   EMAIL_FROM = "Food Connect Ruhr Website <no-reply@food-connect.de>"
const EMAIL_TO = "stefan.aschemann@food-connect.de";
const EMAIL_FROM = "Food Connect Ruhr Website <onboarding@resend.dev>";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

async function handleContact(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Ungültige Anfrage." }, 400);
  }

  const name = (body.name || "").toString().trim();
  const email = (body.email || "").toString().trim();
  const message = (body.message || "").toString().trim();
  // Honeypot: unsichtbares Feld im Formular. Menschen lassen es leer,
  // Bots füllen häufig jedes Feld aus. Ist es befüllt, tun wir so als
  // hätte alles geklappt, verschicken aber nichts.
  const honeypot = (body.website || "").toString().trim();

  if (honeypot) {
    return json({ ok: true });
  }

  if (!name || !email || !message) {
    return json({ ok: false, error: "Bitte alle Felder ausfüllen." }, 400);
  }
  if (name.length > 200 || message.length > 5000) {
    return json({ ok: false, error: "Eingabe ist zu lang." }, 400);
  }
  if (!EMAIL_RE.test(email)) {
    return json({ ok: false, error: "Bitte eine gültige E-Mail-Adresse angeben." }, 400);
  }

  if (!env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY fehlt (Secret nicht gesetzt).");
    return json(
      { ok: false, error: "Formular ist derzeit nicht verfügbar. Bitte per E-Mail kontaktieren." },
      500
    );
  }

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [EMAIL_TO],
      reply_to: email,
      subject: `Neue Anfrage über die Website von ${name}`,
      text: `Neue Kontaktanfrage über foodconnect.stefanfoodconnect.workers.dev\n\nName: ${name}\nE-Mail: ${email}\n\nNachricht:\n${message}`,
    }),
  });

  if (!resendResponse.ok) {
    const errText = await resendResponse.text();
    console.error("Resend-Fehler:", resendResponse.status, errText);
    return json(
      { ok: false, error: "Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es später erneut oder schreiben Sie direkt an info@food-connect.de." },
      502
    );
  }

  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/contact") {
      if (request.method !== "POST") {
        return json({ ok: false, error: "Methode nicht erlaubt." }, 405);
      }
      return handleContact(request, env);
    }

    // Alles andere: normale statische Datei ausliefern.
    return env.ASSETS.fetch(request);
  },
};
