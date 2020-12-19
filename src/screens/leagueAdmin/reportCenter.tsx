import React, {useState, useEffect, useContext} from 'react';
import {Text, View, Button, FlatList} from 'react-native';
import {LeaguesStackType} from '../user/leaguesStack';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import {IMatch, IMatchNavData} from '../../utils/interface';
import {AppContext} from '../../utils/context';

type FixtureList = {
  key: string;
  data: IMatchNavData;
};

type ScreenNavigationProp = StackNavigationProp<
  LeaguesStackType,
  'Report Center'
>;

type ScreenRouteProp = RouteProp<LeaguesStackType, 'Report Center'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};
const db = firestore();

export default function ReportCenter({navigation, route}: Props) {
  const [data, setData] = useState([]);
  const leagueId = route.params.leagueId;

  const context = useContext(AppContext);
  const league = context?.userLeagues[leagueId];

  const leagueRef = db
    .collection('leagues')
    .doc(leagueId)
    .collection('matches');

  useEffect(() => {
    let matches: FixtureList[] = [];
    const conflictMatches = leagueRef
      .where('conflict', '==', true)
      .orderBy('id', 'asc');

    conflictMatches
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const matchData = doc.data() as IMatch;
          const matchId = doc.id;
          const awayTeamName = league.clubs[matchData.away].name;
          const homeTeamName = league.clubs[matchData.home].name;

          const match: IMatchNavData = {
            ...matchData,
            homeTeamName: homeTeamName,
            awayTeamName: awayTeamName,
          };

          const fixture: FixtureList = {
            key: matchId,
            data: match,
          };

          matches.push(fixture);
        });
      })
      .then(() => {
        setData(matches);
      });
  });
  return (
    <View>
      <Text>Report Center</Text>
      <FlatList
        data={data}
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
