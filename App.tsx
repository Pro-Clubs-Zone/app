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
import Home from './src/screens/user/home';
import Leagues from './src/screens/user/leagues';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {AppProvider, AuthProvider, RequestProvider} from './src/utils/context';

const App = () => {
  const Tab = createBottomTabNavigator();
  return (
    <>
      <AuthProvider>
        <AppProvider>
          <RequestProvider>
            <NavigationContainer>
              <Tab.Navigator>
                <Tab.Screen name="Home" component={Home} />
                <Tab.Screen name="Leagues" component={Leagues} />
              </Tab.Navigator>
            </NavigationContainer>
          </RequestProvider>
        </AppProvider>
      </AuthProvider>
    </>
  );
};

// const styles = StyleSheet.create({
//   scrollView: {
//     backgroundColor: Colors.lighter,
//   },
//   engine: {
//     position: 'absolute',
//     right: 0,
//   },
//   body: {
//     backgroundColor: Colors.white,
//   },
//   sectionContainer: {
//     marginTop: 32,
//     paddingHorizontal: 24,
//   },
//   sectionTitle: {
//     fontSize: 24,
//     fontWeight: '600',
//     color: Colors.black,
//   },
//   sectionDescription: {
//     marginTop: 8,
//     fontSize: 18,
//     fontWeight: '400',
//     color: Colors.dark,
//   },
//   highlight: {
//     fontWeight: '700',
//   },
//   footer: {
//     color: Colors.dark,
//     fontSize: 12,
//     fontWeight: '600',
//     padding: 4,
//     paddingRight: 12,
//     textAlign: 'right',
//   },
// });

export default App;
