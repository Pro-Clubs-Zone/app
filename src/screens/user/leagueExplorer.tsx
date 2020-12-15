import React, {useState, useEffect} from 'react';
import {Text, View, ActivityIndicator, FlatList, Button} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {LeaguesStackType} from './leaguesStack';
import firestore from '@react-native-firebase/firestore';
import {LeagueInt} from '../../utils/interface';

type LeaguesNavigationProp = StackNavigationProp<
  LeaguesStackType,
  'League Explorer'
>;

type Props = {
  navigation: LeaguesNavigationProp;
};

const db = firestore();
type Leagues = LeagueInt[] & {key: string}[];

export default function LeagueExplorer({navigation}: Props) {
  const [data, setData] = useState<Leagues>([]);
  const [loading, setLoading] = useState(true);

  const leagueCollection = db.collection('leagues');

  useEffect(() => {
    const subscriber = leagueCollection.onSnapshot((querySnapshot) => {
      let retrievedLeagues: Leagues = [];
      querySnapshot.forEach((doc) => {
        retrievedLeagues.push({...doc.data(), key: doc.id});
      });
      setData(retrievedLeagues);
      setLoading(false);
    });
    return subscriber;
  }, []);

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <FlatList
      data={data}
      renderItem={({item}: any) => (
        <Button
          title={item.name.toString()}
          onPress={() =>
            navigation.navigate('League', {
              leagueId: item.key,
            })
          }
        />
      )}
    />
  );
}
