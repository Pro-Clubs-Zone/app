import React from 'react';
import {Modal, ModalProps, View, TouchableWithoutFeedback} from 'react-native';
import {MinButton} from './buttons';
import {ScaledSheet} from 'react-native-size-matters';
import {APP_COLORS} from '../utils/designSystem';

const PickerContainer = (
  props: ModalProps & {
    children: JSX.Element;
    onApply: () => void;
    onCancel: () => void;
  },
) => (
  <Modal
    presentationStyle="overFullScreen"
    transparent={true}
    animationType="fade"
    {...props}>
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={props.onCancel}>
        <View
          style={{
            flex: 1,
          }}
        />
      </TouchableWithoutFeedback>
      <View style={styles.content}>
        <View style={styles.header}>
          <MinButton title="Cancel" onPress={props.onCancel} secondary />
          <MinButton title="Apply" onPress={props.onApply} />
        </View>
        {props.children}
      </View>
    </View>
  </Modal>
);

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: APP_COLORS.Secondary,
    justifyContent: 'center',
  },
  header: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
});
export default PickerContainer;
