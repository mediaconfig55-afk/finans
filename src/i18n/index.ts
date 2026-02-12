import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import tr from './tr';

// Define the translations
const translations = {
    tr,
    en: tr, // Fallback to TR for now as EN is not yet implemented
};

const i18n = new I18n(translations);

// Set the locale once at the beginning of your app.
i18n.locale = Localization.getLocales()[0].languageCode ?? 'tr';

// When a value is missing from a language it'll fallback to another language with the key present.
i18n.enableFallback = true;
i18n.defaultLocale = 'tr';

export default i18n;
