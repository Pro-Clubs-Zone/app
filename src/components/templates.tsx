import React from 'react';
import {View, ScrollView} from 'react-native';
import {ScaledSheet} from 'react-native-size-matters';

export const FormView = ({children}) => (
  <ScrollView bounces={false} contentContainerStyle={styles.container}>
    {children}
  </ScrollView>
);

export const FormContent = ({children}) => (
  <View style={styles.form}>{children}</View>
);

const styles = ScaledSheet.create({
  container: {
    minHeight: '100%',
  },
  form: {
    padding: '16@vs',
    flex: 1,
  },
});
