import React, {useContext, useState} from 'react';
import {Text, View, Button, SectionList} from 'react-native';
import {LeaguesStackType} from '../user/leaguesStack';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';

type ScreenNavigationProp = StackNavigationProp<
  LeaguesStackType,
  'League Pre-Season'
>;

type ScreenRouteProp = RouteProp<LeaguesStackType, 'League Pre-Season'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

export default function LeaguePreSeason({route, navigation}: Props) {
  return (
    <View>
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
        title="Create Clubs"
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
