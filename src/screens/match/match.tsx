import React, {useContext, useEffect, useState} from 'react';
import {IMatchNavData} from '../../utils/interface';
import {RouteProp} from '@react-navigation/native';
import {LeagueStackType} from '../league/league';
import {createStackNavigator} from '@react-navigation/stack';

// Screens
import UpcomingMatch from './upcomingMatch';
import FinishedMatch from './finishedMatch';
import {MatchContext} from '../../context/matchContext';
import SubmitMatch from './submitMatch';
import {NonModalLoading} from '../../components/loading';

type MatchProps = {
  matchData: IMatchNavData;
};

export type MatchStackType = {
  'Upcoming Match': MatchProps;
  'Conflict Match': MatchProps;
  'Finished Match': MatchProps;
  'Submit Match': undefined;
};

const Stack = createStackNavigator<MatchStackType>();

type ScreenRouteProp = RouteProp<LeagueStackType, 'Match'>;

type Props = {
  route: ScreenRouteProp;
};

export default function Match({route}: Props) {
  const [loading, setLoading] = useState(true);

  const data: IMatchNavData = route.params.matchData;

  const matchContext = useContext(MatchContext);

  useEffect(() => {
    matchContext.setMatch(data);
    setLoading(false);
  }, [data]);

  if (loading) {
    return <NonModalLoading visible={true} />;
  }

  return (
    <Stack.Navigator
      initialRouteName={
        route.params.upcoming ? 'Upcoming Match' : 'Finished Match'
      }
      mode="modal"
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
        name="Submit Match"
        component={SubmitMatch}
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
