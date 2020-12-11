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
  ClubRequestData,
  ClubRequestInt,
  ClubRosterMember,
  LeagueInt,
  LeagueRequestInt,
  MyRequestData,
  MyRequests,
  PlayerRequestData,
  SectionListInt,
  UserDataInt,
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
  //const [clubRequests, setClubRequests] = useState<ClubRequestInt[]>([]);
  //const [leagueRequests, setLeagueRequests] = useState<LeagueRequestInt[]>([]);
  //const [myRequests, setMyRequests] = useState<MyRequests[]>([]);
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
    let requests: ClubRequestInt[] = [];
    let clubData: ClubRequestInt = {
      title: '',
      data: [],
    };
    let playerData: PlayerRequestData;
    let myClubRequests: MyRequests = {
      title: 'Club Requests',
      data: [],
    };
    let myClubRequestData: MyRequestData;

    for (const [leagueId, league] of Object.entries(data)) {
      if (league.clubs) {
        for (const [clubId, club] of Object.entries(league.clubs)) {
          const roster: {[uid: string]: ClubRosterMember} = club.roster;
          for (const [playerId, player] of Object.entries(roster)) {
            if (playerId === uid && player.accepted === false) {
              myClubRequestData = {
                accepted: player.accepted,
                clubId: clubId,
                leagueId: leagueId,
                leagueName: league.name,
                clubName: club.name,
                playerId: playerId,
              };
              myClubRequests.data = [...myClubRequests.data, myClubRequestData];
            }
            if (player.accepted === false) {
              clubData.title = club.name + ' / ' + league.name;
              playerData = {
                ...player,
                clubId: clubId,
                leagueId: leagueId,
                playerId: playerId,
              };
              clubData.data = [...clubData.data, playerData];
            }
          }
        }
      }
      requests.push(clubData);
    }
    console.log(uid, myClubRequests, 'my league requests');
    setClubRequestCount(clubRequestCount + clubData.data.length);
    requestContext?.updateClubs(requests);
    requestContext?.updateMyRequests(myClubRequests);
  };

  const getLeagueRequests = (data: {[leagueId: string]: LeagueInt}) => {
    let requests: LeagueRequestInt[] = [];
    let leagueData: LeagueRequestInt = {
      title: '',
      data: [],
    };
    let clubData: ClubRequestData;
    let myLeagueRequests: MyRequests = {
      title: 'League Requests',
      data: [],
    };
    let myLeagueRequestData: MyRequestData;

    for (const [leagueId, league] of Object.entries(data)) {
      console.log('found club', leagueId, league);
      if (league.clubs) {
        for (const [clubId, club] of Object.entries(league.clubs)) {
          if (club.managerId === uid && club.accepted === false) {
            myLeagueRequestData = {
              accepted: club.accepted,
              clubId: clubId,
              leagueId: leagueId,
              leagueName: league.name,
              clubName: club.name,
            };
            myLeagueRequests.data = [
              ...myLeagueRequests.data,
              myLeagueRequestData,
            ];
          }
          if (club.accepted === false && league.adminId === uid) {
            leagueData.title = league.name;
            clubData = {
              ...club,
              leagueId: leagueId,
              clubId: clubId,
            };
            leagueData.data = [...leagueData.data, clubData];
          }
        }

        requests.push(leagueData);
      }
    }

    setLeagueRequestCount(leagueRequestCount + leagueData.data.length);
    console.log(requests, 'requests');
    requestContext?.updateLeagues(requests);
    requestContext?.updateMyRequests(myLeagueRequests);
  };

  const getLeaguesClubs = async (
    userData: UserDataInt,
  ): Promise<AppContextInt> => {
    const leagues = Object.entries(userData.leagues);
    let userLeagues: {[league: string]: LeagueInt} = {};

    for (const [leagueId, league] of leagues) {
      const clubRef = leaguesRef.doc(leagueId).collection('clubs');

      await leaguesRef
        .doc(leagueId)
        .get()
        .then((doc) => {
          userLeagues = {...userLeagues, [doc.id]: doc.data() as LeagueInt};
        })
        .then(async () => {
          await clubRef.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              console.log('club', doc.data());
              if (league.admin === true) {
                userLeagues[leagueId].clubs = {
                  ...userLeagues[leagueId].clubs,
                  [doc.id]: doc.data() as ClubInt,
                };
              } else if (league.clubId === doc.id) {
                userLeagues[leagueId].clubs = {
                  ...userLeagues[leagueId].clubs,
                  [doc.id]: doc.data() as ClubInt,
                };
              }
            });
          });
        });
      // .then(async () => {
      //   const clubRef = leaguesRef
      //     .doc(leagueId)
      //     .collection('clubs')
      //     .doc(league.clubId);

      //   await clubRef.get().then((doc) => {
      //     if (doc.exists) {
      //       userLeagues[leagueId].clubs = {
      //         [doc.id]: doc.data() as ClubInt,
      //       };
      //     }
      //   });
      // });
    }

    console.log(userLeagues, 'user leagues');
    return {
      userLeagues,
      userData,
    };
  };

  useEffect(() => {
    if (user) {
      const userRef = db.collection('users').doc(uid);
      let userData: UserDataInt;
      const subscriber = userRef.onSnapshot((doc) => {
        console.log('call to fir');
        userData = doc.data() as UserDataInt;
        if (userData?.leagues) {
          getLeaguesClubs(userData)
            .then((data) => {
              context?.update(data);
              getClubRequests(data.userLeagues);
              getLeagueRequests(data.userLeagues);
            })
            .then(() => {
              setLoading(false);
            });
        } else {
          console.log('no leagues');

          context?.update({userData: userData});
          setLoading(false);
        }
      });
      return subscriber;
    }
  }, [uid]);
  //TODO my requests (club/leagues)

  //TODO Get scheduled matches for all leagues
  //TODO report center

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
      setClubRequestCount(0);
      setLeagueRequestCount(0);
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
        onPress={() => navigation.navigate('Requests')}
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
