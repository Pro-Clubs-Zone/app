import React, {useState, useEffect, useContext} from 'react';
import {Text, View, ActivityIndicator, Alert, Button} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {AuthContext} from '../../utils/context';
import LeaguePreview from './leaguePreview';
import CreateClub from './createClub';
import LeaguePreSeason from '../leagueAdmin/leaguePreSeason';
import {LeagueInt} from '../../utils/interface';

const db = firestore();

export default function League({route, navigation}) {
  const [data, setData] = useState<LeagueInt>();
  const [loading, setLoading] = useState<boolean>(true);
  const user = useContext(AuthContext);
  const uid = user?.uid;
  const leagueId: string = route.params.leagueId;
  const leagueRef = db.collection('leagues').doc(leagueId);

  useEffect(() => {
    let leagueInfo: LeagueInt;
    leagueRef.get().then((doc) => {
      leagueInfo = doc.data() as LeagueInt;
      setData(leagueInfo);
      setLoading(false);
    });
  }, [leagueRef]);

  return data?.scheduled ? (
    <LeagueHome navigation={navigation} route={route} />
  ) : data?.adminId === uid ? (
    <LeaguePreSeason navigation={navigation} route={route} />
  ) : (
    <LeaguePreview
      //  data={data}
      route={route}
      navigation={navigation}
    />
  );
}

function LeagueHome({route, navigation}) {
  const leagueId: string = route.params.leagueId;
  return (
    <View>
      <Text>League Home</Text>
      <Button
        title="Standings"
        onPress={() =>
          navigation.navigate('Standings', {
            leagueId: leagueId,
          })
        }
      />
    </View>
  );
}
