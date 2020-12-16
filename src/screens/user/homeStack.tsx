import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {IClubRequest, IMyRequests, ILeagueRequest} from '../../utils/interface';
//Screens
import SignUp from '../auth/signUp';
import SignIn from '../auth/signIn';
import Home from './home';
import Requests from './requests';

export type HomeStackType = {
  Home: undefined;
  'Sign Up': undefined;
  'Sign In': undefined;
  Requests: [
    {
      Club: [IClubRequest[]];
      League: [ILeagueRequest[]];
      Sent: [IMyRequests[]];
    },
  ];
};

export default function HomeNavigator() {
  const Stack = createStackNavigator<HomeStackType>();
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Sign Up" component={SignUp} />
      <Stack.Screen name="Sign In" component={SignIn} />
      <Stack.Screen name="Requests" component={Requests} />
    </Stack.Navigator>
  );
}
