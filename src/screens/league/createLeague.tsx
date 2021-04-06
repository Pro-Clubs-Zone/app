import React, {useContext, useEffect, useState} from 'react';
import {AuthContext} from '../../context/authContext';
// import firestore from '@react-native-firebase/firestore';
import {ILeague} from '../../utils/interface';
import {AppNavStack} from '../index';
import {StackNavigationProp} from '@react-navigation/stack';
import TextField from '../../components/textField';
import {BigButton} from '../../components/buttons';
import {FormView, FormContent} from '../../components/templates';
import {AppContext} from '../../context/appContext';
import FullScreenLoading from '../../components/loading';
import {Alert, Platform, View, KeyboardAvoidingView} from 'react-native';
import Picker from '../../components/picker';
import {APP_COLORS} from '../../utils/designSystem';
import createLeague from './actions/createLeague';
import {t} from '@lingui/macro';
import i18n from '../../utils/i18n';
import {verticalScale} from 'react-native-size-matters';
import SwitchLabel from '../../components/switch';

type ScreenNavigationProp = StackNavigationProp<AppNavStack, 'Create League'>;

type Props = {
  navigation: ScreenNavigationProp;
};

export default function CreateLeague({navigation}: Props) {
  const user = useContext(AuthContext);
  const context = useContext(AppContext);

  const uid = user.uid;
  const userData = context.userData;
  const userLeagues = userData?.leagues;

  const leagueInfoDefault: Partial<ILeague> = {
    name: '',
    platform: 'ps',
    teamNum: 8,
    acceptedClubs: 0,
    matchNum: 2,
    private: true,
    scheduled: false,
    conflictMatchesCount: 0,
  };
  const [data, setData] = useState<ILeague>(leagueInfoDefault as ILeague);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasLeague, setHasLeague] = useState<boolean>(false);
  const [tempData, setTempData] = useState({
    platform: data.platform,
    teamNum: data.teamNum,
    matchNum: data.matchNum,
  });
  const [errorStates, setErrorStates] = useState({
    name: '',
    discord: '',
    twitter: '',
  });

  useEffect(() => {
    if (userLeagues) {
      for (const league of Object.values(userLeagues)) {
        if (league.admin) {
          return setHasLeague(true);
        }
      }
    }
  }, [userLeagues]);

  useEffect(() => {
    if (!uid) {
      Alert.alert(
        i18n._(t`Sign in to continue`),
        i18n._(t`Please sign in first to create a league`),
        [
          {
            text: i18n._(t`Sign In`),
            onPress: () => navigation.navigate('Sign Up'),
          },
        ],
        {cancelable: false},
      );
    }
  }, [navigation, uid]);

  const onChangeText = (
    text: string,
    field: 'name' | 'discord' | 'twitter',
  ) => {
    switch (field) {
      case 'name':
        setData({...data, name: text.trimStart()});
        break;
      case 'discord':
        setData({...data, discord: text.trim()});
        break;
      case 'twitter':
        setData({...data, twitter: text.trim()});
        break;
    }

    if (errorStates[field]) {
      setErrorStates({...errorStates, [field]: ''});
    }
  };

  const fieldValidation = async () => {
    const twitterUrlExp = /(?:https?:\/\/)?(?:www\.)?twitter\.com\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-]*)/;
    const discordUrlExp = /(?:https?:\/\/)?(?:www\.)?discord\.[a-z]+\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-]*)/;

    let errorStatus: Record<'name' | 'discord' | 'twitter', string> = {
      name: '',
      discord: '',
      twitter: '',
    };

    let noErrors = true;

    if (!data.name) {
      errorStatus.name = i18n._(t`Field can't be empty`);
      noErrors = false;
    }

    if (data.name !== '' && data.name!.length < 4) {
      errorStatus.name = i18n._(t`At least ${4} letters`);
      noErrors = false;
    }

    if (data.discord && !data.discord.match(new RegExp(discordUrlExp))) {
      errorStatus.discord = i18n._(t`Invalid URL format`);
      noErrors = false;
    }

    if (data.twitter && !data.twitter.match(new RegExp(twitterUrlExp))) {
      errorStatus.twitter = i18n._(t`Invalid URL format`);
      noErrors = false;
    }

    if (!noErrors) {
      setErrorStates(errorStatus);

      return false;
    }

    return true;
  };

  const showLimitAlert = () => {
    Alert.alert(
      i18n._(t`League Limit Reached`),
      i18n._(t`You cannot create more than one league`),
      [
        {
          text: i18n._(t`Close`),
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
  };

  const onCreateLeague = async () => {
    await user.currentUser.reload();

    if (user.uid && !user.emailVerified) {
      return Alert.alert(
        i18n._(t`Email not verified`),
        i18n._(t`Please verify your email before joining a league`),
        [
          {
            text: i18n._(t`Resend verification`),
            onPress: () => user.currentUser.sendEmailVerification(),
            style: 'cancel',
          },
          {
            text: i18n._(t`Close`),
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
    }
    const noErrors = await fieldValidation();
    if (noErrors) {
      setLoading(true);
      const username = userData!.username;
      try {
        const leagueId = await createLeague(data, uid, username);
        let updatedUserData = {...context.userData!};
        let updatedUserLeagues = {...context.userLeagues};

        updatedUserData.leagues = {
          ...updatedUserData.leagues,
          [leagueId]: {
            admin: true,
            manager: false,
          },
        };

        updatedUserLeagues = {
          ...updatedUserLeagues,
          [leagueId]: data,
        };

        context.setUserData(updatedUserData);
        context.setUserLeagues(updatedUserLeagues);
        setLoading(false);
        navigation.navigate('League', {
          leagueId: leagueId,
          isAdmin: true,
          newLeague: true,
        });
      } catch (error) {
        setLoading(false);
        console.log(error);
        throw new Error(error);
      }
    }
  };

  const pickerItemColor =
    Platform.OS === 'ios' ? APP_COLORS.Light : APP_COLORS.Dark;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <FormView>
        <FullScreenLoading visible={loading} />
        <FormContent>
          <TextField
            onChangeText={(text) => onChangeText(text, 'name')}
            value={data.name}
            placeholder={i18n._(t`i.e. La Liga`)}
            label={i18n._(t`League Name (required)`)}
            error={errorStates.name}
            helper={i18n._(t`Minimum ${4} letters, no profanity`)}
            maxLength={30}
          />
          <Picker
            onValueChange={(itemValue) =>
              Platform.OS === 'ios'
                ? setTempData({...tempData, platform: itemValue})
                : setData({...data, platform: itemValue})
            }
            onDonePress={() => {
              setData({...data, platform: tempData.platform});
            }}
            items={[
              {label: 'Playstation', value: 'ps', color: pickerItemColor},
              {label: 'Xbox', value: 'xb', color: pickerItemColor},
            ]}
            value={Platform.OS === 'ios' ? tempData.platform : data.platform}>
            <TextField
              value={data.platform === 'ps' ? 'Playstation' : 'Xbox'}
              placeholder={i18n._(t`Select Platform`)}
              label={i18n._(t`Platform`)}
              fieldIco="chevron-down"
              editable={false}
            />
          </Picker>
          <View
            style={{
              flexDirection: 'row',
            }}>
            <View
              style={{
                flex: 1,
                marginRight: verticalScale(24),
              }}>
              <Picker
                onValueChange={(itemValue) =>
                  Platform.OS === 'ios'
                    ? setTempData({...tempData, teamNum: itemValue})
                    : setData({...data, teamNum: itemValue})
                }
                onDonePress={() => {
                  setData({...data, teamNum: tempData.teamNum});
                }}
                items={[
                  {
                    label: i18n._(t`${4} Teams`),
                    value: 4,
                    color: pickerItemColor,
                  },
                  {
                    label: i18n._(t`${6} Teams`),
                    value: 6,
                    color: pickerItemColor,
                  },
                  {
                    label: i18n._(t`${8} Teams`),
                    value: 8,
                    color: pickerItemColor,
                  },
                  {
                    label: i18n._(t`${10} Teams`),
                    value: 10,
                    color: pickerItemColor,
                  },
                  {
                    label: i18n._(t`${12} Teams`),
                    value: 12,
                    color: pickerItemColor,
                  },
                  {
                    label: i18n._(t`${14} Teams`),
                    value: 14,
                    color: pickerItemColor,
                  },
                  {
                    label: i18n._(t`${16} Teams`),
                    value: 16,
                    color: pickerItemColor,
                  },
                ]}
                value={Platform.OS === 'ios' ? tempData.teamNum : data.teamNum}>
                <TextField
                  placeholder={i18n._(t`Teams`)}
                  label={i18n._(t`Teams`)}
                  value={i18n._(t`${data.teamNum} Teams`)}
                  fieldIco="chevron-down"
                  editable={false}
                />
              </Picker>
            </View>
            <View
              style={{
                flex: 1,
              }}>
              <Picker
                onValueChange={(itemValue) =>
                  Platform.OS === 'ios'
                    ? setTempData({...tempData, matchNum: itemValue})
                    : setData({...data, matchNum: itemValue})
                }
                onDonePress={() => {
                  setData({...data, matchNum: tempData.matchNum});
                }}
                items={[
                  {
                    label: i18n._(t`${1} Match`),
                    value: 1,
                    color: pickerItemColor,
                  },
                  {
                    label: i18n._(t`${2} Matches`),
                    value: 2,
                    color: pickerItemColor,
                  },
                  {
                    label: i18n._(t`${3} Matches`),
                    value: 3,
                    color: pickerItemColor,
                  },
                  {
                    label: i18n._(t`${4} Matches`),
                    value: 4,
                    color: pickerItemColor,
                  },
                ]}
                value={
                  Platform.OS === 'ios' ? tempData.matchNum : data.matchNum
                }>
                <TextField
                  value={i18n._(t`${data.matchNum} Matches`)}
                  placeholder={i18n._(t`Matches`)}
                  label={i18n._(t`Matches`)}
                  fieldIco="chevron-down"
                  editable={false}
                />
              </Picker>
            </View>
          </View>
          <SwitchLabel
            title={i18n._(t`Public League`)}
            subtitle={i18n._(t`Contact PRZ to enable this option`)}
            disabled={true}
            value={false}
          />
          <TextField
            value={data.description}
            placeholder={i18n._(t`Describe your league and its rules`)}
            label={i18n._(t`Description`)}
            multiline={true}
            onChangeText={(text) => setData({...data, description: text})}
            autoCapitalize="sentences"
            maxLength={1000}
          />
          <TextField
            value={data.discord}
            placeholder="Discord URL"
            label="Discord"
            onChangeText={(text) => onChangeText(text, 'discord')}
            autoCapitalize="none"
            keyboardType="url"
            autoCorrect={false}
            error={errorStates.discord}
            helper={i18n._(t`discord.com/abcde123`)}
          />
          <TextField
            value={data.twitter}
            placeholder="Twitter URL"
            label="Twitter"
            onChangeText={(text) => onChangeText(text, 'twitter')}
            autoCapitalize="none"
            keyboardType="url"
            autoCorrect={false}
            error={errorStates.twitter}
            helper={i18n._(t`twitter.com/proclubszone`)}
          />
        </FormContent>
        <BigButton
          onPress={
            hasLeague
              ? !userData?.premium
                ? showLimitAlert
                : onCreateLeague
              : onCreateLeague
          }
          title={i18n._(t`Create League`)}
        />
      </FormView>
    </KeyboardAvoidingView>
  );
}
