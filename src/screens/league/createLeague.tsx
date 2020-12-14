import React, {useContext, useState} from 'react';
import {Text, View, Button, TextInput} from 'react-native';
import SignUp from '../auth/signUp';
import {AppContext, AuthContext} from '../../utils/context';
import firestore from '@react-native-firebase/firestore';
import {LeagueInt} from '../../utils/interface';

const leagueInfoDefault: LeagueInt = {
  name: Math.floor(Math.random() * Math.floor(200)),
  description: 'some good description',
  platform: 'Playstation',
  teamNum: 4,
  matchNum: 2,
  adminId: '',
  private: false,
  scheduled: false,
  created: firestore.Timestamp.now(),
};

//TODO: ask if to create a club

const db = firestore();

export default function CreateLeague() {
  const [leagueInfo, setLeagueInfo] = useState<LeagueInt>(leagueInfoDefault);
  const [loading, setLoading] = useState<boolean>(false);
  const [leagueName, setLeagueName] = useState<string>('');

  const user = useContext(AuthContext);
  const uid = user?.uid;

  const onCreateLeague = () => {
    const batch = db.batch();
    const leagueRef = db.collection('leagues').doc('italy');
    const userRef = db.collection('users').doc(uid);

    setLoading(true);
    batch.set(leagueRef, {...leagueInfo, adminId: uid, name: leagueName});
    batch.set(
      userRef,
      {
        leagues: {
          [leagueRef.id]: {
            admin: true,
          },
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
      <TextInput
        style={{height: 40, borderColor: 'gray', borderWidth: 1}}
        onChangeText={(text) => setLeagueName(text)}
        value={leagueName}
        placeholder="League Name"
        autoCorrect={true}
      />
      <Button onPress={onCreateLeague} title="Create League" />
    </View>
  );
}
