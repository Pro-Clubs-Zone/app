import React, {useContext, useEffect, useState} from 'react';
import {Text, View, Button} from 'react-native';
import {AppContext, AuthContext, RequestContext} from '../../utils/context';
import auth from '@react-native-firebase/auth';
import {createStackNavigator} from '@react-navigation/stack';
import SignUp from '../auth/signUp';
import functions from '@react-native-firebase/functions';
import SignIn from '../auth/signIn';
import firestore from '@react-native-firebase/firestore';
import Requests from './requests';
import {
  AppContextInt,
  ClubInt,
  ClubRosterMemberInt,
  DocumentData,
  LeagueInt,
  RequestInt,
  UserDataInt,
  UserLeagueInt,
} from '../../utils/globalTypes';

const firFunc = functions();
const firAuth = auth();
const db = firestore();

function Home() {
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator initialRouteName="Leagues">
      <Stack.Screen name="Home" component={HomeContent} />
      <Stack.Screen name="Sign Up" component={SignUp} />
      <Stack.Screen name="Sign In" component={SignIn} />
      <Stack.Screen name="Requests" component={Requests} />
    </Stack.Navigator>
  );
}

function HomeContent({navigation}) {
  const [loading, setLoading] = useState<boolean>(true);
  const [uid, setUid] = useState<string | undefined>();
  const [clubRequests, setClubRequests] = useState<RequestInt[]>([]);
  const [leagueRequests, setLeagueRequests] = useState<RequestInt[]>([]);
  const [clubRequestCount, setClubRequestCount] = useState(0);
  const [leagueRequestCount, setLeagueRequestCount] = useState(0);

  const context = useContext(AppContext);
  const user = useContext(AuthContext);
  const requestContext = useContext(RequestContext);

  const leaguesRef = db.collection('leagues');
  useEffect(() => {
    if (user) {
      setUid(user.uid);
      console.log('updateUserUid');
      setLoading(true);
    } else {
      console.log('no user');
      setLoading(false);
    }
  }, [user]);

  const getClubRequests = (data: {[leagueId: string]: LeagueInt}) => {
    let requests: RequestInt[] = [];
    let clubData: RequestInt = {
      title: '',
      data: [],
    };
    let playerData: UserLeagueInt & {club: string; league: string};

    for (const [leagueId, league] of Object.entries(data)) {
      if (league.clubs) {
        for (const [clubId, club] of Object.entries(league.clubs)) {
          const roster: {[uid: string]: ClubRosterMemberInt} = club.roster;
          clubData.title = club.name + ' / ' + league.name;
          for (const [playerId, player] of Object.entries(roster)) {
            if (player.accepted === false) {
              playerData = {
                ...player,
                club: clubId,
                league: leagueId,
              };
              clubData.data = [...clubData.data, {[playerId]: playerData}];
            }
          }
        }
      }
      requests.push(clubData);
    }
    setClubRequestCount(clubRequestCount + clubData.data.length);

    setClubRequests(requests);
    requestContext?.updateClubs(requests);
  };

  const getLeagueRequests = (data: {[leagueId: string]: LeagueInt}) => {
    let requests: RequestInt[] = [];
    let leagueData: RequestInt = {
      title: '',
      data: [],
    };
    let clubData: ClubInt & {league: string};

    for (const [leagueId, league] of Object.entries(data)) {
      if (league.clubs) {
        for (const [clubId, club] of Object.entries(league.clubs)) {
          leagueData.title = league.name;
          console.log(club);

          if (club.accepted === false) {
            clubData = {
              ...club,
              league: leagueId,
            };
            leagueData.data = [...leagueData.data, {[clubId]: clubData}];
          }
        }
      }
      requests.push(leagueData);
      //  console.log(leagueData.data.length);
    }

    setLeagueRequestCount(leagueRequestCount + leagueData.data.length);
    setLeagueRequests(requests);
    requestContext?.updateLeagues(requests);
  };

  const getLeaguesClubs = (userData: UserDataInt) => {
    const leagues = Object.entries(userData.leagues);

    let userLeagues: {[league: string]: LeagueInt} = {};
    const fetchData = async () => {
      console.log('fetch');
      for (const [leagueId, league] of leagues) {
        const clubRef = leaguesRef
          .doc(leagueId)
          .collection('clubs')
          .doc(league.club);

        await leaguesRef
          .doc(leagueId)
          .get()
          .then((doc) => {
            userLeagues = {...userLeagues, [doc.id]: doc.data() as LeagueInt};
          })
          .then(async () => {
            await clubRef.get().then((doc) => {
              if (doc.exists) {
                userLeagues[leagueId].clubs = {
                  [doc.id]: doc.data() as ClubInt,
                };
              }
            });
          });
      }

      return {
        userLeagues,
        userData,
      };
    };

    fetchData()
      .then((data) => {
        getClubRequests(data.userLeagues);

        context?.update(data);
        return data;
      })
      .then((data) => {
        setLoading(false);
        getLeagueRequests(data.userLeagues);
      });
  };

  useEffect(() => {
    if (user) {
      const userRef = db.collection('users').doc(uid);
      let userData: UserDataInt;
      const subscriber = userRef.onSnapshot((doc) => {
        console.log('call to fir');
        userData = doc.data() as UserDataInt;
        if (userData?.leagues) {
          getLeaguesClubs(userData);
        } else {
          console.log('no leagues');

          context?.update({userData: userData});
          setLoading(false);
        }
      });
      return subscriber;
    }
  }, [uid]);

  //TODO get requests to leagues

  // if Admin, get all the unconfirmed clubs from db
  //TODO Get scheduled matches for all leagues
  //TODO report center
  //TODO my requests (club/leagues)

  // const testFunc = async () => {
  //   const test = firFunc.httpsCallable('scheduleMatches');
  //   test({message: 'hey yooo'})
  //     .then((response) => {
  //       console.log('message from cloud', response);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // };

  const onSignOut = () => {
    firAuth.signOut().then(() => {
      setUid(undefined);
      context?.update({
        userData: {} as UserDataInt,
        userLeagues: {},
      });
    });
  };

  if (loading) {
    return (
      <View>
        <Text>LOADING....</Text>
      </View>
    );
  }

  return (
    <View>
      <Text>Home Screen</Text>
      <Text>{context?.data.userData?.username}</Text>
      <Button
        onPress={() =>
          navigation.navigate('Requests', {
            clubRequests: clubRequests,
            leagueRequests: leagueRequests,
          })
        }
        title={`Requests ${leagueRequestCount + clubRequestCount}`}
      />
      <Text></Text>
      <CustomButton
        onPress={user ? onSignOut : () => navigation.navigate('Sign Up')}
        title={user ? 'Logout' : 'Sign Up'}
      />
      <Button onPress={() => navigation.navigate('Sign In')} title="SignIn" />
    </View>
  );
}

const CustomButton = (props) => {
  return (
    <Button
      onPress={props.onPress}
      title={props.title}
      color="#841584"
      accessibilityLabel="Learn more about this purple button"
    />
  );
};

export default Home;
