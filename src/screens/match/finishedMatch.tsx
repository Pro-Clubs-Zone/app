import React from 'react';
import {View, Text} from 'react-native';
import {IMatchNavData} from '../../utils/interface';
import {MatchStackType} from './match';
import {RouteProp} from '@react-navigation/native';
import ScoreBoard from '../../components/scoreboard';
//import {LeagueContext} from '../../context/leagueContext';
//import firestore from '@react-native-firebase/firestore';
import {StackNavigationProp} from '@react-navigation/stack';
import EmptyState from '../../components/emptyState';
import {t} from '@lingui/macro';
import i18n from '../../utils/i18n';

type ScreenRouteProp = RouteProp<MatchStackType, 'Finished Match'>;
type ScreenNavigationProp = StackNavigationProp<
  MatchStackType,
  'Finished Match'
>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

export default function FinishedMatch({route}: Props) {
  const matchData: IMatchNavData = route.params.matchData;

  return (
    <View style={{flex: 1}}>
      <ScoreBoard data={matchData} editable={false} />
      <EmptyState
        title={i18n._(t`Match Stats & Info`)}
        body={i18n._(t`Coming Soon`)}
      />
    </View>
  );
}
