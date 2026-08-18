import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// Point pdf.js at its worker (bundled by Vite).
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

// Extract plain text from a PDF File (client-side, up to `maxPages` pages).
export async function extractPdfText(file, maxPages = 40) {
  const data = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const pages = Math.min(pdf.numPages, maxPages);
  let text = "";
  for (let i = 1; i <= pages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it) => it.str).join(" ") + "\n";
  }
  return text.replace(/[ \t]+/g, " ").trim();
}
