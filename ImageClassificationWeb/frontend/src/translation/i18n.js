import i18n from 'i18next'
import {initReactI18next} from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector';
import {sk} from "./sk";
import {en} from "./en";

i18n.use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {en: en, sk: sk},
        fallbackLng: localStorage.getItem("lang") || "en",
        interpolation: {
            escapeValue: false
        }
    }).then();

export default i18n;