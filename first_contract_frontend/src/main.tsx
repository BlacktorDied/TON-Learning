import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

// This manifest is used temporarily for development purposes
const manifestUrl =
  "https://raw.githubsercontent.com/ton-community/tutorial/main/03-client/test/public/tonconnect-maniefst.json";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <TonConnectUIProvider manifestUrl={manifestUrl}>
    <App />
  </TonConnectUIProvider>,
);
