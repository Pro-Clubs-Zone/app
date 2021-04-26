import React, {useContext, useEffect, useState} from 'react';
import {Text, View, FlatList, ScrollView, Alert} from 'react-native';
import {AppContext} from '../../context/appContext';
import {AuthContext} from '../../context/authContext';
import {StackNavigationProp} from '@react-navigation/stack';
import firestore from '@react-native-firebase/firestore';
import {IUser, IMatchNavData} from '../../utils/interface';
import getUserUpcomingMatches from './actions/useGetUserUpcomingMatches';
import getLeaguesClubs from './actions/getUserLeagueClubs';
import {AppNavStack} from '../index';
import {APP_COLORS, TEXT_STYLES} from '../../utils/designSystem';
import {t, Trans} from '@lingui/macro';
import i18n from '../../utils/i18n';
import {NonModalLoading} from '../../components/loading';
import {verticalScale, ScaledSheet} from 'react-native-size-matters';
import UpcomingMatchCard from '../../components/upcomingMatchCard';
import {CardMedium} from '../../components/cards';
import {MinButton} from '../../components/buttons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useGetUserPublishedMatches from './actions/useGetUserPublishedMatches';
import useGetLeagueRequests from './actions/useGetLeagueRequests';
import useGetClubRequests from './actions/useGetClubRequests';

const db = firestore();

type ScreenNavigationProp = StackNavigationProp<AppNavStack, 'Home'>;

type Props = {
  navigation: ScreenNavigationProp;
};

