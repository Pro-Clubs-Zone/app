import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

// Screens
import CreateLeague from '../league/createLeague';
import LeagueExplorer from './leagueExplorer';
import SignUp from '../auth/signUp';
import Leagues from './leagues';
import LeagueStack from '../league/leagueStack';
import {LeagueProvider} from '../../context/leagueContext';

type LeagueProps = {
  leagueId: string;
  isAdmin?: boolean;
};

interface ClubProps extends LeagueProps {
  clubId: string;
  manager?: boolean;
}

export type LeaguesStackType = {
  Leagues: undefined;
  League: LeagueProps;
  'Create League': undefined;
  'League Explorer': undefined;
  'Sign Up': undefined;
};

const Stack = createStackNavigator<LeaguesStackType>();

export default function LeaguesStack() {
  return (
    <LeagueProvider>
      <Stack.Navigator initialRouteName="Leagues">
        <Stack.Screen name="Leagues" component={Leagues} />
        <Stack.Screen
          name="League"
          component={LeagueStack}
          options={{headerShown: false}}
        />
        <Stack.Screen name="Create League" component={CreateLeague} />
        <Stack.Screen name="League Explorer" component={LeagueExplorer} />
        <Stack.Screen name="Sign Up" component={SignUp} />
      </Stack.Navigator>
    </LeagueProvider>
  );
}
