// Markdown -> plain text.
//
// The models are instructed to reply in plain text, but they still emit
// markdown regularly. Chat bubbles render with textContent, so "**Hallo**"
// shows its asterisks on screen, and speech synthesis reads every symbol out
// loud ("star star Hallo"). Strip it for display, strip a little more for
// speech. The same helper is inlined in public/exzi.html and
// public/learning-ecosystem.html, which are static pages and cannot import.
//
// Deliberately conservative: German words containing underscores and
// expressions like "3 * 4" must survive untouched.

export const plainText = (s) =>
  String(s == null ? "" : s)
    .replace(/```[a-zA-Z]*\r?\n?([\s\S]*?)```/g, "$1")    // fenced code
    .replace(/`([^`\n]+)`/g, "$1")                         // inline code
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")              // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")               // links -> label
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")                    // headings
    .replace(/^\s{0,3}>\s?/gm, "")                         // blockquotes
    .replace(/^\s*([-*_]\s*){3,}$/gm, "")                  // horizontal rules
    .replace(/^\s*[-*+]\s+/gm, "• ")                  // bullets -> •
    .replace(/\*\*\*([^*]+)\*\*\*/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/(^|[^\w*])\*([^*\n]+)\*(?![\w*])/g, "$1$2")  // *italic*
    .replace(/(^|[^\w_])__([^_\n]+)__(?![\w_])/g, "$1$2")
    .replace(/(^|[^\w_])_([^_\n]+)_(?![\w_])/g, "$1$2")    // _italic_
    .replace(/[ \t]*\|[ \t]*/g, "  ")                       // table pipes
    .replace(/\n{3,}/g, "\n\n")
    .trim();

/** Speech reads symbols, emoji and URLs aloud, so remove those too. */
export const speechText = (s) =>
  plainText(s)
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[•–—]/g, " ")
    // The variation selector is stripped on its own line: inside a character
    // class it combines with the preceding character, which is both a lint
    // error and a subtle correctness bug.
    .replace(/\u{FE0F}/gu, "")
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}]/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
