import React, {useState} from 'react';
import {
  View,
  Keyboard,
  ImageBackground,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import {t} from '@lingui/macro';
import i18n from '../../utils/i18n';
import auth from '@react-native-firebase/auth';
import TextField from '../../components/textField';
import {ScaledSheet} from 'react-native-size-matters';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AppNavStack} from '../index';
import {BigButtonOutlined} from '../../components/buttons';
import FullScreenLoading from '../../components/loading';
import Toast from '../../components/toast';

type ScreenNavigationProp = StackNavigationProp<AppNavStack, 'Reset Password'>;
type ScreenRouteProp = RouteProp<AppNavStack, 'Reset Password'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

const firAuth = auth();

export default function ResetPassword({navigation, route}: Props) {
  const oobCode = route.params.oobCode;

  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [error, setError] = useState<string | null>();

  const onShowToast = (message: string) => {
    setShowToast(true);
    setToastMessage(message);
    setTimeout(() => {
      setShowToast(false);
    }, 1000);
  };

  const onChangeText = (text: string) => {
    setPassword(text);
    if (error) {
      setError(null);
    }
  };

  const fieldValidation = async () => {
    let errorStatus: Record<'password', null | string> = {
      password: null,
    };

    let noErrors = true;

    if (password === '') {
      errorStatus.password = i18n._(t`Field can't be empty`);
      noErrors = false;
    }

    if (password.length < 6 && password !== '') {
      errorStatus.password = i18n._(t`At least ${6} characters`);
      noErrors = false;
    }

    if (!noErrors) {
      setError(errorStatus.password);
      return false;
    }

    return true;
  };

  function onResetPassword() {
    fieldValidation().then(async (noErrors) => {
      if (noErrors) {
        setLoading(true);
        await firAuth
          .confirmPasswordReset(oobCode, password)
          .then(() => {
            Alert.alert(
              i18n._(t`Password Changed`),
              i18n._(t`You can sign in with your new password`),
              [
                {
                  text: i18n._(t`Close`),
                  onPress: () => navigation.goBack(),
                  style: 'cancel',
                },
              ],
              {cancelable: false},
            );
          })
          .catch((error) => {
            if (error.code === 'auth/expired-action-code') {
              onShowToast(i18n._(t`Password reset code has expired`));
            }
            if (error.code === 'auth/weak-password') {
              onShowToast(i18n._(t`New password is not strong enough.`));
            }
            setLoading(false);
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
                value={password}
                placeholder={i18n._(t`Enter Password`)}
                onChangeText={(text) => onChangeText(text)}
                autoCorrect={false}
                autoCapitalize="none"
                label={i18n._(t`Password`)}
                error={error}
                //  blurOnSubmit={false}
                //   secureTextEntry={true}
                //  textContentType="password"
                // fieldIco={visibility}
                // onPressIco={changePwdType}
              />
              <BigButtonOutlined
                onPress={onResetPassword}
                title={i18n._(t`Reset Password`)}
              />
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
});
