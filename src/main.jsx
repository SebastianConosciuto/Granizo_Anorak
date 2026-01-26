import "./assets/fonts.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const loadExt = () => {
  console.log('=== SDK Ready - Initial Check ===');
  console.log('avt exists:', typeof avt !== 'undefined');
  console.log('avt.platform:', avt?.platform);
  console.log('window.token:', typeof window.token !== 'undefined' ? 'exists' : 'undefined');
  console.log('global token:', typeof token !== 'undefined' ? 'exists' : 'undefined');
  
  // Log all global variables from SDK
  if (typeof avt !== 'undefined') {
    console.log('avt keys:', Object.keys(avt));
  }

  // Set the window size
  avt.interface.setWindow({
    width: "900px",
    height: "700px"
  });
  
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

if (typeof avt !== 'undefined') {
  loadExt();
} else {
  window.addEventListener("readySDK", loadExt);
}