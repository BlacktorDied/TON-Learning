import "./App.css";

export default function App() {
    return (
        <>
            <h1>TON Mini App</h1>

            <div className="buttonWrapper">
                <button id="connect-wallet">Connect Wallet</button>
                <p id="wallet-address">Wallet: Not connected</p>
                <button id="disconnect">Disconnect</button>
            </div>

            <div className="data">
                <div className="Card">
                    <b>Wallet Address</b>
                    <p id="address">Loading...</p>
                </div>

                <div className="Card">
                    <b>Balance</b>
                    <p id="balance">Loading...</p>
                </div>

                <div className="Card">
                    <b>Counter Value</b>
                    <p id="counterValue">Loading...</p>
                </div>
            </div>
        </>
    );
}
