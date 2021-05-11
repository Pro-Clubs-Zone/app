import React, {useContext, useLayoutEffect, useState} from 'react';
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
import useGetLeagueRequests from '../user/actions/useGetLeagueRequests';
import {AuthContext} from '../../context/authContext';
import useGetClubRequests from '../user/actions/useGetClubRequests';

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

  const context = useContext(AppContext);
  const leagueContext = useContext(LeagueContext);
  const user = useContext(AuthContext);
  const uid = user.uid;
  const requestContext = useContext(RequestContext);

  const leagueId = leagueContext.leagueId;
  const teamNum = leagueContext.league.teamNum;
  const acceptedClubs = leagueContext.league.acceptedClubs;
  const leagueComplete = teamNum === acceptedClubs;
  const userLeague = context.userData!.leagues![leagueId];
  const newLeague = route.params.newLeague;

  const leagueRequests = useGetLeagueRequests(uid);
  const clubRequests = useGetClubRequests(uid);

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

  if (loading || leagueRequests.loading || clubRequests.loading) {
    return <FullScreenLoading visible={true} label={i18n._(t`Loading`)} />;
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
          subTitle={i18n._(t`Manager your club and roster`)}
          badgeNumber={requestContext.clubCount[userLeague.clubId]}
        />
      ) : (
        <CardMedium
          onPress={() =>
            navigation.navigate('Create Club', {
              isAdmin: true,
              newLeague: false,
              acceptClub: !(acceptedClubs === teamNum),
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
          badgeNumber={requestContext.leagueCount[leagueId]}
        />
        <CardSmall
          title={i18n._(t`Transfer History`)}
          onPress={() =>
            navigation.navigate('Transfer History', {
              leagueId: leagueId,
            })
          }
        />
      </CardSmallContainer>
      <CardMedium
        title={i18n._(t`Invite Clubs`)}
        onPress={() => shareLeagueLink(leagueContext.league.name, leagueId)}
      />
      <CardMedium
        onPress={onScheduleMatches}
        title={i18n._(t`Schedule Matches`)}
        subTitle={
          leagueComplete
            ? i18n._(t`League is full and matches can be scheduled`)
            : i18n._(
                t`${acceptedClubs}/${teamNum} Teams.${`\n`}Not enough teams to schedule matches`,
              )
        }
      />
    </ScrollView>
  );
}
