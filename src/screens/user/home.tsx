import React, {useContext, useEffect, useState} from 'react';
import {Text, View, Button} from 'react-native';
import {AppContext} from '../../context/appContext';
import {AuthContext} from '../../context/authContext';
import {RequestContext} from '../../context/requestContext';
import {StackNavigationProp} from '@react-navigation/stack';
import firestore from '@react-native-firebase/firestore';
import {
  IClubRosterMember,
  IClubRequest,
  ILeague,
  ILeagueRequest,
  ISentRequest,
  IMyRequests,
  IUser,
  IMatchNavData,
  IClubRequestData,
  IPlayerRequestData,
} from '../../utils/interface';
import getUserMatches from './functions/getUserMatches';
import getLeaguesClubs from './functions/getUserLeagueClubs';
import {AppNavStack} from '../index';
import {TEXT_STYLES} from '../../utils/designSystem';
import {t, plural} from '@lingui/macro';
import i18n from '../../utils/i18n';
import FullScreenLoading from '../../components/loading';

const db = firestore();

type ScreenNavigationProp = StackNavigationProp<AppNavStack, 'Home'>;

type Props = {
  navigation: ScreenNavigationProp;
};

export default function Home({navigation}: Props) {
  const [loading, setLoading] = useState<boolean>(true);
  const [matches, setMatches] = useState<IMatchNavData[]>([]);

  const context = useContext(AppContext);
  const user = useContext(AuthContext);
  const requestContext = useContext(RequestContext);

  const uid = user?.uid;

  const getClubRequests = (data: {[leagueId: string]: ILeague}) => {
    let requests: IClubRequest[] = [];
    let requestCount = 0;
    let myClubRequests: IMyRequests = {
      title: '',
      data: [],
    };

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

              let myClubRequestData: ISentRequest = {
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
              let playerData: IPlayerRequestData = {
                ...player,
                clubId: clubId,
                leagueId: leagueId,
                playerId: playerId,
              };

              clubData.title = club.name + ' / ' + league.name;
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
    if (myClubRequests.data.length !== 0) {
      requestContext?.setMyClubRequests(myClubRequests);
    }
  };

  const getLeagueRequests = (data: {[leagueId: string]: ILeague}) => {
    let requests: ILeagueRequest[] = [];
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
        for (const [clubId, club] of Object.entries(league.clubs)) {
          if (club.managerId === uid && club.accepted === false) {
            myLeagueRequests.title = 'League Requests';

            let myLeagueRequestData: ISentRequest = {
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

            let clubData: IClubRequestData = {
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

  useEffect(() => {
    if (user) {
      const userRef = db.collection('users').doc(uid);
      let userInfo: IUser;
      const subscriber = userRef.onSnapshot((doc) => {
        console.log('call to fir');
        userInfo = doc.data() as IUser;

        if (userInfo.leagues) {
          getLeaguesClubs(userInfo).then(async (data) => {
            const {userData, userLeagues} = data;
            context.setUserData(userData);
            context.setUserLeagues(userLeagues);
            getUserMatches(userData, userLeagues)
              .then((matchesData) => setMatches(matchesData))
              .then(() => {
                getClubRequests(userLeagues);
                getLeagueRequests(userLeagues);
              });
          });
        } else {
          console.log('no leagues');
          context.setUserData(userInfo);
        }
      });

      setLoading(false);
      return subscriber;
    }
  }, [user]);

  //TODO UI
  // TODO Stats

  return (
    <>
      <FullScreenLoading visible={loading} />
      <Text style={{...TEXT_STYLES.display4}}>Home Screen</Text>
      <Text>{context?.userData?.username}</Text>
      <Button
        onPress={() => navigation.navigate('Requests')}
        title={`Requests ${requestContext?.requestCount}`}
      />
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
    </>
  );
}
