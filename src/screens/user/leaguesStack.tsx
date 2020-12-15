import React from 'react';
import {MatchData} from '../../utils/interface';
import {createStackNavigator} from '@react-navigation/stack';

// Screens
import CreateLeague from '../league/createLeague';
import LeagueExplorer from './leagueExplorer';
import LeaguePreview from '../league/leaguePreview';
import SignUp from '../auth/signUp';
import CreateClub from '../league/createClub';
import League from '../league/league';
import Clubs from '../leagueAdmin/clubs';
import JoinClub from '../league/joinClub';
import LeagueStandings from '../league/standings';
import Fixtures from '../league/fixtures';
import Leagues from './leagues';

const Stack = createStackNavigator<LeaguesStackType>();

export type LeaguesStackType = {
  Leagues: undefined;
  'Create league': undefined;
  League: {leagueId: string};
  Clubs: undefined;
  'League Explorer': undefined;
  'League Preview': undefined;
  'Sign Up': {matchInfo: MatchData[]};
  'Create Club': undefined;
  'Join Club': undefined;
  Standings: undefined;
  Fixtures: undefined;
};

export default function LeagueNavigator() {
  return (
    <Stack.Navigator initialRouteName="Leagues">
      <Stack.Screen name="Leagues" component={Leagues} />
      <Stack.Screen name="Create league" component={CreateLeague} />
      <Stack.Screen name="League" component={League} />
      <Stack.Screen name="Clubs" component={Clubs} />
      <Stack.Screen name="League Explorer" component={LeagueExplorer} />
      <Stack.Screen name="League Preview" component={LeaguePreview} />
      <Stack.Screen name="Sign Up" component={SignUp} />
      <Stack.Screen name="Create Club" component={CreateClub} />
      <Stack.Screen name="Join Club" component={JoinClub} />
      <Stack.Screen name="Standings" component={LeagueStandings} />
      <Stack.Screen name="Fixtures" component={Fixtures} />
    </Stack.Navigator>
  );
}
