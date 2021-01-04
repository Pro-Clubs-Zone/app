import React from 'react';
import {View, ScrollView} from 'react-native';
import {ScaledSheet} from 'react-native-size-matters';

export const FormView = ({children}) => (
  <View style={styles.container}>{children}</View>
);

export const FormContent = ({children}) => (
  <ScrollView contentContainerStyle={styles.form}>{children}</ScrollView>
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
