import React from 'react';
import {View} from 'react-native';
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
        subTitle={i18n._(t`Find answers to most frequently asked questions.`)}
        onPress={() => navigation.navigate('Help')}
      />
      <CardMedium
        title={i18n._(t`Get in touch`)}
        onPress={() => navigation.navigate('App Info')}
        subTitle={i18n._(
          t`Report bugs, request features or just come to say hi!`,
        )}
      />
    </View>
  );
}
