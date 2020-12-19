import React, {useState, useEffect, useContext} from 'react';
import {Text, View, Button} from 'react-native';
import {LeaguesStackType} from '../user/leaguesStack';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {AppContext} from '../../utils/context';

type ScreenNavigationProp = StackNavigationProp<
  LeaguesStackType,
  'League Scheduled'
>;
type ScreenRouteProp = RouteProp<LeaguesStackType, 'League Scheduled'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

export default function LeagueScheduled({route, navigation}: Props) {
  const leagueId: string = route.params.leagueId;
  const context = useContext(AppContext);

  const userClub = context.userData.leagues[leagueId];

  console.log(userClub);

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

      <Button
        title="My Club"
        onPress={() =>
          navigation.navigate('My Club', {
            leagueId: leagueId,
            clubId: userClub.clubId,
            manager: userClub.manager,
          })
        }
      />

      <Button
        title="Report Center"
        onPress={() =>
          navigation.navigate('Report Center', {
            leagueId: leagueId,
            clubId: userClub.clubId,
          })
        }
      />
    </View>
  );
}
