import React, {useContext, useEffect, useLayoutEffect, useState} from 'react';
import {Alert, ScrollView, Share, Platform} from 'react-native';
import {HeaderBackButton, StackNavigationProp} from '@react-navigation/stack';
import functions from '@react-native-firebase/functions';
import {AppContext} from '../../context/appContext';
import {LeagueContext} from '../../context/leagueContext';
import {LeagueStackType} from '../league/league';
import {
  CardMedium,
  CardSmall,
  CardSmallContainer,
} from '../../components/cards';
import {verticalScale} from 'react-native-size-matters';
import FullScreenLoading from '../../components/loading';
import {RouteProp} from '@react-navigation/native';
import {StackActions, CommonActions} from '@react-navigation/native';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import analytics from '@react-native-firebase/analytics';
import {t} from '@lingui/macro';
import i18n from '../../utils/i18n';
import {RequestContext} from '../../context/requestContext';

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
    const leagueRequests = requestContext.leagues.filter(
      (league) => league.title === leagueContext.league.name,
    );

    if (userLeague.manager) {
      const clubRequests = requestContext.clubs.filter(
        (club) =>
          club.title ===
          `${userLeague.clubName} / ${leagueContext.league.name}`,
      );

      if (clubRequests.length !== 0) {
        setClubReqCount(clubRequests[0].data.length);
      }
    }

    if (leagueRequests.length !== 0) {
      setLeagueReqCount(leagueRequests[0].data.length);
    }
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
            onPress: () => {
              setLoading(true);
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
    const functionRef = firFunc.httpsCallable('scheduleMatches');
    const league = leagueContext.league;
    await functionRef({
      matchNum: league.matchNum,
      leagueId: leagueId,
    })
      .then(() => setLoading(false))
      .then(() => {
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
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const shareLeagueLink = () => {
    const linkBuilder = async () => {
      const link = await dynamicLinks().buildShortLink(
        {
          link: `https://l.proclubs.zone/lgu/${leagueId}`,
          domainUriPrefix: 'https://l.proclubs.zone/lgu',
          ios: {
            bundleId: 'com.proclubszone',
            appStoreId: '1551138800',
            minimumVersion: '1',
            //      fallbackUrl: 'https://proclubs.zone',
          },
          android: {
            packageName: 'com.proclubszone',
            minimumVersion: '1',
            //      fallbackUrl: 'https://proclubs.zone',
          },
          social: {
            title: leagueContext.league.name,
            descriptionText: `Join ${leagueContext.league.name} on Pro Clubs Zone!`,
            imageUrl:
              'https://storage.googleapis.com/pro-clubs-zone-v2.appspot.com/web/dynamic-share.jpg',
          },
        },
        dynamicLinks.ShortLinkType.SHORT,
      );

      return link;
    };

    linkBuilder().then(async (link) => {
      const message = i18n._(
        t`Join ${leagueContext.league.name} on Pro Clubs Zone!`,
      );
      try {
        const result = await Share.share(
          {
            message: Platform.OS === 'ios' ? message : link,
            url: link,
            title: message,
          },
          {
            dialogTitle: i18n._(t`Invite clubs`),
          },
        );
        if (result.action === Share.sharedAction) {
          await analytics().logShare({
            content_type: 'league_invite',
            item_id: leagueId,
            method: result.activityType,
          });
        }
      } catch (error) {
        console.log(error);
      }
    });
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
          subTitle="Manage your current roster"
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
          onPress={() => navigation.navigate('Clubs')}
          badgeNumber={leagueReqCount}
        />
        <CardSmall title={i18n._(t`Invite Clubs`)} onPress={shareLeagueLink} />
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
