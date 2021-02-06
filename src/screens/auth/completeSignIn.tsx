import React, {useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FullScreenLoading from '../../components/loading';
import {Alert} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
//import {RouteProp} from '@react-navigation/native';
import {AppNavStack} from '../index';
import {t} from '@lingui/macro';
import i18n from '../../utils/i18n';
import auth from '@react-native-firebase/auth';

type ScreenNavigationProp = StackNavigationProp<
  AppNavStack,
  'Complete Sign In'
>;
//type ScreenRouteProp = RouteProp<AppNavStack, 'Complete Sign In'>;

type Props = {
  navigation: ScreenNavigationProp;
  // route: ScreenRouteProp;
};

const firAuth = auth();

const CompleteSignIn = ({navigation}: Props) => {
  useEffect(() => {
    const getData = async () => {
      let asyncData;
      try {
        asyncData = await AsyncStorage.multiGet([
          '@storage_Email',
          '@storage_Url',
          //  '@storage_RedirectedFrom',
        ]);

        const email = asyncData[0][1];
        const url = asyncData[1][1];

        if (email !== null && url !== null) {
          if (firAuth.isSignInWithEmailLink(url)) {
            console.log('signed in with email');

            firAuth
              .signInWithEmailLink(email, url)
              .then(async () => {
                const keys = ['@storage_Email', '@storage_Url'];
                try {
                  await AsyncStorage.multiRemove(keys);
                } catch (e) {
                  console.log('cache clear error', e);
                }
              })
              .catch((e) => {
                console.log('something wrong with the link', e);
                Alert.alert(
                  i18n._(t`Wrong sign in link`),
                  i18n._(
                    t`It seems you've used wrong sign in link, please try again.`,
                  ),
                  [
                    {
                      text: i18n._(t`Close`),
                      onPress: () => navigation.goBack(),
                      style: 'cancel',
                    },
                  ],
                  {cancelable: false},
                );
              });
          }
        } else {
          throw new Error('something wrong with data');
        }
      } catch (e) {
        console.log('error completing sign up', e);
        Alert.alert(
          i18n._(t`Wrong sign in link`),
          i18n._(t`It seems you've used wrong sign in link, please try again.`),
          [
            {
              text: i18n._(t`Close`),
              onPress: () => navigation.goBack(),
              style: 'cancel',
            },
          ],
          {cancelable: false},
        );
      }
    };

    getData();
  }, []);

  return <FullScreenLoading visible={true} label={i18n._(t`Signing you in`)} />;
};

export default CompleteSignIn;
