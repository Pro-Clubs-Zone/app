import React, {useState, useEffect, useContext} from 'react';
import {Text, View, ActivityIndicator, Alert, Button} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {AuthContext} from '../../utils/context';
import LeaguePreview from './leaguePreview';
import CreateClub from './createClub';
import LeaguePreSeason from '../leagueAdmin/leaguePreSeason';
import {LeagueInt} from '../../utils/globalTypes';

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
  }, []);

  return data?.scheduled ? (
    console.log('scheduled')
  ) : data?.admin === uid ? (
    <LeaguePreSeason navigation={navigation} route={route}></LeaguePreSeason>
  ) : (
    <LeaguePreview
      //  data={data}
      route={route}
      navigation={navigation}></LeaguePreview>
  );
}
