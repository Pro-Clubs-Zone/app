import React from 'react';
import {View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {APP_COLORS, FONT_SIZES} from '../utils/designSystem';

export const IconButton = ({
  onPress,
  name,
}: {
  onPress: () => void;
  name: string;
}) => (
  <View
    style={{
      width: 48,
      alignItems: 'center',
      height: '100%',
      justifyContent: 'center',
    }}>
    <Icon
      name={name}
      size={FONT_SIZES.M}
      onPress={onPress}
      color={APP_COLORS.Dark}
    />
  </View>
);
