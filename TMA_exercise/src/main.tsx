import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import WebApp from "@twa-dev/sdk";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

WebApp.ready();

const manifestUrl =
    "https://blacktordied.github.io/TON-Learning/TMA_exercise/tonconnect-manifest.json";

createRoot(document.getElementById("root")!).render(
    <TonConnectUIProvider manifestUrl={manifestUrl}>
        <App />
    </TonConnectUIProvider>,
);
