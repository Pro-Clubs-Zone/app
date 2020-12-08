import React, {useContext, useState} from 'react';
import {Text, View, Button, TextInput, ActivityIndicator} from 'react-native';
import {AppContext} from '../../utils/context';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import CheckBox from '@react-native-community/checkbox';

const db = firestore();
const firAuth = auth();

function SignUp({navigation}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignUp = () => {
    setLoading(true);

    const createDbEntry = (data) => {
      db.collection('users')
        .doc(data.context.user.uid)
        .set({
          username: username,
        })
        .then(() => {
          console.log('entry created');
          setLoading(false);
        });
    };

    firAuth
      .createUserWithEmailAndPassword(email, password)
      .then((data) => {
        console.log('User account created & signed in!', data);
        createDbEntry(data);
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
      {loading && <Loading />}
      <TextInput
        style={{height: 40, borderColor: 'gray', borderWidth: 1}}
        onChangeText={(text) => setEmail(text)}
        value={email}
        placeholder="email"
        autoCompleteType="email"
        autoCorrect={false}
      />
      <TextInput
        style={{height: 40, borderColor: 'gray', borderWidth: 1}}
        onChangeText={(text) => setPassword(text)}
        value={password}
        placeholder="password"
        autoCompleteType="password"
      />
      <TextInput
        style={{height: 40, borderColor: 'gray', borderWidth: 1}}
        onChangeText={(text) => setUsername(text)}
        value={username}
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
