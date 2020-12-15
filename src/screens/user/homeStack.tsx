import React from 'react';
import {MatchData} from '../../utils/interface';
import {createStackNavigator} from '@react-navigation/stack';
import {
  ClubRequestInt,
  MyRequests,
  LeagueRequestInt,
} from '../../utils/interface';
//Screens
import SignUp from '../auth/signUp';
import SignIn from '../auth/signIn';
import Home from './home';
import Requests from './requests';
import Match from '../league/match';

export type HomeStackType = {
  Home: undefined;
  Leagues: undefined;
  'Sign Up': undefined;
  'Sign In': undefined;
  Requests: [
    {
      Club: [ClubRequestInt[]];
      League: [LeagueRequestInt[]];
      Sent: [MyRequests[]];
    },
  ];
  Match: {matchInfo: MatchData[]};
};

export default function HomeNavigator() {
  const Stack = createStackNavigator<HomeStackType>();
  return (
    <Stack.Navigator initialRouteName="Leagues">
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Sign Up" component={SignUp} />
      <Stack.Screen name="Sign In" component={SignIn} />
      <Stack.Screen name="Requests" component={Requests} />
      <Stack.Screen name="Match" component={Match} />
    </Stack.Navigator>
  );
}
