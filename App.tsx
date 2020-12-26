/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {AppProvider} from './src/context/appContext';
import {AuthProvider} from './src/context/authContext';
import {RequestProvider} from './src/context/requestContext';
import {LeagueProvider} from './src/context/leagueContext';
import AppIndex from './src/screens';
import {NavTheme} from './src/utils/designSystem';

const App = () => {
  return (
    <>
      <AuthProvider>
        <AppProvider>
          <RequestProvider>
            <LeagueProvider>
              <NavigationContainer theme={NavTheme}>
                <AppIndex />
              </NavigationContainer>
            </LeagueProvider>
          </RequestProvider>
        </AppProvider>
      </AuthProvider>
    </>
  );
};

export default App;
