import React, {useContext, useState} from 'react';
import {Text, View, Button, TextInput} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {Club, UserLeague} from './interface';
import {AppContext} from '../../utils/context';

const db = firestore();

export default function CreateClub({route, navigation}) {
  const [clubName, setClubName] = useState('');
  const [loading, setLoading] = useState(false);

  const context = useContext(AppContext);

  const leagueId: string = route.params.leagueId;
  const uid: string = context.user.uid;

  const onCreateClub = () => {
    const userRef = db.collection('users').doc(uid);
    const clubRef = db
      .collection('leagues')
      .doc(leagueId)
      .collection('clubs')
      .doc();
    const leagueRef = db.collection('leagues').doc(leagueId);

    const clubInfo: Club = {
      name: clubName,
      managerId: uid,
      accepted: false,
      roster: {
        [uid]: true,
      },
      created: firestore.Timestamp.now(),
    };
    const userInfo: UserLeague = {
      club: clubRef.id,
      manager: true,
    };

    setLoading(true);
    const batch = db.batch();
    batch.set(clubRef, clubInfo);
    batch.set(
      userRef,
      {
        leagues: {
          [leagueId]: userInfo,
        },
      },
      {merge: true},
    );
    batch.commit().then(() => {
      setLoading(false);
      navigation.goBack();
    });
  };

  return (
    <View>
      <TextInput
        style={{height: 40, borderColor: 'gray', borderWidth: 1}}
        onChangeText={(text) => setClubName(text)}
        value={clubName}
        placeholder="Club Name"
        autoCorrect={false}
      />
      <Button title="Create" onPress={onCreateClub} />
    </View>
  );
}
