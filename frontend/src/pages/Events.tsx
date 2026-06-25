import React from "react";
import { useTranslation } from "react-i18next";

interface Event {
  id: string;
  title: { en: string; am: string };
  start_time: string;
  status: "upcoming" | "live" | "completed";
  odds: { home: number; draw: number; away: number };
  teams: { home: { en: string; am: string }; away: { en: string; am: string } };
}

interface EventsPageProps {
  events: Event[];
  locale: "en" | "am";
  onSelect: (event: Event) => void;
}

function EventsPage({ events, locale, onSelect }: EventsPageProps): React.ReactElement {
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
      <div className="section-header">{t("nav.events")}</div>
      <p style={{ padding: "0 16px 8px", fontSize: "0.85rem", color: "#666" }}>
        {t("betting.selectEvent")}
      </p>
      {events.map((event) => (
        <div key={event.id} className="event-card" onClick={() => onSelect(event)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="event-title">{event.title[locale] || event.title.en}</div>
            <span className={`event-status ${event.status}`}>
              {t(`status.${event.status}`)}
            </span>
          </div>
          <div className="event-time">{formatTime(event.start_time)}</div>
          <div className="odds-grid">
            <div className="odds-btn">
              <div className="odds-label">{event.teams.home[locale] || event.teams.home.en}</div>
              <div className="odds-value">{event.odds.home.toFixed(2)}</div>
            </div>
            <div className="odds-btn">
              <div className="odds-label">Draw</div>
              <div className="odds-value">{event.odds.draw.toFixed(2)}</div>
            </div>
            <div className="odds-btn">
              <div className="odds-label">{event.teams.away[locale] || event.teams.away.en}</div>
              <div className="odds-value">{event.odds.away.toFixed(2)}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default EventsPage;
