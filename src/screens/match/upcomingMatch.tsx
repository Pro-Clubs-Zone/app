import React, {useContext, useState} from 'react';
import {Button, Text, View} from 'react-native';
import {IMatchNavData} from '../../utils/interface';
import {TextInput} from 'react-native-gesture-handler';
import onSubmitMatch from './functions/onSubmitMatch';
import onConflictResolve from './functions/onConflictResolve';
import {AppContext} from '../../context/appContext';
import {MatchStackType} from './match';
import {RouteProp} from '@react-navigation/native';
import ScoreBoard from '../../components/scoreboard';

type ScreenRouteProp = RouteProp<MatchStackType, 'Upcoming Match'>;

type Props = {
  route: ScreenRouteProp;
};

export default function UpcomingMatch({route}: Props) {
  const [homeScore, setHomeScore] = useState<number>();
  const [awayScore, setAwayScore] = useState<number>();

  const context = useContext(AppContext);

  const matchData: IMatchNavData = route.params;
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
            onConflictResolve(matchData, matchData.homeTeamId).then(
              () => decrementConflictCounter,
            )
          }
          onSelectAway={() =>
            onConflictResolve(matchData, matchData.awayTeamId).then(
              () => decrementConflictCounter,
            )
          }
        />
      </>
    );
  }

  return (
    <View>
      <ScoreBoard
        data={matchData}
        onSubmit={() => onSubmitMatch(homeScore, awayScore, matchData)}
        editable={true}
      />
      {/* <Text>hello from matches</Text>
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
      )} */}
    </View>
  );
}

const MatchConflict = (props) => {
  const data: IMatchNavData = props.data;
  return (
    <View>
      <Text>This is conflict match</Text>
      <View>
        <Text>Home Team: {data.homeTeamName}</Text>
        <View>
          <Text>Home Team: {data.homeTeamName}</Text>
          <Text>{data.submissions[data.homeTeamId][data.homeTeamId]}</Text>
        </View>
        <View>
          <Text>Away Team: {data.awayTeamName}</Text>
          <Text>{data.submissions[data.awayTeamId][data.awayTeamId]}</Text>
        </View>
        <Button title="select home" onPress={props.onSelectHome} />
      </View>
      <View>
        <Text>Away Team: {data.awayTeamName}</Text>
        <View>
          <Text>Home Team: {data.homeTeamName}</Text>
          <Text>{data.submissions[data.awayTeamId][data.homeTeamId]}</Text>
        </View>
        <View>
          <Text>Away Team: {data.awayTeamName}</Text>
          <Text>{data.submissions[data.awayTeamId][data.awayTeamId]}</Text>
        </View>
        <Button title="select away" onPress={props.onSelectAway} />
      </View>
    </View>
  );
};
