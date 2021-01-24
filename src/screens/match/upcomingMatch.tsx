import React, {useContext, useEffect, useState} from 'react';
import {ScrollView, View, Alert} from 'react-native';
import {IMatchNavData} from '../../utils/interface';
import submitMatch from './functions/onSubmitMatch';
import onConflictResolve from './functions/onConflictResolve';
import {AppContext} from '../../context/appContext';
import {MatchStackType} from './match';
import {RouteProp} from '@react-navigation/native';
import ScoreBoard from '../../components/scoreboard';
import {MatchTextField} from '../../components/textField';
import {ScaledSheet, verticalScale} from 'react-native-size-matters';
import {APP_COLORS} from '../../utils/designSystem';
//import firestore from '@react-native-firebase/firestore';
import EmptyState from '../../components/emptyState';
import i18n from '../../utils/i18n';
import {ListHeading} from '../../components/listItems';
import {t} from '@lingui/macro';
import FullScreenLoading from '../../components/loading';
import {StackNavigationProp} from '@react-navigation/stack';
//import useGetMatches from '../league/functions/useGetMatches';
import MatchConflictItem from '../../components/matchConflictItem';
import analytics from '@react-native-firebase/analytics';

type ScreenRouteProp = RouteProp<MatchStackType, 'Upcoming Match'>;
type ScreenNavigationProp = StackNavigationProp<
  MatchStackType,
  'Upcoming Match'
>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

//const db = firestore();

