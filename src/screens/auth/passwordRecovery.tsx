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

type ScreenNavigationProp = StackNavigationProp<
  AppNavStack,
  'Password Recovery'
>;
type ScreenRouteProp = RouteProp<AppNavStack, 'Password Recovery'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

const firAuth = auth();

export default function PasswordRecovery({navigation}: Props) {
  const [email, setEmail] = useState<string>('');
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
    setEmail(text);
    if (error) {
      setError(null);
    }
  };

  const fieldValidation = async () => {
    const re = /\S+@\S+\.\S+/;
    const emailValid = re.test(email);

    let errorStatus: Record<'email', null | string> = {
      email: null,
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
      setError(errorStatus.email);
      return false;
    }

    return true;
  };

  const onRecoverPassword = async () => {
    const noErrors = await fieldValidation();
    if (noErrors) {
      setLoading(true);
      try {
        await firAuth.sendPasswordResetEmail(email);
        Alert.alert(
          i18n._(t`Password Reset`),
          i18n._(t`Password reset link was send to your email`),
          [
            {
              text: i18n._(t`Close`),
              onPress: () => navigation.goBack(),
              style: 'cancel',
            },
          ],
          {cancelable: false},
        );
      } catch (prcErr) {
        setLoading(false);

        if (prcErr.code === 'auth/invalid-email') {
          onShowToast(i18n._(t`That email address is invalid`));
        }
        if (prcErr.code === 'auth/user-not-found') {
          onShowToast(i18n._(t`There is no user with this email`));
        }
        console.error(prcErr);
      }
    }
  };

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
                onChangeText={(text) => onChangeText(text)}
                keyboardType="email-address"
                autoCorrect={false}
                autoCapitalize="none"
                label={i18n._(t`E-mail`)}
                returnKeyType="next"
                helper="example@gmail.com"
                error={error}
              />
              <BigButtonOutlined
                onPress={onRecoverPassword}
                title={i18n._(t`Get Reset Link`)}
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
