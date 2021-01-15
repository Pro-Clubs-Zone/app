import React, {useContext, useLayoutEffect, useState} from 'react';
import {Alert, ScrollView} from 'react-native';
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
  //const [loading, setLoading] = useState<boolean>(false);
  const [clubRosterLength, setClubRosterLength] = useState(1);

  const context = useContext(AppContext);
  const leagueContext = useContext(LeagueContext);

  const leagueId = leagueContext.leagueId;
  // const scheduled = leagueContext.league.scheduled;
  const teamNum = leagueContext.league.teamNum;
  const acceptedClubs = context.userLeagues[leagueId].clubs
    ? Object.keys(context.userLeagues[leagueId].clubs).length
    : 0;
  const leagueComplete = teamNum === acceptedClubs;
  const userClub = context.userData.leagues[leagueId];
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
        'Schedule Matches',
        'Are you sure you want to schedule matches and start the league?',
        [
          {
            text: 'Schedule',
            onPress: () => scheduleMatches(),
          },
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
    } else {
      Alert.alert(
        'Schedule Matches',
        `You can schedule matches once the league has ${teamNum} teams`,
        [
          {
            text: 'Close',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
    }
  };

  const scheduleMatches = async () => {
    //setLoading(true);
    const functionRef = firFunc.httpsCallable('scheduleMatches');
    const league = leagueContext.league;
    console.log('====================================');
    console.log(leagueId);
    console.log('====================================');
    await functionRef({
      matchNum: league.matchNum,
      leagueId: leagueId,
    })
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

  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: verticalScale(16),
      }}
      showsVerticalScrollIndicator={false}>
      {userClub.manager ? (
        <CardMedium
          onPress={() =>
            navigation.navigate('My Club', {
              clubId: userClub.clubId,
              manager: userClub.manager,
            })
          }
          title={userClub.clubName}
          subTitle={
            clubRosterLength > 1
              ? clubRosterLength + ' Players'
              : 'No members except you'
          }
        />
      ) : (
        <CardMedium
          onPress={() =>
            navigation.navigate('Create Club', {
              isAdmin: true,
              newLeague: false,
            })
          }
          title="Create My Club"
          subTitle="fdf"
        />
      )}
      <CardSmallContainer>
        <CardSmall
          title={'League\nClubs'}
          onPress={() => navigation.navigate('Clubs')}
        />
        <CardSmall
          title={'Invite\nClubs'}
          onPress={() => console.log('nothing yet')}
        />
      </CardSmallContainer>

      <CardMedium
        onPress={onScheduleMatches}
        title="Schedule Matches"
        subTitle={
          leagueComplete
            ? 'League is full and matches can be scheduled'
            : `${acceptedClubs}/${teamNum} Teams\nNot enough teams to schedule matches`
        }
      />
    </ScrollView>
  );
}
