const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
// Model naming changes fairly often - override via OPENAI_MODEL in .env
// if this default is no longer current when you read this.
const DEFAULT_MODEL = "gpt-5-nano";

export interface AIReportAssessment {
  severity: "LOW" | "MEDIUM" | "HIGH";
  summary: string;
}

const REASON_LABELS: Record<string, string> = {
  FAKE_PROFILE: "Falsk profil",
  HARASSMENT: "Trakasserier",
  INAPPROPRIATE_CONTENT: "Olämpligt innehåll",
  UNDERAGE_SUSPECTED: "Misstänkt minderårig",
  SCAM: "Bedrägeri",
  OTHER: "Annat",
};

const SYSTEM_PROMPT = `Du är en granskningsassistent för en dejtingapp. Du bedömer hur allvarlig en användarrapport är.
Svara ENDAST med giltig JSON på formen {"severity": "LOW"|"MEDIUM"|"HIGH", "summary": "kort sammanfattning på svenska, max två meningar"}.
HIGH = misstänkt minderårig, hot om våld, allvarliga brott.
MEDIUM = trakasserier, bedrägeri, eller mönster som tyder på upprepat problembeteende.
LOW = otydliga eller mindre allvarliga fall.
Detta är ett beslutsstöd åt en mänsklig granskare, inte ett automatiskt beslut - var återhållsam med HIGH om det är osäkert.`;

/**
 * Returns an AI severity assessment for a report, or null if
 * OPENAI_API_KEY isn't set or the call fails for any reason. Never
 * throws - a report must always get created even if this fails.
 */
export async function assessReport(
  reason: string,
  details: string | null
): Promise<AIReportAssessment | null> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.log("[AI-granskning ej konfigurerad] Rapport väntar på manuell granskning.");
    return null;
  }

  try {
    const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
    const userContent = `Anledning: ${REASON_LABELS[reason] ?? reason}\nBeskrivning: ${
      details?.trim() || "Ingen beskrivning angiven."
    }`;

    const res = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!res.ok) {
      console.error(`OpenAI API error: ${res.status} ${await res.text()}`);
      return null;
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!["LOW", "MEDIUM", "HIGH"].includes(parsed.severity) || typeof parsed.summary !== "string") {
      console.error("Oväntat AI-svarsformat:", raw);
      return null;
    }

    return { severity: parsed.severity, summary: parsed.summary };
  } catch (err) {
    console.error("AI-granskning misslyckades:", err);
    return null;
  }
}
