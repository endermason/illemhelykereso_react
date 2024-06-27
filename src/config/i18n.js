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
            escapeValue: false, // not needed for react as it escapes by default
        },
        nonExplicitSupportedLngs: true, //Allows "en-US" and "en-UK" to be implcitly supported
        load: "languageOnly",   //Loads only the language part from the locale
        fallbackLng: "en",  //Use English if a language is not available
        detection: {
            order: ["querystring", "cookie", "localStorage", "sessionStorage", "navigator", "htmlTag"], //Order of lookup
            lookupQuerystring: "lang",
            lookupCookie: "i18next",
            lookupLocalStorage: "i18nextLng",
            lookupSessionStorage: "i18nextLng",
            caches: ["localStorage"],
            excludeCacheFor: ["cimode"],
        },
    });

export default i18n;