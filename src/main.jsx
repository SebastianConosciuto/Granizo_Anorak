import "./assets/fonts.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const loadExt = () => {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

if (avt) {
  loadExt();
} else {
  window.addEventListener("readySDK", loadExt);
}