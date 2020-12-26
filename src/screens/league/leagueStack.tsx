import React, {useState, useLayoutEffect, useContext} from 'react';
import {Text, View} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {AppContext} from '../../context/appContext';
import {AuthContext} from '../../context/authContext';
import {ILeague, IMatchNavData} from '../../utils/interface';
import {createStackNavigator} from '@react-navigation/stack';
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
import LeagueStandings from './standings';
import Fixtures from './fixtures';
import Clubs from '../leagueAdmin/clubs';
import CreateClub from './createClub';
import JoinClub from './joinClub';

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
  'Join Club': LeagueProps;
  Home: {
    screen: string;
  };
};

const Stack = createStackNavigator<LeagueStackType>();

//type ScreenNavigationProp = StackNavigationProp<LeaguesStackType, 'League'>;

type ScreenRouteProp = RouteProp<LeaguesStackType, 'League'>;

type Props = {
  //navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

const db = firestore();

export default function LeagueStack({route}: Props) {
  const [league, setLeague] = useState<ILeague>();
  const [loading, setLoading] = useState<boolean>(true);
  const user = useContext(AuthContext);
  const context = useContext(AppContext);
  const userData = context?.userData;
  const uid = user?.uid;
  const leagueId = route.params.leagueId;
  const leagueContext = useContext(LeagueContext);

  useLayoutEffect(() => {
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
        console.log(leagueInfo, 'League info');
      })
      .then(() => {
        setLoading(false);
      });
  }, [leagueId]);

  if (loading) {
    return (
      <View>
        <Text>LOADING</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {userData?.leagues && userData?.leagues[leagueId] ? (
        league?.scheduled ? (
          <>
            <Stack.Screen name="League Scheduled" component={LeagueScheduled} />
            <Stack.Screen name="Standings" component={LeagueStandings} />
            <Stack.Screen name="Fixtures" component={Fixtures} />
            <Stack.Screen name="Match" component={Match} />
            <Stack.Screen name="Report Center" component={ReportCenter} />
          </>
        ) : league?.adminId === uid ? (
          <>
            <Stack.Screen
              name="League Pre-Season"
              component={LeaguePreSeason}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="League Preview" component={LeaguePreview} />
            <Stack.Screen name="Join Club" component={JoinClub} />
          </>
        )
      ) : (
        <>
          <Stack.Screen name="League Preview" component={LeaguePreview} />
          <Stack.Screen name="Join Club" component={JoinClub} />
        </>
      )}

      <>
        <Stack.Screen name="Create Club" component={CreateClub} />
        <Stack.Screen name="Clubs" component={Clubs} />
        <Stack.Screen name="My Club" component={Club} />
        <Stack.Screen name="Club Settings" component={ClubSettings} />
      </>
    </Stack.Navigator>
  );
}
