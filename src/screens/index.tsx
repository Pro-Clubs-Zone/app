import React, {useContext, useEffect, useState} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {AuthContext} from '../context/authContext';
import {createStackNavigator} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {FONT_SIZES} from '../utils/designSystem';

// Screens
import Home from './user/home';
import Leagues from './user/leagues';
import SignUp from './auth/signUp';
import SignIn from './auth/signIn';
import Requests from './user/requests';
import CreateLeague from './league/createLeague';
import LeagueExplorer from './user/leagueExplorer';
import LeagueStack from './league/leagueStack';
import {View, Text} from 'react-native';

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
  const [uid, setUid] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (user) {
      setUid(user.uid);
      console.log('updateUserUid');
      setLoading(false);
    } else {
      setUid(undefined);
      console.log('no user', user);
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <View>
        <Text>Loading</Text>
      </View>
    );
  }

  if (uid) {
    return (
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeTabs} />
        <Stack.Screen name="Requests" component={Requests} />
        <Stack.Screen name="Create League" component={CreateLeague} />
        <Stack.Screen name="League Explorer" component={LeagueExplorer} />
        <Stack.Screen
          name="League"
          component={LeagueStack}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    );
  } else {
    return (
      <Stack.Navigator initialRouteName="Leagues">
        <Stack.Screen
          name="Leagues"
          component={Leagues}
          options={({navigation}) => ({
            headerRight: () => (
              <Icon
                name="account"
                size={FONT_SIZES.M}
                onPress={() => navigation.navigate('Sign Up')}
              />
            ),
          })}
        />
        <Stack.Screen name="Sign In" component={SignIn} />
        <Stack.Screen name="Requests" component={Requests} />
        <Stack.Screen name="Create League" component={CreateLeague} />
        <Stack.Screen name="League Explorer" component={LeagueExplorer} />
        <Stack.Screen name="Sign Up" component={SignUp} />
        <Stack.Screen
          name="League"
          component={LeagueStack}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    );
  }
}

const HomeTabs = () => {
  const Tab = createBottomTabNavigator();
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Leagues" component={Leagues} />
    </Tab.Navigator>
  );
};