export default function UpcomingMatch({navigation, route}: Props) {
  const [homeScore, setHomeScore] = useState<string>('');
  const [awayScore, setAwayScore] = useState<string>('');
  const [editable, setEditable] = useState<boolean>();
  const [loading, setLoading] = useState<boolean>(false);
  const [errorStates, setErrorStates] = useState({
    homeScore: null,
    awayScore: null,
  });

  const context = useContext(AppContext);

  const leagueId = route.params.matchData.leagueId;
  const matchData: IMatchNavData = route.params.matchData;
  // const leagueRef = db
  //   .collection('leagues')
  //   .doc(leagueId)
  //   .collection('matches');

  // const query = leagueRef
  //   .where('homeTeamId', 'in', matchData.teams)
  //   .where('teams', 'array-contains', '')
  //   .where('published', '==', true);

  // const getMatches = useGetMatches(leagueId, query);

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
    const userData = {...context.userData};
    leagueData[matchData.leagueId].conflictMatchesCount -= 1;
    userData.adminConflictCounts -= 1;

    context.setUserLeagues(leagueData);
    context.setUserData(userData);
  };

  const showAlert = (submissionResult: string) => {
    let title: string;
    let body: string;

    let conflict: boolean = false;

    switch (submissionResult) {
      case 'Success':
        title = i18n._(t`Result Submitted`);
        body = i18n._(t`Match was published with the selected result`);
        break;
      case 'Conflict':
        title = i18n._(t`Match will be reviewed`);
        body = i18n._(t`Match cannot be published due to conflict.`);
        conflict = true;
        break;
      case 'First Submission':
        title = i18n._(t`Result Submitted`);
        body = i18n._(
          t`Match will be published once opponent submits their result`,
        );
        break;
      case 'Conflict Resolved':
        title = i18n._(t`Conflict Resolved`);
        body = i18n._(t`Match was published with the selected result`);
        break;
    }

    let foundUserMatch = context.userMatches.filter(
      (match) => match.id === matchData.matchId,
    );

    if (foundUserMatch.length !== 0) {
      let notPublishedMatches = context.userMatches.filter(
        (match) => match.id !== matchData.matchId,
      );

      if (
        submissionResult === 'Success' ||
        submissionResult === 'Conflict Resolved'
      ) {
        context.setUserMatches(notPublishedMatches);
      }
      if (
        submissionResult === 'First Submission' ||
        submissionResult === 'Conflict'
      ) {
        let userUpcomingMatch = {...foundUserMatch[0]};
        userUpcomingMatch.data.conflict = conflict;
        userUpcomingMatch.data.submissions = {
          [matchData.clubId]: {
            [matchData.homeTeamId]: Number(homeScore),
            [matchData.awayTeamId]: Number(awayScore),
          },
        };
        const updatedMatchList = [userUpcomingMatch, ...notPublishedMatches];
        context.setUserMatches(updatedMatchList);
      }
    }

    Alert.alert(
      title,
      body,
      [
        {
          text: i18n._(t`Close`),
          onPress: () => {
            setLoading(false);
            navigation.goBack();
          },
        },
      ],
      {cancelable: false},
    );
  };

  const onSelectResult = async (id: string) => {
    setLoading(true);
    await onConflictResolve(matchData, id).then(async (result) => {
      await analytics().logEvent('match_resolve_conflict');
      decrementConflictCounter();
      showAlert(result);
    });
  };

  const fieldValidation = async (): Promise<boolean> => {
    const regex = new RegExp('^[0-9]*$');

    if (!regex.test(homeScore) || !regex.test(awayScore)) {
      setErrorStates({
        awayScore: !regex.test(awayScore),
        homeScore: !regex.test(homeScore),
      });
      return false;
    }

    if (!homeScore || !awayScore) {
      setErrorStates({awayScore: !awayScore, homeScore: !homeScore});
      return false;
    }

    return true;
  };

  const onChangeText = (text: string, field: 'homeScore' | 'awayScore') => {
    switch (field) {
      case 'homeScore':
        setHomeScore(text);
        break;
      case 'awayScore':
        setAwayScore(text);
        break;
    }

    if (errorStates[field]) {
      setErrorStates({...errorStates, [field]: null});
    }
  };

  const onSubmitMatch = async () => {
    fieldValidation().then(async (noErrors) => {
      if (noErrors) {
        setLoading(true);
        await submitMatch(homeScore, awayScore, matchData).then(
          async (result) => {
            await analytics().logEvent('match_submit_score');
            showAlert(result);
          },
        );
      }
    });
  };

  return (
    <View
      style={{
        flex: 1,
      }}>
      <FullScreenLoading visible={loading} />
      <ScoreBoard data={matchData} onSubmit={onSubmitMatch} editable={editable}>
        <MatchTextField
          error={errorStates.homeScore}
          onChangeText={(score: string) => onChangeText(score, 'homeScore')}
          value={homeScore}
        />
        <View style={styles.divider} />
        <MatchTextField
          error={errorStates.awayScore}
          onChangeText={(score: string) => onChangeText(score, 'awayScore')}
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
        // <FlatList
        //   data={getMatches.data}
        //   ListHeaderComponent={() => <ListHeading col1="Past Fixtures" />}
        //   renderItem={({item}) => (
        //     <FixtureItem
        //       matchId={item.data.id}
        //       homeTeamName={item.data.homeTeamName}
        //       awayTeamName={item.data.awayTeamName}
        //       homeTeamScore={item.data.result[item.data.homeTeamId]}
        //       awayTeamScore={item.data.result[item.data.awayTeamId]}
        //       conflict={false}
        //       onPress={() =>
        //         navigation.navigate('Finished Match', {
        //           matchData: item.data,
        //         })
        //       }
        //     />
        //   )}
        //   keyExtractor={(item) => item.data.matchId}
        //   ItemSeparatorComponent={() => <ListSeparator />}
        //   ListEmptyComponent={() => (
        //     <EmptyState title={i18n._(t`No Fixtures`)} />
        //   )}
        //   contentContainerStyle={{
        //     justifyContent: getMatches.data.length === 0 ? 'center' : null,
        //     flexGrow: 1,
        //   }}
        //   stickyHeaderIndices={[0]}
        // />
        <EmptyState
          title={i18n._(t`Past Fixtures`)}
          body={i18n._(t`Coming Soon`)}
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
      <ListHeading col1={i18n._(t`Conflict Match`)} />
      <MatchConflictItem
        header={i18n._(t`${data.homeTeamName} Submission`)}
        homeTeam={data.homeTeamName}
        awayTeam={data.awayTeamName}
        homeScore={data.submissions[data.homeTeamId][data.homeTeamId]}
        awayScore={data.submissions[data.homeTeamId][data.awayTeamId]}
        onPickResult={onSelectHome}
      />
      <MatchConflictItem
        header={i18n._(t`${data.awayTeamName} Submission`)}
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
