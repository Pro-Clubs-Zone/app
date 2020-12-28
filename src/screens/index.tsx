import React, {useContext, useEffect, useState} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {AuthContext} from '../context/authContext';
import {createStackNavigator} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {APP_COLORS} from '../utils/designSystem';
import {IconButton} from '../components/buttons';
import auth from '@react-native-firebase/auth';

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

type LeagueProps = {
  leagueId: string;
  isAdmin?: boolean;
};

export type AppNavStack = {
  Home: undefined;
  'Sign Up': undefined;
  'Sign In': undefined;
  Requests: undefined;
  'Create League': undefined;
  'League Explorer': undefined;
  Leagues: undefined;
  League: LeagueProps;
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
      console.log('signed out');
    });
  };

  const commonStack = (
    <>
      <Stack.Screen name="Requests" component={Requests} />
      <Stack.Screen name="Create League" component={CreateLeague} />
      <Stack.Screen name="League Explorer" component={LeagueExplorer} />
      <Stack.Screen
        name="League"
        component={LeagueStack}
        options={{headerShown: false}}
      />
    </>
  );

  if (loading) {
    return <FullScreenLoading visible={true} />;
  }

  if (uid) {
    return (
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerBackTitleVisible: false,
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
        {commonStack}
      </Stack.Navigator>
    );
  } else {
    return (
      <Stack.Navigator
        initialRouteName="Leagues"
        screenOptions={{
          headerBackTitleVisible: false,
        }}>
        <Stack.Screen
          name="Leagues"
          component={Leagues}
          options={({navigation}) => ({
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
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Leagues"
        component={Leagues}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="trophy-variant" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
