import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import tr from './locales/tr.json';
import en from './locales/en.json';

// Tarayıcıdan dil tercihini al, yoksa Türkçe varsayılan
const savedLanguage = localStorage.getItem('language') || 'tr';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            tr: { translation: tr },
            en: { translation: en }
        },
        lng: savedLanguage, // Varsayılan dil
        fallbackLng: 'tr', // Çeviri bulunamazsa Türkçe kullan
        interpolation: {
            escapeValue: false // React zaten XSS koruması yapıyor
        }
    });

export default i18n;