export default function Home({navigation}: Props) {
  const [loading, setLoading] = useState<boolean>(false);

  const context = useContext(AppContext);
  const user = useContext(AuthContext);

  const uid = user.uid;

  const publishedMatches = useGetUserPublishedMatches(uid);
  const leagueRequests = useGetLeagueRequests(uid);
  const clubRequests = useGetClubRequests(uid);

  console.log(clubRequests);

  const showResendAlert = () => {
    Alert.alert(
      i18n._(t`Verification link sent`),
      i18n._(
        t`Check your email for verification link. Also make sure to check Spam folder.`,
      ),
      [
        {
          text: i18n._(t`Close`),
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
  };

  // const getClubRequests = (data: {[leagueId: string]: ILeague}) => {
  //   let requests: IClubRequest[] = [];
  //   let requestCount = 0;
  //   let myClubRequests: IMyRequests = {
  //     title: '',
  //     data: [],
  //   };

  //   for (const [leagueId, league] of Object.entries(data)) {
  //     let clubData: IClubRequest = {
  //       title: '',
  //       data: [],
  //     };
  //     if (league.clubs) {
  //       for (const [clubId, club] of Object.entries(league.clubs)) {
  //         const roster: {[uid: string]: IClubRosterMember} = club.roster;
  //         for (const [playerId, player] of Object.entries(roster)) {
  //           if (playerId === uid && player.accepted === false) {
  //             myClubRequests.title = i18n._(t`Club Requests`);

  //             let myClubRequestData: ISentRequest = {
  //               accepted: player.accepted,
  //               clubId: clubId,
  //               leagueId: leagueId,
  //               leagueName: league.name,
  //               clubName: club.name,
  //               playerId: playerId,
  //             };
  //             myClubRequests.data = [...myClubRequests.data, myClubRequestData];
  //           }
  //           if (player.accepted === false && club.managerId === uid) {
  //             let playerData: IPlayerRequestData = {
  //               ...player,
  //               clubId: clubId,
  //               leagueId: leagueId,
  //               playerId: playerId,
  //             };

  //             clubData.title = club.name + ' / ' + league.name;
  //             clubData.data = [...clubData.data, playerData];
  //             requestCount++;
  //           }
  //         }
  //       }
  //       if (clubData.data.length !== 0) {
  //         requests.push(clubData);
  //       }
  //     }
  //   }
  //   requestContext.setClubCount(requestCount);
  //   requestContext.setClubs(requests);
  //   if (myClubRequests.data.length !== 0) {
  //     requestContext.setMyClubRequests(myClubRequests);
  //   }
  // };

  // const getLeagueRequests = (data: {[leagueId: string]: ILeague}) => {
  //   let requests: ILeagueRequest[] = [];
  //   let myLeagueRequests: IMyRequests = {
  //     title: '',
  //     data: [],
  //   };

  //   let requestCount = 0;

  //   for (const [leagueId, league] of Object.entries(data)) {
  //     let leagueData: ILeagueRequest = {
  //       title: '',
  //       data: [],
  //     };
  //     if (league.clubs) {
  //       for (const [clubId, club] of Object.entries(league.clubs)) {
  //         if (club.managerId === uid && club.accepted === false) {
  //           myLeagueRequests.title = i18n._(t`League Requests`);

  //           let myLeagueRequestData: ISentRequest = {
  //             accepted: club.accepted,
  //             clubId: clubId,
  //             leagueId: leagueId,
  //             leagueName: league.name,
  //             clubName: club.name,
  //           };

  //           myLeagueRequests.data.push(myLeagueRequestData);
  //         }
  //         if (
  //           club.accepted === false &&
  //           Object.keys(league.admins).some((adminUid) => adminUid === uid)
  //         ) {
  //           leagueData.title = league.name;

  //           let clubData: IClubRequestData = {
  //             ...club,
  //             leagueId: leagueId,
  //             clubId: clubId,
  //           };
  //           leagueData.data = [...leagueData.data, clubData];
  //           requestCount++;
  //         }
  //       }
  //       if (leagueData.data.length !== 0) {
  //         requests.push(leagueData);
  //       }
  //     }
  //   }

  //   requestContext.setLeagueCount(requestCount);
  //   requestContext.setLeagues(requests);
  //   if (myLeagueRequests.data.length !== 0) {
  //     requestContext.setMyLeagueRequests(myLeagueRequests);
  //   }
  // };

  useEffect(() => {
    const fetchData = async () => {
      const userRef = db.collection('users').doc(uid);
      let userInfo: IUser;
      setLoading(true);
      const doc = await userRef.get();
      userInfo = doc.data() as IUser;
      if (doc.exists && userInfo.leagues) {
        const leagueAndClubsData = await getLeaguesClubs(userInfo);
        const {updatedUserData, userLeagues} = leagueAndClubsData;
        context.setUserData(updatedUserData);
        context.setUserLeagues(userLeagues);
        const matchesData = await getUserUpcomingMatches(
          updatedUserData,
          userLeagues,
        );
        context.setUserMatches(matchesData);
        getClubRequests(userLeagues);
        //    getLeagueRequests(userLeagues);
      } else {
        context.setUserData(userInfo);
      }
      setLoading(false);
    };
    if (user) {
      try {
        fetchData();
      } catch (error) {
        setLoading(false);
        throw new Error(error);
      }
    }
  }, [user]);

  const requestCount = clubRequests.count + leagueRequests.count;

  const getRivalsName = (match: IMatchNavData) => {
    const rivalId = match.teams!.filter((teamId) => teamId !== match.clubId);
    const rivalName = context.userLeagues![match.leagueId].clubs![rivalId[0]]
      .name;
    return rivalName;
  };

  const userLeagues = context?.userLeagues && Object.keys(context.userLeagues);

  const allUserMatches = (leagueId: string) => {
    let upcomingMatches = [
      ...context.userMatches.filter(
        (league) => league.data.leagueId === leagueId,
      ),
    ];

    const publishedMatchesByLeague = publishedMatches.data.filter(
      (leagueMatch) => leagueMatch.data.leagueId === leagueId,
    );

    publishedMatchesByLeague.forEach((publishedMatch) => {
      const updatedUpcomingMatches = upcomingMatches.filter((upcomingMatch) => {
        return upcomingMatch.id !== publishedMatch.id;
      });

      upcomingMatches = updatedUpcomingMatches;
    });

    return [...publishedMatchesByLeague, ...upcomingMatches];
  };

  if (loading && publishedMatches.loading) {
    return <NonModalLoading visible={true} />;
  }
  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={TEXT_STYLES.caption}>
            <Trans>My Matches</Trans>
          </Text>
          <Text
            style={[
              TEXT_STYLES.small,
              {
                textAlign: 'right',
              },
            ]}>
            {user.displayName}
          </Text>
        </View>

        {context?.userMatches.length !== 0 ||
        publishedMatches.data.length !== 0 ? (
          <>
            {userLeagues.map(
              (userLeagueId) =>
                context.userLeagues[userLeagueId].scheduled &&
                context.userData.leagues[userLeagueId].clubId && (
                  <FlatList
                    key={userLeagueId}
                    data={allUserMatches(userLeagueId)}
                    horizontal={true}
                    contentContainerStyle={styles.scrollContainer}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({item}) => (
                      <UpcomingMatchCard
                        clubName={
                          context.userLeagues![item.data.leagueId].clubs![
                            item.data.clubId
                          ].name
                        }
                        rivalName={getRivalsName(item.data)}
                        leagueName={item.data.leagueName}
                        onPress={() =>
                          navigation.navigate('Match', {
                            matchData: item.data,
                            upcoming: !item.data.published,
                          })
                        }
                        submitted={!!item.data.submissions}
                        conflict={item.data.conflict || item.data.motmConflict}
                        published={item.data.published}
                      />
                    )}
                    keyExtractor={(item) => item.id}
                  />
                ),
            )}
            <View style={styles.submissionInfo}>
              <Icon
                name="information-outline"
                size={verticalScale(16)}
                color={APP_COLORS.Accent}
                style={{
                  marginRight: verticalScale(4),
                }}
              />
              <Text style={TEXT_STYLES.small}>
                <Trans>Submit matches even when you lost.</Trans>
              </Text>
            </View>
          </>
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
              <Trans>No Upcoming Matches</Trans>
            </Text>
          </View>
        )}
      </View>

      <CardMedium
        title={i18n._(t`My Requests`)}
        subTitle={i18n._(t`Manage your received and sent request`)}
        badgeNumber={requestCount}
        onPress={() =>
          navigation.navigate('Requests', {
            uid,
          })
        }
      />
      {!user?.currentUser?.emailVerified && (
        <View style={styles.emailVerification}>
          <Text
            style={[
              TEXT_STYLES.body,
              {
                paddingLeft: verticalScale(8),
                paddingTop: verticalScale(4),
              },
            ]}>
            {i18n._(t`Email is not verified`)}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingTop: verticalScale(16),
            }}>
            <MinButton
              title={i18n._(t`Resend`)}
              secondary
              onPress={() => {
                user.currentUser.sendEmailVerification();
                showResendAlert();
              }}
            />
            <MinButton
              title={i18n._(t`I've verified`)}
              secondary
              onPress={() => {
                user.currentUser.reload();
              }}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

//---------- Stylesheet ----------//

const styles = ScaledSheet.create({
  container: {
    backgroundColor: APP_COLORS.Primary,
    minHeight: '128@vs',
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
    paddingBottom: '24@vs',
  },
  emailVerification: {
    flexDirection: 'column',
    borderRadius: 3,
    backgroundColor: APP_COLORS.Red,
    padding: '8@vs',
    marginHorizontal: '4@vs',
    marginVertical: '8@vs',
  },
  submissionInfo: {
    flexDirection: 'row',
    paddingBottom: '16@vs',
    paddingHorizontal: '12@vs',
  },
});
