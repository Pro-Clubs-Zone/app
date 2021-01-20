import React, {useContext, useEffect, useState} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {AuthContext} from '../context/authContext';
import {createStackNavigator} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {APP_COLORS, FONT_SIZES} from '../utils/designSystem';
import {IconButton} from '../components/buttons';
import auth from '@react-native-firebase/auth';
import RNRestart from 'react-native-restart';

// Screens
import Home from './user/home';
import Leagues from './user/leagues';
import SignUp from './auth/signUp';
import SignIn from './auth/signIn';
import Requests from './user/requests';
import CreateLeague from './league/createLeague';
import LeagueExplorer from './user/leagueExplorer';
import LeagueStack from './league/league';
import FullScreenLoading from '../components/loading';
import {ILeagueProps, IMatchNavData} from '../utils/interface';
import Match from './match/match';
import {RequestContext} from '../context/requestContext';
import {AppContext} from '../context/appContext';
import LeaguePreview from './league/leaguePreview';

type SignIn = {data?: {}; redirectedFrom?: string | null};

export type AppNavStack = {
  Home: undefined;
  'Sign Up': SignIn;
  'Sign In': SignIn;
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

export default function AppIndex() {
  const Stack = createStackNavigator<AppNavStack>();
  const user = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | undefined | null>(null);

  const firAuth = auth();

  useEffect(() => {
    if (user.authInit) {
      setUid(user.uid);
      setLoading(false);
    }
  }, [user]);

  const onSignOut = () => {
    firAuth.signOut().then(() => {
      // requestContext?.resetRequests();
      // context?.setUserData(null);
      // context?.setUserLeagues(null);
      RNRestart.Restart();
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

  // if (loading) {
  //   return <FullScreenLoading visible={true} />;
  // }

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
      </Stack.Navigator>
    );
  } else {
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
        {commonStack}
      </Stack.Navigator>
    );
  }
}

const HomeTabs = () => {
  const Tab = createBottomTabNavigator();
  const requestContext = useContext(RequestContext);
  const context = useContext(AppContext);

  const conflictsCount = context.userData?.adminConflictCounts;
  const requestCount = requestContext?.requestCount;

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
          conflictsCount > 0
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
