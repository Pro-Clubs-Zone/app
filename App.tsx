/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import {AppProvider} from './src/context/appContext';
import {AuthProvider} from './src/context/authContext';
import {RequestProvider} from './src/context/requestContext';
import {LeagueProvider} from './src/context/leagueContext';
import AppIndex from './src/screens';
import {APP_COLORS, NavTheme} from './src/utils/designSystem';
import {I18nProvider} from '@lingui/react';
import i18n from './src/utils/i18n';
import {ActionSheetProvider} from '@expo/react-native-action-sheet';
import RNBootSplash from 'react-native-bootsplash';
import dynamicLinks from '@react-native-firebase/dynamic-links';

const App = () => {
  //  const [incomingLinkId, setIncomingLinkId] = useState(null);

  const linking = {
    prefixes: ['https://proclubs.zone', 'proclubs://'],
    async getInitialURL() {
      //  const url = await Linking.getInitialURL();

      // if (url != null) {
      //   return url;
      // }
      const firUrl = await dynamicLinks()
        .getInitialLink()
        .then((link) => link);
      console.log(firUrl);

      if (firUrl) {
        return firUrl.url;
      }
    },
    // subscribe(listener) {
    //   console.log(listener);

    //   // First, you may want to do the default deep link handling
    //   const onReceiveURL = ({url}: {url: string}) => listener(url);

    //   // Listen to incoming links from deep linking
    //   Linking.addEventListener('url', onReceiveURL);

    //   const getInitialURL = async () => {
    //     const url = await dynamicLinks()
    //       .getInitialLink()
    //       .then((link) => link);

    //     if (url != null) {
    //       console.log(url);
    //       listener(url.url);
    //       return url;
    //     }
    //   };

    //   const unsubscribe = dynamicLinks().onLink(getInitialURL);

    //   return () => {
    //     Linking.removeEventListener('url', onReceiveURL);
    //     unsubscribe();
    //   };
    // },
    config: {
      initialRouteName: 'Home',
      screens: {
        League: 'l/:leagueId',
      },
      // League: {
      //   path: 'l/:leagueId',
      //   parse: {
      //     leagueId: (leagueId) => leagueId,
      //   },
      // },
    },
    // routes: [
    //   {
    //     name: 'Leagues',
    //     state: {
    //       routes: [
    //         {
    //           name: 'League',
    //           params: {
    //             leagueId: incomingLinkId,
    //           },
    //         },
    //       ],
    //     },
    //   },
    // ],
  };

  useEffect(() => {
    RNBootSplash.hide({fade: true});
  }, []);

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        translucent={true}
        backgroundColor={APP_COLORS.Accent}
      />
      <I18nProvider i18n={i18n}>
        <AuthProvider>
          <AppProvider>
            <RequestProvider>
              <LeagueProvider>
                <NavigationContainer theme={NavTheme} linking={linking}>
                  <ActionSheetProvider>
                    <AppIndex />
                  </ActionSheetProvider>
                </NavigationContainer>
              </LeagueProvider>
            </RequestProvider>
          </AppProvider>
        </AuthProvider>
      </I18nProvider>
    </>
  );
};

export default App;
