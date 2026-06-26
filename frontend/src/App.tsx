import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import LoginPage from "./pages/Login";
import EventsPage from "./pages/Events";
import BetSlipPage from "./pages/BetSlip";
import MyBetsPage from "./pages/MyBets";
import WalletPage from "./pages/Wallet";

type Page = "events" | "betslip" | "mybets" | "wallet";

export interface ApiEvent {
  id: string;
  title: string;
  home_team: string;
  away_team: string;
  start_time: string;
  status: "upcoming" | "live" | "completed";
  odds: { home: number; draw: number; away: number };
  league: string;
}

export interface Bet {
  id: string;
  event_title: string;
  home_team: string;
  away_team: string;
  market_description: string;
  stake: number;
  odds: number;
  potential_payout: number;
  status: "pending" | "won" | "lost" | "void";
  selection: string;
  event_result: string;
  created_at: string;
}

const API_BASE = import.meta.env.VITE_API_URL || "";

function App(): React.ReactElement {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState<Page>("events");
  const [token, setToken] = useState<string | null>(localStorage.getItem("ethiobet_token"));
  const [userId, setUserId] = useState<string | null>(localStorage.getItem("ethiobet_user_id"));
  const [balance, setBalance] = useState(0);
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ApiEvent | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(true);

  const locale = (i18n.language || "en") as "en" | "am";

  const showToast = (message: string, type: "success" | "error" = "success"): void => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const authHeaders = (): HeadersInit =>
    token ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` } : { "Content-Type": "application/json" };

  const fetchEvents = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch(`${API_BASE}/api/events?lang=${locale}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch {
      console.error("Failed to fetch events");
    }
    setLoading(false);
  }, [locale]);

  const fetchBalance = useCallback(async (): Promise<void> => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_BASE}/api/user/${userId}/balance`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
      }
    } catch {
      console.error("Failed to fetch balance");
    }
  }, [userId, token]);

  const fetchBets = useCallback(async (): Promise<void> => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_BASE}/api/user/${userId}/bets?lang=${locale}`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setBets(data.bets || []);
      }
    } catch {
      console.error("Failed to fetch bets");
    }
  }, [userId, token, locale]);

  useEffect(() => {
    fetchEvents();
    if (token && userId) {
      fetchBalance();
      fetchBets();
    } else {
      setLoading(false);
    }
  }, [fetchEvents, fetchBalance, fetchBets, token, userId]);

  const handleLogin = (newToken: string, user: { id: string; phone: string; balance: number }): void => {
    setToken(newToken);
    setUserId(user.id);
    setBalance(user.balance);
    localStorage.setItem("ethiobet_token", newToken);
    localStorage.setItem("ethiobet_user_id", user.id);
    showToast(t("common.welcome") + "!");
  };

  const handleLogout = (): void => {
    if (token) {
      fetch(`${API_BASE}/api/auth/logout`, { method: "POST", headers: authHeaders() }).catch(() => {});
    }
    setToken(null);
    setUserId(null);
    setBalance(0);
    setBets([]);
    localStorage.removeItem("ethiobet_token");
    localStorage.removeItem("ethiobet_user_id");
  };

  if (!token) {
    return <LoginPage onLogin={handleLogin} apiBase={API_BASE} />;
  }

  const toggleLang = (): void => {
    const newLang = i18n.language === "am" ? "en" : "am";
    i18n.changeLanguage(newLang);
    document.documentElement.setAttribute("lang", newLang);
  };

  const handleSelectEvent = (event: ApiEvent): void => {
    setSelectedEvent(event);
    setPage("betslip");
  };

  const handlePlaceBet = async (
    stake: number,
    odds: number,
    selection: "home" | "draw" | "away",
    marketDesc: { en: string; am: string }
  ): Promise<void> => {
    if (!selectedEvent || !userId) return;

    try {
      const res = await fetch(`${API_BASE}/api/bets/place`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          user_id: userId,
          event_id: selectedEvent.id,
          market_description: marketDesc,
          stake,
          odds,
          selection,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setBalance(data.remaining_balance);
        showToast(t("betting.betPlaced"));
        fetchBets();
        setPage("mybets");
      } else {
        showToast(data.error || "Failed to place bet", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  const handleDeposit = (amount: number): void => {
    setBalance((prev) => prev + amount);
    showToast(t("wallet.success"));
    fetchBalance();
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>{t("app.name")}</h1>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span className="balance-badge">
            {balance.toFixed(0)} {t("common.etb")}
          </span>
          <button className="lang-btn" onClick={toggleLang}>
            {i18n.language === "am" ? "EN" : "አማ"}
          </button>
          <button
            className="lang-btn"
            onClick={handleLogout}
            title="Logout"
            style={{ fontSize: "0.7rem", padding: "4px 8px" }}
          >
            {t("auth.logout")}
          </button>
        </div>
      </header>

      {/* Toast */}
      {toast && <div className={`toast ${toast.type === "error" ? "error" : ""}`}>{toast.message}</div>}

      {/* Pages */}
      {loading ? (
        <div className="empty-state">
          <p>{t("wallet.processing")}</p>
        </div>
      ) : (
        <>
          {page === "events" && <EventsPage events={events} locale={locale} onSelect={handleSelectEvent} onRefresh={fetchEvents} />}
          {page === "betslip" && selectedEvent && (
            <BetSlipPage event={selectedEvent} locale={locale} balance={balance} onPlaceBet={handlePlaceBet} />
          )}
          {page === "mybets" && <MyBetsPage bets={bets} locale={locale} onRefresh={fetchBets} />}
          {page === "wallet" && <WalletPage balance={balance} onDeposit={handleDeposit} />}
        </>
      )}

      {/* Bottom Navigation */}
      <nav className="nav">
        <button className={`nav-item ${page === "events" ? "active" : ""}`} onClick={() => setPage("events")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          {t("nav.events")}
        </button>
        <button className={`nav-item ${page === "mybets" ? "active" : ""}`} onClick={() => { setPage("mybets"); fetchBets(); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <path d="M16 13H8M16 17H8M10 9H8" />
          </svg>
          {t("nav.myBets")}
        </button>
        <button className={`nav-item ${page === "wallet" ? "active" : ""}`} onClick={() => setPage("wallet")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <path d="M1 10h22" />
          </svg>
          {t("nav.wallet")}
        </button>
      </nav>
    </div>
  );
}

export default App;
