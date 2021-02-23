import React, {useLayoutEffect, useState} from 'react';
import {
  Text,
  View,
  Keyboard,
  ImageBackground,
  Pressable,
  TouchableWithoutFeedback,
  Alert,
  Linking,
} from 'react-native';
import {t, Trans} from '@lingui/macro';
import i18n from '../../utils/i18n';
import auth from '@react-native-firebase/auth';
import TextField from '../../components/textField';
import {TEXT_STYLES, APP_COLORS} from '../../utils/designSystem';
import {ScaledSheet} from 'react-native-size-matters';
//import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp, HeaderBackButton} from '@react-navigation/stack';
import {AppNavStack} from '../index';
import {BigButtonOutlined} from '../../components/buttons';
import FullScreenLoading from '../../components/loading';
import Toast from '../../components/toast';
import {StackActions} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import {ILeague} from '../../utils/interface';

type ScreenNavigationProp = StackNavigationProp<AppNavStack, 'Sign In'>;
//type ScreenRouteProp = RouteProp<AppNavStack, 'Sign In'>;

type Props = {
  navigation: ScreenNavigationProp;
  //  route: ScreenRouteProp;
};

const firAuth = auth();

export default function SignIn({navigation}: Props) {
  // const redirectedFrom = route.params?.redirectedFrom ?? 'home';
  // const redirectedData = route.params?.data as ILeague;

  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [errorStates, setErrorStates] = useState({
    email: '',
  });

  const popAction = StackActions.pop(2);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderBackButton
          onPress={() => navigation.dispatch(popAction)}
          labelVisible={false}
        />
      ),
    });
  }, [navigation]);

  const onShowToast = (message: string) => {
    setShowToast(true);
    setToastMessage(message);
    setTimeout(() => {
      setShowToast(false);
    }, 1000);
  };

  const onChangeText = (text: string, field: 'email') => {
    switch (field) {
      case 'email':
        setEmail(text);
        break;
    }

    if (errorStates[field]) {
      setErrorStates({...errorStates, [field]: ''});
    }
  };

  const fieldValidation = async () => {
    const re = /\S+@\S+\.\S+/;
    const emailValid = re.test(email);

    let errorStatus: Record<'email', string> = {
      email: '',
    };

    let noErrors = true;

    if (!emailValid && email !== '') {
      errorStatus.email = i18n._(t`Email is badly formatted`);
      noErrors = false;
    }
    if (email === '') {
      errorStatus.email = i18n._(t`Field can't be empty`);
      noErrors = false;
    }

    if (!noErrors) {
      setErrorStates(errorStatus);
      return false;
    }

    return true;
  };

  function onSignIn() {
    fieldValidation().then(async (noErrors) => {
      if (noErrors) {
        setLoading(true);
        await firAuth
          .sendSignInLinkToEmail(email, {
            android: {
              packageName: 'com.proclubszone',
              minimumVersion: '1',
              installApp: true,
            },
            iOS: {
              bundleId: 'com.proclubszone',
            },
            url: 'https://l.proclubs.zone/emu/',
            dynamicLinkDomain: 'l.proclubs.zone',
            handleCodeInApp: true,
          })
          .then(async () => {
            //   const jsonLeagueData = JSON.stringify(redirectedData);
            // const asyncLeagueData = ['@storage_LeagueData', jsonLeagueData];
            //   const asyncRedirect = ['@storage_RedirectedFrom', redirectedFrom];
            //            const asyncEmail = ['@storage_Email', email];
            try {
              await AsyncStorage.setItem('@storage_Email', email).then(() => {
                Alert.alert(
                  i18n._(t`Check your email`),
                  i18n._(
                    t`Use the link that you have received in your email to sign in`,
                  ),
                  [
                    {
                      text: i18n._(t`Close`),
                      onPress: () => navigation.dispatch(popAction),
                      style: 'cancel',
                    },
                  ],
                  {cancelable: false},
                );
              });
            } catch (e) {
              console.log('problem creating user', e);
            }
          })
          .catch((error) => {
            setLoading(false);

            if (error.code === 'auth/invalid-email') {
              onShowToast(i18n._(t`That email address is invalid`));
            }
            if (error.code === 'auth/user-not-found') {
              onShowToast(i18n._(t`There is no user with this email`));
            }
            if (error.code === 'auth/wrong-password') {
              onShowToast(
                i18n._(
                  t`The password is invalid or the user does not have a password.`,
                ),
              );
            }
            console.error(error);
          });
      }
    });
  }

  return (
    <ImageBackground source={{uri: 'main_bg'}} style={styles.backgroundImage}>
      <Toast message={toastMessage} visible={showToast} success={false} />
      <FullScreenLoading visible={loading} />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <View style={styles.contentFrame}>
            <View style={styles.content}>
              <TextField
                value={email}
                placeholder={i18n._(t`Enter E-mail`)}
                onChangeText={(text) => onChangeText(text, 'email')}
                keyboardType="email-address"
                autoCorrect={false}
                autoCapitalize="none"
                label={i18n._(t`E-mail`)}
                returnKeyType="next"
                helper="example@gmail.com"
                error={errorStates.email}
              />
              <BigButtonOutlined
                onPress={onSignIn}
                title={i18n._(t`Sign In`)}
              />
              {__DEV__ && (
                <>
                  <BigButtonOutlined
                    onPress={() => firAuth.signInAnonymously()}
                    title="Sign Anon"
                  />
                  <BigButtonOutlined
                    onPress={() => {
                      firAuth.createUserWithEmailAndPassword(email, '123456');
                    }}
                    title="Sign Up with email"
                  />
                  <BigButtonOutlined
                    onPress={() => {
                      firAuth.signInWithEmailAndPassword(email, '123456');
                    }}
                    title="Sign In with email"
                  />
                </>
              )}
              <Pressable
                onPress={() => {
                  Linking.openURL('https://proclubs.zone/privacy-policy');
                }}>
                <View style={styles.privacyPolicy}>
                  <Trans>
                    <Text style={TEXT_STYLES.small}>
                      By signing up you agree to our{' '}
                      <Text style={{...TEXT_STYLES.small, fontWeight: 'bold'}}>
                        Privacy Policy.
                      </Text>
                    </Text>
                  </Trans>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </ImageBackground>
  );
}

//---------- Stylesheet ----------//

const styles = ScaledSheet.create({
  backgroundImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  container: {
    paddingHorizontal: '24@vs',
    marginTop: '56@vs',
    maxWidth: '640@ms0.1',
    flex: 1,
    alignItems: 'center',
  },
  contentFrame: {
    flex: 1,
    flexDirection: 'row',
    //   marginTop: "32@vs"
  },
  content: {
    flex: 1,
  },
  footer: {
    height: '64@vs',
    borderTopWidth: 1,
    borderTopColor: APP_COLORS.Primary,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  privacyPolicy: {
    alignItems: 'center',
    marginTop: '16@vs',
  },
});
