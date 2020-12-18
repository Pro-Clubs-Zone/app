import React, {useContext, useEffect, useState, useLayoutEffect} from 'react';
import {Text, View, Button, Alert} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {LeaguesStackType} from '../user/leaguesStack';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {AppContext} from '../../utils/context';
import RNRestart from 'react-native-restart';

type ScreenNavigationProp = StackNavigationProp<
  LeaguesStackType,
  'Club Settings'
>;
type ScreenRouteProp = RouteProp<LeaguesStackType, 'Club Settings'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

export default function ClubSettings({navigation, route}: Props) {
  const leagueId = route.params.leagueId;
  const clubId = route.params.clubId;
  const db = firestore();
  const batch = db.batch();
  const clubRef = db
    .collection('leagues')
    .doc(leagueId)
    .collection('clubs')
    .doc(clubId);

  const context = useContext(AppContext);

  const clubRoster = context.userLeagues[leagueId].clubs[clubId].roster;
  const isAdmin = context.userData.leagues[leagueId].admin;
  const onRemove = async () => {
    Alert.alert(
      'Remove Club',
      'Remove club?',
      [
        {
          text: 'Remove',
          onPress: () => {
            removeData().then(() => RNRestart.Restart());
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

    const removeData = async () => {
      for (const playerId of Object.keys(clubRoster)) {
        const playerRef = db.collection('users').doc(playerId);
        if (isAdmin) {
          batch.update(playerRef, {
            ['leagues.' + leagueId + '.manager']: firestore.FieldValue.delete(),
            ['leagues.' + leagueId + '.clubId']: firestore.FieldValue.delete(),
          });
        } else {
          batch.update(playerRef, {
            ['leagues.' + leagueId]: firestore.FieldValue.delete(),
          });
        }
      }
      batch.delete(clubRef);
      const commit = await batch.commit();
      return commit;
    };
  };

  return (
    <View>
      <Text>Club Settings</Text>
      <Button title="remove club" onPress={onRemove} />
    </View>
  );
}
