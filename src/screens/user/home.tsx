import React, {useContext, useEffect, useState} from 'react';
import {Text, View, Button} from 'react-native';
import {AppContext, AuthContext, RequestContext} from '../../utils/context';
import auth from '@react-native-firebase/auth';
import {StackNavigationProp} from '@react-navigation/stack';
import firestore from '@react-native-firebase/firestore';
import {
  IClub,
  IClubRosterMember,
  ILeague,
  ILeagueRequest,
  ISentRequest,
  IMyRequests,
  IPlayerRequest,
  IUser,
  IMatchNavData,
} from '../../utils/interface';
import getUserMatches from './functions/getUserMatches';
import {HomeStackType} from './homeStack';

const firAuth = auth();
const db = firestore();

type ScreenNavigationProp = StackNavigationProp<HomeStackType, 'Home'>;

type Props = {
  navigation: ScreenNavigationProp;
};

export default function Home({navigation}: Props) {
  const [loading, setLoading] = useState<boolean>(true);
  const [uid, setUid] = useState<string | undefined>();
  const [matches, setMatches] = useState<IMatchNavData[]>([]);

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

  const getClubRequests = (data: {[leagueId: string]: ILeague}) => {
    let requests: IClubRequest[] = [];
    let requestCount = 0;
    let playerData: IPlayerRequest;
    let myClubRequests: IMyRequests = {
      title: '',
      data: [],
    };
    let myClubRequestData: ISentRequest;

    for (const [leagueId, league] of Object.entries(data)) {
      let clubData: IClubRequest = {
        title: '',
        data: [],
      };
      if (league.clubs) {
        for (const [clubId, club] of Object.entries(league.clubs)) {
          const roster: {[uid: string]: IClubRosterMember} = club.roster;
          for (const [playerId, player] of Object.entries(roster)) {
            if (playerId === uid && player.accepted === false) {
              myClubRequests.title = 'Club Requests';
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
            if (player.accepted === false && club.managerId === uid) {
              clubData.title = club.name + ' / ' + league.name;
              playerData = {
                ...player,
                clubId: clubId,
                leagueId: leagueId,
                playerId: playerId,
              };
              clubData.data = [...clubData.data, playerData];
              requestCount++;
            }
          }
        }
        if (clubData.data.length !== 0) {
          requests.push(clubData);
        }
      }
    }
    requestContext?.setClubCount(requestCount);
    requestContext?.setClubs(requests);
    requestContext?.setMyClubRequests(myClubRequests);
  };

  const getLeagueRequests = (data: {[leagueId: string]: ILeague}) => {
    let requests: ILeagueRequest[] = [];
    let clubData: IClubRequest;
    let myLeagueRequests: IMyRequests = {
      title: '',
      data: [],
    };

    let requestCount = 0;

    for (const [leagueId, league] of Object.entries(data)) {
      let leagueData: ILeagueRequest = {
        title: '',
        data: [],
      };
      if (league.clubs) {
        let myLeagueRequestData: ISentRequest;
        for (const [clubId, club] of Object.entries(league.clubs)) {
          if (club.managerId === uid && club.accepted === false) {
            myLeagueRequests.title = 'League Requests';
            myLeagueRequestData = {
              accepted: club.accepted,
              clubId: clubId,
              leagueId: leagueId,
              leagueName: league.name,
              clubName: club.name,
            };

            myLeagueRequests.data.push(myLeagueRequestData);
          }
          if (club.accepted === false && league.adminId === uid) {
            leagueData.title = league.name;
            clubData = {
              ...club,
              leagueId: leagueId,
              clubId: clubId,
            };
            leagueData.data = [...leagueData.data, clubData];
            requestCount++;
          }
        }
        if (leagueData.data.length !== 0) {
          requests.push(leagueData);
        }
      }
    }

    requestContext?.setLeagueCount(requestCount);
    requestContext?.setLeagues(requests);
    if (myLeagueRequests.data.length !== 0) {
      requestContext?.setMyLeagueRequests(myLeagueRequests);
    }
  };

  const getLeaguesClubs = async (
    userData: IUser,
  ): Promise<{
    userData: IUser;
    userLeagues: {[league: string]: ILeague};
  }> => {
    const leagues = Object.entries(userData.leagues);
    let userLeagues: {[league: string]: ILeague} = {};

    for (const [leagueId, league] of leagues) {
      const clubRef = leaguesRef.doc(leagueId).collection('clubs');

      await leaguesRef
        .doc(leagueId)
        .get()
        .then((doc) => {
          userLeagues = {...userLeagues, [doc.id]: doc.data() as ILeague};
        })
        .then(async () => {
          await clubRef.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              console.log('club', doc.data());
              userLeagues[leagueId].clubs = {
                ...userLeagues[leagueId].clubs,
                [doc.id]: doc.data() as IClub,
              };
              // if (league.admin === true) {
              //   userLeagues[leagueId].clubs = {
              //     ...userLeagues[leagueId].clubs,
              //     [doc.id]: doc.data() as ClubInt,
              //   };
              // } else if (league.clubId === doc.id) {
              //   userLeagues[leagueId].clubs = {
              //     ...userLeagues[leagueId].clubs,
              //     [doc.id]: doc.data() as ClubInt,
              //   };
              // }
            });
          });
        });
    }

    return {
      userLeagues,
      userData,
    };
  };

  useEffect(() => {
    if (user) {
      const userRef = db.collection('users').doc(uid);
      let userInfo: IUser;
      const subscriber = userRef.onSnapshot((doc) => {
        console.log('call to fir');
        userInfo = doc.data() as IUser;
        if (userInfo?.leagues) {
          getLeaguesClubs(userInfo)
            .then((data) => {
              const {userData, userLeagues} = data;
              context?.setUserData(userData);
              context?.setUserLeagues(userLeagues);
              getClubRequests(userLeagues);
              getLeagueRequests(userLeagues);
              getUserMatches(userData, userLeagues).then((matchesData) =>
                setMatches(matchesData),
              );
            })
            .then(() => {
              setLoading(false);
            });
        } else {
          console.log('no leagues');

          context?.setUserData(userInfo);
          setLoading(false);
        }
      });
      return subscriber;
    }
  }, [uid]);

  //TODO report center
  //TODO UI
  // TODO Stats
  const onSignOut = () => {
    firAuth.signOut().then(() => {
      setUid(undefined);
      requestContext?.setClubCount(0);
      requestContext?.setLeagueCount(0);
      context?.setUserData(null);
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
      <Text>{context?.userData?.username}</Text>
      <Button
        onPress={() => navigation.navigate('Requests')}
        title={`Requests ${requestContext?.requestCount}`}
      />
      <CustomButton
        onPress={user ? onSignOut : () => navigation.navigate('Sign Up')}
        title={user ? 'Logout' : 'Sign Up'}
      />
      <Button onPress={() => navigation.navigate('Sign In')} title="SignIn" />
      <Button
        onPress={() =>
          navigation.navigate('Leagues', {
            screen: 'Match',
            params: {
              matchInfo: matches, //FIXME pass correct match from array}
            },
          })
        }
        title="Match Screen"
      />
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
