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
import HomeStack from './src/screens/user/homeStack';
import LeaguesStack from './src/screens/user/leaguesStack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {AppProvider} from './src/context/appContext';
import {AuthProvider} from './src/context/authContext';
import {RequestProvider} from './src/context/requestContext';

const App = () => {
  const Tab = createBottomTabNavigator();
  return (
    <>
      <AuthProvider>
        <AppProvider>
          <RequestProvider>
            <NavigationContainer>
              <Tab.Navigator>
                <Tab.Screen name="Home" component={HomeStack} />
                <Tab.Screen name="Leagues" component={LeaguesStack} />
              </Tab.Navigator>
            </NavigationContainer>
          </RequestProvider>
        </AppProvider>
      </AuthProvider>
    </>
  );
};

export default App;
