import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const en = {
  app: { name: "EthioBet", tagline: "Ethiopia's Premier Sports Betting" },
  nav: { home: "Home", events: "Events", myBets: "My Bets", wallet: "Wallet" },
  betting: {
    placeBet: "Place Bet",
    stake: "Stake Amount (ETB)",
    odds: "Odds",
    potentialWin: "Potential Win",
    confirmBet: "Confirm Bet",
    insufficientBalance: "Insufficient balance",
    betPlaced: "Bet placed successfully!",
    matchWinner: "Match Winner",
    overUnder: "Over/Under",
    selectEvent: "Select an event to bet on",
    noBets: "No bets yet",
  },
  wallet: {
    balance: "Balance",
    deposit: "Deposit",
    depositVia: "Deposit via Telebirr",
    enterAmount: "Enter amount (ETB)",
    minDeposit: "Minimum deposit: 10 ETB",
    processing: "Processing...",
    success: "Deposit successful!",
    recentDeposits: "Recent Deposits",
  },
  status: {
    pending: "Pending",
    won: "Won",
    lost: "Lost",
    void: "Void",
    live: "LIVE",
    upcoming: "Upcoming",
    completed: "Completed",
    success: "Success",
    failed: "Failed",
  },
  common: {
    etb: "ETB",
    login: "Login",
    welcome: "Welcome",
  },
};

const am = {
  app: { name: "ኢትዮቤት", tagline: "የኢትዮጵያ ቁንጮ ስፖርት ውርርድ" },
  nav: { home: "መነሻ", events: "ክስተቶች", myBets: "ውርርዶቼ", wallet: "ቦርሳ" },
  betting: {
    placeBet: "ውርርድ አስቀምጥ",
    stake: "የውርርድ መጠን (ብር)",
    odds: "ኦድስ",
    potentialWin: "ሊያሸንፉ የሚችሉ",
    confirmBet: "ውርርድ አረጋግጥ",
    insufficientBalance: "በቂ ቀሪ ሂሳብ የለም",
    betPlaced: "ውርርድ በተሳካ ሁኔታ ተቀምጧል!",
    matchWinner: "የጨዋታ አሸናፊ",
    overUnder: "ከላይ/ከታች",
    selectEvent: "ለመወራረድ ክስተት ይምረጡ",
    noBets: "ገና ውርርድ የለም",
  },
  wallet: {
    balance: "ቀሪ ሂሳብ",
    deposit: "ገንዘብ ማስገባት",
    depositVia: "በቴሌብር ገንዘብ ያስገቡ",
    enterAmount: "መጠን ያስገቡ (ብር)",
    minDeposit: "ዝቅተኛ ተቀማጭ: 10 ብር",
    processing: "በሂደት ላይ...",
    success: "ተቀማጭ ተሳክቷል!",
    recentDeposits: "የቅርብ ጊዜ ተቀማጭ",
  },
  status: {
    pending: "በመጠባበቅ ላይ",
    won: "አሸንፈዋል",
    lost: "ተሸንፈዋል",
    void: "ተሰርዟል",
    live: "በቀጥታ",
    upcoming: "መጪ",
    completed: "ተጠናቋል",
    success: "ተሳክቷል",
    failed: "አልተሳካም",
  },
  common: {
    etb: "ብር",
    login: "ግባ",
    welcome: "እንኳን ደህና መጡ",
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      am: { translation: am },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "am"],
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "ethiobet_lang",
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
