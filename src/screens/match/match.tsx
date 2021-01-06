import React from 'react';
import {IMatchNavData} from '../../utils/interface';
import {RouteProp} from '@react-navigation/native';
import {LeagueStackType} from '../league/league';
import {createStackNavigator} from '@react-navigation/stack';

// Screens
import UpcomingMatch from './upcomingMatch';

export type MatchStackType = {
  'Upcoming Match': IMatchNavData;
  'Conflict Match': IMatchNavData;
  'Finished Match': IMatchNavData;
};

const Stack = createStackNavigator<MatchStackType>();

type ScreenRouteProp = RouteProp<LeagueStackType, 'Match'>;

type Props = {
  route: ScreenRouteProp;
};

export default function Match({route}: Props) {
  const data: IMatchNavData = route.params.matchInfo;

  return (
    <Stack.Navigator
      screenOptions={{
        headerBackTitleVisible: false,
      }}>
      <Stack.Screen
        name="Upcoming Match"
        component={UpcomingMatch}
        initialParams={data}
      />
    </Stack.Navigator>
  );
}
