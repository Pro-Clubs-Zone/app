import React, {useContext} from 'react';
import {Text, View, FlatList, Button} from 'react-native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import useGetMatches from './functions/useGetMatches';
// import {RouteProp} from '@react-navigation/native';
// import {StackNavigationProp} from '@react-navigation/stack';
// import {LeagueStackType} from './league';
import {LeagueContext} from '../../context/leagueContext';

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
  const leagueContext = useContext(LeagueContext);
  const leagueId = leagueContext.leagueId;

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Upcoming"
        component={UpcomingFixtures}
        initialParams={{leagueId}}
      />
      <Tab.Screen
        name="Past"
        component={PastFixtures}
        initialParams={{leagueId}}
      />
    </Tab.Navigator>
  );
}

function UpcomingFixtures({navigation}: Props) {
  const leagueContext = useContext(LeagueContext);
  const leagueId = leagueContext.leagueId;

  const getMatches = useGetMatches(leagueId, false, [true, false]);

  return (
    <View>
      <Text>Fixtures</Text>
      <FlatList
        data={getMatches.data}
        renderItem={({item}) => (
          <Item
            home={item.data.homeTeamName}
            away={item.data.awayTeamName}
            onPress={() =>
              navigation.navigate('Match', {
                matchInfo: item.data,
              })
            }
          />
        )}
        keyExtractor={(item) => item.key}
      />
      <Button
        disabled={getMatches.allLoaded}
        title="load more"
        onPress={getMatches.onLoadMore}
      />
    </View>
  );
}

export function PastFixtures({navigation}: Props) {
  const leagueContext = useContext(LeagueContext);
  const leagueId = leagueContext.leagueId;

  const getMatches = useGetMatches(leagueId, true, [true, false]);

  return (
    <View>
      <Text>Fixtures</Text>
      <FlatList
        data={getMatches.data}
        renderItem={({item}) => (
          <Item
            home={item.data.homeTeamName}
            away={item.data.awayTeamName}
            onPress={() =>
              navigation.navigate('Match', {
                matchInfo: item.data,
              })
            }
          />
        )}
        keyExtractor={(item) => item.key}
      />
      <Button
        disabled={getMatches.allLoaded}
        title="load more"
        onPress={getMatches.onLoadMore}
      />
    </View>
  );
}

const Item = ({home, away, onPress}) => (
  <View>
    <Text>Home: {home}</Text>
    <Text>away: {away}</Text>
    <Button title="match page" onPress={onPress} />
  </View>
);
