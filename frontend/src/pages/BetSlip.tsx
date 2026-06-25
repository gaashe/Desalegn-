import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface Event {
  id: string;
  title: { en: string; am: string };
  start_time: string;
  status: "upcoming" | "live" | "completed";
  odds: { home: number; draw: number; away: number };
  teams: { home: { en: string; am: string }; away: { en: string; am: string } };
}

interface BetSlipPageProps {
  event: Event;
  locale: "en" | "am";
  balance: number;
  onPlaceBet: (stake: number, odds: number, marketDesc: { en: string; am: string }) => void;
}

type Selection = "home" | "draw" | "away";

function BetSlipPage({ event, locale, balance, onPlaceBet }: BetSlipPageProps): React.ReactElement {
  const { t } = useTranslation();
  const [selection, setSelection] = useState<Selection | null>(null);
  const [stake, setStake] = useState("");

  const stakeNum = parseFloat(stake) || 0;
  const selectedOdds = selection ? event.odds[selection] : 0;
  const potentialWin = parseFloat((stakeNum * selectedOdds).toFixed(2));

  const getMarketDescription = (): { en: string; am: string } => {
    if (!selection) return { en: "", am: "" };
    const teamMap: Record<Selection, { en: string; am: string }> = {
      home: event.teams.home,
      draw: { en: "Draw", am: "አቻ" },
      away: event.teams.away,
    };
    const team = teamMap[selection];
    return {
      en: `Match Winner - ${team.en}`,
      am: `የጨዋታ አሸናፊ - ${team.am}`,
    };
  };

  const canPlace = selection && stakeNum > 0 && stakeNum <= balance;

  return (
    <div>
      <div className="section-header">{t("betting.placeBet")}</div>
      <div className="bet-slip">
        <h3>{event.title[locale] || event.title.en}</h3>

        {/* Selection */}
        <div className="form-group">
          <label>{t("betting.matchWinner")}</label>
          <div className="odds-grid">
            <button
              className={`odds-btn ${selection === "home" ? "selected" : ""}`}
              onClick={() => setSelection("home")}
            >
              <div className="odds-label">{event.teams.home[locale] || event.teams.home.en}</div>
              <div className="odds-value">{event.odds.home.toFixed(2)}</div>
            </button>
            <button
              className={`odds-btn ${selection === "draw" ? "selected" : ""}`}
              onClick={() => setSelection("draw")}
            >
              <div className="odds-label">Draw / አቻ</div>
              <div className="odds-value">{event.odds.draw.toFixed(2)}</div>
            </button>
            <button
              className={`odds-btn ${selection === "away" ? "selected" : ""}`}
              onClick={() => setSelection("away")}
            >
              <div className="odds-label">{event.teams.away[locale] || event.teams.away.en}</div>
              <div className="odds-value">{event.odds.away.toFixed(2)}</div>
            </button>
          </div>
        </div>

        {/* Stake */}
        <div className="form-group">
          <label>{t("betting.stake")}</label>
          <input
            type="number"
            placeholder="0"
            value={stake}
            onChange={(e) => setStake(e.target.value)}
            min="1"
            max={balance}
          />
          <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "4px" }}>
            {t("wallet.balance")}: {balance.toFixed(2)} {t("common.etb")}
          </div>
        </div>

        {/* Potential Win */}
        {stakeNum > 0 && selection && (
          <div className="potential-win">
            <div style={{ fontSize: "0.8rem", color: "#666" }}>{t("betting.potentialWin")}</div>
            <div className="amount">
              {potentialWin.toFixed(2)} {t("common.etb")}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#666" }}>
              {t("betting.odds")}: {selectedOdds.toFixed(2)}
            </div>
          </div>
        )}

        {/* Insufficient balance warning */}
        {stakeNum > balance && (
          <div style={{ color: "var(--danger)", fontSize: "0.85rem", marginBottom: "12px", textAlign: "center" }}>
            {t("betting.insufficientBalance")}
          </div>
        )}

        {/* Place Bet Button */}
        <button
          className="btn btn-primary"
          disabled={!canPlace}
          onClick={() => {
            if (canPlace) {
              onPlaceBet(stakeNum, selectedOdds, getMarketDescription());
            }
          }}
        >
          {t("betting.confirmBet")} {stakeNum > 0 && `- ${stakeNum} ${t("common.etb")}`}
        </button>
      </div>
    </div>
  );
}

export default BetSlipPage;
