import React, {useContext, useEffect, useState} from 'react';
import {Text, View, Button, Alert} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {AppContext, AuthContext} from '../../utils/context';
import {FlatList} from 'react-native-gesture-handler';
import {IClub, IClubRosterMember, IUserLeague} from '../../utils/interface';
import {LeaguesStackType} from '../user/leaguesStack';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';

// type ScreenNavigationProp = StackNavigationProp<LeaguesStackType, 'Join Club'>;

type ScreenRouteProp = RouteProp<LeaguesStackType, 'Join Club'>;

type Props = {
  //  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

const db = firestore();
type ClubData = IClub & {key: string};

export default function JoinClub({route}: Props) {
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
          retrievedClubs.push({...(doc.data() as IClub), key: doc.id});
        });
        setData(retrievedClubs);
        setLoading(false);
      });
  }, []);

  const onSendRequestConfirm = (clubId: string) => {
    const clubRef = leagueClubs.doc(clubId);
    const userInfo: {[leagueId: string]: IUserLeague} = {
      [leagueId]: {
        clubId: clubId,
        accepted: false,
        manager: false,
      },
    };
    const rosterMember: {[uid: string]: IClubRosterMember} = {
      [uid]: {
        accepted: false,
        username: context?.userData?.username,
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
    <View>
      <Text>{props.name}</Text>
      <Button title="Send Request" onPress={props.onPress} />
    </View>
  );
};
