import React, {useState, useEffect, useContext} from 'react';
import {Text, View, ActivityIndicator, Alert, Button} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {AuthContext} from '../../utils/context';
import {LeaguesStackType} from '../user/leaguesStack';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';

type ScreenNavigationProp = StackNavigationProp<
  LeaguesStackType,
  'League Preview'
>;

type ScreenRouteProp = RouteProp<LeaguesStackType, 'League Preview'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

const db = firestore();

export default function LeaguePreview({navigation, route}: Props) {
  const [accepted, setAccepted] = useState<boolean>(false);

  const leagueId = route.params.leagueId;
  const user = useContext(AuthContext);

  const uid = user?.uid;

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
          user ? onCheckUserInLeague() : navigation.navigate('Sign Up')
        }
      />
    </View>
  );
}
