import React, {useState, useEffect} from 'react';
import {Text, View, ActivityIndicator, FlatList, Button} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AppNavStack} from '../index';
import firestore from '@react-native-firebase/firestore';
import {ILeague} from '../../utils/interface';
import FullScreenLoading from '../../components/loading';

type ScreenNavigationProp = StackNavigationProp<AppNavStack, 'League Explorer'>;

type Props = {
  navigation: ScreenNavigationProp;
};

const db = firestore();
type Leagues = ILeague[] & {key: string}[];

export default function LeagueExplorer({navigation}: Props) {
  const [data, setData] = useState<Leagues>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const leagueCollection = db.collection('leagues');
    const subscriber = leagueCollection.onSnapshot((querySnapshot) => {
      let retrievedLeagues: Leagues = [];
      querySnapshot.forEach((doc) => {
        retrievedLeagues.push({...doc.data(), key: doc.id});
      });
      setData(retrievedLeagues);
    });

    setLoading(false);
    return subscriber;
  }, []);

  return (
    <>
      <FullScreenLoading visible={loading} />
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
    </>
  );
}
