import React, {useContext, useState} from 'react';
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
import {RouteProp} from '@react-navigation/native';
import {AppNavStack} from '../index';
import {BigButtonOutlined} from '../../components/buttons';
import FullScreenLoading from '../../components/loading';
import Toast from '../../components/toast';
import createLeague from '../../actions/createLeague';
import {ILeague, IUser} from '../../utils/interface';
import {AppContext} from '../../context/appContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ScreenNavigationProp = StackNavigationProp<AppNavStack, 'Sign Up'>;
type ScreenRouteProp = RouteProp<AppNavStack, 'Sign Up'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

const db = firestore();
const firAuth = auth();

function SignUp({navigation, route}: Props) {
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [errorStates, setErrorStates] = useState({
    email: '',
    username: '',
  });

  const context = useContext(AppContext);

  const redirectedFrom: string = route.params?.redirectedFrom;
  const redirectedData = route.params?.data as ILeague;

  const onShowToast = (message: string) => {
    setShowToast(true);
    setToastMessage(message);
    setTimeout(() => {
      setShowToast(false);
    }, 1000);
  };

  const onChangeText = (text: string, field: 'email' | 'username') => {
    switch (field) {
      case 'email':
        setEmail(text);
        break;
      case 'username':
        setUsername(text.trim());
        break;
    }

    if (errorStates[field]) {
      setErrorStates({...errorStates, [field]: null});
    }
  };

  const fieldValidation = async () => {
    const re = /\S+@\S+\.\S+/;
    const emailValid = re.test(email);

    let errorStatus: Record<'email' | 'username', string> = {
      email: '',
      username: '',
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

  const onSignUp = () => {
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
            //  console.log('User account created & signed in!', data);
            try {
              await AsyncStorage.setItem('@storage_Email', email);
              await AsyncStorage.setItem('@storage_Username', username);
              Alert.alert(
                i18n._(t`Check your email`),
                i18n._(
                  t`Use link that you have received in your email to sign in`,
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
            } catch (e) {
              console.log('problem creating user', e);
            }
            //await createDbEntry(data);
            // return data;
          })
          // .then(async ({user}) => {
          //   const onCreateLeague = async () => {
          //     await createLeague(redirectedData, user.uid, username).then(
          //       (leagueId) => {
          //         let updatedUserData = {...context.userData};
          //         let updatedUserLeagues = {...context.userLeagues};

          //         updatedUserData = {
          //           username: username,
          //           premium: false,
          //           leagues: {
          //             [leagueId]: {
          //               admin: true,
          //               manager: false,
          //             },
          //           },
          //         };

          //         updatedUserLeagues = {
          //           [leagueId]: redirectedData,
          //         };

          //         context.setUserData(updatedUserData);
          //         context.setUserLeagues(updatedUserLeagues);

          //         navigation.navigate('League', {
          //           leagueId: leagueId,
          //           isAdmin: true,
          //           newLeague: true,
          //         });
          //       },
          //     );
          //   };

          //   switch (redirectedFrom) {
          //     case 'createLeague':
          //       onCreateLeague();
          //       break;
          //     case 'createClub':
          //       setLoading(false);
          //       navigation.goBack();
          //       break;
          //     case 'joinClub':
          //       setLoading(false);
          //       navigation.goBack();
          //       break;
          //   }
          // })
          .catch((error) => {
            setLoading(false);
            if (error.code === 'auth/email-already-in-use') {
              onShowToast('That email address is already in use!');
            }

            if (error.code === 'auth/invalid-email') {
              onShowToast('That email address is invalid');
            }
            console.error(error);
          });
      }
    });
  };

  return (
    <ImageBackground source={{uri: 'main_bg'}} style={styles.backgroundImage}>
      <Toast message={toastMessage} visible={showToast} />
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
                error={errorStates.email}
                maxLength={320}
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
        onPress={() =>
          navigation.navigate('Sign In', {
            data: redirectedData,
            redirectedFrom: redirectedFrom,
          })
        }>
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
