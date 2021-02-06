import React, {useContext, useEffect} from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {AppContext} from '../../context/appContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FullScreenLoading from '../../components/loading';
// import {StackNavigationProp} from '@react-navigation/stack';
// import {RouteProp} from '@react-navigation/native';
// import {AppNavStack} from '../index';
import {t, Trans} from '@lingui/macro';
import i18n from '../../utils/i18n';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {IUser} from '../../utils/interface';

// type ScreenNavigationProp = StackNavigationProp<
//   AppNavStack,
//   'Complete Sign In'
// >;
// type ScreenRouteProp = RouteProp<AppNavStack, 'Complete Sign In'>;

// type Props = {
//   navigation: ScreenNavigationProp;
//   route: ScreenRouteProp;
// };

const db = firestore();
const firAuth = auth();

const CompleteSignIn = () => {
  const context = useContext(AppContext);

  useEffect(() => {
    const getData = async () => {
      try {
        const email = await AsyncStorage.getItem('@storage_Email');
        const username = await AsyncStorage.getItem('@storage_Username');
        const url = await AsyncStorage.getItem('@storage_Url');
        if (email !== null && url !== null) {
          if (firAuth.isSignInWithEmailLink(url)) {
            console.log('signed in with email');

            firAuth
              .signInWithEmailLink(email, url)
              .then(async (data) => {
                const uid = data.user.uid;
                const userInitialData: IUser = {
                  username: username,
                  premium: false,
                };
                await db
                  .collection('users')
                  .doc(uid)
                  .set(userInitialData)
                  .then(() => {
                    context.setUserData(userInitialData);
                  });
              })
              .then(async () => {
                const keys = [
                  '@storage_Email',
                  '@storage_Username',
                  '@storage_Url',
                ];
                try {
                  await AsyncStorage.multiRemove(keys);
                } catch (e) {
                  console.log('cache clear error', e);
                }

                console.log('Done');
              });
          }
        }
      } catch (e) {
        console.log('error completing sign up', e);
      }
    };

    getData();
  }, [context]);

  return (
    <>
      <FullScreenLoading visible={true} label={i18n._(t`Signing you in`)} />
    </>
  );
};

export default CompleteSignIn;
