import React from 'react';
import {Text, View, Switch, SwitchProps} from 'react-native';
import {TEXT_STYLES, APP_COLORS} from '../utils/designSystem';
import {verticalScale} from 'react-native-size-matters';

export default function SwitchLabel({
  title,
  subtitle,
  ...props
}: {
  title: string;
  subtitle?: string;
} & SwitchProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignContent: 'center',
        alignItems: 'center',
        paddingBottom: verticalScale(16),
      }}>
      <View>
        <Text style={TEXT_STYLES.body}>{title}</Text>
        {subtitle && (
          <Text
            style={[
              TEXT_STYLES.small,
              {
                color: APP_COLORS.Gray,
              },
            ]}>
            {subtitle}
          </Text>
        )}
      </View>
      <Switch
        trackColor={{false: APP_COLORS.Dark, true: APP_COLORS.Accent}}
        thumbColor={APP_COLORS.Primary}
        ios_backgroundColor={APP_COLORS.Dark}
        //  onValueChange={toggleSwitch}
        {...props}
      />
    </View>
  );
}
