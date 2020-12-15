import React, {useState, useEffect, useContext} from 'react';
import {Text, View, Button} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {AppContext, AuthContext} from '../../utils/context';
import LeaguePreview from './leaguePreview';
import LeaguePreSeason from '../leagueAdmin/leaguePreSeason';
import {LeagueInt} from '../../utils/interface';

const db = firestore();

export default function League({route, navigation}) {
  const [league, setLeague] = useState<LeagueInt>();
  const [loading, setLoading] = useState<boolean>(true);
  const user = useContext(AuthContext);
  const context = useContext(AppContext);
  const userData = context?.userData;
  const uid = user?.uid;
  const leagueId: string = route.params.leagueId;

  useEffect(() => {
    console.log('effect on league');

    const leagueRef = db.collection('leagues').doc(leagueId);
    let leagueInfo: LeagueInt;
    leagueRef.get().then((doc) => {
      leagueInfo = doc.data() as LeagueInt;
      setLeague(leagueInfo);
      setLoading(false);
    });
  }, [leagueId]);

  if (userData?.leagues && userData?.leagues[leagueId]) {
    if (league?.scheduled) {
      return <LeagueHome navigation={navigation} route={route} />;
    } else {
      if (league?.adminId === uid) {
        return <LeaguePreSeason navigation={navigation} route={route} />;
      } else {
        return (
          <LeaguePreview
            //  data={data}
            route={route}
            navigation={navigation}
          />
        );
      }
    }
  } else {
    return (
      <LeaguePreview
        //  data={data}
        route={route}
        navigation={navigation}
      />
    );
  }
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
      <Button
        title="Fixtures"
        onPress={() =>
          navigation.navigate('Fixtures', {
            leagueId: leagueId,
          })
        }
      />
    </View>
  );
}
