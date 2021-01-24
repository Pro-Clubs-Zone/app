import React from 'react';
import {IMatchNavData} from '../../utils/interface';
import {RouteProp} from '@react-navigation/native';
import {LeagueStackType} from '../league/league';
import {createStackNavigator} from '@react-navigation/stack';

// Screens
import UpcomingMatch from './upcomingMatch';
import FinishedMatch from './finishedMatch';

type MatchProps = {
  matchData: IMatchNavData;
};

export type MatchStackType = {
  'Upcoming Match': MatchProps;
  'Conflict Match': MatchProps;
  'Finished Match': MatchProps;
};

const Stack = createStackNavigator<MatchStackType>();

type ScreenRouteProp = RouteProp<LeagueStackType, 'Match'>;

type Props = {
  route: ScreenRouteProp;
};

export default function Match({route}: Props) {
  const data: IMatchNavData = route.params.matchData;

  return (
    <Stack.Navigator
      initialRouteName={
        route.params.upcoming ? 'Upcoming Match' : 'Finished Match'
      }
      screenOptions={{
        headerBackTitleVisible: false,
        animationEnabled: false,
      }}>
      <Stack.Screen
        name="Upcoming Match"
        component={UpcomingMatch}
        initialParams={{
          matchData: data,
        }}
        options={{
          headerStyle: {
            elevation: 0,
          },
        }}
      />
      <Stack.Screen
        name="Finished Match"
        component={FinishedMatch}
        initialParams={{
          matchData: data,
        }}
        options={{
          headerStyle: {
            elevation: 0,
          },
        }}
      />
    </Stack.Navigator>
  );
}
