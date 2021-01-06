import React, {useContext, useEffect, useState} from 'react';
import {Button, Text, View} from 'react-native';
import {IMatchNavData} from '../../utils/interface';
import onSubmitMatch from './functions/onSubmitMatch';
import onConflictResolve from './functions/onConflictResolve';
import {AppContext} from '../../context/appContext';
import {MatchStackType} from './match';
import {RouteProp} from '@react-navigation/native';
import ScoreBoard from '../../components/scoreboard';
import {MatchTextField} from '../../components/textField';
import {ScaledSheet} from 'react-native-size-matters';
import {APP_COLORS} from '../../utils/designSystem';
import {AuthContext} from '../../context/authContext';
import {LeagueContext} from '../../context/leagueContext';

type ScreenRouteProp = RouteProp<MatchStackType, 'Upcoming Match'>;

type Props = {
  route: ScreenRouteProp;
};

export default function UpcomingMatch({route}: Props) {
  const [homeScore, setHomeScore] = useState<number>();
  const [awayScore, setAwayScore] = useState<number>();
  const [editable, setEditable] = useState<boolean>();

  const context = useContext(AppContext);
  const leagueContext = useContext(LeagueContext);

  const leagueId = leagueContext.leagueId;
  const matchData: IMatchNavData = route.params;

  useEffect(() => {
    console.log(matchData);

    const userClub = context.userData.leagues[leagueId].clubId;
    const isManager = matchData.teams.includes(userClub) && matchData.manager;
    const hasSubmitted = isManager && !matchData.submissions?.[userClub];

    setEditable(hasSubmitted);
  }, [context, matchData]);

  const decrementConflictCounter = () => {
    const leagueData = {...context.userLeagues};
    leagueData[matchData.leagueId].conflictMatchesCount -= 1;
    context.setUserLeagues(leagueData);
  };

  return (
    <View>
      <ScoreBoard
        data={matchData}
        onSubmit={() => onSubmitMatch(homeScore, awayScore, matchData)}
        editable={editable}>
        <MatchTextField
          // error={
          //   data.scoresErrors && data.scoresErrors[data.team1]
          //     ? true
          //     : false
          // }
          onChangeText={(score: any) => setHomeScore(score)}
          value={homeScore}
        />
        <View style={styles.divider} />
        <MatchTextField
          // error={
          //   data.scoresErrors && data.scoresErrors[data.team2]
          //     ? true
          //     : false
          // }
          onChangeText={(score: any) => setAwayScore(score)}
          value={awayScore}
        />
      </ScoreBoard>
      {matchData.conflict && matchData.admin ? (
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
      ) : (
        <Text>Past Fixtures</Text>
      )}
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

const styles = ScaledSheet.create({
  divider: {
    height: '3@vs',
    width: '8@vs',
    backgroundColor: APP_COLORS.Accent,
    marginHorizontal: '8@vs',
  },
});
