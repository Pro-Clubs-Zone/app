import React, {useState, useLayoutEffect, useContext} from 'react';
import firestore from '@react-native-firebase/firestore';
import {AppContext} from '../../context/appContext';
import {AuthContext} from '../../context/authContext';
import {ILeague, ILeagueProps, IMatchNavData} from '../../utils/interface';
import {
  createStackNavigator,
  StackNavigationProp,
} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {AppNavStack} from '../index';
import {LeagueContext} from '../../context/leagueContext';
import FullScreenLoading from '../../components/loading';

// Screens
import LeaguePreview from './leaguePreview';
import LeaguePreSeason from '../leagueAdmin/leaguePreSeason';
import LeagueScheduled from './leagueScheduled';
import ReportCenter from '../leagueAdmin/reportCenter';
import Match from '../match/match';
import LeagueStandings from './standings';
import Fixtures from './fixtures';
import JoinClub from './joinClub';
import Clubs from '../leagueAdmin/clubs';
import CreateClub from './createClub';
import Club from '../club/club';
import ClubSettings from '../club/clubSettings';
import SignUp from '../auth/signUp';
import SignIn from '../auth/signIn';
import LeagueExplorer from '../user/leagueExplorer';
import {IconButton} from '../../components/buttons';
import crashlytics from '@react-native-firebase/crashlytics';

interface ClubProps {
  clubId: string;
  manager?: boolean;
}

type SignIn = {data?: {}; redirectedFrom?: string | null};

export type LeagueStackType = {
  'League Scheduled': ILeagueProps;
  Clubs: ILeagueProps;
  'League Preview': {
    infoMode: boolean;
  };
  'League Pre-Season': ILeagueProps;
  'Create Club': ILeagueProps;
  'Join Club': undefined;
  Standings: ILeagueProps;
  Fixtures: ILeagueProps;
  Match: {matchData: IMatchNavData; upcoming: boolean};
  'My Club': ClubProps;
  'Club Settings': ClubProps;
  'Report Center': ILeagueProps;
  'Sign Up': SignIn;
  'Sign In': SignIn;
  'League Explorer': undefined;
  Home: {
    screen: string;
  };
};

const Stack = createStackNavigator<LeagueStackType>();

type ScreenRouteProp = RouteProp<AppNavStack, 'League'>;
type ScreenNavigationProp = StackNavigationProp<AppNavStack, 'League'>;

type Props = {
  route: ScreenRouteProp;
  navigation: ScreenNavigationProp;
};

const db = firestore();

export default function LeagueStack({navigation, route}: Props) {
  const [league, setLeague] = useState<ILeague>();
  const [loading, setLoading] = useState<boolean>(true);
  const user = useContext(AuthContext);
  const context = useContext(AppContext);
  const userData = context?.userData;
  const uid = user?.uid;
  const leagueId = route.params.leagueId;
  const newLeague = route.params.newLeague;
  const leagueContext = useContext(LeagueContext);

  const userInLeague =
    userData?.leagues && userData.leagues[leagueId]?.accepted;
  const leagueScheduled = league?.scheduled;
  const userAdmin = userData ? league?.adminId === uid : false;

  useLayoutEffect(() => {
    console.log('effect on league', route);

    //TODO: Check if league exists in context
    const leagueRef = db.collection('leagues').doc(leagueId);
    let leagueInfo: ILeague;
    leagueRef
      .get()
      .then((doc) => {
        leagueInfo = doc.data() as ILeague;
        // leagueContext.setLeague(leagueInfo);
        leagueContext.setLeagueId(leagueId);
        leagueContext.setLeague(leagueInfo);
        setLeague(leagueInfo);
        crashlytics().setAttribute('leagueId', leagueId);
        console.log(leagueInfo, 'League info');
      })
      .then(() => {
        setLoading(false);
      });
  }, [leagueId]);

  const commonStack = (
    <>
      <Stack.Screen name="League Explorer" component={LeagueExplorer} />
      <Stack.Screen name="Create Club" component={CreateClub} />
      <Stack.Screen name="Clubs" component={Clubs} />
      <Stack.Screen name="My Club" component={Club} />
      <Stack.Screen name="Club Settings" component={ClubSettings} />
    </>
  );

  if (loading) {
    return <FullScreenLoading visible={true} />;
  }

  if (leagueScheduled) {
    if (userInLeague) {
      return (
        <Stack.Navigator
          screenOptions={{
            headerBackTitleVisible: false,
            animationEnabled: false,
          }}>
          <Stack.Screen
            name="League Scheduled"
            component={LeagueScheduled}
            options={{
              animationTypeForReplace: 'pop',
              headerRight: () => (
                <IconButton
                  name="information"
                  onPress={() => {
                    navigation.navigate('League Preview', {
                      infoMode: true,
                    });
                  }}
                />
              ),
            }}
          />
          <Stack.Screen name="Standings" component={LeagueStandings} />
          <Stack.Screen name="Fixtures" component={Fixtures} />
          <Stack.Screen
            name="Match"
            component={Match}
            options={{headerShown: false}}
          />
          <Stack.Screen name="Report Center" component={ReportCenter} />
          {commonStack}
        </Stack.Navigator>
      );
    } else {
      return (
        <Stack.Navigator
          screenOptions={{
            headerBackTitleVisible: false,
            animationEnabled: false,
          }}>
          <Stack.Screen name="League Preview" component={LeaguePreview} />
          <Stack.Screen name="Sign Up" component={SignUp} />
          <Stack.Screen name="Sign In" component={SignIn} />
          <Stack.Screen name="Join Club" component={JoinClub} />
        </Stack.Navigator>
      );
    }
  } else {
    if (userAdmin) {
      return (
        <Stack.Navigator
          screenOptions={{
            headerBackTitleVisible: false,
            animationEnabled: false,
          }}>
          <Stack.Screen
            name="League Pre-Season"
            component={LeaguePreSeason}
            initialParams={{newLeague: newLeague}}
            options={{
              headerRight: () => (
                <IconButton
                  name="information"
                  onPress={() => {
                    navigation.navigate('League Preview', {
                      infoMode: true,
                    });
                  }}
                />
              ),
            }}
          />
          {commonStack}
        </Stack.Navigator>
      );
    } else {
      return (
        <Stack.Navigator
          screenOptions={{
            headerBackTitleVisible: false,
            animationEnabled: false,
          }}>
          <Stack.Screen name="League Preview" component={LeaguePreview} />
          <Stack.Screen name="Create Club" component={CreateClub} />
          <Stack.Screen name="Join Club" component={JoinClub} />
          <Stack.Screen name="Sign Up" component={SignUp} />
          <Stack.Screen name="Sign In" component={SignIn} />
          <Stack.Screen name="Club Settings" component={ClubSettings} />
        </Stack.Navigator>
      );
    }
  }
}
