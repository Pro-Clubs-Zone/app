import React, {useContext, useEffect, useState} from 'react';
import {ScrollView, View, FlatList, Alert} from 'react-native';
import {IMatchNavData} from '../../utils/interface';
import onSubmitMatch from './functions/onSubmitMatch';
import onConflictResolve from './functions/onConflictResolve';
import {AppContext} from '../../context/appContext';
import {MatchStackType} from './match';
import {RouteProp} from '@react-navigation/native';
import ScoreBoard from '../../components/scoreboard';
import {MatchTextField} from '../../components/textField';
import {ScaledSheet, verticalScale} from 'react-native-size-matters';
import {APP_COLORS} from '../../utils/designSystem';
import firestore from '@react-native-firebase/firestore';
import FixtureItem from '../../components/fixtureItems';
import EmptyState from '../../components/emptyState';
import i18n from '../../utils/i18n';
import {ListHeading, ListSeparator} from '../../components/listItems';
import {t} from '@lingui/macro';
import FullScreenLoading from '../../components/loading';
import {StackNavigationProp} from '@react-navigation/stack';
import useGetMatches from '../league/functions/useGetMatches';
import MatchConflictItem from '../../components/matchConflictItem';

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
  const [loading, setLoading] = useState<boolean>(false);

  const context = useContext(AppContext);

  const leagueId = route.params.matchData.leagueId;
  const matchData: IMatchNavData = route.params.matchData;

  const leagueRef = db
    .collection('leagues')
    .doc(leagueId)
    .collection('matches');

  const query = leagueRef
    .where('teams', 'in', [matchData.teams, matchData.teams.reverse()])
    .where('published', '==', true);

  const getMatches = useGetMatches(leagueId, query);

  useEffect(() => {
    console.log('====================================');
    console.log(matchData);
    console.log('====================================');
    const userClub = context.userData.leagues[leagueId].clubId;
    const isManager = matchData.teams.includes(userClub) && matchData.manager;
    const hasSubmitted = !!matchData.submissions?.[userClub];
    const canSubmit = isManager && !hasSubmitted;

    setEditable(canSubmit);
  }, [leagueId]);

  const decrementConflictCounter = () => {
    const leagueData = {...context.userLeagues};
    leagueData[matchData.leagueId].conflictMatchesCount -= 1;
    context.setUserLeagues(leagueData);
  };

  const showAlert = (submissionResult: string) => {
    let title: string;
    let body: string;

    switch (submissionResult) {
      case 'Success':
        title = 'Results Published';
        body = 'Publish Message';
        break;
      case 'Conflict':
        title = 'Submission Conflict';
        body = 'Conflict Message';
        break;
      case 'First Submission':
        title = 'Submission Succesfull';
        body = 'Success Message';
        break;
      case 'Conflict Resolved':
        title = 'Conflict Resolved';
        body = 'Match was published with the selected result';
        break;
    }

    Alert.alert(
      title,
      body,
      [
        {
          text: 'Close',
          onPress: () => {
            setLoading(false);
            navigation.goBack();
          },
        },
      ],
      {cancelable: false},
    );
  };

  const onSelectResult = (id: string) => {
    onConflictResolve(matchData, id).then((result) => {
      decrementConflictCounter;
      showAlert(result);
    });
  };

  return (
    <View
      style={{
        flex: 1,
      }}>
      <FullScreenLoading visible={loading} />
      <ScoreBoard
        data={matchData}
        onSubmit={() => {
          setLoading(true);
          onSubmitMatch(homeScore, awayScore, matchData).then((result) => {
            //      setLoading(false);
            showAlert(result);
          });
        }}
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
          onSelectHome={() => {
            onSelectResult(matchData.homeTeamId);
          }}
          onSelectAway={() => {
            onSelectResult(matchData.awayTeamId);
          }}
        />
      ) : (
        <FlatList
          data={getMatches.data}
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
            justifyContent: getMatches.data.length === 0 ? 'center' : null,
            flexGrow: 1,
          }}
          stickyHeaderIndices={[0]}
        />
      )}
    </View>
  );
}

const MatchConflict = ({
  onSelectHome,
  onSelectAway,
  data,
}: {
  onSelectHome: () => void;
  onSelectAway: () => void;
  data: IMatchNavData;
}) => {
  return (
    <ScrollView
      stickyHeaderIndices={[0]}
      contentContainerStyle={{paddingBottom: verticalScale(32)}}>
      <ListHeading col1="Conflict Match" />
      <MatchConflictItem
        header={`${data.homeTeamName} Submission`}
        homeTeam={data.homeTeamName}
        awayTeam={data.awayTeamName}
        homeScore={data.submissions[data.homeTeamId][data.homeTeamId]}
        awayScore={data.submissions[data.homeTeamId][data.awayTeamId]}
        onPickResult={onSelectHome}
      />
      <MatchConflictItem
        header={`${data.awayTeamName} Submission`}
        homeTeam={data.homeTeamName}
        awayTeam={data.awayTeamName}
        homeScore={data.submissions[data.awayTeamId][data.homeTeamId]}
        awayScore={data.submissions[data.awayTeamId][data.awayTeamId]}
        onPickResult={onSelectAway}
      />
    </ScrollView>
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
