import React, {useState, useEffect, useContext} from 'react';
import {Text, View, Alert, Button} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {AuthContext} from '../../utils/context';
import {LeagueStackType} from './leagueStack';
import {StackNavigationProp} from '@react-navigation/stack';
import {LeagueContext} from '../../context/leagueContext';

type ScreenNavigationProp = StackNavigationProp<
  LeagueStackType,
  'League Preview'
>;

type Props = {
  navigation: ScreenNavigationProp;
};

const db = firestore();

export default function LeaguePreview({navigation}: Props) {
  const [accepted, setAccepted] = useState<boolean>(false);
  const leagueContext = useContext(LeagueContext);
  const user = useContext(AuthContext);

  const leagueId = leagueContext.leagueId;
  const uid = user?.uid;
  console.log(leagueId);

  const leagueRef = db.collection('leagues').doc(leagueId);
  const leagueClubs = leagueRef.collection('clubs');
  //  const userRef = db.collection('users').doc(uid);

  const onCheckUserInLeague = () => {
    let playerAccepted: boolean;
    leagueClubs
      .where(`roster.${uid}.accepted`, 'in', [true, false])
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          console.log('not in league');

          return showUserTypeSelection();
        } else {
          querySnapshot.forEach((doc) => {
            playerAccepted = doc.data().roster[uid].accepted;
            setAccepted(playerAccepted);
            userInLeague();
            console.log(playerAccepted, 'player accepted?');
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
      accepted ? 'League not started' : 'Request already sent',
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
          user
            ? onCheckUserInLeague()
            : navigation.navigate('Home', {
                screen: 'Sign Up',
              })
        }
      />
    </View>
  );
}
