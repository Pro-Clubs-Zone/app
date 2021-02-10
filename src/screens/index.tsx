import React, {useContext, useLayoutEffect} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {AuthContext} from '../context/authContext';
import {createStackNavigator} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {APP_COLORS, FONT_SIZES} from '../utils/designSystem';
import {IconButton} from '../components/buttons';
import auth from '@react-native-firebase/auth';
import crashlytics from '@react-native-firebase/crashlytics';
import {LogBox, Platform} from 'react-native';
import functions from '@react-native-firebase/functions';
import firestore from '@react-native-firebase/firestore';

// Screens
import Home from './user/home';
import Leagues from './user/leagues';
import SignUp from './auth/signUp';
import SignIn from './auth/signIn';
import Requests from './user/requests';
import CreateLeague from './league/createLeague';
import LeagueExplorer from './user/leagueExplorer';
import LeagueStack from './league/league';
import {ILeagueProps, IMatchNavData} from '../utils/interface';
import Match from './match/match';
import {RequestContext} from '../context/requestContext';
import {AppContext} from '../context/appContext';
import LeaguePreview from './league/leaguePreview';
import CompleteSignIn from './auth/completeSignIn';

type SignIn = {data?: {}; redirectedFrom?: string | null};

export type AppNavStack = {
  Home: undefined;
  'Sign Up': undefined;
  'Sign In': undefined;
  'Complete Sign In': undefined;
  Requests: undefined;
  'Create League': undefined;
  'League Explorer': undefined;
  Leagues: undefined;
  League: ILeagueProps & {leagueId: string};
  Match: {matchData: IMatchNavData; upcoming: boolean};
  'Create Club': ILeagueProps;
  'Join Club': undefined;
  'League Preview': {
    infoMode: boolean;
  };
};

const db = firestore();
const firAuth = auth();
const firFunc = functions();

export default function AppIndex() {
  const Stack = createStackNavigator<AppNavStack>();
  const user = useContext(AuthContext);
  const requests = useContext(RequestContext);
  const context = useContext(AppContext);

  const debug = true;

  const uid = user.uid;
  const displayName = user.displayName;

  useLayoutEffect(() => {
    crashlytics().log('App mounted.');
    if (__DEV__ && debug) {
      const localAddress = Platform.OS === 'ios' ? 'localhost' : '192.168.0.13';
      console.log('dev');

      firFunc.useFunctionsEmulator(`http://${localAddress}:5001`);
      firAuth.useEmulator(`http://${localAddress}:9099`);
      db.settings({
        host: `${localAddress}:8080`,
        ssl: false,
        persistence: false,
        cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
      });
      LogBox.ignoreLogs(['Remote debugger is in a background']);
      LogBox.ignoreLogs(['DevTools failed to load SourceMap:']); // Ignore log notification by message
    }

    console.log('use effect from index', user);

    if (user.uid) {
      crashlytics().setUserId(uid!);
    }
  }, [user]);

  const onSignOut = () => {
    firAuth.signOut().then(() => {
      context.setUserData(undefined);
      context.setUserLeagues(undefined);
      context.setUserMatches([]);
      requests.resetRequests();
    });
  };

  const commonStack = (
    <>
      <Stack.Screen
        name="Requests"
        component={Requests}
        options={{
          headerStyle: {
            elevation: 0,
          },
        }}
      />
      <Stack.Screen name="Create League" component={CreateLeague} />
      <Stack.Screen name="League Explorer" component={LeagueExplorer} />
      <Stack.Screen name="League Preview" component={LeaguePreview} />
      <Stack.Screen
        name="League"
        component={LeagueStack}
        options={{headerShown: false}}
      />
    </>
  );

  if (uid) {
    return (
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerBackTitleVisible: false,
          animationEnabled: false,
        }}>
        {!displayName && <Stack.Screen name="Sign Up" component={SignUp} />}
        {displayName && (
          <>
            <Stack.Screen
              name="Home"
              component={HomeTabs}
              options={{
                animationTypeForReplace: 'pop',
                headerRight: () => (
                  <IconButton name="logout-variant" onPress={onSignOut} />
                ),
              }}
            />

            <Stack.Screen
              name="Match"
              component={Match}
              options={{headerShown: false}}
            />
            {commonStack}
          </>
        )}
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerBackTitleVisible: false,
        animationEnabled: false,
      }}>
      <Stack.Screen
        name="Home"
        component={Leagues}
        options={({navigation}) => ({
          title: 'Leagues',
          headerRight: () => (
            <IconButton
              name="account"
              onPress={() => navigation.navigate('Sign In')}
            />
          ),
          animationTypeForReplace: 'pop',
        })}
      />

      <Stack.Screen
        name="Sign In"
        component={SignIn}
        options={{
          animationTypeForReplace: 'pop',
        }}
      />
      <Stack.Screen name="Complete Sign In" component={CompleteSignIn} />
      {commonStack}
    </Stack.Navigator>
  );
}

const HomeTabs = () => {
  const Tab = createBottomTabNavigator();
  const requestContext = useContext(RequestContext);
  const context = useContext(AppContext);

  const conflictsCount = context.userData?.adminConflictCounts;
  const requestCount = requestContext.requestCount;

  return (
    <Tab.Navigator
      tabBarOptions={{
        style: {
          backgroundColor: APP_COLORS.Secondary,
        },
        activeTintColor: APP_COLORS.Accent,
        inactiveTintColor: APP_COLORS.Gray,
        allowFontScaling: true,
        labelPosition: 'beside-icon',
      }}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={
          requestCount > 0
            ? {
                tabBarIcon: ({color, size}) => (
                  <Icon name="home" color={color} size={size} />
                ),
                tabBarBadge: requestCount,
                tabBarBadgeStyle: {
                  backgroundColor: APP_COLORS.Red,
                  fontSize: FONT_SIZES.XXSS,
                  fontWeight: 'bold',
                },
              }
            : {
                tabBarIcon: ({color, size}) => (
                  <Icon name="home" color={color} size={size} />
                ),
              }
        }
      />
      <Tab.Screen
        name="Leagues"
        component={Leagues}
        options={
          conflictsCount && conflictsCount > 0
            ? {
                tabBarIcon: ({color, size}) => (
                  <Icon name="trophy-variant" color={color} size={size} />
                ),
                tabBarBadge: conflictsCount,
                tabBarBadgeStyle: {
                  backgroundColor: APP_COLORS.Red,
                  fontSize: FONT_SIZES.XXSS,
                  fontWeight: 'bold',
                },
              }
            : {
                tabBarIcon: ({color, size}) => (
                  <Icon name="trophy-variant" color={color} size={size} />
                ),
              }
        }
      />
    </Tab.Navigator>
  );
};
