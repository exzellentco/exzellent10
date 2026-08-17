import React from "react";
import { scoreBand } from "../../APIs/speechAnalyzer";

// Shared renderer for one analysis result: score ring, per-word verdicts,
// summary chips and the transcript. Used by both the student and teacher popups.
// `detailed` shows extra teacher-facing metrics (WER, transcript, extra words).
const ScoreResult = ({ result, detailed = false }) => {
  if (!result) return null;
  const score = result.pronunciation_score;
  const band = scoreBand(score);
  const ringColor =
    score >= 90 ? "var(--spl-green)" : score >= 75 ? "var(--spl-cyanL)" : score >= 55 ? "var(--spl-amber)" : "var(--spl-red)";

  return (
    <div>
      <div className="spl-scorewrap">
        <div className="spl-ring" style={{ "--v": score, "--spl-ringc": ringColor }}>
          <b>{Math.round(score)}</b>
          <span>/ 100</span>
        </div>
        <div className="spl-scoremeta">
          <b style={{ color: band.color }}>{band.label}</b>
          <span>
            {result.summary.matched}/{result.summary.reference_words} words correct
          </span>
          {detailed && <span> · WER {result.word_error_rate}</span>}
        </div>
      </div>

      <div className="spl-label" style={{ marginTop: 18 }}>What we heard</div>
      <p className="spl-words">
        {result.per_word.map((w, i) =>
          w.status === "extra" ? (
            detailed ? (
              <span className="spl-extra" key={i}> ({w.heard}) </span>
            ) : null
          ) : (
            <span className={`spl-w ${w.status}`} key={i}>
              {w.word}
              {w.status === "substituted" && <span className="spl-heard"> →{w.heard}</span>}{" "}
            </span>
          )
        )}
      </p>

      <div className="spl-legend">
        <i><span className="spl-dot" style={{ background: "var(--spl-green)" }} />correct</i>
        <i><span className="spl-dot" style={{ background: "var(--spl-amber)" }} />mispronounced</i>
        <i><span className="spl-dot" style={{ background: "var(--spl-red)" }} />missed</i>
      </div>

      <div className="spl-chips">
        <span className="spl-chip"><b>{result.summary.matched}</b> correct</span>
        <span className="spl-chip"><b>{result.summary.substituted}</b> mispronounced</span>
        <span className="spl-chip"><b>{result.summary.missing}</b> missed</span>
        {detailed && <span className="spl-chip"><b>{result.summary.extra}</b> extra</span>}
      </div>

      {detailed && (
        <>
          <div className="spl-label" style={{ marginTop: 18 }}>Raw transcript</div>
          <div className="spl-card spl-sub">{result.transcript || <em>(nothing detected)</em>}</div>
        </>
      )}
    </div>
  );
};

export default ScoreResult;
