import React, {useState, useEffect, useContext} from 'react';
import {Text, View, Button} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {AppContext, AuthContext} from '../../utils/context';
import {ILeague, IMatchNavData} from '../../utils/interface';
import {
  createStackNavigator,
  StackNavigationProp,
} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {LeaguesStackType} from '../user/leaguesStack';
import {LeagueContext} from '../../context/leagueContext';
// Screens
import LeaguePreview from './leaguePreview';
import LeaguePreSeason from '../leagueAdmin/leaguePreSeason';
import LeagueScheduled from './leagueScheduled';
import Club from '../club/club';
import ClubSettings from '../club/clubSettings';
import ReportCenter from '../leagueAdmin/reportCenter';
import Match from '../match/match';
import LeagueStandings from '../league/standings';
import Fixtures from '../league/fixtures';
import Clubs from '../leagueAdmin/clubs';

type LeagueProps = {
  leagueId: string;
  isAdmin?: boolean;
};

interface ClubProps extends LeagueProps {
  clubId: string;
  manager?: boolean;
}

export type LeagueStackType = {
  'League Scheduled': LeagueProps;
  Clubs: LeagueProps;
  'League Preview': LeagueProps;
  'League Pre-Season': LeagueProps;
  'Create Club': LeagueProps;
  Standings: LeagueProps;
  Fixtures: LeagueProps;
  Match: {matchInfo: IMatchNavData};
  'My Club': ClubProps;
  'Club Settings': ClubProps;
  'Report Center': LeagueProps;
};

const Stack = createStackNavigator<LeagueStackType>();

type ScreenNavigationProp = StackNavigationProp<LeaguesStackType, 'League'>;

type ScreenRouteProp = RouteProp<LeaguesStackType, 'League'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

const db = firestore();

export default function League({navigation, route}: Props) {
  const [league, setLeague] = useState<ILeague>();
  const [loading, setLoading] = useState<boolean>(true);
  const user = useContext(AuthContext);
  const context = useContext(AppContext);
  const userData = context?.userData;
  const uid = user?.uid;
  const leagueId = route.params.leagueId;
  const leagueContext = useContext(LeagueContext);

  useEffect(() => {
    console.log('effect on league');
    //TODO: Check if league exists in context
    const leagueRef = db.collection('leagues').doc(leagueId);
    let leagueInfo: ILeague;
    leagueRef
      .get()
      .then((doc) => {
        leagueInfo = doc.data() as ILeague;
        // leagueContext.setLeague(leagueInfo);
        leagueContext.setLeagueId(leagueId);
        setLeague(leagueInfo);
      })
      .then(() => {
        setLoading(false);
      });
  }, [leagueId, leagueContext]);

  return (
    <Stack.Navigator headerMode="none">
      <Stack.Screen name="League Pre-Season" component={LeaguePreSeason} />
      <Stack.Screen name="Clubs" component={Clubs} />
      <Stack.Screen name="League Scheduled" component={LeagueScheduled} />
      <Stack.Screen name="Standings" component={LeagueStandings} />
      <Stack.Screen name="Fixtures" component={Fixtures} />
      <Stack.Screen name="League Preview" component={LeaguePreview} />
      <Stack.Screen name="Match" component={Match} />
      <Stack.Screen name="My Club" component={Club} />
      <Stack.Screen name="Club Settings" component={ClubSettings} />
      <Stack.Screen name="Report Center" component={ReportCenter} />
    </Stack.Navigator>
  );

  // if (userData?.leagues && userData?.leagues[leagueId]) {
  //   if (league?.scheduled) {
  //     return <LeagueScheduled navigation={navigation} route={route} />;
  //   } else {
  //     if (league?.adminId === uid) {
  //       return <LeaguePreSeason navigation={navigation} route={route} />;
  //     } else {
  //       return (
  //         <LeaguePreview
  //           //  data={data}
  //           route={route}
  //           navigation={navigation}
  //         />
  //       );
  //     }
  //   }
  // } else {
  //   return (
  //     <LeaguePreview
  //       //  data={data}
  //       route={route}
  //       navigation={navigation}
  //     />
  //   );
  // }
}
