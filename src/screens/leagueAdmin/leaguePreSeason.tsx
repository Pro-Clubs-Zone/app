import React, {useContext} from 'react';
import {ScrollView} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
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

type ScreenNavigationProp = StackNavigationProp<
  LeagueStackType,
  'League Pre-Season'
>;

type Props = {
  navigation: ScreenNavigationProp;
};
const firFunc = functions();

export default function LeaguePreSeason({navigation}: Props) {
  const context = useContext(AppContext);
  const leagueContext = useContext(LeagueContext);

  const leagueId = leagueContext.leagueId;
  const userClub = context.userData.leagues[leagueId];

  const scheduleMatches = async () => {
    const functionRef = firFunc.httpsCallable('scheduleMatches');
    functionRef({leagueId: leagueId})
      .then((response) => {
        console.log('message from cloud', response);
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
              leagueId: leagueId,
              clubId: userClub.clubId,
              manager: userClub.manager,
            })
          }
          title="My Club"
          subTitle="fdf"
        />
      ) : (
        <CardMedium
          onPress={() =>
            navigation.navigate('Create Club', {
              leagueId: leagueId,
              isAdmin: true,
            })
          }
          title="Create My Club"
          subTitle="fdf"
        />
      )}
      <CardSmallContainer>
        <CardSmall
          title={'League\nClubs'}
          onPress={() =>
            navigation.navigate('Clubs', {
              leagueId: leagueId,
            })
          }
        />
        <CardSmall
          title={'Invite\nClubs'}
          onPress={() => console.log('nothing yet')}
        />
      </CardSmallContainer>
      <CardMedium onPress={scheduleMatches} title="Schedule Matches" />
    </ScrollView>
  );
}
