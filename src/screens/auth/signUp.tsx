import React, {useContext, useState} from 'react';
import {
  View,
  Keyboard,
  ImageBackground,
  TouchableWithoutFeedback,
} from 'react-native';
import {t} from '@lingui/macro';
import i18n from '../../utils/i18n';
import auth from '@react-native-firebase/auth';
import TextField from '../../components/textField';
import {APP_COLORS} from '../../utils/designSystem';
import {ScaledSheet} from 'react-native-size-matters';
import {StackNavigationProp} from '@react-navigation/stack';
import {CommonActions} from '@react-navigation/native';
import {AppNavStack} from '../index';
import {BigButtonOutlined} from '../../components/buttons';
import FullScreenLoading from '../../components/loading';
import firestore from '@react-native-firebase/firestore';
import {IUser} from '../../utils/interface';
import {AppContext} from '../../context/appContext';

type ScreenNavigationProp = StackNavigationProp<AppNavStack, 'Sign Up'>;
// type ScreenRouteProp = RouteProp<AppNavStack, 'Sign Up'>;

type Props = {
  navigation: ScreenNavigationProp;
  //route: ScreenRouteProp;
};

const firAuth = auth();
const db = firestore();

function SignUp({navigation}: Props) {
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorStates, setErrorStates] = useState({
    username: '',
  });

  // const redirectedFrom: string = route.params?.redirectedFrom ?? 'home';
  // const redirectedData = route.params?.data as ILeague;

  const uid = firAuth.currentUser!.uid;
  const context = useContext(AppContext);

  const onChangeText = (text: string, field: 'username') => {
    switch (field) {
      case 'username':
        setUsername(text.trim());
        break;
    }

    if (errorStates[field]) {
      setErrorStates({...errorStates, [field]: ''});
    }
  };

  const fieldValidation = async () => {
    let errorStatus: Record<'username', string> = {
      username: '',
    };

    let noErrors = true;

    if (username === '') {
      errorStatus.username = i18n._(t`Field can't be empty`);
      noErrors = false;
    }

    if (username !== '' && username.length < 4) {
      errorStatus.username = i18n._(t`At least ${4} characters`);
      noErrors = false;
    }

    if (username.includes(' ')) {
      errorStatus.username = i18n._(t`No space character`);
      noErrors = false;
    }

    if (!noErrors) {
      setErrorStates(errorStatus);
      return false;
    }

    return true;
  };

  const onSignUp = async () => {
    const userInitialData: IUser = {
      username: username,
      premium: false,
    };

    fieldValidation().then(async (noErrors) => {
      if (noErrors) {
        const update = {
          displayName: username,
        };
        setLoading(true);
        await firAuth.currentUser!.updateProfile(update);
        await db
          .collection('users')
          .doc(uid)
          .set(userInitialData, {
            merge: true,
          })
          .then(async () => {
            context.setUserData(userInitialData);
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{name: 'Home'}],
              }),
            );
          });
      }
    });
  };
  return (
    <ImageBackground source={{uri: 'main_bg'}} style={styles.backgroundImage}>
      <FullScreenLoading visible={loading} />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <View style={styles.contentFrame}>
            <View style={styles.content}>
              <TextField
                value={username}
                placeholder={i18n._(t`Enter Username`)}
                onChangeText={(text) => onChangeText(text, 'username')}
                keyboardType="default"
                autoCorrect={false}
                autoCapitalize="none"
                label={i18n._(t`Username`)}
                returnKeyType="next"
                error={errorStates.username}
                helper={i18n._(t`PSN or Xbox Username`)}
                maxLength={16}
              />
              <BigButtonOutlined
                onPress={onSignUp}
                title={i18n._(t`Sign Up`)}
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
});

export default SignUp;
