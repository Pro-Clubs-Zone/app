import React, {useContext, useEffect, useState} from 'react';
import {Text, View, FlatList, ScrollView} from 'react-native';
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
import {APP_COLORS, TEXT_STYLES} from '../../utils/designSystem';
import {t, plural, Trans} from '@lingui/macro';
import i18n from '../../utils/i18n';
import FullScreenLoading from '../../components/loading';
import {verticalScale, ScaledSheet} from 'react-native-size-matters';
import UpcomingMatchCard from '../../components/upcomingMatchCard';
import {CardMedium} from '../../components/cards';

const db = firestore();

type ScreenNavigationProp = StackNavigationProp<AppNavStack, 'Home'>;

type Props = {
  navigation: ScreenNavigationProp;
};

export default function Home({navigation}: Props) {
  const [loading, setLoading] = useState<boolean>(() => true);
  // const [upcomingMatches, setUpcomingMatches] = useState<FixtureList[]>([]);

  const context = useContext(AppContext);
  const user = useContext(AuthContext);
  const requestContext = useContext(RequestContext);

  const uid = user?.uid;
  const username = context.userData?.username;

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
      //  setLoading(true);
      const userRef = db.collection('users').doc(uid);
      let userInfo: IUser;
      const subscriber = userRef.onSnapshot((doc) => {
        userInfo = doc.data() as IUser;

        if (userInfo?.leagues) {
          getLeaguesClubs(userInfo).then(async (data) => {
            const {updatedUserData, userLeagues} = data;
            context.setUserData(updatedUserData);
            context.setUserLeagues(userLeagues);
            getUserMatches(updatedUserData, userLeagues)
              .then((matchesData) => {
                context.setUserMatches(matchesData);
                //  setUpcomingMatches(matchesData);
              })
              .then(() => {
                getClubRequests(userLeagues);
                getLeagueRequests(userLeagues);
              })
              .then(() => {
                setLoading(false);
              });
          });
        } else {
          console.log('no leagues');

          setLoading(false);
          context.setUserData(userInfo);
        }
      });
      return subscriber;
    }
  }, [user]);

  const getRivalsName = (match: IMatchNavData) => {
    const rivalId = match.teams.filter((teamId) => teamId !== match.clubId);
    const rivalName =
      context.userLeagues[match.leagueId]?.clubs[rivalId[0]].name;
    return rivalName;
  };

  if (loading) {
    return <FullScreenLoading visible={true} />;
  }

  return (
    <View style={{flex: 1}}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={TEXT_STYLES.caption}>
            <Trans>Next Matches</Trans>
          </Text>
          <Text
            style={[
              TEXT_STYLES.small,
              {
                textAlign: 'right',
              },
            ]}>
            {username}
          </Text>
        </View>
        {context.userMatches?.length !== 0 ? (
          <FlatList
            data={context.userMatches}
            horizontal={true}
            contentContainerStyle={styles.scrollContainer}
            showsHorizontalScrollIndicator={false}
            renderItem={({item}) => (
              <UpcomingMatchCard
                clubName={
                  context.userLeagues[item.data.leagueId]?.clubs[
                    item.data.clubId
                  ].name
                }
                rivalName={getRivalsName(item.data)}
                leagueName={item.data.leagueName}
                onPress={() =>
                  navigation.navigate('Match', {
                    matchData: item.data,
                    upcoming: true,
                  })
                }
                submitted={!!item.data.submissions?.[item.data.clubId]}
                conflict={item.data.conflict}
              />
            )}
            keyExtractor={(item) => item.id}
          />
        ) : (
          <View
            style={{
              paddingTop: verticalScale(16),
            }}>
            <Text
              style={[
                TEXT_STYLES.small,
                {
                  textAlign: 'center',
                },
              ]}>
              No Upcoming Matches
            </Text>
          </View>
        )}
      </View>
      <ScrollView>
        <CardMedium
          title="My Requests"
          subTitle="Manager your received and sent request"
          badgeNumber={requestContext.requestCount}
          onPress={() => navigation.navigate('Requests')}
        />
      </ScrollView>
    </View>
  );
}

//---------- Stylesheet ----------//

const styles = ScaledSheet.create({
  container: {
    backgroundColor: APP_COLORS.Primary,
    height: '128@vs',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: '16@vs',
    paddingHorizontal: '8@vs',
  },
  scrollContainer: {
    paddingHorizontal: '8@vs',
  },
});
