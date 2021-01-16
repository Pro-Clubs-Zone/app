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

const App = () => {
  useEffect(() => {
    RNBootSplash.hide({fade: true});
    console.log('splash off');
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
                <NavigationContainer theme={NavTheme}>
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
