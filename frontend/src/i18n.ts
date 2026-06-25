/**
 * i18next Configuration for Next.js/React Frontend
 * Supports English and Amharic with Noto Sans Ethiopic font.
 *
 * SETUP GUIDE:
 * 1. Install dependencies:
 *    npm install i18next react-i18next i18next-browser-languagedetector
 *
 * 2. Add Noto Sans Ethiopic font to your _app.tsx or layout:
 *    - Via Google Fonts: @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic:wght@400;500;600;700&display=swap')
 *    - Or self-host from /public/fonts/NotoSansEthiopic-*.woff2
 *
 * 3. Import this file in your app entry point:
 *    import './i18n';
 *
 * 4. Use in components:
 *    import { useTranslation } from 'react-i18next';
 *    const { t, i18n } = useTranslation();
 *    t('betting.placeBet') // "Place Bet" or "ውርርድ አስቀምጥ"
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "./locales/en/common.json";
import amCommon from "./locales/am/common.json";

const resources = {
  en: { common: enCommon },
  am: { common: amCommon },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS: "common",
    fallbackLng: "en",
    supportedLngs: ["en", "am"],

    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "ethiobet_lang",
    },

    interpolation: {
      escapeValue: false, // React already escapes
    },

    react: {
      useSuspense: true,
    },
  });

export default i18n;
