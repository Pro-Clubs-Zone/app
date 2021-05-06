import React, {useContext, useLayoutEffect, useState} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {AuthContext} from '../context/authContext';
import {createStackNavigator} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {APP_COLORS, FONT_SIZES, TEXT_STYLES} from '../utils/designSystem';
import {verticalScale} from 'react-native-size-matters';
import {IconButton, MinButton} from '../components/buttons';
import auth from '@react-native-firebase/auth';
import crashlytics from '@react-native-firebase/crashlytics';
import {
  LogBox,
  Linking,
  SafeAreaView,
  Text,
  View,
  Pressable,
  Platform,
} from 'react-native';
import functions from '@react-native-firebase/functions';
import firestore from '@react-native-firebase/firestore';
import VersionCheck from 'react-native-version-check';
import {t} from '@lingui/macro';
import i18n from '../utils/i18n';

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
import AppInfo from './world/appInfo';
import Settings from './user/settings';

type SignIn = {data?: {}; redirectedFrom?: string | null};

type AppInfo = {
  isNeeded: boolean;
  currentVersion: string;
  latestVersion: string;
  storeUrl: string;
};

export type AppNavStack = {
  Home: undefined;
  'Sign Up': undefined;
  'Sign In': undefined;
  'Password Recovery': undefined;
  'Reset Password': {
    oobCode: string;
  };
  Requests: {
    uid: string;
  };
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
  Settings: undefined;
};

const db = firestore();
const firAuth = auth();
const firFunc = functions();

export default function AppIndex() {
  const [appInfo, setAppInfo] = useState<AppInfo>();
  //const [showAlert, setShowAlert] = useState(false);
  const Stack = createStackNavigator<AppNavStack>();
  const user = useContext(AuthContext);
  const requests = useContext(RequestContext);
  const context = useContext(AppContext);

  // const debug = true;

  const uid = user.uid;
  useLayoutEffect(() => {
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

    if (user.uid) {
      crashlytics().setUserId(uid!);
    }

    const checkAppUpdate = async () => {
      const appUpdate = await VersionCheck.needUpdate({
        packageName: 'com.proclubszone',
        forceUpdate: true,
      });
      try {
        if (appUpdate?.isNeeded) {
          setAppInfo(appUpdate);
        }
      } catch (error) {
        throw new Error(error);
      }
    };

    checkAppUpdate();
  }, []);

  const onSignOut = (goBack: () => void) => {
    firAuth.signOut().then(() => {
      context.setUserData(undefined);
      context.setUserLeagues(undefined);
      context.setUserMatches([]);
      requests.resetRequests();
      goBack();
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
      <Stack.Screen
        name="App Info"
        component={AppInfo}
        options={{
          title: 'Get in touch',
        }}
      />
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={({navigation}) => ({
          headerRight: () =>
            uid && (
              <IconButton
                name="logout-variant"
                onPress={() => onSignOut(navigation.goBack())}
              />
            ),
        })}
      />
    </>
  );

  if (appInfo) {
    return (
      <SafeAreaView
        style={{
          backgroundColor: APP_COLORS.Dark,
          flex: 1,
          justifyContent: 'center',
        }}>
        <Pressable
          onPress={() => Linking.openURL(appInfo.storeUrl)}
          style={{
            paddingHorizontal: verticalScale(16),
            marginBottom: verticalScale(56),
          }}>
          <View
            style={{
              borderRadius: 3,
              padding: verticalScale(24),
              paddingBottom: verticalScale(16),
              paddingRight: verticalScale(16),
              backgroundColor: APP_COLORS.Accent,
            }}>
            <Text
              style={[
                TEXT_STYLES.display3,
                {
                  color: APP_COLORS.Primary,
                },
              ]}>
              {i18n._(t`New app version available.`)}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',

                marginTop: verticalScale(16),
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Icon
                  name={Platform.OS === 'ios' ? 'apple' : 'google-play'}
                  color={APP_COLORS.Primary}
                  style={{
                    marginRight: verticalScale(4),
                  }}
                  size={verticalScale(16)}
                />
                <Text
                  style={[
                    TEXT_STYLES.small,
                    {
                      color: APP_COLORS.Primary,
                    },
                  ]}>
                  {i18n._(t`Update now to continue`)}
                </Text>
              </View>
              <Icon
                name="arrow-right-circle-outline"
                color={APP_COLORS.Primary}
                size={verticalScale(24)}
              />
            </View>
          </View>
        </Pressable>
        {/* <View>
          <MinButton
            title={i18n._(t`Later`)}
            onPress={() => setShowAlert(false)}
            secondary
          />
        </View> */}
      </SafeAreaView>
    );
  }

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
          options={({navigation}) => ({
            headerRight: () => (
              <IconButton
                name="cog"
                onPress={() => navigation.navigate('Settings')}
              />
            ),
          })}
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
          title: 'Home',
          headerRight: () => (
            <View
              style={{
                flexDirection: 'row',
              }}>
              <IconButton
                name="cog"
                onPress={() => navigation.navigate('Settings')}
              />
              <IconButton
                name="account"
                onPress={() => navigation.navigate('Sign Up')}
              />
            </View>
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
  const requestCount = requestContext.totalCount;

  return (
    <Tab.Navigator
      initialRouteName="Home"
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
        name="Leagues "
        component={Leagues}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="trophy-variant" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="World "
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
