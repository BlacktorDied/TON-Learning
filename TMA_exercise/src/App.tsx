import "./App.css";
import { useEffect, useMemo, useState } from "react";
import {
    useTonAddress,
    useTonConnectUI,
    useTonWallet,
} from "@tonconnect/ui-react";
import { beginCell, toNano, fromNano, Address, TonClient } from "@ton/ton";
import TonWeb from "tonweb";

export default function App() {
    const userFriendlyAddress = useTonAddress();                    // For userFriendlyAddress
    // const rawAddress = useTonAddress(false);                     // For rawAddress
    const wallet = useTonWallet();                                  // For Balance
    const [tonConnectUI] = useTonConnectUI();                       // For Connect & Disconnect

    const [balance, setBalance] = useState<string>();               // get & set Balance
    const [formType, setFormType] = useState("TON");                // get & set FormType (For Form)
    // const [comment, setComment] = useState("");                     // get & set Comment (For Transaction)
    const [masterAddress, setMasterAddress] = useState("");         // get & set MasterAddress (For Jetton)
    const [recipientAddress, setRecipientAddress] = useState("");   // get & set Address (For Transaction)
    const [inputAmount, setInputAmount] = useState<string>("0");    // get & set Amount (For Transaction)
    const amount = useMemo<number>(
        () => parseFloat(inputAmount),
        [inputAmount],
    );

    // Initialize TonClient
    const client = new TonClient({
        endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
        apiKey: import.meta.env.VITE_TESTNET_API_KEY, // Enter you own Testnet API Key
    });

    // Get Balance useEffect
    useEffect(() => {
        if (!wallet) return;
        const getBalance = async () => {
            const recipientAddress = Address.parse(wallet.account.address);
            const balance = await client.getBalance(recipientAddress);
            setBalance(balance.toString());
        };
        getBalance();
        const interval = setInterval(getBalance, 5000);
        return () => clearInterval(interval);
    }, [wallet]);

    // UI Options
    tonConnectUI.uiOptions = {
        uiPreferences: {
            theme: "SYSTEM",
        },

        actionsConfiguration: {
            modals: ['before', 'success', 'error'],
            notifications: ['before', 'success', 'error']
        }
    };

    // Send TON Transaction
    async function sendTONTransaction() {
        if (isNaN(amount) || amount <= 0) {
            console.error("Invalid amount");
            return;
        }

        const transaction = {
            validUntil: Date.now() + 5 * 60 * 1000,
            messages: [
                {
                    address: recipientAddress,
                    amount: toNano(amount).toString(),
                },
            ],
        };

        try {
            tonConnectUI.sendTransaction(transaction);
        } catch (e) {
            console.error(e);
        }
    }

    // Send Jetton Transaction
    const tonweb = new TonWeb(
        new TonWeb.HttpProvider(
            "https://testnet.toncenter.com/api/v2/jsonRPC",
            { apiKey: import.meta.env.VITE_TESTNET_API_KEY }, // Enter you own Testnet API Key
        ),
    );

    async function getJettonWalletAddress() {
        const jettonMinter = new TonWeb.token.jetton.JettonMinter(
            tonweb.provider,
            {
                address: masterAddress,
                adminAddress: new TonWeb.utils.Address(masterAddress),
                jettonContentUri: "",
                jettonWalletCodeHex: "",
            },
        );

        const jettonWalletAddress = await jettonMinter.getJettonWalletAddress(
            new TonWeb.utils.Address(userFriendlyAddress),
        );

        return jettonWalletAddress;
    }

    async function sendJettonTransaction() {
        const body = beginCell()
            .storeUint(0xf8a7ea5, 32)                           // jetton transfer op code
            .storeUint(0, 64)                                   // query_id:uint64
            .storeCoins(toNano(amount.toString()))              // amount:(VarUInteger 16) -  Jetton amount for transfer (decimals = 6 - USDT, 9 - default). Function toNano use decimals = 9 (remember it)
            .storeAddress(Address.parse(recipientAddress))      // destination:MsgAddress
            .storeAddress(Address.parse(userFriendlyAddress))   // response_destination:MsgAddress
            .storeUint(0, 1)                                    // custom_payload:(Maybe ^Cell)
            .storeCoins(toNano("0.05"))                         // forward_ton_amount:(VarUInteger 16) - if >0, will send notification message
            .storeUint(0, 1)                                    // forward_payload:(Either Cell ^Cell)
            .endCell();

        console.log(body);

        const transaction = {
            validUntil: Date.now() + 5 * 60 * 1000,
            messages: [
                {
                    address: (await getJettonWalletAddress()).toString(),   // sender jetton wallet
                    amount: toNano("0.1").toString(),                       // for commission fees, excess will be returned
                    payload: body.toBoc().toString("base64"),               // payload with jetton transfer body
                },
            ],
        };

        try {
            tonConnectUI.sendTransaction(transaction);
        } catch (e) {
            console.error(e);
        }
    }

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
                <>
                    <p className="address">
                        <b>Your Address:</b>{" "}
                        <span
                            onClick={() => {
                                navigator.clipboard.writeText(
                                    userFriendlyAddress,
                                );
                                document.head.insertAdjacentHTML(
                                    "beforeend",
                                    "<style>.address::after { display: block; }</style>",
                                );
                            }}
                        >
                            {userFriendlyAddress.slice(0, 4) +
                                "..." +
                                userFriendlyAddress.slice(-4)}
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="copyIcon"
                            >
                                <path d="M6 11c0-2.8 0-4.2.9-5.1C7.8 5 9.2 5 12 5h3c2.8 0 4.2 0 5.1.9.9.9.9 2.3.9 5.1v5c0 2.8 0 4.2-.9 5.1-.9.9-2.3.9-5.1.9h-3c-2.8 0-4.2 0-5.1-.9C6 20.2 6 18.8 6 16v-5Z" />
                                <path d="M6 19a3 3 0 0 1-3-3v-6c0-3.8 0-5.7 1.2-6.8C5.3 2 7.2 2 11 2h4a3 3 0 0 1 3 3" />
                            </svg>
                        </span>
                    </p>

                    <p className="balance">
                        <b>Wallet Balance:</b>{" "}
                        {balance ? fromNano(balance) : "Loading..."} TONs
                    </p>

                    <div className="switch-wrapper">
                        <p>TONs</p>
                        <div
                            className={`switch ${formType === "TON" ? "TON" : "Jetton"}`}
                            onClick={() => {
                                setFormType((prev) =>
                                    prev === "TON" ? "Jetton" : "TON",
                                );
                            }}
                        />
                        <p>Jettons</p>
                    </div>

                    {formType === "TON" ? (
                        <form className="send-transaction">
                            <label htmlFor="recipientAddress">
                                Recipient Address:
                                <input
                                    type="text"
                                    id="recipientAddress"
                                    value={recipientAddress}
                                    onChange={(e) =>
                                        setRecipientAddress(e.target.value)
                                    }
                                />
                            </label>

                            <label htmlFor="amount">
                                Amount:
                                <input
                                    type="number"
                                    id="amount"
                                    value={inputAmount}
                                    onChange={(e) =>
                                        setInputAmount(e.target.value)
                                    }
                                />
                            </label>

                            <button
                                onClick={async (e) => {
                                    e.preventDefault();
                                    await sendTONTransaction();
                                }}
                            >
                                Send transaction
                            </button>
                        </form>
                    ) : (
                        <form className="send-transaction">
                            <label htmlFor="masterAddress">
                                Jetton Minter (Jetton Master):
                                <select
                                    value={masterAddress}
                                    onChange={(e) =>
                                        setMasterAddress(e.target.value)
                                    }
                                >
                                    <option value="">Select Jetton</option>
                                    <option value="kQBngUvvulIE8dMcA468fWImjMdrt_B-TVUwQ_5itds7sIfW">
                                        TMAE
                                    </option>
                                </select>
                            </label>

                            <label htmlFor="recipientAddress">
                                Recipient Address:
                                <input
                                    type="text"
                                    id="recipientAddress"
                                    value={recipientAddress}
                                    onChange={(e) =>
                                        setRecipientAddress(e.target.value)
                                    }
                                />
                            </label>

                            <label htmlFor="amount">
                                Amount:
                                <input
                                    type="number"
                                    id="amount"
                                    value={inputAmount}
                                    onChange={(e) =>
                                        setInputAmount(e.target.value)
                                    }
                                />
                            </label>

                            <button
                                onClick={async (e) => {
                                    e.preventDefault();
                                    await sendJettonTransaction();
                                }}
                            >
                                Send transaction
                            </button>
                        </form>
                    )}
                </>
            )}
        </>
    );
}
