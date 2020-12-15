import React, {useContext} from 'react';
import {Text, View, Button} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AppContext} from '../../utils/context';
import {LeaguesStackType} from './leaguesStack';

type LeaguesNavigationProp = StackNavigationProp<LeaguesStackType, 'Leagues'>;

type Props = {
  navigation: LeaguesNavigationProp;
};

export default function Leagues({navigation}: Props) {
  const context = useContext(AppContext);
  return (
    <View>
      <Text>Leagues Screen</Text>
      <Button
        onPress={() => navigation.navigate('Create league')}
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
