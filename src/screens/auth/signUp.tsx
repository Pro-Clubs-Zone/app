import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  Keyboard,
  ImageBackground,
  Linking,
  Pressable,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import {t, Trans} from '@lingui/macro';
import i18n from '../../utils/i18n';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import TextField from '../../components/textField';
import {TEXT_STYLES, APP_COLORS} from '../../utils/designSystem';
import {ScaledSheet} from 'react-native-size-matters';
import {StackNavigationProp} from '@react-navigation/stack';
import screenBg from '../../assets/images/login-bg.jpg';
import {AppNavStack} from '../index';
import {BigButtonOutlined} from '../../components/buttons';
import FullScreenLoading from '../../components/loading';
import Toast from '../../components/toast';

type ScreenNavigationProp = StackNavigationProp<AppNavStack, 'Home'>;

type Props = {
  navigation: ScreenNavigationProp;
};

const db = firestore();
const firAuth = auth();

function SignUp({navigation}: Props) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState({
    email: null,
    password: null,
    username: null,
  });

  const onShowAlert = (title, error) => {
    Alert.alert(
      title,
      error,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
  };

  const onChangeText = (
    text: string,
    field: 'email' | 'password' | 'username',
  ) => {
    switch (field) {
      case 'email':
        setEmail(text);
        break;
      case 'username':
        setUsername(text);
        break;
      case 'password':
        setPassword(text);
        break;
    }

    if (error[field]) {
      setError({...error, [field]: null});
    }
  };

  const fieldValidation = async () => {
    const re = /\S+@\S+\.\S+/;
    const emailValid = re.test(email);

    if (!emailValid && email !== '') {
      setError({...error, email: 'email is badly formatted'});
      return false;
    }
    if (email === '') {
      setError({...error, email: "Field can't be empty"});
      return false;
    }

    if (password === '') {
      setError({...error, password: "Field can't be empty"});
      return false;
    }

    if (password.length < 6 && password !== '') {
      setError({...error, password: 'at least 6 characters'});
      return false;
    }

    if (username === '') {
      setError({...error, username: "Field can't be empty"});
      return false;
    }

    if (username !== '' && username.length < 4) {
      setError({...error, username: 'At least 4 letters'});
      return false;
    }

    return true;
  };

  const onSignUp = () => {
    fieldValidation().then(async (noErrors) => {
      if (noErrors) {
        setLoading(true);

        const createDbEntry = async (data: {user: {uid: string}}) => {
          await db.collection('users').doc(data.user.uid).set({
            username: username,
          });
        };

        await firAuth
          .createUserWithEmailAndPassword(email, password)
          .then(async (data) => {
            //  console.log('User account created & signed in!', data);
            await createDbEntry(data);
          })
          .catch((error) => {
            if (error.code === 'auth/email-already-in-use') {
              // <Toast message="That email address is already in use'" />;
              // onShowAlert('Error', ');
              //     console.log('That email address is already in use!');
            }

            if (error.code === 'auth/invalid-email') {
              onShowAlert('Error', 'That email address is invalid');

              // console.log('That email address is invalid!');
            }

            //   setLoading(false);
            console.error(error);
          });
      }
    });
  };

  return (
    <ImageBackground source={screenBg} style={styles.backgroundImage}>
      <FullScreenLoading visible={loading} />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          {/* <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/logo.png')}
              resizeMode="contain"
              style={{
                height: '100%',
              }}
            />
          </View> */}
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
                //    onBlur={checkEmailFormat}

                helper="example@gmail.com"
                error={error.email}
              />
              <TextField
                value={password}
                //  secureTextEntry={true}
                placeholder={i18n._(t`Enter Password`)}
                onChangeText={(text) => onChangeText(text, 'password')}
                autoCorrect={false}
                label={i18n._(t`Password`)}
                helper="at least 6 characters"
                //      onBlur={checkPasswordFormat}
                // textContentType="newPassword"
                //  fieldIco={visibility}
                //  onPressIco={changePwdType}
                // error={
                //   !props.password &&
                //   passwordTouched &&
                //   i18n._(t`Password field cant't be empty`)
                // }
                error={error.password}
              />
              <TextField
                value={username}
                placeholder={i18n._(t`Enter Username`)}
                onChangeText={(text) => onChangeText(text, 'username')}
                keyboardType="default"
                autoCorrect={false}
                autoCapitalize="none"
                label={i18n._(t`Username`)}
                returnKeyType="next"
                error={error.username}
                helper={i18n._(t`PSN or Xbox Username`)}
              />
              <BigButtonOutlined
                onPress={onSignUp}
                title="Sign Up"
                // disabled={
                //   !props.email || !emailIsValid(props.email) || !props.password
                // }
              />
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
              {/* <View
                style={{
                  marginTop: verticalScale(24),
                }}>
                <View style={styles.sep}>
                  <View style={styles.sepLine} />
                  <Text style={[FONTS.display4, styles.sepText]}>
                    <Trans>OR</Trans>
                  </Text>
                  <View style={styles.sepLine} />
                </View>
                <View
                  style={{
                    marginTop: verticalScale(24),
                  }}>
                  <ExternalLogin
                    onPress={onFbSignupPress.bind(this)}
                    label={i18n._(
                      t`Sign up with ${
                        selectedPlatform == 'PSN' ? 'Facebook' : 'XBOX'
                      }`,
                    )}
                    platform={selectedPlatform}
                  />
                </View>
              </View> */}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
      <Pressable
        style={{width: '100%'}}
        onPress={() => navigation.navigate('Sign In')}>
        <View style={styles.footer}>
          <Trans>
            <Text style={TEXT_STYLES.small}>
              Already have an account?{' '}
              <Text style={{...TEXT_STYLES.small, fontWeight: 'bold'}}>
                Log in now.
              </Text>
            </Text>
          </Trans>
        </View>
      </Pressable>
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
    //  marginTop: "32@vs"
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
  logoContainer: {
    height: '112@vs',
    alignItems: 'center',
  },
  sepLine: {
    height: '3@vs',
    width: '48@vs',
    backgroundColor: APP_COLORS.Accent,
  },
  sep: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sepText: {
    color: APP_COLORS.Accent,
    textAlign: 'center',
    marginHorizontal: '16@vs',
  },
  privacyPolicy: {
    alignItems: 'center',
    marginTop: '16@vs',
  },
});

export default SignUp;
