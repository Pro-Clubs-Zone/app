import React, {useContext, useState} from 'react';
import {Button, Text, View} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {IMatchNavData} from '../../utils/interface';
import functions from '@react-native-firebase/functions';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {TextInput} from 'react-native-gesture-handler';
import {LeagueStackType} from '../league/leagueStack';

type ScreenNavigationProp = StackNavigationProp<LeagueStackType, 'Match'>;

type ScreenRouteProp = RouteProp<LeagueStackType, 'Match'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

const db = firestore();
const firFunc = functions();

export default function Match({navigation, route}: Props) {
  const [homeScore, setHomeScore] = useState<number>();
  const [awayScore, setAwayScore] = useState<number>();

  let matchData: IMatchNavData = route.params.matchInfo;
  console.log(matchData);

  const onSubmit = () => {
    const teamSubmission = {
      [matchData.clubId]: {
        [matchData.home]: homeScore,
        [matchData.away]: awayScore,
      },
    };
    const matchRef = db
      .collection('leagues')
      .doc(matchData.leagueId)
      .collection('matches')
      .doc(matchData.matchId);

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
        }
      })
      .then(() => {
        navigation.goBack();
      });
  };

  return (
    <View>
      <Text>hello from matches</Text>
      <TextInput
        style={{height: 40, borderColor: 'gray', borderWidth: 1}}
        onChangeText={(score: any) => setHomeScore(score)}
        value={homeScore}
        placeholder="Home"
        autoCorrect={false}
        keyboardType="number-pad"
      />
      <TextInput
        style={{height: 40, borderColor: 'gray', borderWidth: 1}}
        onChangeText={(score: any) => setAwayScore(score)}
        value={awayScore}
        placeholder="Away"
        autoCorrect={false}
        keyboardType="number-pad"
      />
      {matchData.teams?.includes(matchData.clubId) && matchData.manager && (
        <Button title="submit" onPress={onSubmit} />
      )}
    </View>
  );
}
