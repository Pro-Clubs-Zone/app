import React, {useContext, useState} from 'react';
import {Text, View, Button, TextInput} from 'react-native';
import firestore from '@react-native-firebase/firestore';
//import {Club, UserLeague} from './interface';
import {AppContext} from '../../context/appContext';
import {AuthContext} from '../../context/authContext';
import {IClub, IUserLeague} from '../../utils/interface';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {LeagueStackType} from './leagueStack';

type ScreenNavigationProp = StackNavigationProp<LeagueStackType, 'Create Club'>;

type ScreenRouteProp = RouteProp<LeagueStackType, 'Create Club'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

const db = firestore();

export default function CreateClub({route, navigation}: Props) {
  const [clubName, setClubName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const user = useContext(AuthContext);
  const context = useContext(AppContext);

  const leagueId = route.params.leagueId;
  const uid = user?.uid;
  const isAdmin = route.params.isAdmin;

  const onCreateClub = () => {
    const userRef = db.collection('users').doc(uid);
    const clubRef = db
      .collection('leagues')
      .doc(leagueId)
      .collection('clubs')
      .doc();

    const clubInfo: IClub = {
      name: clubName,
      managerId: uid,
      accepted: isAdmin ? true : false,
      roster: {
        [uid]: {
          accepted: true,
          username: context?.userData?.username,
        },
      },
      created: firestore.Timestamp.now(),
    };
    const userInfo: IUserLeague = {
      clubId: clubRef.id,
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
