import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface LoginPageProps {
  onLogin: (token: string, user: { id: string; phone: string; balance: number }) => void;
  apiBase: string;
}

function LoginPage({ onLogin, apiBase }: LoginPageProps): React.ReactElement {
  const { t, i18n } = useTranslation();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleLang = (): void => {
    const newLang = i18n.language === "am" ? "en" : "am";
    i18n.changeLanguage(newLang);
  };

  const requestOTP = async (): Promise<void> => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiBase}/api/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep("otp");
      } else {
        setError(data.error || "Failed to send OTP");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  const verifyOTP = async (): Promise<void> => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiBase}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone, code }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        onLogin(data.token, data.user);
      } else {
        setError(data.error || "Invalid OTP code");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>{t("app.name")}</h1>
        <button className="lang-btn" onClick={toggleLang}>
          {i18n.language === "am" ? "EN" : "አማ"}
        </button>
      </header>

      <div className="login-page">
        <div style={{ textAlign: "center", padding: "40px 20px 20px" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "8px" }}>{t("app.tagline")}</h2>
          <p style={{ color: "#666", fontSize: "0.9rem" }}>{t("auth.loginDesc")}</p>
        </div>

        <div className="card">
          {step === "phone" ? (
            <>
              <div className="form-group">
                <label>{t("auth.phone")}</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09xxxxxxxx"
                  maxLength={15}
                />
              </div>
              {error && <div className="error-text">{error}</div>}
              <button
                className="btn btn-primary"
                onClick={requestOTP}
                disabled={loading || phone.length < 9}
              >
                {loading ? t("wallet.processing") : t("auth.sendOTP")}
              </button>
            </>
          ) : (
            <>
              <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: "12px" }}>
                {t("auth.otpSent")} {phone}
              </p>
              <div className="form-group">
                <label>{t("auth.enterOTP")}</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  style={{ textAlign: "center", fontSize: "1.5rem", letterSpacing: "8px" }}
                />
              </div>
              {error && <div className="error-text">{error}</div>}
              <button
                className="btn btn-primary"
                onClick={verifyOTP}
                disabled={loading || code.length !== 6}
              >
                {loading ? t("wallet.processing") : t("auth.verify")}
              </button>
              <button
                className="btn"
                style={{ background: "transparent", color: "var(--primary)", marginTop: "8px" }}
                onClick={() => { setStep("phone"); setCode(""); setError(""); }}
              >
                {t("auth.changePhone")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
