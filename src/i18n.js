// i18n.js
 import i18n from 'i18n-js';

i18n.fallbacks = true;
i18n.translations = {
  en: {
    ChangeLanguage: "Change Language",
   },
  mr: {
    ChangeLanguage: "Хэлийг өөрчлөх",
   }
};

// Detect user's language
i18n.locale = Localization.locale || 'en';

export default i18n;
