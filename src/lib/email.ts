const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_ADDRESS = "Velvetine <noreply@velvetine.app>"; // update once the domain is registered and verified in Resend

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // Dev fallback: no Resend account connected yet. Prints the real
    // reset link to the server terminal so the whole flow can be tested
    // end-to-end before that account exists. Remove nothing here when
    // RESEND_API_KEY is added later - it starts sending real emails
    // automatically.
    console.log(`[e-post ej konfigurerad] Återställningslänk för ${to}:\n${resetUrl}`);
    return;
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to,
      subject: "Återställ ditt lösenord – Velvetine",
      html: `<p>Klicka på länken för att välja ett nytt lösenord:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Länken slutar gälla om en timme. Bad du inte om detta kan du bortse från mejlet.</p>`,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend API error: ${res.status} ${text}`);
  }
}

/**
 * Sends the "we updated our terms/privacy policy" notice. Called from an
 * explicit admin action, not automatically - the person who updates the
 * policy text is the one who decides when it's ready to announce.
 */
export async function sendPolicyUpdateEmail(
  to: string,
  message: string,
  termsUrl: string,
  privacyUrl: string
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[e-post ej konfigurerad] Villkorsavisering till ${to}:\n${message}`);
    return;
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to,
      subject: "Vi har uppdaterat våra villkor – Velvetine",
      html: `<p>${message}</p><p><a href="${termsUrl}">Villkor</a> · <a href="${privacyUrl}">Integritetspolicy</a></p>`,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend API error: ${res.status} ${text}`);
  }
}

export async function sendVerificationEmail(to: string, verifyUrl: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[e-post ej konfigurerad] Verifieringslänk för ${to}:\n${verifyUrl}`);
    return;
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to,
      subject: "Bekräfta din e-postadress – Velvetine",
      html: `<p>Klicka på länken för att bekräfta din e-postadress:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>Länken slutar gälla om 24 timmar.</p>`,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend API error: ${res.status} ${text}`);
  }
}

export async function sendNewMatchEmail(to: string, matchUrl: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[e-post ej konfigurerad] Ny matchning-mejl till ${to}: ${matchUrl}`);
    return;
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to,
      subject: "Ni matchade på Velvetine",
      html: `<p>Ni gillade varandra! Chatta med er nya matchning:</p><p><a href="${matchUrl}">${matchUrl}</a></p>`,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend API error: ${res.status} ${text}`);
  }
}

export async function sendNewMessageEmail(
  to: string,
  senderName: string,
  matchUrl: string
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[e-post ej konfigurerad] Nytt meddelande-mejl till ${to} från ${senderName}: ${matchUrl}`);
    return;
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to,
      subject: `${senderName} skickade dig ett meddelande – Velvetine`,
      html: `<p>Du har ett nytt meddelande på Velvetine:</p><p><a href="${matchUrl}">${matchUrl}</a></p>`,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend API error: ${res.status} ${text}`);
  }
}
