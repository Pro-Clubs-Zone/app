import React from 'react';
import {IMatchNavData} from '../../utils/interface';
import {createStackNavigator} from '@react-navigation/stack';

// Screens
import CreateLeague from '../league/createLeague';
import LeagueExplorer from './leagueExplorer';
import LeaguePreview from '../league/leaguePreview';
import SignUp from '../auth/signUp';
import CreateClub from '../league/createClub';
import League from '../league/league';
import LeagueScheduled from '../league/league_scheduled';
import Clubs from '../leagueAdmin/clubs';
import JoinClub from '../league/joinClub';
import LeagueStandings from '../league/standings';
import Fixtures from '../league/fixtures';
import Leagues from './leagues';
import Match from '../league/match';
import LeaguePreSeason from '../leagueAdmin/leaguePreSeason';

const Stack = createStackNavigator<LeaguesStackType>();

type Props = {
  leagueId: string;
  isAdmin?: boolean;
};

export type LeaguesStackType = {
  'League Scheduled': Props;
  Leagues: undefined;
  'Create League': undefined;
  League: Props;
  Clubs: Props;
  'League Explorer': undefined;
  'League Preview': Props;
  'League Pre-Season': Props;
  'Sign Up': undefined;
  'Create Club': Props;
  'Join Club': Props;
  Standings: Props;
  Fixtures: Props;
  Match: {matchInfo: IMatchNavData};
};

export default function LeagueNavigator() {
  return (
    <Stack.Navigator initialRouteName="Leagues">
      <Stack.Screen name="League Scheduled" component={LeagueScheduled} />
      <Stack.Screen name="Leagues" component={Leagues} />
      <Stack.Screen name="Create League" component={CreateLeague} />
      <Stack.Screen name="League" component={League} />
      <Stack.Screen name="Clubs" component={Clubs} />
      <Stack.Screen name="League Explorer" component={LeagueExplorer} />
      <Stack.Screen name="League Preview" component={LeaguePreview} />
      <Stack.Screen name="League Pre-Season" component={LeaguePreSeason} />
      <Stack.Screen name="Sign Up" component={SignUp} />
      <Stack.Screen name="Create Club" component={CreateClub} />
      <Stack.Screen name="Join Club" component={JoinClub} />
      <Stack.Screen name="Standings" component={LeagueStandings} />
      <Stack.Screen name="Fixtures" component={Fixtures} />
      <Stack.Screen name="Match" component={Match} />
    </Stack.Navigator>
  );
}
