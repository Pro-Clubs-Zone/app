import React, {useState, useEffect, useContext} from 'react';
import {Text, View, ActivityIndicator, Alert, Button} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {AuthContext} from '../../utils/context';
import {UserLeague} from './interface';

const db = firestore();

export default function LeaguePreview({data, navigation, route}) {
  const [inLeague, setInLeague] = useState({
    member: true,
    confirmedPlayer: false,
  });

  const leagueId = route.params.leagueId;

  useEffect(() => {
    console.log(data, leagueId);
  }, []);

  const user = useContext(AuthContext);
  const uid: string = user?.uid;

  const leagueRef = db.collection('leagues').doc(leagueId);
  const leagueClubs = leagueRef.collection('clubs');
  const userRef = db.collection('users').doc(uid);

  const onCheckUserInLeague = () => {
    let confirmed: boolean;
    leagueClubs
      .where(`roster.${uid}`, 'in', [true, false])
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          setInLeague({...inLeague, member: false});
          return showUserTypeSelection();
        } else {
          querySnapshot.forEach((doc) => {
            confirmed = doc.data().roster[uid];
            setInLeague({...inLeague, confirmedPlayer: confirmed});
            userInLeague();
          });
        }
      })
      .catch(function (error) {
        console.log('Error getting documents: ', error);
      });
  };

  const userInLeague = () => {
    Alert.alert(
      'Join League',
      inLeague.confirmedPlayer ? 'League not started' : 'Request already sent',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
  };

  const showUserTypeSelection = () => {
    Alert.alert(
      'Join League',
      'Join the league as manager or player?',
      [
        {
          text: 'Manager',
          onPress: () =>
            navigation.navigate('Create Club', {
              leagueId: leagueId,
            }),
        },
        {
          text: 'Player',
          onPress: () =>
            navigation.navigate('Join Club', {
              leagueId: leagueId,
            }),
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
    <View>
      <Text>{leagueId}</Text>
      <Button
        title="Join League"
        onPress={() =>
          user ? onCheckUserInLeague() : navigation.navigate('Sign Up')
        }
      />
    </View>
  );
}
