import React from 'react';
import {View, ScrollView} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AppNavStack} from '../index';
import {CardMedium} from '../../components/cards';
import {t} from '@lingui/macro';
import i18n from '../../utils/i18n';

type ScreenNavigationProp = StackNavigationProp<AppNavStack, 'World'>;

type Props = {
  navigation: ScreenNavigationProp;
};

export default function World({navigation}: Props) {
  return (
    <View style={{flex: 1}}>
      <CardMedium
        title={i18n._(t`Help`)}
        onPress={() => navigation.navigate('Help')}
      />
    </View>
  );
}
