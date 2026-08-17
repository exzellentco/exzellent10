import { useRef, useState, useCallback, useEffect } from "react";

// Mic recorder hook. start() begins capture; stop() resolves with the audio Blob.
// Exposes live `recording` state, elapsed `seconds`, and a permission `error`.
export function useRecorder() {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const resolveRef = useRef(null);

  const cleanup = useCallback(() => {
    clearInterval(timerRef.current);
    if (mediaRef.current?.stream) mediaRef.current.stream.getTracks().forEach((t) => t.stop());
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const start = useCallback(async () => {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Recording isn't supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        clearInterval(timerRef.current);
        setRecording(false);
        if (resolveRef.current) { resolveRef.current(blob); resolveRef.current = null; }
      };
      mediaRef.current = mr;
      mr.start();
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch (e) {
      setError(e.name === "NotAllowedError" ? "Microphone permission was denied." : "Could not access the microphone.");
      setRecording(false);
    }
  }, []);

  const stop = useCallback(
    () =>
      new Promise((resolve) => {
        if (mediaRef.current && mediaRef.current.state !== "inactive") {
          resolveRef.current = resolve;
          mediaRef.current.stop();
        } else {
          resolve(null);
        }
      }),
    []
  );

  return { recording, seconds, error, start, stop };
}
