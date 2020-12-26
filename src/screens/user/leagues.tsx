import React from 'react';
import {View, Button, ScrollView} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {LeaguesStackType} from './leaguesStack';
import {verticalScale, ScaledSheet} from 'react-native-size-matters';
import {COLORS} from '../../utils/designSystem';
import {CardSmall, CardMedium} from '../../components/cards';

type ScreenNavigationProp = StackNavigationProp<LeaguesStackType, 'Leagues'>;

type Props = {
  navigation: ScreenNavigationProp;
};

export default function Leagues({navigation}: Props) {
  return (
    <ScrollView
      contentContainerStyle={{
        backgroundColor: COLORS.Dark,
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
        title="League Explorer"
        subTitle="Find a league in world"
      />
    </ScrollView>
  );
}
