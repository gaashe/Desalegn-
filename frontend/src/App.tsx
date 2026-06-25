import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import EventsPage from "./pages/Events";
import BetSlipPage from "./pages/BetSlip";
import MyBetsPage from "./pages/MyBets";
import WalletPage from "./pages/Wallet";

type Page = "events" | "betslip" | "mybets" | "wallet";

interface Event {
  id: string;
  title: { en: string; am: string };
  start_time: string;
  status: "upcoming" | "live" | "completed";
  odds: { home: number; draw: number; away: number };
  teams: { home: { en: string; am: string }; away: { en: string; am: string } };
}

export interface Bet {
  id: string;
  event_title: { en: string; am: string };
  market_description: { en: string; am: string };
  stake: number;
  odds: number;
  potential_payout: number;
  status: "pending" | "won" | "lost" | "void";
  created_at: string;
}

// Mock data for demo
const MOCK_EVENTS: Event[] = [
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    title: { en: "Arsenal vs Chelsea", am: "አርሰናል vs ቼልሲ" },
    start_time: new Date(Date.now() + 7200000).toISOString(),
    status: "upcoming",
    odds: { home: 2.1, draw: 3.4, away: 3.6 },
    teams: { home: { en: "Arsenal", am: "አርሰናል" }, away: { en: "Chelsea", am: "ቼልሲ" } },
  },
  {
    id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    title: { en: "Man City vs Liverpool", am: "ማን ሲቲ vs ሊቨርፑል" },
    start_time: new Date(Date.now() + 3600000).toISOString(),
    status: "live",
    odds: { home: 1.85, draw: 3.6, away: 4.2 },
    teams: { home: { en: "Man City", am: "ማን ሲቲ" }, away: { en: "Liverpool", am: "ሊቨርፑል" } },
  },
  {
    id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
    title: { en: "Barcelona vs Real Madrid", am: "ባርሴሎና vs ሪያል ማድሪድ" },
    start_time: new Date(Date.now() + 86400000).toISOString(),
    status: "upcoming",
    odds: { home: 2.5, draw: 3.2, away: 2.8 },
    teams: { home: { en: "Barcelona", am: "ባርሴሎና" }, away: { en: "Real Madrid", am: "ሪያል ማድሪድ" } },
  },
  {
    id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
    title: { en: "Ethiopia vs Kenya", am: "ኢትዮጵያ vs ኬንያ" },
    start_time: new Date(Date.now() + 172800000).toISOString(),
    status: "upcoming",
    odds: { home: 1.95, draw: 3.3, away: 4.0 },
    teams: { home: { en: "Ethiopia", am: "ኢትዮጵያ" }, away: { en: "Kenya", am: "ኬንያ" } },
  },
];

function App(): React.ReactElement {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState<Page>("events");
  const [balance, setBalance] = useState(500.0);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [bets, setBets] = useState<Bet[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success"): void => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleLang = (): void => {
    const newLang = i18n.language === "am" ? "en" : "am";
    i18n.changeLanguage(newLang);
    document.documentElement.setAttribute("lang", newLang);
  };

  const locale = (i18n.language || "en") as "en" | "am";

  const handleSelectEvent = (event: Event): void => {
    setSelectedEvent(event);
    setPage("betslip");
  };

  const handlePlaceBet = (stake: number, odds: number, marketDesc: { en: string; am: string }): void => {
    if (stake > balance) {
      showToast(t("betting.insufficientBalance"), "error");
      return;
    }
    setBalance((prev) => prev - stake);
    const newBet: Bet = {
      id: crypto.randomUUID(),
      event_title: selectedEvent!.title,
      market_description: marketDesc,
      stake,
      odds,
      potential_payout: parseFloat((stake * odds).toFixed(2)),
      status: "pending",
      created_at: new Date().toISOString(),
    };
    setBets((prev) => [newBet, ...prev]);
    showToast(t("betting.betPlaced"));
    setPage("mybets");
  };

  const handleDeposit = (amount: number): void => {
    setBalance((prev) => prev + amount);
    showToast(t("wallet.success"));
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
        </div>
      </header>

      {/* Toast */}
      {toast && <div className={`toast ${toast.type === "error" ? "error" : ""}`}>{toast.message}</div>}

      {/* Pages */}
      {page === "events" && <EventsPage events={MOCK_EVENTS} locale={locale} onSelect={handleSelectEvent} />}
      {page === "betslip" && selectedEvent && (
        <BetSlipPage event={selectedEvent} locale={locale} balance={balance} onPlaceBet={handlePlaceBet} />
      )}
      {page === "mybets" && <MyBetsPage bets={bets} locale={locale} />}
      {page === "wallet" && <WalletPage balance={balance} onDeposit={handleDeposit} />}

      {/* Bottom Navigation */}
      <nav className="nav">
        <button className={`nav-item ${page === "events" ? "active" : ""}`} onClick={() => setPage("events")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          {t("nav.events")}
        </button>
        <button className={`nav-item ${page === "mybets" ? "active" : ""}`} onClick={() => setPage("mybets")}>
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
