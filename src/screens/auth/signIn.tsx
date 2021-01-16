import React, {useLayoutEffect, useState} from 'react';
import {
  Text,
  View,
  Keyboard,
  ImageBackground,
  Pressable,
  TouchableWithoutFeedback,
} from 'react-native';
import {t, Trans} from '@lingui/macro';
import i18n from '../../utils/i18n';
import auth from '@react-native-firebase/auth';
import TextField from '../../components/textField';
import {TEXT_STYLES, APP_COLORS} from '../../utils/designSystem';
import {ScaledSheet, verticalScale} from 'react-native-size-matters';
import {StackNavigationProp, HeaderBackButton} from '@react-navigation/stack';
import {AppNavStack} from '../index';
import {BigButtonOutlined} from '../../components/buttons';
import FullScreenLoading from '../../components/loading';
import Toast from '../../components/toast';
import {StackActions} from '@react-navigation/native';

type ScreenNavigationProp = StackNavigationProp<AppNavStack, 'Home'>;

type Props = {
  navigation: ScreenNavigationProp;
};

const firAuth = auth();

export default function SignIn({navigation}: Props) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [errorStates, setErrorStates] = useState({
    email: null,
    password: null,
  });

  useLayoutEffect(() => {
    const popAction = StackActions.pop(2);

    navigation.setOptions({
      headerLeft: () => (
        <HeaderBackButton onPress={() => navigation.dispatch(popAction)} />
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

  const onChangeText = (text: string, field: 'email' | 'password') => {
    switch (field) {
      case 'email':
        setEmail(text);
        break;
      case 'password':
        setPassword(text);
        break;
    }

    if (errorStates[field]) {
      setErrorStates({...errorStates, [field]: null});
    }
  };

  const fieldValidation = async () => {
    const re = /\S+@\S+\.\S+/;
    const emailValid = re.test(email);

    let errorStatus: Record<
      'email' | 'password' | 'username',
      null | string
    > = {
      email: null,
      password: null,
      username: null,
    };

    let noErrors = true;

    if (!emailValid && email !== '') {
      errorStatus.email = 'email is badly formatted';
      noErrors = false;
    }
    if (email === '') {
      errorStatus.email = "Field can't be empty";
      noErrors = false;
    }

    if (password === '') {
      errorStatus.password = "Field can't be empty";
      noErrors = false;
    }

    if (password.length < 6 && password !== '') {
      errorStatus.password = 'at least 6 characters';
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
          .signInWithEmailAndPassword(email, password)
          .catch((error) => {
            setLoading(false);

            if (error.code === 'auth/invalid-email') {
              onShowToast('That email address is invalid');
            }
            if (error.code === 'auth/user-not-found') {
              onShowToast('There is no user with this email');
            }
            if (error.code === 'auth/wrong-password') {
              onShowToast(
                'The password is invalid or the user does not have a password.',
              );
            }
            console.error(error);
          });
      }
    });
  }

  return (
    <ImageBackground source={{uri: 'main_bg'}} style={styles.backgroundImage}>
      <Toast message={toastMessage} visible={showToast} />
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
              <TextField
                value={password}
                placeholder={i18n._(t`Enter Password`)}
                onChangeText={(text) => onChangeText(text, 'password')}
                autoCorrect={false}
                autoCapitalize="none"
                label={i18n._(t`Password`)}
                error={errorStates.password}
                //  blurOnSubmit={false}
                //   secureTextEntry={true}
                //  textContentType="password"
                // fieldIco={visibility}
                // onPressIco={changePwdType}
                // error={
                //   !password &&
                //   passwordTouched &&
                //   i18n._(t`Password field cant't be empty`)
                // }
              />
              <BigButtonOutlined
                onPress={onSignIn}
                title={i18n._(t`Sign In`)}
                // disabled={
                //   !email ||
                //   !emailIsValid(email) ||
                //   !password
                // }
              />
              <Pressable>
                <View style={styles.resetPass}>
                  <Trans>
                    <Text style={TEXT_STYLES.small}>
                      Forgot login details?{' '}
                      <Text style={[TEXT_STYLES.small, {fontWeight: 'bold'}]}>
                        Get help recovering it.
                      </Text>
                    </Text>
                  </Trans>
                </View>
              </Pressable>
              {/* <View
                style={{
                  marginTop: verticalScale(24)
                }}
              >
                <View style={styles.sep}>
                  <View style={styles.sepLine} />
                  <Text style={[TEXT_STYLES.small.display4, styles.sepText]}>
                    <Trans>OR</Trans>
                  </Text>
                  <View style={styles.sepLine} />
                </View>
                <View
                  style={{
                    marginTop: verticalScale(24)
                  }}
                >
                  <ExternalLogin
                    onPress={onFbLoginPress.bind(this)}
                    label={i18n._(
                      t`Log in with ${
                        selectedPlatform == "PSN" ? "Facebook" : "XBOX"
                      }`
                    )}
                    platform={selectedPlatform}
                  />
                </View>
              </View> */}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
      <Pressable onPress={() => navigation.goBack()} style={{width: '100%'}}>
        <View style={styles.footer}>
          <Trans>
            <Text style={TEXT_STYLES.small}>
              Don’t have an account?{' '}
              <Text style={[TEXT_STYLES.small, {fontWeight: 'bold'}]}>
                Sign up now.
              </Text>
            </Text>
          </Trans>
        </View>
      </Pressable>
      {/* {openXBL && (
        <XboxSignup
          openModal={openXBL}
          closeModal={() => setState({ openXBL: false })}
          onSignInSuccess={createMicrosoftUser}
          signupUrl={MS_OAUTH}
        />
      )} */}
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
  resetPass: {
    alignItems: 'center',
    marginTop: '16@vs',
  },
});
