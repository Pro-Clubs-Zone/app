import React from 'react';
import {View, ScrollView, KeyboardAvoidingView, Platform} from 'react-native';
import {ScaledSheet} from 'react-native-size-matters';

export const FormView = ({children}: {children: JSX.Element[]}) => (
  <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView bounces={false} contentContainerStyle={styles.container}>
      {children}
    </ScrollView>
  </KeyboardAvoidingView>
);

export const FormContent = ({
  children,
}: {
  children: JSX.Element[] | JSX.Element;
}) => <View style={styles.form}>{children}</View>;

const styles = ScaledSheet.create({
  container: {
    minHeight: '100%',
  },
  form: {
    padding: '16@vs',
    flex: 1,
  },
});
