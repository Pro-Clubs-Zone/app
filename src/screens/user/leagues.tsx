import React from 'react';
import {View, Button, ScrollView} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AppNavStack} from '../index';
import {verticalScale, ScaledSheet} from 'react-native-size-matters';
import {APP_COLORS} from '../../utils/designSystem';
import {CardSmall, CardMedium} from '../../components/cards';
import {t} from '@lingui/macro';
import i18n from '../../utils/i18n';

type ScreenNavigationProp = StackNavigationProp<AppNavStack, 'Leagues'>;

type Props = {
  navigation: ScreenNavigationProp;
};

export default function Leagues({navigation}: Props) {
  return (
    <ScrollView
      contentContainerStyle={{
        backgroundColor: APP_COLORS.Dark,
        paddingBottom: verticalScale(16),
      }}
      showsVerticalScrollIndicator={false}>
      <View style={{flexDirection: 'row', flex: 1}}>
        <CardSmall
          onPress={() => navigation.navigate('Create League')}
          title="Create League"
        />
        <CardSmall
          onPress={() => navigation.navigate('Create League')}
          title={'Join\nLeague'}
        />
      </View>
      <CardMedium
        onPress={() => navigation.navigate('League Explorer')}
        title={i18n._(t`League Explorer`)}
        subTitle="Find a league in world"
      />
    </ScrollView>
  );
}
