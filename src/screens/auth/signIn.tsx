import React, {useState} from 'react';
import {
  Text,
  View,
  Button,
  ActivityIndicator,
  Keyboard,
  ImageBackground,
  Image,
  Linking,
  Pressable,
  TouchableWithoutFeedback,
} from 'react-native';
import {t, Trans} from '@lingui/macro';
import i18n from '../../utils/i18n';
import auth from '@react-native-firebase/auth';
import TextField from '../../components/textField';
import {TEXT_STYLES, APP_COLORS} from '../../utils/designSystem';
import {verticalScale, ScaledSheet} from 'react-native-size-matters';
import {StackNavigationProp} from '@react-navigation/stack';
import screenBg from '../../assets/images/login-bg.jpg';
import {AppNavStack} from '../index';

type ScreenNavigationProp = StackNavigationProp<AppNavStack, 'Home'>;

type Props = {
  navigation: ScreenNavigationProp;
};

const firAuth = auth();

export default function SignIn({navigation}: Props) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  function onSignIn() {
    firAuth.signInWithEmailAndPassword(email, password);
  }

  return (
    <ImageBackground source={screenBg} style={styles.backgroundImage}>
      {
        // loading && <LoginSpinner visible={loading} />
      }
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
                onChangeText={(text) => setEmail(text)}
                keyboardType="email-address"
                autoCorrect={false}
                autoCapitalize="none"
                label={i18n._(t`E-mail`)}
                returnKeyType="next"
                autoFocus={true}
                // onBlur={onEmailBlur}
                // error={emailError}
              />
              <TextField
                value={password}
                placeholder={i18n._(t`Enter Password`)}
                onChangeText={(text) => setPassword(text)}
                autoCorrect={false}
                autoCapitalize="none"
                label={i18n._(t`Password`)}
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
              <Button
                onPress={onSignIn}
                title={i18n._(t`Log in`)}
                // disabled={
                //   !email ||
                //   !emailIsValid(email) ||
                //   !password
                // }
              />
              {/* <Pressable onPress={onResetPassword.bind(this)}>
                <View style={styles.resetPass}>
                  <Trans>
                    <Text style={TEXT_STYLES.small.small}>
                      Forgot login details?{" "}
                      <Text style={TEXT_STYLES.small.smallBold}>
                        Get help recovering it.
                      </Text>
                    </Text>
                  </Trans>
                </View>
              </Pressable>
              <View
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
              Don’t have an account?
              <Text style={TEXT_STYLES.small}> Sign up now.</Text>
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

  // return (
  //   <View>
  //     <TextInput
  //       style={{height: 40, borderColor: 'gray', borderWidth: 1}}
  //       onChangeText={(text) => setEmail(text)}
  //       value={email}
  //       placeholder="email"
  //       autoCompleteType="email"
  //       autoCorrect={false}
  //       autoCapitalize="none"
  //     />
  //     <TextInput
  //       style={{height: 40, borderColor: 'gray', borderWidth: 1}}
  //       onChangeText={(text) => setPassword(text)}
  //       value={password}
  //       placeholder="password"
  //       autoCompleteType="password"
  //     />
  //     <Button title="Sign In" onPress={onSignIn} />
  //   </View>
  // );
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
