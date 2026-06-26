import React from "react";
import { useTranslation } from "react-i18next";
import type { Bet } from "../App";

interface MyBetsPageProps {
  bets: Bet[];
  locale: "en" | "am";
  onRefresh: () => void;
}

function MyBetsPage({ bets, locale, onRefresh }: MyBetsPageProps): React.ReactElement {
  const { t } = useTranslation();

  if (bets.length === 0) {
    return (
      <div className="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
        </svg>
        <p>{t("betting.noBets")}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>{t("nav.myBets")}</span>
        <button onClick={onRefresh} style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: "0.8rem" }}>
          {t("events.refresh")}
        </button>
      </div>
      {bets.map((bet) => (
        <div key={bet.id} className="bet-item">
          <div className="bet-info">
            <div className="bet-market">{bet.market_description}</div>
            <div className="bet-details">
              {bet.home_team && bet.away_team ? `${bet.home_team} vs ${bet.away_team}` : bet.event_title}
              {" "}&bull;{" "}
              {t("betting.stake")}: {bet.stake} {t("common.etb")} &bull;{" "}
              {t("betting.odds")}: {bet.odds.toFixed(2)}
            </div>
            <div className="bet-details" style={{ color: "var(--primary)" }}>
              {t("betting.potentialWin")}: {bet.potential_payout.toFixed(2)} {t("common.etb")}
            </div>
            {bet.status === "won" && (
              <div className="bet-details" style={{ color: "#22c55e", fontWeight: 600 }}>
                Won {bet.potential_payout.toFixed(2)} {t("common.etb")}
              </div>
            )}
          </div>
          <span className={`bet-status ${bet.status}`}>{t(`status.${bet.status}`)}</span>
        </div>
      ))}
    </div>
  );
}

export default MyBetsPage;
