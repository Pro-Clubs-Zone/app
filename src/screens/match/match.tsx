import React, {useContext, useEffect, useState} from 'react';
import {IMatch, IMatchNavData} from '../../utils/interface';
import {RouteProp} from '@react-navigation/native';
import {LeagueStackType} from '../league/league';
import {createStackNavigator} from '@react-navigation/stack';
import firestore from '@react-native-firebase/firestore';

// Screens
import UpcomingMatch from './upcomingMatch';
import FinishedMatch from './finishedMatch';
import {MatchContext} from '../../context/matchContext';
import SubmitMatch from './submitMatch';
import {NonModalLoading} from '../../components/loading';
import SubmitStats from './submitStats';

type MatchProps = {
  matchData: IMatchNavData;
};

export type MatchStackType = {
  'Upcoming Match': MatchProps;
  'Conflict Match': MatchProps;
  'Finished Match': MatchProps;
  'Submit Match': undefined;
  'Submit Stats': undefined;
};

const Stack = createStackNavigator<MatchStackType>();

type ScreenRouteProp = RouteProp<LeagueStackType, 'Match'>;

type Props = {
  route: ScreenRouteProp;
};

const db = firestore();

export default function Match({route}: Props) {
  const [loading, setLoading] = useState(true);

  const data: IMatchNavData = route.params.matchData;

  const matchContext = useContext(MatchContext);

  useEffect(() => {
    const matchRef = db
      .collection('leagues')
      .doc(data.leagueId)
      .collection('matches')
      .doc(data.matchId);

    matchRef.get().then((res) => {
      const matchData = res.data() as IMatch;
      const matchNavData = {...data, ...matchData};
      matchContext.setMatch(matchNavData);
      setLoading(false);
    });
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
        options={{
          title: `Upcoming Match #${data.id}`,
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
        name="Submit Stats"
        component={SubmitStats}
        options={{
          headerStyle: {
            elevation: 0,
          },
        }}
      />
      <Stack.Screen
        name="Finished Match"
        component={FinishedMatch}
        options={{
          title: `Finished Match #${data.id}`,
          headerStyle: {
            elevation: 0,
          },
        }}
      />
    </Stack.Navigator>
  );
}
