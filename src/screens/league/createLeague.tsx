import React, {useContext, useState} from 'react';
import {Text, View} from 'react-native';
import {AuthContext} from '../../context/authContext';
import firestore from '@react-native-firebase/firestore';
import {ILeague} from '../../utils/interface';
import {AppNavStack} from '../index';
import {StackNavigationProp} from '@react-navigation/stack';
import FullScreenLoading from '../../components/loading';
import TextField from '../../components/textField';
import {BigButton} from '../../components/buttons';
import {FormView, FormContent} from '../../components/templates';

type ScreenNavigationProp = StackNavigationProp<AppNavStack, 'Create League'>;

type Props = {
  navigation: ScreenNavigationProp;
};

const leagueInfoDefault: ILeague = {
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

export default function CreateLeague({navigation}: Props) {
  const [leagueInfo, setLeagueInfo] = useState<ILeague>(leagueInfoDefault);
  // const [loading, setLoading] = useState<boolean>(false);
  const [leagueName, setLeagueName] = useState<string>('');

  const user = useContext(AuthContext);
  const uid = user?.uid;

  const onCreateLeague = () => {
    const batch = db.batch();
    const leagueRef = db.collection('leagues').doc();
    const userRef = db.collection('users').doc(uid);

    // setLoading(true);
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
      //    setLoading(false);
      navigation.navigate('League', {
        leagueId: leagueRef.id,
        isAdmin: true,
      });
    });
  };

  return (
    <FormView>
      <FormContent>
        <TextField
          onChangeText={(text) => setLeagueName(text)}
          value={leagueName}
          placeholder="League Name"
          autoCorrect={true}
          label="League Name"
        />
      </FormContent>
      <BigButton onPress={onCreateLeague} title="Create League" />
    </FormView>
  );
}
