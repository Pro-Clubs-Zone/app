import {setupI18n} from '@lingui/core';
// import ruTranslation from '../locales/ru/messages.js';
import enTranslation from '../locales/en/messages.js';
import esTranslations from '../locales/es/messages.js';
import {en, es} from 'make-plural';

const i18n = setupI18n({
  locale: 'en',
  localeData: {
    en: {
      plurals: en,
    },
    es: {
      plurals: es,
    },
  },
  messages: {
    en: enTranslation.messages,
  },
});

// i18n.loadLocaleData('ru', {
//   plurals: ru,
// });
// i18n.load('es', esTranslations.messages);
// i18n.activate('es');

export default i18n;

// export const changeActiveLanguage = (newActiveLanguage) => {
//   var catalog = 'www';
//   switch (newActiveLanguage) {
//     case 'English':
//       catalog = {en: enMessages};
//       break;
//     case 'Russian':
//       catalog = {ru: ruMessages};
//       break;
//     default:
//       catalog = {en: enMessages};
//       break;
//   }
//   // const catalog =
//   //   newActiveLanguage === 'en' ? { en: enMessages } : { cs: require('./locale/cs/messages.js') };
//   console.log('catalog: ' + catalog);
//   i18n.load(catalog);
//   i18n.activate('en');
//   return i18n;
// };
