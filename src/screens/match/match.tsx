import React, {useContext, useState} from 'react';
import {Button, Text, View} from 'react-native';
import {IMatchNavData} from '../../utils/interface';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {TextInput} from 'react-native-gesture-handler';
import {LeagueStackType} from '../league/league';
import onSubmitMatch from './functions/onSubmitMatch';
import MatchConflict from './matchConflict';
import onConflictResolve from './functions/onConflictResolve';
import {AppContext} from '../../context/appContext';

type ScreenNavigationProp = StackNavigationProp<LeagueStackType, 'Match'>;

type ScreenRouteProp = RouteProp<LeagueStackType, 'Match'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

export default function Match({navigation, route}: Props) {
  const [homeScore, setHomeScore] = useState<number>();
  const [awayScore, setAwayScore] = useState<number>();

  const context = useContext(AppContext);

  let matchData: IMatchNavData = route.params.matchInfo;
  console.log(matchData);

  const decrementConflictCounter = () => {
    const leagueData = {...context.userLeagues};
    leagueData[matchData.leagueId].conflictMatchesCount -= 1;
    context.setUserLeagues(leagueData);
  };

  if (matchData.conflict) {
    return (
      <>
        <MatchConflict
          data={matchData}
          onSelectHome={() =>
            onConflictResolve(matchData, matchData.home).then(
              () => decrementConflictCounter,
            )
          }
          onSelectAway={() =>
            onConflictResolve(matchData, matchData.away).then(
              () => decrementConflictCounter,
            )
          }
        />
      </>
    );
  }

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
        <Button
          title="submit"
          onPress={() => onSubmitMatch(homeScore, awayScore, matchData)}
        />
      )}
    </View>
  );
}
