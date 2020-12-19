import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

// Screens
import CreateLeague from '../league/createLeague';
import LeagueExplorer from './leagueExplorer';
import SignUp from '../auth/signUp';
import CreateClub from '../league/createClub';
import JoinClub from '../league/joinClub';
import Leagues from './leagues';
import League from '../league/league';
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
  'Create Club': LeagueProps;
  'Join Club': LeagueProps;
};

const Stack = createStackNavigator<LeaguesStackType>();

export default function LeagueNavigator() {
  return (
    <LeagueProvider>
      <Stack.Navigator initialRouteName="Leagues">
        <Stack.Screen name="Leagues" component={Leagues} />
        <Stack.Screen name="League" component={League} />
        <Stack.Screen name="Create League" component={CreateLeague} />
        <Stack.Screen name="League Explorer" component={LeagueExplorer} />
        <Stack.Screen name="Sign Up" component={SignUp} />
        <Stack.Screen name="Create Club" component={CreateClub} />
        <Stack.Screen name="Join Club" component={JoinClub} />
      </Stack.Navigator>
    </LeagueProvider>
  );
}
