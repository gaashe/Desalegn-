import React from "react";
import { useTranslation } from "react-i18next";
import type { ApiEvent } from "../App";

interface EventsPageProps {
  events: ApiEvent[];
  locale: "en" | "am";
  onSelect: (event: ApiEvent) => void;
  onRefresh: () => void;
}

function EventsPage({ events, locale, onSelect, onRefresh }: EventsPageProps): React.ReactElement {
  const { t } = useTranslation();

  const formatTime = (iso: string): string => {
    const d = new Date(iso);
    return d.toLocaleTimeString(locale === "am" ? "am-ET" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div>
      <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>{t("nav.events")}</span>
        <button onClick={onRefresh} style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: "0.8rem" }}>
          {t("events.refresh")}
        </button>
      </div>
      <p style={{ padding: "0 16px 8px", fontSize: "0.85rem", color: "#666" }}>
        {t("betting.selectEvent")}
      </p>
      {events.length === 0 ? (
        <div className="empty-state">
          <p>{t("events.noEvents")}</p>
        </div>
      ) : (
        events.map((event) => (
          <div key={event.id} className="event-card" onClick={() => onSelect(event)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div className="event-title">{event.home_team} vs {event.away_team}</div>
                {event.league && <div style={{ fontSize: "0.75rem", color: "#999" }}>{event.league}</div>}
              </div>
              <span className={`event-status ${event.status}`}>
                {t(`status.${event.status}`)}
              </span>
            </div>
            <div className="event-time">{formatTime(event.start_time)}</div>
            {event.odds && (
              <div className="odds-grid">
                <div className="odds-btn">
                  <div className="odds-label">{event.home_team}</div>
                  <div className="odds-value">{event.odds.home?.toFixed(2) || "-"}</div>
                </div>
                <div className="odds-btn">
                  <div className="odds-label">Draw</div>
                  <div className="odds-value">{event.odds.draw?.toFixed(2) || "-"}</div>
                </div>
                <div className="odds-btn">
                  <div className="odds-label">{event.away_team}</div>
                  <div className="odds-value">{event.odds.away?.toFixed(2) || "-"}</div>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default EventsPage;
