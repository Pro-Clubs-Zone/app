import React, {useContext, useState} from 'react';
import {Text, View, Button, SectionList} from 'react-native';
import {LeaguesStackType} from '../user/leaguesStack';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import functions from '@react-native-firebase/functions';

type ScreenNavigationProp = StackNavigationProp<
  LeaguesStackType,
  'League Pre-Season'
>;

type ScreenRouteProp = RouteProp<LeaguesStackType, 'League Pre-Season'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};
const firFunc = functions();

export default function LeaguePreSeason({route, navigation}: Props) {
  const leagueId = route.params.leagueId;

  const scheduleMatches = async () => {
    const functionRef = firFunc.httpsCallable('scheduleMatches');
    functionRef({leagueId: leagueId})
      .then((response) => {
        console.log('message from cloud', response);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <View>
      <Button onPress={scheduleMatches} title="Schedule Matches" />
      <Button
        title="Clubs"
        onPress={() =>
          navigation.navigate('Clubs', {
            leagueId: route.params.leagueId,
          })
        }
      />
      <Button title="Invite Clubs" />
      <Button
        title="Create My Club"
        onPress={() =>
          navigation.navigate('Create Club', {
            leagueId: route.params.leagueId,
            isAdmin: true,
          })
        }
      />
    </View>
  );
}
