import { useState } from "react";
import "./App.css";
import { TonConnectButton, TonConnectUIProvider } from "@tonconnect/ui-react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <TonConnectButton />
    </div>
  );
}

export default App;
