import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ApiEvent } from "../App";

interface BetSlipPageProps {
  event: ApiEvent;
  locale: "en" | "am";
  balance: number;
  onPlaceBet: (stake: number, odds: number, selection: "home" | "draw" | "away", marketDesc: { en: string; am: string }) => void;
}

type Selection = "home" | "draw" | "away";

function BetSlipPage({ event, locale, balance, onPlaceBet }: BetSlipPageProps): React.ReactElement {
  const { t } = useTranslation();
  const [selection, setSelection] = useState<Selection | null>(null);
  const [stake, setStake] = useState("");

  const stakeNum = parseFloat(stake) || 0;
  const selectedOdds = selection && event.odds ? event.odds[selection] : 0;
  const potentialWin = parseFloat((stakeNum * selectedOdds).toFixed(2));

  const getMarketDescription = (): { en: string; am: string } => {
    if (!selection) return { en: "", am: "" };
    const teamMap: Record<Selection, string> = {
      home: event.home_team,
      draw: locale === "am" ? "አቻ" : "Draw",
      away: event.away_team,
    };
    return {
      en: `Match Winner - ${selection === "draw" ? "Draw" : (selection === "home" ? event.home_team : event.away_team)}`,
      am: `የጨዋታ አሸናፊ - ${teamMap[selection]}`,
    };
  };

  const canPlace = selection && stakeNum > 0 && stakeNum <= balance;

  return (
    <div>
      <div className="section-header">{t("betting.placeBet")}</div>
      <div className="bet-slip">
        <h3>{event.home_team} vs {event.away_team}</h3>
        {event.league && <div style={{ fontSize: "0.8rem", color: "#999", marginBottom: "12px" }}>{event.league}</div>}

        <div className="form-group">
          <label>{t("betting.matchWinner")}</label>
          <div className="odds-grid">
            <button
              className={`odds-btn ${selection === "home" ? "selected" : ""}`}
              onClick={() => setSelection("home")}
            >
              <div className="odds-label">{event.home_team}</div>
              <div className="odds-value">{event.odds?.home?.toFixed(2) || "-"}</div>
            </button>
            <button
              className={`odds-btn ${selection === "draw" ? "selected" : ""}`}
              onClick={() => setSelection("draw")}
            >
              <div className="odds-label">Draw / አቻ</div>
              <div className="odds-value">{event.odds?.draw?.toFixed(2) || "-"}</div>
            </button>
            <button
              className={`odds-btn ${selection === "away" ? "selected" : ""}`}
              onClick={() => setSelection("away")}
            >
              <div className="odds-label">{event.away_team}</div>
              <div className="odds-value">{event.odds?.away?.toFixed(2) || "-"}</div>
            </button>
          </div>
        </div>

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

        {stakeNum > balance && (
          <div style={{ color: "var(--danger)", fontSize: "0.85rem", marginBottom: "12px", textAlign: "center" }}>
            {t("betting.insufficientBalance")}
          </div>
        )}

        <button
          className="btn btn-primary"
          disabled={!canPlace}
          onClick={() => {
            if (canPlace && selection) {
              onPlaceBet(stakeNum, selectedOdds, selection, getMarketDescription());
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
