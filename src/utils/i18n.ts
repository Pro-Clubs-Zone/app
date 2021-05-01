import {setupI18n} from '@lingui/core';
import enTranslation from '../locales/en/messages.js';
import esTranslations from '../locales/es/messages.js';
import {en, es} from 'make-plural';

const i18n = setupI18n({
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
    es: esTranslations.messages,
  },
});

// i18n.loadLocaleData('ru', {
//   plurals: ru,
// });

export default i18n;

// i18n.load('es', esTranslations.messages);
// i18n.activate('es');

// i18n.loadLocaleData({
//   en: {plurals: en},
//   cs: {plurals: es},
// });

// export const changeActiveLanguage = (newActiveLanguage: string) => {
//   console.log(newActiveLanguage);

//   switch (newActiveLanguage) {
//     case 'es':
//       i18n.load('es', esTranslations.messages);
//       i18n.activate('es');
//       break;
//     case 'en':
//       i18n.activate('en');
//       break;
//     default:
//       i18n.activate('en');
//       break;
//   }
//   // const catalog =
//   //   newActiveLanguage === 'en' ? { en: enMessages } : { cs: require('./locale/cs/messages.js') };
//   // console.log('catalog: ' + catalog);
//   // i18n.load(catalog);
//   i18n.activate('en');
//   return i18n;
// };
