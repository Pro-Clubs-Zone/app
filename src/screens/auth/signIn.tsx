import React, {useContext, useState} from 'react';
import {Text, TextInput, View, Button} from 'react-native';
import {AppContext} from '../../utils/context';
import auth from '@react-native-firebase/auth';

const firAuth = auth();

export default function SignIn() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  function onSignIn() {
    firAuth.signInWithEmailAndPassword(email, password);
  }

  return (
    <View>
      <TextInput
        style={{height: 40, borderColor: 'gray', borderWidth: 1}}
        onChangeText={(text) => setEmail(text)}
        value={email}
        placeholder="email"
        autoCompleteType="email"
        autoCorrect={false}
        autoCapitalize="none"
      />
      <TextInput
        style={{height: 40, borderColor: 'gray', borderWidth: 1}}
        onChangeText={(text) => setPassword(text)}
        value={password}
        placeholder="password"
        autoCompleteType="password"
      />
      <Button title="Sign In" onPress={onSignIn} />
    </View>
  );
}
