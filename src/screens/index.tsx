import React, {useContext, useLayoutEffect} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {AuthContext} from '../context/authContext';
import {createStackNavigator} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {APP_COLORS, FONT_SIZES} from '../utils/designSystem';
import {IconButton} from '../components/buttons';
import auth from '@react-native-firebase/auth';
import crashlytics from '@react-native-firebase/crashlytics';
import {LogBox} from 'react-native';
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
import PasswordRecovery from './auth/passwordRecovery';
import ResetPassword from './auth/resetPassword';
import World from './world/world';
import Help from './world/help';
import HelpArticle from './world/helpArticle';

type SignIn = {data?: {}; redirectedFrom?: string | null};

export type AppNavStack = {
  Home: undefined;
  'Sign Up': undefined;
  'Sign In': undefined;
  'Password Recovery': undefined;
  'Reset Password': {
    oobCode: string;
  };
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
  World: undefined;
  Help: undefined;
  'Help Article': {
    id: string;
  };
  'App Info': undefined;
};

const db = firestore();
const firAuth = auth();
const firFunc = functions();

export default function AppIndex() {
  const Stack = createStackNavigator<AppNavStack>();
  const user = useContext(AuthContext);
  const requests = useContext(RequestContext);
  const context = useContext(AppContext);

  // const debug = true;

  const uid = user.uid;

  useLayoutEffect(() => {
    crashlytics().log('App mounted.');
    if (__DEV__) {
      const localAddress = '192.168.0.178';
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
  }, []);

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
      <Stack.Screen name="Help" component={Help} />
      <Stack.Screen name="Help Article" component={HelpArticle} />
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
        <Stack.Screen
          name="Home"
          component={UserTabs}
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
        component={GuestTabs}
        options={({navigation}) => ({
          title: 'Leagues',
          headerRight: () => (
            <IconButton
              name="account"
              onPress={() => navigation.navigate('Sign Up')}
            />
          ),
          animationTypeForReplace: 'pop',
        })}
      />

      <Stack.Screen
        name="Sign Up"
        component={SignUp}
        options={{
          animationTypeForReplace: 'pop',
        }}
      />
      <Stack.Screen name="Sign In" component={SignIn} />
      <Stack.Screen name="Password Recovery" component={PasswordRecovery} />
      <Stack.Screen name="Reset Password" component={ResetPassword} />
      {commonStack}
    </Stack.Navigator>
  );
}

const UserTabs = () => {
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
      <Tab.Screen
        name="World"
        component={World}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="earth" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const GuestTabs = () => {
  const Tab = createBottomTabNavigator();

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
        name="Leagues"
        component={Leagues}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="trophy-variant" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="World"
        component={World}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="earth" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
