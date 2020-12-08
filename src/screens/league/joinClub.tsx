import React, {useContext, useEffect, useState} from 'react';
import {Text, View, Button, Alert} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {UserLeague} from './interface';
import {AppContext} from '../../utils/context';
import {FlatList} from 'react-native-gesture-handler';

const db = firestore();

export default function JoinClub({navigation, route}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const context = useContext(AppContext);
  const uid: string = context.user.uid;
  const userRef = db.collection('users').doc(uid);
  const leagueId = route.params.leagueId;
  const leagueRef = db.collection('leagues').doc(leagueId);
  const leagueClubs = leagueRef.collection('clubs');

  useEffect(() => {
    let retrievedClubs: [] = [];
    leagueClubs
      .where('accepted', '==', false)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          retrievedClubs.push({...doc.data(), key: doc.id});
        });
        setData(retrievedClubs);
        setLoading(false);
      });
  }, []);

  const onSendRequestConfirm = (clubId: string) => {
    const clubRef = leagueClubs.doc(clubId);
    const userInfo: UserLeague = {
      club: clubId,
      manager: false,
    };
    const batch = db.batch();
    batch.set(
      clubRef,
      {
        roster: {
          [uid]: false,
        },
      },
      {merge: true},
    );
    batch.set(
      userRef,
      {
        leagues: {
          [leagueId]: userInfo,
        },
      },
      {merge: true},
    );
    return batch.commit();
  };

  const onSendRequest = (clubId: string) => {
    console.log('onsendrequest');
    Alert.alert(
      'Join Club',
      'Send request to "club name" to join?',
      [
        {
          text: 'Send Request',
          onPress: () => {
            onSendRequestConfirm(clubId);
          },
        },
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
  };

  return (
    <FlatList
      data={data}
      renderItem={({item}: any) => (
        <Club name={item.name} onPress={() => onSendRequest(item.key)} />
      )}
    />
  );
}

const Club = (props) => {
  return (
    <View
      style={{
        height: 100,
        width: '100%',
      }}>
      <Text>{props.name}</Text>
      <Button title="Send Request" onPress={props.onPress} />
    </View>
  );
};
