import React, {useContext} from 'react';
import {View, Text} from 'react-native';
import {IMatchNavData} from '../../utils/interface';
import {MatchStackType} from './match';
import {RouteProp} from '@react-navigation/native';
import ScoreBoard from '../../components/scoreboard';
import {LeagueContext} from '../../context/leagueContext';
import firestore from '@react-native-firebase/firestore';
import {StackNavigationProp} from '@react-navigation/stack';

type ScreenRouteProp = RouteProp<MatchStackType, 'Finished Match'>;
type ScreenNavigationProp = StackNavigationProp<
  MatchStackType,
  'Finished Match'
>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

const db = firestore();

export default function FinishedMatch({navigation, route}: Props) {
  const leagueContext = useContext(LeagueContext);
  const leagueId = leagueContext.leagueId;
  const matchData: IMatchNavData = route.params.matchData;

  return (
    <View>
      <ScoreBoard data={matchData} editable={false} />
      <Text>GoalScorers</Text>
    </View>
  );
}
