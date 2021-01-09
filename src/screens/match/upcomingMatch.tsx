import React, {useContext, useEffect, useState} from 'react';
import {Button, Text, View, FlatList} from 'react-native';
import {FixtureList, IMatch, IMatchNavData} from '../../utils/interface';
import onSubmitMatch from './functions/onSubmitMatch';
import onConflictResolve from './functions/onConflictResolve';
import {AppContext} from '../../context/appContext';
import {MatchStackType} from './match';
import {RouteProp} from '@react-navigation/native';
import ScoreBoard from '../../components/scoreboard';
import {MatchTextField} from '../../components/textField';
import {ScaledSheet} from 'react-native-size-matters';
import {APP_COLORS} from '../../utils/designSystem';
import {LeagueContext} from '../../context/leagueContext';
import firestore from '@react-native-firebase/firestore';
import FixtureItem from '../../components/fixtureItems';
import EmptyState from '../../components/emptyState';
import i18n from '../../utils/i18n';
import {ListHeading, ListSeparator} from '../../components/listItems';
import {t} from '@lingui/macro';
import FullScreenLoading from '../../components/loading';
import {StackNavigationProp} from '@react-navigation/stack';

type ScreenRouteProp = RouteProp<MatchStackType, 'Upcoming Match'>;
type ScreenNavigationProp = StackNavigationProp<
  MatchStackType,
  'Finished Match'
>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

const db = firestore();

export default function UpcomingMatch({navigation, route}: Props) {
  const [homeScore, setHomeScore] = useState<string>();
  const [awayScore, setAwayScore] = useState<string>();
  const [editable, setEditable] = useState<boolean>();
  const [pastMatches, setPastMatches] = useState<FixtureList[]>([]);
  const [loading, setLoading] = useState<boolean>();

  const context = useContext(AppContext);
  const leagueContext = useContext(LeagueContext);

  const leagueId = leagueContext.leagueId;
  const matchData: IMatchNavData = route.params.matchData;

  useEffect(() => {
    const userClub = context.userData.leagues[leagueId].clubId;
    const isManager = matchData.teams.includes(userClub) && matchData.manager;
    const hasSubmitted = !!matchData.submissions?.[userClub];
    const canSubmit = isManager && !hasSubmitted;

    setEditable(canSubmit);
  }, [leagueId]);

  useEffect(() => {
    let matches: FixtureList[] = [];
    const leagueRef = db
      .collection('leagues')
      .doc(leagueId)
      .collection('matches');

    leagueRef
      .where('teams', 'in', [matchData.teams, matchData.teams.reverse()])
      .where('published', '==', true)
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const data = doc.data() as IMatch;
          const matchId = doc.id;
          const match: IMatchNavData = {
            ...data,
            homeTeamName:
              context.userLeagues[leagueId].clubs[data.homeTeamId].name,
            awayTeamName:
              context.userLeagues[leagueId].clubs[data.awayTeamId].name,
            clubId: matchData.clubId,
            manager: matchData.manager,
            matchId: matchId,
            leagueId: leagueId,
            leagueName: matchData.leagueName,
            admin: matchData.admin,
          };

          const fixture: FixtureList = {
            key: matchId,
            data: match,
          };
          matches.push(fixture);
        });
      })
      .then(() => {
        setPastMatches(matches);
        setLoading(false);
      });
  }, [leagueId]);

  const decrementConflictCounter = () => {
    const leagueData = {...context.userLeagues};
    leagueData[matchData.leagueId].conflictMatchesCount -= 1;
    context.setUserLeagues(leagueData);
  };

  return (
    <View>
      <ScoreBoard
        data={matchData}
        onSubmit={() =>
          onSubmitMatch(homeScore, awayScore, matchData).then(() => {
            navigation.goBack();
          })
        }
        editable={editable}>
        <MatchTextField
          // error={
          //   data.scoresErrors && data.scoresErrors[data.team1]
          //     ? true
          //     : false
          // }
          onChangeText={(score: string) => setHomeScore(score)}
          value={homeScore}
        />
        <View style={styles.divider} />
        <MatchTextField
          // error={
          //   data.scoresErrors && data.scoresErrors[data.team2]
          //     ? true
          //     : false
          // }
          onChangeText={(score: string) => setAwayScore(score)}
          value={awayScore}
        />
      </ScoreBoard>
      {matchData.conflict && matchData.admin ? (
        <MatchConflict
          data={matchData}
          onSelectHome={() =>
            onConflictResolve(matchData, matchData.homeTeamId).then(
              () => decrementConflictCounter,
            )
          }
          onSelectAway={() =>
            onConflictResolve(matchData, matchData.awayTeamId).then(
              () => decrementConflictCounter,
            )
          }
        />
      ) : (
        <FlatList
          data={pastMatches}
          ListHeaderComponent={() => <ListHeading col1="Past Fixtures" />}
          renderItem={({item}) => (
            <FixtureItem
              matchId={item.data.id}
              homeTeamName={item.data.homeTeamName}
              awayTeamName={item.data.awayTeamName}
              homeTeamScore={item.data.result[item.data.homeTeamId]}
              awayTeamScore={item.data.result[item.data.awayTeamId]}
              conflict={false}
              onPress={() =>
                navigation.navigate('Finished Match', {
                  matchData: item.data,
                })
              }
            />
          )}
          keyExtractor={(item) => item.data.matchId}
          ItemSeparatorComponent={() => <ListSeparator />}
          ListEmptyComponent={() => (
            <EmptyState title={i18n._(t`No Fixtures`)} />
          )}
          contentContainerStyle={{
            justifyContent: pastMatches.length === 0 ? 'center' : null,
            flexGrow: 1,
          }}
          stickyHeaderIndices={[0]}
        />
      )}
    </View>
  );
}

const MatchConflict = (props) => {
  const data: IMatchNavData = props.data;
  return (
    <View>
      <Text>This is conflict match</Text>
      <View>
        <Text>Home Team: {data.homeTeamName}</Text>
        <View>
          <Text>Home Team: {data.homeTeamName}</Text>
          <Text>{data.submissions[data.homeTeamId][data.homeTeamId]}</Text>
        </View>
        <View>
          <Text>Away Team: {data.awayTeamName}</Text>
          <Text>{data.submissions[data.awayTeamId][data.awayTeamId]}</Text>
        </View>
        <Button title="select home" onPress={props.onSelectHome} />
      </View>
      <View>
        <Text>Away Team: {data.awayTeamName}</Text>
        <View>
          <Text>Home Team: {data.homeTeamName}</Text>
          <Text>{data.submissions[data.awayTeamId][data.homeTeamId]}</Text>
        </View>
        <View>
          <Text>Away Team: {data.awayTeamName}</Text>
          <Text>{data.submissions[data.awayTeamId][data.awayTeamId]}</Text>
        </View>
        <Button title="select away" onPress={props.onSelectAway} />
      </View>
    </View>
  );
};

const styles = ScaledSheet.create({
  divider: {
    height: '3@vs',
    width: '8@vs',
    backgroundColor: APP_COLORS.Accent,
    marginHorizontal: '8@vs',
  },
});
