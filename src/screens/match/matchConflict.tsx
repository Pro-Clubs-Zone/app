import React from 'react';
import {Button, Text, View} from 'react-native';
import {IMatchNavData} from '../../utils/interface';

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

export default MatchConflict;
