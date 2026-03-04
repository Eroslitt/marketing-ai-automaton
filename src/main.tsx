import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Prevent unhandled promise rejections (e.g. MetaMask) from crashing the app
window.addEventListener("unhandledrejection", (event) => {
  console.warn("Unhandled rejection suppressed:", event.reason);
  event.preventDefault();
});

createRoot(document.getElementById("root")!).render(<App />);
