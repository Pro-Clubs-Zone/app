import React, {useContext, useState} from 'react';
import {Text, View, Button, SectionList} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {AppContext} from '../../utils/context';
import {FlatList} from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';

const Stack = createStackNavigator();
const db = firestore();

export default function LeaguePreSeason({route, navigation}) {
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
    </View>
  );
}
