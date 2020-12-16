import React, {useContext, useEffect, useState} from 'react';
import {Button, Text, View} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {IMatchNavData} from '../../utils/interface';
import functions from '@react-native-firebase/functions';
import {LeaguesStackType} from '../user/leaguesStack';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';

type ScreenNavigationProp = StackNavigationProp<LeaguesStackType, 'Match'>;

type ScreenRouteProp = RouteProp<LeaguesStackType, 'Match'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

const db = firestore();
const firFunc = functions();

export default function Match({navigation, route}: Props) {
  let matchData: IMatchNavData = route.params.matchInfo;
  console.log(matchData);

  const teamSubmission = {
    [matchData.clubId]: {
      [matchData.home]: 2,
      [matchData.away]: 1,
    },
  };
  const matchRef = db
    .collection('leagues')
    .doc(matchData.leagueId)
    .collection('matches')
    .doc(matchData.matchId);

  const onSubmit = () => {
    matchRef
      .set(
        {
          submissions: teamSubmission,
        },
        {merge: true},
      )
      .then(() => {
        if (
          matchData.submissions &&
          Object.keys(matchData.submissions).length === 1
        ) {
          const controlMatch = firFunc.httpsCallable('matchSubmission');
          const match: IMatchNavData = {
            ...matchData,
            submissions: {...matchData.submissions, ...teamSubmission},
          };
          console.log({...match});

          controlMatch({data: match})
            .then((response) => {
              console.log('message from cloud', response);
            })
            .catch((error) => {
              console.log(error);
            });
        } else {
          console.log('first submission');
        }
      })
      .then(() => {
        navigation.goBack();
      });
  };

  return (
    <View>
      <Text>hello from matches</Text>
      {matchData.teams?.includes(matchData.clubId) && matchData.manager && (
        <Button title="submit" onPress={onSubmit} />
      )}
    </View>
  );
}
