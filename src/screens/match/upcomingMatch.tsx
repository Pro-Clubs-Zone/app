import React, {useContext, useEffect, useState} from 'react';
import {ScrollView, View, Alert} from 'react-native';
import {IMatchNavData} from '../../utils/interface';
import onConflictResolve from './functions/onConflictResolve';
import {AppContext} from '../../context/appContext';
import {MatchStackType} from './match';
import {RouteProp} from '@react-navigation/native';
import ScoreBoard from '../../components/scoreboard';
import {verticalScale} from 'react-native-size-matters';
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
  const [canSubmit, setCanSubmit] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

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

  useEffect(() => {
    console.log('====================================');
    console.log(matchData);
    console.log('====================================');

    const userClub = context.userData!.leagues![leagueId].clubId!;
    const isManager = matchData.teams!.includes(userClub) && matchData.manager;
    const hasSubmitted = !!matchData.submissions?.[userClub];
    const managerCanSubmit = isManager && !hasSubmitted;
    setCanSubmit(managerCanSubmit);
  }, [leagueId]);

  const decrementConflictCounter = () => {
    const leagueData = {...context.userLeagues};
    const userData = {...context.userData};
    leagueData[matchData.leagueId].conflictMatchesCount -= 1;
    userData.adminConflictCounts -= 1;

    context.setUserLeagues(leagueData);
    context.setUserData(userData);
  };

  const showAlert = () => {
    const title = i18n._(t`Conflict Resolved`);
    const body = i18n._(t`Match was published with the selected result`);

    let foundUserMatch = context.userMatches.filter(
      (match) => match.id === matchData.matchId,
    );

    if (foundUserMatch.length !== 0) {
      let notPublishedMatches = context.userMatches.filter(
        (match) => match.id !== matchData.matchId,
      );

      context.setUserMatches(notPublishedMatches);
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
      showAlert();
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
      <ScoreBoard data={matchData} editable={false} canSubmit={canSubmit} />
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
