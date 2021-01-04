import React, {useContext} from 'react';
import {FlatList} from 'react-native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import useGetMatches from './functions/useGetMatches';
// import {RouteProp} from '@react-navigation/native';
// import {StackNavigationProp} from '@react-navigation/stack';
// import {LeagueStackType} from './league';
import {LeagueContext} from '../../context/leagueContext';
import FixtureItem from '../../components/fixtureItems';
import {MinButton} from '../../components/buttons';
import {ListSeparator} from '../../components/listItems';
import EmptyState from '../../components/emptyState';
import {t} from '@lingui/macro';
import i18n from '../../utils/i18n';
// import {verticalScale} from 'react-native-size-matters';

type FixturesStack = {
  Upcoming: {leagueId: string};
  Past: {leagueId: string};
};

const Tab = createMaterialTopTabNavigator<FixturesStack>();

type ScreenNavigationProp = StackNavigationProp<LeagueStackType, 'Fixtures'>;
// type ScreenRouteProp = RouteProp<LeagueStackType, 'Fixtures'>;

type Props = {
  navigation: ScreenNavigationProp;
  // route: ScreenRouteProp;
};

export default function Fixtures(/*{route}: Props*/) {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Upcoming" component={UpcomingFixtures} />
      <Tab.Screen name="Past" component={PastFixtures} />
    </Tab.Navigator>
  );
}

function UpcomingFixtures({navigation}: Props) {
  const leagueContext = useContext(LeagueContext);
  const leagueId = leagueContext.leagueId;

  const getMatches = useGetMatches(leagueId, false, [true, false]);

  return (
    <FlatList
      data={getMatches.data}
      renderItem={({item}) => (
        <FixtureItem
          homeTeamName={item.data.homeTeamName}
          awayTeamName={item.data.awayTeamName}
          conflict={item.data.conflict}
          onPress={() =>
            navigation.navigate('Match', {
              matchInfo: item.data,
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
      // getItemLayout={(item, index) => ({
      //   length: verticalScale(64),
      //   offset: verticalScale(65) * index,
      //   index,
      // })}
      ListFooterComponent={() =>
        getMatches.data.length !== 0 &&
        !getMatches.allLoaded && (
          <MinButton title="load more" onPress={getMatches.onLoadMore} />
        )
      }
    />
  );
}

export function PastFixtures({navigation}: Props) {
  const leagueContext = useContext(LeagueContext);
  const leagueId = leagueContext.leagueId;

  const getMatches = useGetMatches(leagueId, true, [true, false]);

  return (
    <FlatList
      data={getMatches.data}
      renderItem={({item}) => (
        <FixtureItem
          homeTeamName={item.data.homeTeamName}
          awayTeamName={item.data.awayTeamName}
          homeTeamScore={item.data.result[item.data.home]}
          awayTeamScore={item.data.result[item.data.away]}
          conflict={false}
          onPress={() =>
            navigation.navigate('Match', {
              matchInfo: item.data,
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
      // getItemLayout={(item, index) => ({
      //   length: verticalScale(64),
      //   offset: verticalScale(65) * index,
      //   index,
      // })}
      ListFooterComponent={() =>
        getMatches.data.length !== 0 &&
        !getMatches.allLoaded && (
          <MinButton title="load more" onPress={getMatches.onLoadMore} />
        )
      }
    />
  );
}
