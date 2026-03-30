import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

/* Self-hosted Latin subsets — same weights as former Google Fonts link; no extra DNS to fonts.googleapis.com */
import "@fontsource/inter/latin-300.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/playfair-display/latin-400-italic.css";
import "@fontsource/playfair-display/latin-400.css";
import "@fontsource/playfair-display/latin-600.css";
import "@fontsource/playfair-display/latin-800.css";

import App from "./App.tsx";
import { initReportWebVitals } from "./lib/report-web-vitals.ts";
import "./index.css";

const rootEl = document.getElementById("root");
if (!rootEl) {
	throw new Error("Missing #root element");
}
createRoot(rootEl).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
initReportWebVitals();
