// Exzi companion — the authenticated, streaming chat used on the dashboards.
//
// Talks to POST /api/chat/message, which replies as Server-Sent Events:
//   data: {"text":"partial "}   <- many of these
//   data: [DONE]                <- terminator
//   data: {"error":"..."}       <- if the stream fails mid-flight
//
// EventSource cannot be used here because it only issues GET requests and
// cannot set an Authorization header, so we read the stream off fetch()
// directly. Host resolution lives in apiBase.js: relative in dev so Vite
// proxies to the mock backend, the real backend URL in production.

import { apiUrl } from "./apiBase";

const authToken = () => {
  const ls = localStorage.getItem("token");
  if (ls) return ls;
  const row = document.cookie.split("; ").find((r) => r.startsWith("token="));
  return row ? row.split("=")[1] : "";
};

/** Stable per-tab session id so Exzi keeps context across a dashboard visit. */
export const sessionIdFor = (userId) => {
  const key = `exzi-session-${userId || "me"}`;
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = `${userId || "me"}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem(key, id);
  }
  return id;
};

/**
 * Send one message and stream the reply.
 *
 * @param {object}   opts
 * @param {string}   opts.sessionId
 * @param {string}   opts.userMessage
 * @param {object}   opts.profile      { name, mode, nativeLanguage?, targetLanguage?, level? }
 * @param {function} opts.onChunk      called with each text fragment as it arrives
 * @param {AbortSignal} [opts.signal]  lets the caller stop a reply mid-stream
 * @returns {Promise<string>} the complete reply text
 */
export const streamExzi = async ({ sessionId, userMessage, profile, onChunk, signal }) => {
  const headers = { "Content-Type": "application/json" };
  const t = authToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  const res = await fetch(apiUrl("/api/chat/message"), {
    method: "POST",
    headers,
    credentials: "include",
    signal,
    body: JSON.stringify({ sessionId, userMessage, profile }),
  });

  // Errors come back as ordinary JSON, not as a stream.
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) throw new Error("Your session expired — please log in again.");
    if (res.status === 429) throw new Error("Exzi is busy right now. Give it a moment and try again.");
    throw new Error(data.message || `Exzi is unavailable (${res.status}).`);
  }
  if (!res.body) throw new Error("Streaming is not supported in this browser.");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  // SSE frames are separated by a blank line. Chunks can split mid-frame, so
  // hold the remainder in `buffer` until a full frame has arrived.
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let sep;
    while ((sep = buffer.indexOf("\n\n")) !== -1) {
      const frame = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);

      for (const line of frame.split("\n")) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (payload === "[DONE]") return full;
        try {
          const obj = JSON.parse(payload);
          if (obj.error) throw new Error("Exzi lost the connection mid-reply. Please try again.");
          if (obj.text) {
            full += obj.text;
            onChunk && onChunk(obj.text, full);
          }
        } catch (err) {
          if (err instanceof SyntaxError) continue; // ignore a malformed frame
          throw err;
        }
      }
    }
  }
  return full;
};
