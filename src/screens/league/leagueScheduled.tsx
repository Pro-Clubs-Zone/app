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
import {t} from '@lingui/macro';
import i18n from '../../utils/i18n';
import shareLeagueLink from './actions/shareLink';
import {RequestContext} from '../../context/requestContext';
import countLeagueRequests from './actions/countLeagueRequests';

type ScreenNavigationProp = StackNavigationProp<
  LeagueStackType,
  'League Scheduled'
>;

type Props = {
  navigation: ScreenNavigationProp;
};

export default function LeagueScheduled({navigation}: Props) {
  // const [leagueReqCount, setLeagueReqCount] = useState(0);
  // const [clubReqCount, setClubReqCount] = useState(0);

  // const [clubRosterLength, setClubRosterLength] = useState<number>(0);

  const context = useContext(AppContext);
  const leagueContext = useContext(LeagueContext);
  const requestContext = useContext(RequestContext);

  const leagueId = leagueContext.leagueId;
  const userLeague = context.userData!.leagues![leagueId];

  const isAdmin = userLeague.admin;
  // const isManager = context.userData.leagues[leagueId].manager;
  const isPlayer = userLeague.clubId !== undefined;

  const conflictMatchesCount =
    context.userLeagues?.[leagueId].conflictMatchesCount;

  const [clubRequests, leagueRequests] = countLeagueRequests(
    requestContext.leagues,
    requestContext.clubs,
    userLeague,
    leagueContext.league.name,
  );

  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: verticalScale(16),
      }}
      showsVerticalScrollIndicator={false}>
      {isAdmin && (
        <CardSmallContainer>
          <CardSmall
            title={i18n._(t`Admin Center`)}
            subTitle={i18n._(t`Review and resolve all conflicted matches`)}
            badgeNumber={conflictMatchesCount}
            onPress={() => navigation.navigate('Admin Center')}
          />
          <CardSmall
            title={i18n._(t`League Clubs`)}
            onPress={() =>
              navigation.navigate('Clubs', {
                isAdmin: isAdmin,
                newLeague: false,
                scheduled: true,
              })
            }
            badgeNumber={leagueRequests}
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
        <CardMedium
          title={userLeague.clubName}
          // subTitle={`${clubRosterLength} club members`}
          badgeNumber={clubRequests}
          onPress={() =>
            navigation.navigate('My Club', {
              clubId: userLeague.clubId,
              manager: userLeague.manager,
            })
          }
        />
      )}
      <CardSmallContainer>
        <CardSmall
          title={i18n._(t`Transfer History`)}
          onPress={() =>
            navigation.navigate('Transfer History', {
              leagueId: leagueId,
            })
          }
        />
        <CardSmall
          title={i18n._(t`Invite Players`)}
          onPress={() => shareLeagueLink(leagueContext.league.name, leagueId)}
        />
      </CardSmallContainer>
    </ScrollView>
  );
}
