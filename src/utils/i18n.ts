import {setupI18n} from '@lingui/core';
import ru from '../locales/ru/messages.js';
import en from '../locales/en/messages.js';

// import this constant as get translations from it outside of React
const i18n = setupI18n({
  locales: ['en', 'ru'],
  messages: {
    en: en.messages,
    ru: ru.messages,
  },
});
i18n.load('ru', ru.messages);
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
