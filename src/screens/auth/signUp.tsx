import React, {useState} from 'react';
import {Text, View, Button, TextInput, ActivityIndicator} from 'react-native';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import TextField from '../../components/textField';

const db = firestore();
const firAuth = auth();

function SignUp({navigation}) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const onSignUp = () => {
    const createDbEntry = (data: {user: {uid: string}}) => {
      db.collection('users').doc(data.user.uid).set({
        username: username,
      });
    };

    setLoading(true);

    firAuth
      .createUserWithEmailAndPassword(email, password)
      .then((data) => {
        console.log('User account created & signed in!', data);
        return createDbEntry(data);
      })
      .catch((error) => {
        if (error.code === 'auth/email-already-in-use') {
          console.log('That email address is already in use!');
        }

        if (error.code === 'auth/invalid-email') {
          console.log('That email address is invalid!');
        }

        console.error(error);
      });
  };

  return (
    <View>
      {
        // loading && <Loading />
      }
      <TextField
        onChangeText={(text) => setEmail(text)}
        value={email}
        placeholder="email"
        autoCompleteType="email"
        autoCorrect={false}
        label="email"
      />
      <TextField
        onChangeText={(text) => setPassword(text)}
        value={password}
        placeholder="password"
        autoCompleteType="password"
        label="password"
      />
      <TextField
        onChangeText={(text) => setUsername(text)}
        value={username}
        label="username"
        placeholder="username"
      />
      <Button title="Sign Up" onPress={onSignUp} />
    </View>
  );
}

const Loading = () => (
  <View>
    <ActivityIndicator size="large" />
  </View>
);

export default SignUp;
