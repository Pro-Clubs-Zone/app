import React, {useContext} from 'react';
import {ScrollView} from 'react-native';
import {LeagueStackType} from './league';
import {StackNavigationProp} from '@react-navigation/stack';
import {AppContext} from '../../context/appContext';
import {LeagueContext} from '../../context/leagueContext';
import {
  CardMedium,
  CardSmall,
  CardSmallContainer,
} from '../../components/cards';
import {verticalScale} from 'react-native-size-matters';

type ScreenNavigationProp = StackNavigationProp<
  LeagueStackType,
  'League Scheduled'
>;

type Props = {
  navigation: ScreenNavigationProp;
};

export default function LeagueScheduled({navigation}: Props) {
  const context = useContext(AppContext);
  const leagueContext = useContext(LeagueContext);

  const leagueId = leagueContext.leagueId;
  const userClub = context.userData.leagues[leagueId];
  const isAdmin = context.userData.leagues[leagueId].admin;
  const conflictMatchesCount =
    context.userLeagues[leagueId].conflictMatchesCount;
  const clubRoster =
    context.userLeagues[leagueId].clubs[userClub.clubId].roster;
  const clubRosterLength = Object.keys(clubRoster).length;

  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: verticalScale(16),
      }}
      showsVerticalScrollIndicator={false}>
      {isAdmin && (
        <CardMedium
          title="Report Center"
          subTitle="Review and resolve all conflicted matches"
          badgeNumber={conflictMatchesCount}
          onPress={() => navigation.navigate('Report Center')}
        />
      )}
      <CardSmallContainer>
        <CardSmall
          title="Standings"
          onPress={() => navigation.navigate('Standings')}
        />
        <CardSmall
          title="Fixtures"
          onPress={() => navigation.navigate('Fixtures')}
        />
      </CardSmallContainer>
      <CardMedium
        title={userClub.clubName}
        subTitle={`${clubRosterLength} club members`}
        onPress={() =>
          navigation.navigate('My Club', {
            clubId: userClub.clubId,
            manager: userClub.manager,
          })
        }
      />
    </ScrollView>
  );
}
