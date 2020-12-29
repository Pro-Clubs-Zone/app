import React from 'react';
import {Text, View} from 'react-native';
import {TEXT_STYLES} from '../utils/designSystem';
import {PrimaryButton} from './buttons';
import {verticalScale, ScaledSheet} from 'react-native-size-matters';

type Props = {
  title: string;
  body?: string;
  buttonTitle?: string;
  buttonOnPress?: () => void;
};

const EmptyState = (props: Props) => (
  <View style={styles.container}>
    <Text
      style={[
        TEXT_STYLES.display4,
        {
          textAlign: 'center',
        },
      ]}>
      {props.title}
    </Text>
    <Text
      style={[
        TEXT_STYLES.body,
        {
          textAlign: 'center',
          marginTop: verticalScale(8),
        },
      ]}>
      {props.body}
    </Text>
    {props.buttonTitle && (
      <View
        style={{
          marginTop: verticalScale(24),
        }}>
        <PrimaryButton
          title={props.buttonTitle}
          onPress={props.buttonOnPress}
        />
      </View>
    )}
  </View>
);

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    padding: '24@vs',
  },
});

export default EmptyState;
