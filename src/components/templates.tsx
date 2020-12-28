import React from 'react';
import {View} from 'react-native';
import {ScaledSheet} from 'react-native-size-matters';

export const FormView = ({children}) => (
  <View style={styles.container}>{children}</View>
);

export const FormContent = ({children}) => (
  <View style={styles.form}>{children}</View>
);

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  form: {
    paddingHorizontal: '16@vs',
    paddingTop: '16@vs',
  },
});
