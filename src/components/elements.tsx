import React from 'react';
import {View, Text} from 'react-native';
import {ScaledSheet} from 'react-native-size-matters';
import {TEXT_STYLES, APP_COLORS} from '../utils/designSystem';

export const Badge = ({number}: {number: number}) => (
  <View style={styles.badge}>
    <Text
      style={[
        TEXT_STYLES.small,
        {
          fontWeight: 'bold',
        },
      ]}>
      {number}
    </Text>
  </View>
);

//---------- Stylesheet ----------//

const styles = ScaledSheet.create({
  badge: {
    position: 'absolute',
    right: '16@vs',
    top: '16@vs',
    height: '20@vs',
    width: '20@vs',
    borderRadius: '20@vs',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: APP_COLORS.Red,
  },
});
