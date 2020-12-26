import {setupI18n} from '@lingui/core';
import ruTranslation from '../locales/ru/messages.js';
import enTranslation from '../locales/en/messages.js';
import {en, ru} from 'make-plural';

const i18n = setupI18n({
  locale: 'ru',
  localeData: {
    ru: {
      plurals: ru,
    },
  },
  messages: {
    en: ruTranslation.messages,
    ru: enTranslation.messages,
  },
});

i18n.load('ru', ruTranslation.messages);
// i18n.loadLocaleData('ru', {
//   plurals: ru,
// });
i18n.activate('ru');

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
