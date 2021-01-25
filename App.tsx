/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useEffect, useRef} from 'react';
import {StatusBar, Linking} from 'react-native';
import analytics from '@react-native-firebase/analytics';
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
  const routeNameRef = useRef();
  const navigationRef = useRef();

  const getFirUrl = async () => {
    const firUrl = await dynamicLinks()
      .getInitialLink()
      .then((link) => link);

    return firUrl;
  };

  const linking = {
    prefixes: ['https://l.proclubs.zone', 'proclubs://'],
    async getInitialURL() {
      const firUrl = await getFirUrl();
      const getLink = await Linking.getInitialURL();

      if (firUrl) {
        return firUrl.url;
      }

      if (getLink) {
        return getLink;
      }
    },
    subscribe(listener) {
      const onReceiveURL = ({url}: {url: string}) => {
        listener(url);
      };

      Linking.addEventListener('url', onReceiveURL);
      const unsubscribe = dynamicLinks().onLink(onReceiveURL);

      return () => {
        unsubscribe();
        Linking.removeEventListener('url', onReceiveURL);
      };
    },
    config: {
      initialRouteName: 'Home',
      screens: {
        League: 'lgu/:leagueId',
        'Reset Password': 'eml/',
      },
    },
  };

  useEffect(() => {
    RNBootSplash.hide({fade: true});
  }, []);

  // useEffect(() => {
  //   console.log('use');

  //   Linking.addEventListener('url', (url) => console.log(url));
  //   return Linking.removeAllListeners('url');
  // }, []);

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
                <NavigationContainer
                  theme={NavTheme}
                  linking={linking}
                  ref={navigationRef}
                  onReady={() =>
                    (routeNameRef.current = navigationRef.current.getCurrentRoute().name)
                  }
                  onStateChange={async () => {
                    const previousRouteName = routeNameRef.current;
                    const currentRouteName = navigationRef.current.getCurrentRoute()
                      .name;

                    if (previousRouteName !== currentRouteName) {
                      await analytics().logScreenView({
                        screen_name: currentRouteName,
                        screen_class: currentRouteName,
                      });
                    }
                  }}>
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
