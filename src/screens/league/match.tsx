import React, {useContext, useEffect, useState} from 'react';
import {Button, Text, View} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {MatchData} from '../../utils/interface';
import functions from '@react-native-firebase/functions';

const db = firestore();
const firFunc = functions();

export default function Match({navigation, route}) {
  let matchData: MatchData = route.params.matchInfo[0];

  const teamSubmission = {
    [matchData.clubId]: {
      [matchData.home]: 2,
      [matchData.away]: 1,
    },
  };
  console.log(matchData);
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
          const match: MatchData = {
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
      });
  };

  return (
    <View>
      <Text>hello from matches</Text>
      <Button title="submit" onPress={onSubmit} />
    </View>
  );
}
