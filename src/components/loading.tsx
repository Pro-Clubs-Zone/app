import React from 'react';
import {ActivityIndicator, View, Text, Modal, ModalProps} from 'react-native';
import {APP_COLORS, TEXT_STYLES} from '../utils/designSystem';
import {ScaledSheet} from 'react-native-size-matters';
import {t} from '@lingui/macro';
import i18n from '../utils/i18n';

export default function FullScreenLoading({
  label,
  ...props
}: {label?: string} & ModalProps) {
  return (
    <Modal presentationStyle="fullScreen" {...props}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={APP_COLORS.Accent} />
        <Text style={[TEXT_STYLES.title, styles.text]}>
          {label ? label : i18n._(t`Loading`)}
        </Text>
      </View>
    </Modal>
  );
}
export function NonModalLoading({
  label,
  visible,
}: {
  label?: string;
  visible: boolean;
}) {
  return (
    <View
      style={[
        styles.container,
        {
          display: visible ? 'flex' : 'none',
        },
      ]}>
      <ActivityIndicator size="large" color={APP_COLORS.Accent} />
      <Text style={[TEXT_STYLES.title, styles.text]}>
        {label ? label : i18n._(t`Loading`)}
      </Text>
    </View>
  );
}

const styles = ScaledSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: APP_COLORS.Dark,
    width: '100%',
    height: '100%',
  },
  text: {
    marginTop: '8@vs',
    color: APP_COLORS.Gray,
  },
});
