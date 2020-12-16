import React, {useContext, useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {Text, View, FlatList} from 'react-native';
import {ClubStanding} from '../../utils/interface';
import {LeaguesStackType} from '../user/leaguesStack';
import {RouteProp} from '@react-navigation/native';
// import {StackNavigationProp} from '@react-navigation/stack';

// type ScreenNavigationProp = StackNavigationProp<LeaguesStackType, 'Fixtures'>;
type ScreenRouteProp = RouteProp<LeaguesStackType, 'Standings'>;

const db = firestore();

type StandingsList = {
  key: string;
  data: ClubStanding;
};

type Props = {
  // navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

export default function LeagueStandings({route}: Props) {
  const [data, setData] = useState<{[id: string]: ClubStanding}>({});
  const [standings, setStandings] = useState<StandingsList[]>([]);

  const leagueId = route.params.leagueId;

  useEffect(() => {
    const standingsRef = db
      .collection('leagues')
      .doc(leagueId)
      .collection('stats')
      .doc('standings');

    standingsRef.get().then((doc) => {
      const standingsData = doc.data() as {[id: string]: ClubStanding};
      setData(standingsData);
    });
  }, [leagueId]);

  useEffect(() => {
    let leagueStandings: StandingsList[] = [];
    console.log(data, 'standings data');
    for (let [clubId, clubData] of Object.entries(data)) {
      let clubStanding: StandingsList = {
        key: clubId,
        data: clubData,
      };
      leagueStandings.push(clubStanding);
    }
    leagueStandings.sort((a, b) => {
      return b.data.points - a.data.points;
    });
    setStandings(leagueStandings);
  }, [data]);

  return (
    <View>
      <Text>Standings</Text>
      <View>
        <FlatList
          data={standings}
          renderItem={({item}) => (
            <Item
              name={item.data.name}
              points={item.data.points}
              won={item.data.won}
              lost={item.data.lost}
            />
          )}
          keyExtractor={(item) => item.key}
        />
      </View>
    </View>
  );
}
const Item = ({name, points, won, draw, lost, scored, conceded, played}) => (
  <View>
    <Text>Name: {name}</Text>
    <Text>Points: {points}</Text>
    <Text>Won: {won}</Text>
    <Text>Lost: {lost}</Text>
  </View>
);
