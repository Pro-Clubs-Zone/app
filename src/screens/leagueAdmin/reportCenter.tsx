import React, {useContext} from 'react';
import {FlatList} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
// import {RouteProp} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
// import {IMatchNavData} from '../../utils/interface';
// import {AppContext} from '../../context/appContext';
import {LeagueStackType} from '../league/league';
import {LeagueContext} from '../../context/leagueContext';
import {ListSeparator} from '../../components/listItems';
import EmptyState from '../../components/emptyState';
import {t} from '@lingui/macro';
import i18n from '../../utils/i18n';
import FixtureItem from '../../components/fixtureItems';
import useGetMatches from '../league/functions/useGetMatches';
import {MinButton} from '../../components/buttons';

type ScreenNavigationProp = StackNavigationProp<
  LeagueStackType,
  'Report Center'
>;

type Props = {
  navigation: ScreenNavigationProp;
};

const db = firestore();

export default function ReportCenter({navigation}: Props) {
  const leagueContext = useContext(LeagueContext);

  const leagueId = leagueContext.leagueId;

  const leagueRef = db
    .collection('leagues')
    .doc(leagueId)
    .collection('matches');

  const query = leagueRef
    .where('published', '==', false)
    .where('conflict', 'in', [true]);

  const getMatches = useGetMatches(leagueId, query);

  return (
    <FlatList
      data={getMatches.data}
      renderItem={({item}) => (
        <FixtureItem
          matchId={item.data.id}
          homeTeamName={item.data.homeTeamName}
          awayTeamName={item.data.awayTeamName}
          conflict={item.data.conflict}
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
      ListEmptyComponent={() => <EmptyState title={i18n._(t`No Fixtures`)} />}
      contentContainerStyle={{
        justifyContent: getMatches.data.length === 0 ? 'center' : null,
        flexGrow: 1,
      }}
      ListFooterComponent={() =>
        getMatches.data.length !== 0 &&
        !getMatches.allLoaded && (
          <MinButton
            title={i18n._(t`Load more`)}
            onPress={getMatches.onLoadMore}
          />
        )
      }
    />
  );
}
