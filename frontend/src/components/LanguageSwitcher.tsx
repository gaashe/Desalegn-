/**
 * Language Switcher Component
 * Toggles between English and Amharic (አማርኛ).
 */
import React from "react";
import { useTranslation } from "react-i18next";

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = (): void => {
    const newLang = i18n.language === "am" ? "en" : "am";
    i18n.changeLanguage(newLang);
    document.documentElement.setAttribute("lang", newLang);
    document.body.setAttribute("data-lang", newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="lang-switcher"
      aria-label="Switch language"
    >
      {i18n.language === "am" ? "English" : "አማርኛ"}
    </button>
  );
};

export default LanguageSwitcher;
