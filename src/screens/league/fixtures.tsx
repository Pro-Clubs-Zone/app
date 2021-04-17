import React, {useContext} from 'react';
import {FlatList, View} from 'react-native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import useGetMatches from './actions/useGetMatches';
// import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {LeagueStackType} from './league';
import {LeagueContext} from '../../context/leagueContext';
import FixtureItem from '../../components/fixtureItems';
import {MinButton} from '../../components/buttons';
import {ListSeparator} from '../../components/listItems';
import EmptyState from '../../components/emptyState';
import {t} from '@lingui/macro';
import i18n from '../../utils/i18n';
import FullScreenLoading from '../../components/loading';
import firestore from '@react-native-firebase/firestore';
import {verticalScale} from 'react-native-size-matters';

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

const db = firestore();

export default function Fixtures(/*{route}: Props*/) {
  return (
    <Tab.Navigator lazy={true}>
      <Tab.Screen name="Upcoming" component={UpcomingFixtures} />
      <Tab.Screen name="Past" component={PastFixtures} />
    </Tab.Navigator>
  );
}

function UpcomingFixtures({navigation}: Props) {
  const leagueContext = useContext(LeagueContext);
  const leagueId = leagueContext.leagueId;

  const leagueRef = db
    .collection('leagues')
    .doc(leagueId)
    .collection('matches');

  const query = leagueRef
    .where('published', '==', false)
    .where('conflict', 'in', [true, false]);

  const getMatches = useGetMatches(leagueId, query);

  return (
    <>
      <FullScreenLoading visible={getMatches.loading} />
      <FlatList
        data={getMatches.data}
        renderItem={({item}) => (
          <FixtureItem
            matchId={item.data.id}
            homeTeamName={item.data.homeTeamName}
            awayTeamName={item.data.awayTeamName}
            conflict={item.data.conflict || item.data.motmConflict}
            hasSubmission={
              item.data.submissions &&
              Object.keys(item.data.submissions).length === 1
            }
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
          justifyContent: getMatches.data.length === 0 ? 'center' : undefined,
          flexGrow: 1,
        }}
        // getItemLayout={(item, index) => ({
        //   length: verticalScale(64),
        //   offset: verticalScale(65) * index,
        //   index,
        // })}
        ListFooterComponent={
          getMatches.data.length !== 0 &&
          !getMatches.allLoaded && (
            <View
              style={{
                paddingBottom: verticalScale(24),
              }}>
              <MinButton
                title={i18n._(t`Load more`)}
                onPress={getMatches.onLoadMore}
              />
            </View>
          )
        }
      />
    </>
  );
}

export function PastFixtures({navigation}: Props) {
  const leagueContext = useContext(LeagueContext);
  const leagueId = leagueContext.leagueId;

  const leagueRef = db
    .collection('leagues')
    .doc(leagueId)
    .collection('matches');

  const query = leagueRef
    .where('published', '==', true)
    .where('conflict', 'in', [false]);

  const getMatches = useGetMatches(leagueId, query);

  return (
    <FlatList
      data={getMatches.data}
      renderItem={({item}) => (
        <FixtureItem
          matchId={item.data.id}
          homeTeamName={item.data.homeTeamName}
          awayTeamName={item.data.awayTeamName}
          homeTeamScore={item.data.result![item.data.homeTeamId]}
          awayTeamScore={item.data.result![item.data.awayTeamId]}
          conflict={false}
          onPress={() =>
            navigation.navigate('Match', {
              matchData: item.data,
              upcoming: false,
            })
          }
        />
      )}
      keyExtractor={(item) => item.data.matchId}
      ItemSeparatorComponent={() => <ListSeparator />}
      ListEmptyComponent={() => <EmptyState title={i18n._(t`No Fixtures`)} />}
      contentContainerStyle={{
        justifyContent: getMatches.data.length === 0 ? 'center' : undefined,
        flexGrow: 1,
      }}
      // getItemLayout={(item, index) => ({
      //   length: verticalScale(64),
      //   offset: verticalScale(65) * index,
      //   index,
      // })}
      ListFooterComponent={
        getMatches.data.length !== 0 &&
        !getMatches.allLoaded && (
          <View
            style={{
              paddingBottom: verticalScale(24),
            }}>
            <MinButton
              title={i18n._(t`Load more`)}
              onPress={getMatches.onLoadMore}
            />
          </View>
        )
      }
    />
  );
}
