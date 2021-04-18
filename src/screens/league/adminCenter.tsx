import React, {useContext} from 'react';
import {FlatList} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
// import {RouteProp} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
// import {IMatchNavData} from '../../utils/interface';
// import {AppContext} from '../../context/appContext';
import {LeagueStackType} from './league';
import {LeagueContext} from '../../context/leagueContext';
import {ListSeparator} from '../../components/listItems';
import EmptyState from '../../components/emptyState';
import {t} from '@lingui/macro';
import i18n from '../../utils/i18n';
import FixtureItem from '../../components/fixtureItems';
import useMatchData from './actions/useGetMatches';

type ScreenNavigationProp = StackNavigationProp<
  LeagueStackType,
  'Admin Center'
>;

type Props = {
  navigation: ScreenNavigationProp;
};

const db = firestore();

export default function AdminCenter({navigation}: Props) {
  const leagueContext = useContext(LeagueContext);

  const leagueId = leagueContext.leagueId;

  const leagueRef = db
    .collection('leagues')
    .doc(leagueId)
    .collection('matches');

  const singleSubmissionsQuery = leagueRef
    .where('published', '==', false)
    .where('submissionCount', '==', 1);

  const conflictSubmissionsQuery = leagueRef
    .where('published', '==', false)
    .where('conflict', 'in', [true]);

  const singleSubmissions = useMatchData(leagueId, singleSubmissionsQuery);
  const conflictMatches = useMatchData(leagueId, conflictSubmissionsQuery);
  const matchData = [...singleSubmissions.data, ...conflictMatches.data];

  return (
    <FlatList
      data={matchData}
      renderItem={({item}) => (
        <FixtureItem
          matchId={item.data.id}
          homeTeamName={item.data.homeTeamName}
          awayTeamName={item.data.awayTeamName}
          conflict={item.data.conflict}
          hasSubmission={item.data.submissionCount === 1}
          onPress={() =>
            navigation.navigate('Match', {
              matchData: item.data,
              upcoming: true,
            })
          }
        />
      )}
      keyExtractor={(item) => item.data.matchId}
      ItemSeparatorComponent={() => <ListSeparator />}
      ListEmptyComponent={() => (
        <EmptyState
          title={i18n._(t`No fixtures`)}
          body={i18n._(
            t`All conflicted and single-submission fixtures will appear here`,
          )}
        />
      )}
      contentContainerStyle={{
        justifyContent: matchData.length === 0 ? 'center' : null,
        flexGrow: 1,
      }}
      // ListFooterComponent={() =>
      //   matchData.data.length !== 0 &&
      //   !matchData.allLoaded && (
      //     <MinButton
      //       title={i18n._(t`Load more`)}
      //       onPress={matchData.onLoadMore}
      //     />
      //   )
      // }
    />
  );
}
