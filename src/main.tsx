import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

import "./styles/globals.css";
import { ThemeProvider } from "./components/theme-provider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="blackjack-theme">
      <App />
    </ThemeProvider>
  </StrictMode>
);
