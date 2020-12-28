import React from 'react';
import {Modal, Text, View} from 'react-native';
import {ScaledSheet} from 'react-native-size-matters';

const Toast = ({message}: {message: string}) => (
  <Modal transparent={true} animationType="slide" style={styles.modalContainer}>
    <View>
      <Text>{message}</Text>
    </View>
  </Modal>
);

export default Toast;

const styles = ScaledSheet.create({
  modalContainer: {
    width: '50%',
    minWidth: '200@vs',
    backgroundColor: 'red',
  },
});
