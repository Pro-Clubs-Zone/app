import React, {useContext, useEffect, useState} from 'react';
import {ScrollView, View, Alert} from 'react-native';
import {IMatchNavData} from '../../utils/interface';
import submitMatch from './functions/onSubmitMatch';
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
  const [loading, setLoading] = useState<boolean>(false);
  const [errorStates, setErrorStates] = useState({
    homeScore: false,
    awayScore: false,
  });

  const context = useContext(AppContext);

  const leagueId = route.params.matchData.leagueId;
  const matchData: IMatchNavData = route.params!.matchData;
  // const leagueRef = db
  //   .collection('leagues')
  //   .doc(leagueId)
  //   .collection('matches');

  // const query = leagueRef
  //   .where('homeTeamId', 'in', matchData.teams)
  //   .where('teams', 'array-contains', '')
  //   .where('published', '==', true);

  // const getMatches = useGetMatches(leagueId, query);

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
    }

    let foundUserMatch = context.userMatches.filter(
      (match) => match.id === matchData.matchId,
    );

    if (foundUserMatch.length !== 0) {
      let notPublishedMatches = context.userMatches.filter(
        (match) => match.id !== matchData.matchId,
      );

      if (submissionResult === 'Success') {
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
      setErrorStates({...errorStates, [field]: false});
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
      <FullScreenLoading
        visible={loading}
        label={i18n._(t`Submitting Match...`)}
      />
      <ScoreBoard
        data={matchData}
        onSubmit={onSubmitMatch}
        editable={true}
        canSubmit={true}>
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
      <EmptyState title={i18n._(t`Match info`)} />
    </View>
  );
}

const styles = ScaledSheet.create({
  divider: {
    height: '3@vs',
    width: '8@vs',
    backgroundColor: APP_COLORS.Accent,
    marginHorizontal: '8@vs',
  },
});
