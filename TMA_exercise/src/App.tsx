import "./App.css";
import { useEffect, useMemo, useState } from "react";
import {
    useTonAddress,
    useTonConnectUI,
    useTonWallet,
} from "@tonconnect/ui-react";
import { TonClient } from "@ton/ton";
import { Address, toNano, fromNano, beginCell } from "@ton/core";

export default function App() {
    const userFriendlyAddress = useTonAddress(); // For userFriendlyAddress
    const wallet = useTonWallet(); // For Balance
    const [tonConnectUI] = useTonConnectUI(); // For Connect & Disconnect
    // const jettonContractAddress = ""; //
    // const jettonContractABI = []; //

    const [balance, setBalance] = useState<string>(); // get & set Balance
    const [masterAddress, setMasterAddress] = useState(""); // get & set MasterAddress (For Jetton)
    const [recipientAddress, setRecipientAddress] = useState(""); // get & set Address    (For Transaction)
    const [inputAmount, setInputAmount] = useState<string>("0"); // get & set Amount     (For Transaction)
    const amount = useMemo<number>(
        () => parseFloat(inputAmount),
        [inputAmount],
    );
    const [formType, setFormType] = useState("TON"); // get & set FormType   (For Form)

    // Initialize TonClient
    const client = new TonClient({
        endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
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
            const result = await tonConnectUI.sendTransaction(transaction, {
                modals: ["before", "success", "error"],
                notifications: ["before", "success", "error"],
            });
            console.log(result);
        } catch (e) {
            console.error(e);
        }
    }

    // Send Jetton Transaction
    async function sendJettonTransaction() {
        if (isNaN(amount) || amount <= 0) {
            console.error("Invalid Jetton amount");
            return;
        }

        try {
            // Create the payload for the Jetton transfer
            const payload = beginCell()
                .storeUint(0xf8a7ea5, 32) // Jetton transfer method ID
                .storeUint(0, 64) // Query ID (optional, can be 0)
                .storeCoins(toNano(amount)) // Jetton amount
                .storeAddress(Address.parse(recipientAddress)) // Recipient's address
                .storeAddress(null) // Forward payload address (null if not used)
                .storeUint(0, 1) // No custom payload
                .endCell();

            // Construct the transaction object
            const transaction = {
                validUntil: Date.now() + 5 * 60 * 1000, // Transaction valid for 5 minutes
                messages: [
                    {
                        address: masterAddress, // Sender's Jetton wallet address
                        amount: toNano("0.05").toString(), // Small TON fee for the transaction
                        payload: payload.toBoc().toString("base64"), // Encoded payload
                    },
                ],
            };

            // Send the transaction
            const result = await tonConnectUI.sendTransaction(transaction, {
                modals: ["before", "success", "error"],
                notifications: ["before", "success", "error"],
            });

            console.log("Jetton transaction result:", result);
        } catch (e) {
            console.error("Jetton transaction failed:", e);
        }
    }

    // Create a contract instance using the address from tonconnect-ui
    // const contract =
    //     wallet && wallet.account.publicKey
    //         ? client.open(
    //               WalletContractV4.create({
    //                   workchain: 0,
    //                   publicKey: Buffer.from(wallet.account.publicKey, "hex"),
    //               })
    //           )
    //         : null;
    // useEffect(() => {
    //     const getBalance = async () => {
    //         if (contract) {
    //             let balance: bigint = await contract.getBalance();
    //             setBalance(fromNano(balance).toString());
    //         }
    //     };
    //     const interval = setInterval(getBalance, 5000);
    //     return () => clearInterval(interval);
    // }, [contract]);

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
                        <b>User-friendly address:</b>{" "}
                        <span
                            onClick={() => {
                                navigator.clipboard.writeText(
                                    userFriendlyAddress,
                                );
                            }}
                        >
                            {userFriendlyAddress.slice(0, 4) +
                                "..." +
                                userFriendlyAddress.slice(-4)}
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
                                Jetton Master Address:
                                <input
                                    type="text"
                                    id="masterAddress"
                                    value={masterAddress}
                                    onChange={(e) =>
                                        setMasterAddress(e.target.value)
                                    }
                                />
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
