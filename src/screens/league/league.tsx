import React, {useState, useEffect, useContext} from 'react';
import {Text, View, ActivityIndicator, Alert, Button} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {AppContext} from '../../utils/context';
import LeaguePreview from './leaguePreview';
import CreateClub from './createClub';
import LeaguePreSeason from '../leagueAdmin/leaguePreSeason';

const db = firestore();

export default function League({route, navigation}) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const context = useContext(AppContext);

  const leagueId = route.params.leagueId;
  const leagueRef = db.collection('leagues').doc(leagueId);
  const uid: string = context.user.uid;

  useEffect(() => {
    let leagueInfo: any;
    leagueRef.get().then((doc) => {
      leagueInfo = doc.data();
      setData(leagueInfo);
      setLoading(false);
    });
  }, []);

  return data.scheduled ? (
    console.log('scheduled')
  ) : data.admin === uid ? (
    <LeaguePreSeason navigation={navigation} route={route}></LeaguePreSeason>
  ) : (
    <LeaguePreview
      data={data}
      route={route}
      navigation={navigation}></LeaguePreview>
  );
}
