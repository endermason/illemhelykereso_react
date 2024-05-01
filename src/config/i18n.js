import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from "i18next-http-backend";
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    .use(initReactI18next)
    .use(HttpApi)
    .use(LanguageDetector)
    .init({
        supportedLngs: ["en", "de", "hu"],
        interpolation: {
            escapeValue: false,
        },
        nonExplicitSupportedLngs: true, //Allows "en-US" and "en-UK" to be implcitly supported
        load: "languageOnly",
        fallbackLng: "en",
        detection: {
            order: ["querystring", "cookie", "localStorage", "sessionStorage", "navigator", "htmlTag"],
            lookupQuerystring: "lang",
            lookupCookie: "i18next",
            lookupLocalStorage: "i18nextLng",
            lookupSessionStorage: "i18nextLng",
            caches: ["localStorage"],
            excludeCacheFor: ["cimode"],
        },
    });

export default i18n;