import "./App.css";

import { useEffect, useState } from "react";
import {
    useTonAddress,
    SendTransactionRequest,
    useTonConnectUI,
    useTonWallet,
} from "@tonconnect/ui-react";
import TonWeb from "tonweb";

export default function App() {
    const userFriendlyAddress = useTonAddress();
    const rawAddress = useTonAddress(false);
    const wallet = useTonWallet();

    const tonweb = new TonWeb(
        new TonWeb.HttpProvider("https://testnet.toncenter.com/api/v2/jsonRPC")
    );
    const [balance, setBalance] = useState<string>();

    useEffect(() => {
        if (!wallet) return;
        const getBalance = async () =>
            setBalance(await tonweb.getBalance( wallet.account.address));
        getBalance();
    }, [wallet]);

    const [tonConnectUI] = useTonConnectUI();

    const [address, setAddress] = useState("");
    const [amount, setAmount] = useState("");

    const transaction: SendTransactionRequest = {
        validUntil: Date.now() + 5 * 60 * 1000,
        messages: [
            {
                address: address,
                amount: amount,
            },
        ],
    };

    return (
        <>
            <h1>Telegram Mini App</h1>

            {userFriendlyAddress ? (
                <button
                    id="disconnect-wallet"
                    onClick={() => tonConnectUI.disconnect()}
                >
                    Disconnect Wallet
                </button>
            ) : (
                <button
                    id="connect-wallet"
                    onClick={() => tonConnectUI.openModal()}
                >
                    Connect Wallet
                </button>
            )}

            {userFriendlyAddress && (
                <div>
                    <div className="address">
                        <p>
                            <b>User-friendly address:</b> {userFriendlyAddress}
                        </p>
                        <p>
                            <b>Raw address:</b> {rawAddress}
                        </p>
                    </div>

                    <div className="balance">
                        <p>
                            <b>Wallet Balance:</b> {balance ? TonWeb.utils.fromNano(balance) : "Loading..."} TON
                        </p>
                    </div>

                    <div className="send-transaction">
                        <label htmlFor="address">
                            Address:
                            <input
                                type="text"
                                id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </label>
                        <label htmlFor="amount">
                            Amount (in nano):
                            <input
                                type="text"
                                id="amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </label>
                        <button
                            onClick={() =>
                                tonConnectUI.sendTransaction(transaction)
                            }
                        >
                            Send transaction
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
