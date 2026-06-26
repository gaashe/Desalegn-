import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface WalletPageProps {
  balance: number;
  onDeposit: (amount: number) => void;
}

function WalletPage({ balance, onDeposit }: WalletPageProps): React.ReactElement {
  const { t } = useTranslation();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const quickAmounts = [50, 100, 200, 500, 1000];

  const handleDeposit = (): void => {
    const num = parseFloat(amount);
    if (num < 10) return;
    setLoading(true);
    // Simulate Telebirr deposit flow
    setTimeout(() => {
      onDeposit(num);
      setAmount("");
      setLoading(false);
    }, 1500);
  };

  return (
    <div>
      {/* Balance Card */}
      <div className="wallet-balance">
        <div className="label">{t("wallet.balance")}</div>
        <div className="amount">{balance.toFixed(2)}</div>
        <div className="currency">{t("common.etb")}</div>
      </div>

      {/* Deposit Section */}
      <div className="card">
        <h3 style={{ marginBottom: "16px", fontSize: "1rem" }}>{t("wallet.depositVia")}</h3>

        {/* Telebirr Logo */}
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <div
            style={{
              display: "inline-block",
              padding: "8px 20px",
              background: "#0066b3",
              borderRadius: "8px",
              color: "white",
              fontWeight: "700",
              fontSize: "1.1rem",
            }}
          >
            telebirr
          </div>
        </div>

        {/* Quick Amounts */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
          {quickAmounts.map((q) => (
            <button
              key={q}
              className="market-option"
              style={{ flex: "1", minWidth: "60px", textAlign: "center" }}
              onClick={() => setAmount(q.toString())}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Amount Input */}
        <div className="form-group">
          <label>{t("wallet.enterAmount")}</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            min="10"
            max="50000"
          />
          <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "4px" }}>
            {t("wallet.minDeposit")}
          </div>
        </div>

        {/* Deposit Button */}
        <button
          className="btn btn-accent"
          onClick={handleDeposit}
          disabled={loading || parseFloat(amount) < 10}
        >
          {loading ? t("wallet.processing") : `${t("wallet.deposit")} ${amount ? amount + " " + t("common.etb") : ""}`}
        </button>
      </div>
    </div>
  );
}

export default WalletPage;
