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
  const getFirUrl = async () => {
    const firUrl = await dynamicLinks()
      .getInitialLink()
      .then((link) => link);

    return firUrl;
  };

  const linking = {
    prefixes: ['https://proclubs.zone', 'proclubs://'],
    async getInitialURL() {
      const link = await getFirUrl();

      return link.url;
    },
    subscribe(listener) {
      const firUrl = async () => {
        const link = await getFirUrl();
        if (link) {
          listener(link.url);
          return link;
        }
      };

      const unsubscribe = dynamicLinks().onLink(firUrl);

      return () => unsubscribe();
    },
    config: {
      initialRouteName: 'Home',
      screens: {
        League: 'l/:leagueId',
      },
    },
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
