import React from 'react';
import {ActivityIndicator, View, Text, Modal, ModalProps} from 'react-native';
import {APP_COLORS, TEXT_STYLES} from '../utils/designSystem';
import {ScaledSheet} from 'react-native-size-matters';
import {t} from '@lingui/macro';
import i18n from '../utils/i18n';

export default function FullScreenLoading(props: ModalProps) {
  return (
    <Modal presentationStyle="fullScreen" {...props}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={APP_COLORS.Accent} />
        <Text style={[TEXT_STYLES.title, styles.text]}>
          {props.label ? props.label : i18n._(t`Loading`)}
        </Text>
      </View>
    </Modal>
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
