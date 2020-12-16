import React, {useState, useEffect, useContext} from 'react';
import {Text, View, Button} from 'react-native';
import {LeaguesStackType} from '../user/leaguesStack';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';

type ScreenNavigationProp = StackNavigationProp<LeaguesStackType, 'League'>;
type ScreenRouteProp = RouteProp<LeaguesStackType, 'League'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

export default function LeagueScheduled({route, navigation}: Props) {
  const leagueId: string = route.params.leagueId;
  return (
    <View>
      <Text>League Home</Text>
      <Button
        title="Standings"
        onPress={() =>
          navigation.navigate('Standings', {
            leagueId: leagueId,
          })
        }
      />
      <Button
        title="Fixtures"
        onPress={() =>
          navigation.navigate('Fixtures', {
            leagueId: leagueId,
          })
        }
      />
    </View>
  );
}
