import React from 'react';
import {Text, View, Button} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {LeaguesStackType} from './leaguesStack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type ScreenNavigationProp = StackNavigationProp<LeaguesStackType, 'Leagues'>;

type Props = {
  navigation: ScreenNavigationProp;
};

export default function Leagues({navigation}: Props) {
  return (
    <View>
      <Text>Leagues Screen</Text>
      <Icon name="account-circle-outline" />
      <Button
        onPress={() => navigation.navigate('Create League')}
        title="Create League"
      />
      <Button
        title="League Explorer"
        onPress={() => navigation.navigate('League Explorer')}
      />
      <Button title="Join League" />
    </View>
  );
}
