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
import {t} from '@lingui/macro';
import i18n from '../../utils/i18n';
import shareLeagueLink from './actions/shareLink';
import {RequestContext} from '../../context/requestContext';
import countLeagueRequests from './countLeagueRequests';

type ScreenNavigationProp = StackNavigationProp<
  LeagueStackType,
  'League Scheduled'
>;

type Props = {
  navigation: ScreenNavigationProp;
};

export default function LeagueScheduled({navigation}: Props) {
  const [leagueReqCount, setLeagueReqCount] = useState(0);
  const [clubReqCount, setClubReqCount] = useState(0);

  // const [clubRosterLength, setClubRosterLength] = useState<number>(0);

  const context = useContext(AppContext);
  const leagueContext = useContext(LeagueContext);
  const requestContext = useContext(RequestContext);

  const leagueId = leagueContext.leagueId;
  const userClub = context.userData.leagues[leagueId];
  const isAdmin = context.userData.leagues[leagueId].admin;
  // const isManager = context.userData.leagues[leagueId].manager;
  const isPlayer = context.userData.leagues[leagueId].clubId !== undefined;
  const userLeague = context.userData!.leagues![leagueId];

  const conflictMatchesCount =
    context.userLeagues[leagueId].conflictMatchesCount;

  useEffect(() => {
    const [clubRequests, leagueRequests] = countLeagueRequests(
      requestContext.leagues,
      requestContext.clubs,
      userLeague,
      leagueContext.league.name,
    );

    setClubReqCount(clubRequests);
    setLeagueReqCount(leagueRequests);

    // if (isManager) {
    //   const clubRoster =
    //     context.userLeagues[leagueId].clubs[userClub.clubId].roster;
    //   let requests = 0;
    //   let roster = 0;
    //   for (const request of Object.values(clubRoster)) {
    //     if (!request.accepted) {
    //       requests += 1;
    //     } else {
    //       roster += 1;
    //     }
    //   }
    //   setClubReqests(requests);
    //   //  setClubRosterLength(roster);
    // }
  }, []);

  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: verticalScale(16),
      }}
      showsVerticalScrollIndicator={false}>
      {isAdmin && (
        <CardSmallContainer>
          <CardSmall
            title={i18n._(t`Report Center`)}
            subTitle={i18n._(t`Review and resolve all conflicted matches`)}
            badgeNumber={conflictMatchesCount}
            onPress={() => navigation.navigate('Report Center')}
          />
          <CardSmall
            title={i18n._(t`League Clubs`)}
            onPress={() => navigation.navigate('Clubs')}
            badgeNumber={leagueReqCount}
          />
        </CardSmallContainer>
      )}
      <CardMedium
        title={i18n._(t`League Stats`)}
        subTitle={i18n._(t`Check out the league leaders`)}
        onPress={() => navigation.navigate('Stats')}
      />
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

      {isPlayer && (
        <CardSmallContainer>
          <CardSmall
            title={userClub.clubName}
            // subTitle={`${clubRosterLength} club members`}
            badgeNumber={clubReqCount}
            onPress={() =>
              navigation.navigate('My Club', {
                clubId: userClub.clubId,
                manager: userClub.manager,
              })
            }
          />
          <CardSmall
            title={i18n._(t`Invite Players`)}
            onPress={() => shareLeagueLink(leagueContext.league.name, leagueId)}
          />
        </CardSmallContainer>
      )}
    </ScrollView>
  );
}
