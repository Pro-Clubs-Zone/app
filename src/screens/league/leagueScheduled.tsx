import React, {useContext, useEffect, useState} from 'react';
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
  const [clubRequests, setClubReqests] = useState<number>(0);
  const [clubRosterLength, setClubRosterLength] = useState<number>(0);

  const context = useContext(AppContext);
  const leagueContext = useContext(LeagueContext);

  const leagueId = leagueContext.leagueId;
  const userClub = context.userData.leagues[leagueId];
  const isAdmin = context.userData.leagues[leagueId].admin;
  const conflictMatchesCount =
    context.userLeagues[leagueId].conflictMatchesCount;

  useEffect(() => {
    console.log('use effect running');

    const clubRoster =
      context.userLeagues[leagueId].clubs[userClub.clubId].roster;
    let requests = 0;
    let roster = 0;
    for (const request of Object.values(clubRoster)) {
      if (!request.accepted) {
        requests += 1;
      } else {
        roster += 1;
      }
    }
    setClubReqests(requests);
    setClubRosterLength(roster);
  }, []);

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
        badgeNumber={clubRequests}
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
