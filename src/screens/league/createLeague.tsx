import React, {useContext, useState} from 'react';
import {Text, View, Button} from 'react-native';
import SignUp from '../auth/signUp';
import {AppContext, AuthContext} from '../../utils/context';
import firestore from '@react-native-firebase/firestore';
import {League, UserLeague} from './interface';

const leagueInfoDefault: League = {
  name: Math.floor(Math.random() * Math.floor(200)),
  description: 'some good description',
  platform: 'Playstation',
  teamNum: 4,
  matchNum: 2,
  admin: '',
  private: false,
  scheduled: false,
  created: firestore.Timestamp.now(),
};

//TODO: ask if to create a club

const db = firestore();

export default function CreateLeague() {
  const [leagueInfo, setLeagueInfo] = useState(leagueInfoDefault);
  const [loading, setLoading] = useState(false);

  const context = useContext(AppContext);
  const user = useContext(AuthContext);
  const uid: string = user?.uid;

  const onCreateLeague = () => {
    const batch = db.batch();
    const leagueRef = db.collection('leagues').doc();
    const userRef = db.collection('users').doc(uid);

    setLoading(true);
    batch.set(leagueRef, {...leagueInfo, admin: uid});
    batch.set(
      userRef,
      {
        leagueAdmin: {
          [leagueRef.id]: true,
        },
      },
      {merge: true},
    );
    batch.commit().then(() => {
      setLoading(false);
    });
  };

  return (
    <View>
      <Text>Create new League</Text>
      <Button onPress={onCreateLeague} title="Create League" />
    </View>
  );
}
