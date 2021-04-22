import React, {useContext, useEffect, useLayoutEffect, useState} from 'react';
import {Alert, ScrollView} from 'react-native';
import {HeaderBackButton, StackNavigationProp} from '@react-navigation/stack';
import functions from '@react-native-firebase/functions';
import {AppContext} from '../../context/appContext';
import {LeagueContext} from '../../context/leagueContext';
import {LeagueStackType} from './league';
import {
  CardMedium,
  CardSmall,
  CardSmallContainer,
} from '../../components/cards';
import {verticalScale} from 'react-native-size-matters';
import FullScreenLoading from '../../components/loading';
import {RouteProp} from '@react-navigation/native';
import {StackActions, CommonActions} from '@react-navigation/native';
import {t} from '@lingui/macro';
import i18n from '../../utils/i18n';
import {RequestContext} from '../../context/requestContext';
import shareLeagueLink from './actions/shareLink';
import analytics from '@react-native-firebase/analytics';
import countLeagueRequests from './actions/countLeagueRequests';

type ScreenNavigationProp = StackNavigationProp<
  LeagueStackType,
  'League Pre-Season'
>;
type ScreenRouteProp = RouteProp<LeagueStackType, 'League Pre-Season'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};
const firFunc = functions();

export default function LeaguePreSeason({navigation, route}: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const [leagueReqCount, setLeagueReqCount] = useState(0);
  const [clubReqCount, setClubReqCount] = useState(0);
  // const [clubRosterLength, setClubRosterLength] = useState(1);

  const context = useContext(AppContext);
  const leagueContext = useContext(LeagueContext);
  const requestContext = useContext(RequestContext);

  const leagueId = leagueContext.leagueId;
  const teamNum = leagueContext.league.teamNum;
  const acceptedClubs = leagueContext.league.acceptedClubs;
  const leagueComplete = teamNum === acceptedClubs;
  const userLeague = context.userData!.leagues![leagueId];
  const newLeague = route.params.newLeague;

  useLayoutEffect(() => {
    if (newLeague) {
      const popAction = StackActions.pop(2);

      navigation.setOptions({
        headerLeft: () => (
          <HeaderBackButton
            onPress={() => navigation.dispatch(popAction)}
            labelVisible={false}
          />
        ),
      });
    }
  }, [navigation, newLeague]);

  useEffect(() => {
    const [clubRequests, leagueRequests] = countLeagueRequests(
      requestContext.leagues,
      requestContext.clubs,
      userLeague,
      leagueContext.league.name,
    );

    setClubReqCount(clubRequests);
    setLeagueReqCount(leagueRequests);

    // const leagueRequests = requestContext.leagues.filter(
    //   (league) => league.title === leagueContext.league.name,
    // );

    // if (userLeague.manager) {
    //   const clubRequests = requestContext.clubs.filter(
    //     (club) =>
    //       club.title ===
    //       `${userLeague.clubName} / ${leagueContext.league.name}`,
    //   );

    //   if (clubRequests.length !== 0) {
    //     setClubReqCount(clubRequests[0].data.length);
    //   }
    // }

    // if (leagueRequests.length !== 0) {
    //   setLeagueReqCount(leagueRequests[0].data.length);
    // }
  }, [requestContext]);

  //FIXME:
  // useEffect(() => {
  //   if (userClub.clubId && context.userLeagues[leagueId].clubs) {
  //     const clubRoster =
  //       context.userLeagues[leagueId].clubs[userClub.clubId].roster;
  //     setClubRosterLength(Object.values(clubRoster).length);
  //   }
  // }, [context]);

  const onScheduleMatches = () => {
    if (leagueComplete) {
      Alert.alert(
        i18n._(t`Schedule Matches`),
        i18n._(
          t`Are you sure you want to schedule matches and start the league?`,
        ),
        [
          {
            text: i18n._(t`Schedule`),
            style: 'destructive',
            onPress: () => {
              scheduleMatches();
            },
          },
          {
            text: i18n._(t`Cancel`),
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
    } else {
      Alert.alert(
        i18n._(t`Schedule Matches`),
        i18n._(
          t`You can schedule matches once the league has ${teamNum} teams`,
        ),
        [
          {
            text: i18n._(t`Close`),
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
    }
  };

  const scheduleMatches = async () => {
    try {
      setLoading(true);
      const functionRef = firFunc.httpsCallable('scheduleMatches');
      const league = leagueContext.league;
      await functionRef({
        matchNum: league.matchNum,
        leagueId: leagueId,
      });
      await analytics().logEvent('schedule_league', {
        platform: league.platform,
        private: league.private,
        teamNum: league.teamNum,
        name: league.name,
      });
      setLoading(false);

      navigation.dispatch(
        CommonActions.reset({
          index: 2,
          routes: [
            {name: 'Home'},
            {name: 'League Explorer'},
            {name: 'League', params: {leagueId: leagueId}},
          ],
        }),
      );
    } catch (error) {
      setLoading(false);
      throw new Error(error);
    }
  };

  if (loading) {
    return (
      <FullScreenLoading
        visible={true}
        label={i18n._(t`Scheduling Matches...`)}
      />
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: verticalScale(16),
      }}
      showsVerticalScrollIndicator={false}>
      {userLeague.manager ? (
        <CardMedium
          onPress={() =>
            navigation.navigate('My Club', {
              clubId: userLeague.clubId!,
              manager: userLeague.manager,
            })
          }
          title={userLeague.clubName!}
          // subTitle={
          //   clubRosterLength > 1
          //     ? i18n._(t`${clubRosterLength} Players`)
          //     : i18n._(t`No members except you`)
          // }
          subTitle={i18n._(t`Manage your current roster`)}
          badgeNumber={clubReqCount}
        />
      ) : (
        <CardMedium
          onPress={() =>
            navigation.navigate('Create Club', {
              isAdmin: true,
              newLeague: false,
            })
          }
          title={i18n._(t`Create Your Club`)}
          subTitle={i18n._(t`If you want to participate in your own league`)}
        />
      )}
      <CardSmallContainer>
        <CardSmall
          title={i18n._(t`League Clubs`)}
          onPress={() =>
            navigation.navigate('Clubs', {
              scheduled: false,
              isAdmin: true,
              newLeague: false,
            })
          }
          badgeNumber={leagueReqCount}
        />
        <CardSmall
          title={i18n._(t`Invite Clubs`)}
          onPress={() => shareLeagueLink(leagueContext.league.name, leagueId)}
        />
      </CardSmallContainer>

      <CardMedium
        onPress={onScheduleMatches}
        title={i18n._(t`Schedule Matches`)}
        subTitle={
          leagueComplete
            ? i18n._(t`League is full and matches can be scheduled`)
            : i18n._(
                t`${acceptedClubs}/${teamNum} Teams. 
                Not enough teams to schedule matches`,
              )
        }
      />
    </ScrollView>
  );
}
