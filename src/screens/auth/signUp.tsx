import React, {useContext, useState} from 'react';
import {
  View,
  Keyboard,
  ImageBackground,
  TouchableWithoutFeedback,
  Pressable,
  Text,
} from 'react-native';
import {t} from '@lingui/macro';
import i18n from '../../utils/i18n';
import auth from '@react-native-firebase/auth';
import TextField from '../../components/textField';
import {APP_COLORS, TEXT_STYLES} from '../../utils/designSystem';
import {ScaledSheet} from 'react-native-size-matters';
import {StackNavigationProp} from '@react-navigation/stack';
import {AppNavStack} from '../index';
import {BigButtonOutlined} from '../../components/buttons';
import FullScreenLoading from '../../components/loading';
import firestore from '@react-native-firebase/firestore';
import {IUser} from '../../utils/interface';
import {AppContext} from '../../context/appContext';
import Toast from '../../components/toast';

type ScreenNavigationProp = StackNavigationProp<AppNavStack, 'Sign Up'>;
// type ScreenRouteProp = RouteProp<AppNavStack, 'Sign Up'>;

type Props = {
  navigation: ScreenNavigationProp;
  //route: ScreenRouteProp;
};

const firAuth = auth();
const db = firestore();

function SignUp({navigation}: Props) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [errorStates, setErrorStates] = useState({
    email: null,
    password: null,
    username: null,
  });

  // const redirectedFrom: string = route.params?.redirectedFrom ?? 'home';
  // const redirectedData = route.params?.data as ILeague;

  const context = useContext(AppContext);

  const onShowToast = (message: string) => {
    setShowToast(true);
    setToastMessage(message);
    setTimeout(() => {
      setShowToast(false);
    }, 1000);
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
        setUsername(text.trim());
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
      errorStatus.email = i18n._(t`Email is badly formatted`);
      noErrors = false;
    }
    if (email === '') {
      errorStatus.email = i18n._(t`Field can't be empty`);
      noErrors = false;
    }

    if (password === '') {
      errorStatus.password = i18n._(t`Field can't be empty`);
      noErrors = false;
    }

    if (password.length < 6 && password !== '') {
      errorStatus.password = i18n._(t`At least ${6} characters`);
      noErrors = false;
    }

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
    const noErrors = await fieldValidation();
    if (noErrors) {
      try {
        setLoading(true);
        const createDbEntry = async (data: {user: {uid: string}}) => {
          const uid = data.user.uid;
          const userInitialData: IUser = {username: username, premium: false};
          try {
            await db.collection('users').doc(uid).set(userInitialData);
            context.setUserData(userInitialData);
          } catch (error) {
            console.log(error);

            throw new Error(error);
          }
        };

        const userData = await firAuth.createUserWithEmailAndPassword(
          email,
          password,
        );
        const userProfile = {
          displayName: username,
        };
        setLoading(true);
        return await Promise.all([
          firAuth.currentUser.updateProfile(userProfile),
          createDbEntry(userData),
          userData.user.sendEmailVerification(),
        ]);
        //   setLoading(false);
        // const onCreateLeague = async () => {
        //   const {user} = userData;
        //   await createLeague(redirectedData, user.uid, username).then(
        //     (leagueId) => {
        //       let updatedUserData = {...context.userData};
        //       let updatedUserLeagues = {...context.userLeagues};

        //       updatedUserData = {
        //         username: username,
        //         premium: false,
        //         leagues: {
        //           [leagueId]: {
        //             admin: true,
        //             manager: false,
        //           },
        //         },
        //       };

        //       updatedUserLeagues = {
        //         [leagueId]: redirectedData,
        //       };

        //       context.setUserData(updatedUserData);
        //       context.setUserLeagues(updatedUserLeagues);

        //       navigation.navigate('League', {
        //         leagueId: leagueId,
        //         isAdmin: true,
        //         newLeague: true,
        //       });
        //     },
        //   );
        // };

        // switch (redirectedFrom) {
        //   case 'createLeague':
        //     onCreateLeague();
        //     break;
        //   case 'createClub':
        //     setLoading(false);
        //     navigation.goBack();
        //     break;
        //   case 'joinClub':
        //     setLoading(false);
        //     navigation.goBack();
        //     break;
        // }
      } catch (error) {
        setLoading(false);
        if (error.code === 'auth/email-already-in-use') {
          onShowToast('The email address is already in use!');
        }

        if (error.code === 'auth/invalid-email') {
          onShowToast('The email address is invalid');
        }
        console.error(error);
      }
    }
  };

  return (
    <ImageBackground source={{uri: 'main_bg'}} style={styles.backgroundImage}>
      <FullScreenLoading visible={loading} />
      <Toast message={toastMessage} visible={showToast} success={false} />

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
                //    onBlur={checkEmailFormat}

                helper="example@gmail.com"
                error={errorStates.email}
                maxLength={320}
              />
              <TextField
                value={password}
                //  secureTextEntry={true}
                placeholder={i18n._(t`Enter Password`)}
                onChangeText={(text) => onChangeText(text, 'password')}
                autoCorrect={false}
                label={i18n._(t`Password`)}
                helper={i18n._(t`At least ${6} characters`)}
                //      onBlur={checkPasswordFormat}
                // textContentType="newPassword"
                //  fieldIco={visibility}
                //  onPressIco={changePwdType}
                error={errorStates.password}
                maxLength={128}
                textContentType="newPassword"
                secureTextEntry={true}
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
      <Pressable
        style={{width: '100%'}}
        onPress={() => navigation.navigate('Sign In')}>
        <View style={styles.footer}>
          <Text style={TEXT_STYLES.small}>
            {i18n._(t`Already have an account?`)}{' '}
            <Text style={{...TEXT_STYLES.small, fontWeight: 'bold'}}>
              {i18n._(t`Sign in now`)}
            </Text>
          </Text>
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
});

export default SignUp;
