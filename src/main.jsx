import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import './index.css'
import './styles/dashboard.css'
import './styles/auth.css'
import './styles/teacher-dash.css'
import './styles/speech.css'

const noiseUrl = `url("data:image/svg+xml,${encodeURIComponent(`<svg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'><filter id='noise'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#noise)'/></svg>`)}")`;


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
    <div className="pointer-events-none fixed inset-0 z-[9999] md:opacity-[0.06] opacity-[0.1] md:bg-size-[128px_128px] bg-size-[300px_300px]" style={{backgroundImage: noiseUrl,backgroundRepeat: "repeat",}}/>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
