// Speech analyzer client. Records mic audio in the browser, POSTs the raw bytes
// with a target sentence to the mock's /api/ai/analyze-speech, which transcribes
// via Whisper and scores pronunciation (algorithm ported from the voice-analyzer
// project). Returns the scoring contract:
//   { transcript, reference, word_error_rate, pronunciation_score, per_word[],
//     summary, syllables_spoken, language, duration_sec }
import { apiUrl } from "./apiBase";

export async function analyzeSpeech(blob, referenceText, lang = "en") {
  const params = new URLSearchParams();
  if (referenceText) params.set("ref", referenceText);
  if (lang) params.set("lang", lang);
  const res = await fetch(apiUrl(`/api/ai/analyze-speech?${params.toString()}`), {
    method: "POST",
    headers: { "Content-Type": "application/octet-stream" },
    body: blob,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Speech analysis failed. Please try again.");
  }
  return data;
}

// A pronunciation score maps to a friendly band (label + colour token).
export function scoreBand(score) {
  if (score == null) return { label: "—", color: "var(--spl-muted)" };
  if (score >= 90) return { label: "Excellent", color: "var(--spl-green)" };
  if (score >= 75) return { label: "Good", color: "var(--spl-cyan)" };
  if (score >= 55) return { label: "Getting there", color: "var(--spl-amber)" };
  return { label: "Keep practising", color: "var(--spl-red)" };
}
