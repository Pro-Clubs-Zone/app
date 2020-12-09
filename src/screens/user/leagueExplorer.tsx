import React, {useState, useEffect} from 'react';
import {Text, View, ActivityIndicator, FlatList, Button} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import firestore from '@react-native-firebase/firestore';

const Stack = createStackNavigator();
const db = firestore();

export default function LeagueExplorer({navigation}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const leagueCollection = db.collection('leagues');

  useEffect(() => {
    const subscriber = leagueCollection.onSnapshot((querySnapshot) => {
      let retrievedLeagues: any = [];
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
