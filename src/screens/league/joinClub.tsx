import React, {useContext, useEffect, useState} from 'react';
import {Text, View, Button, Alert} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {AppContext, AuthContext} from '../../utils/context';
import {FlatList} from 'react-native-gesture-handler';
import {ClubInt, ClubRosterMember, UserLeague} from '../../utils/globalTypes';

const db = firestore();
type ClubData = ClubInt & {key: string};

export default function JoinClub({navigation, route}) {
  const [data, setData] = useState<ClubData[]>([]);
  const [loading, setLoading] = useState(true);

  const context = useContext(AppContext);
  const user = useContext(AuthContext);
  const uid = user?.uid;
  const userRef = db.collection('users').doc(uid);
  const leagueId = route.params.leagueId;
  const leagueRef = db.collection('leagues').doc(leagueId);
  const leagueClubs = leagueRef.collection('clubs');

  useEffect(() => {
    let retrievedClubs: ClubData[] = [];
    leagueClubs
      .where('accepted', '==', true)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          retrievedClubs.push({...(doc.data() as ClubInt), key: doc.id});
        });
        setData(retrievedClubs);
        setLoading(false);
      });
  }, []);

  const onSendRequestConfirm = (clubId: string) => {
    const clubRef = leagueClubs.doc(clubId);
    const userInfo: {[leagueId: string]: UserLeague} = {
      [leagueId]: {
        clubId: clubId,
        accepted: false,
      },
    };
    const rosterMember: {[uid: string]: ClubRosterMember} = {
      [uid]: {
        accepted: false,
        username: context?.data.userData?.username,
      },
    };
    const batch = db.batch();

    batch.set(
      clubRef,
      {
        roster: rosterMember,
      },
      {merge: true},
    );
    batch.set(
      userRef,
      {
        leagues: userInfo,
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
