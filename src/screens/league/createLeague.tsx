import React, {useContext, useEffect, useState} from 'react';
import {AuthContext} from '../../context/authContext';
import firestore from '@react-native-firebase/firestore';
import {ILeague} from '../../utils/interface';
import {AppNavStack} from '../index';
import {StackNavigationProp} from '@react-navigation/stack';
import TextField from '../../components/textField';
import {BigButton} from '../../components/buttons';
import {FormView, FormContent} from '../../components/templates';
import {AppContext} from '../../context/appContext';
import FullScreenLoading from '../../components/loading';
import {Alert} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import PickerContainer from '../../components/pickerContainer';
import {APP_COLORS} from '../../utils/designSystem';

type ScreenNavigationProp = StackNavigationProp<AppNavStack, 'Create League'>;

type Props = {
  navigation: ScreenNavigationProp;
};

const db = firestore();

export default function CreateLeague({navigation}: Props) {
  const user = useContext(AuthContext);
  const context = useContext(AppContext);

  const uid = user.uid;
  const userLeagues = context.userData?.leagues;

  const leagueInfoDefault: ILeague = {
    name: Math.floor(Math.random() * Math.floor(200)),
    description: 'some good description',
    platform: 'Playstation',
    teamNum: 4,
    matchNum: 2,
    adminId: uid,
    private: false,
    scheduled: false,
    created: firestore.Timestamp.now(),
  };

  const [leagueInfo, setLeagueInfo] = useState<ILeague>(leagueInfoDefault);
  const [leagueName, setLeagueName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [hasLeague, setHasLeague] = useState<boolean>(false);
  const [tempPlatform, setTempPlatform] = useState<
    'ps' | 'xb' | React.ReactText
  >('ps');
  const [platform, setPlatform] = useState<'ps' | 'xb' | React.ReactText>('ps');
  const [showPicker, setShowPicker] = useState<boolean>(false);

  useEffect(() => {
    if (userLeagues) {
      for (const league of Object.values(userLeagues)) {
        if (league.admin) {
          return setHasLeague(true);
        }
      }
    }
  }, [userLeagues]);

  const showLimitAlert = () => {
    Alert.alert(
      'League Limit Reached',
      'You cannot create more than one league',
      [
        {
          text: 'Close',
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
  };

  const onCreateLeague = () => {
    const batch = db.batch();
    const leagueRef = db.collection('leagues').doc();
    const userRef = db.collection('users').doc(uid);
    setLoading(true);
    batch.set(leagueRef, {...leagueInfo, adminId: uid, name: leagueName});
    batch.set(
      userRef,
      {
        leagues: {
          [leagueRef.id]: {
            admin: true,
          },
        },
      },
      {merge: true},
    );
    batch.commit().then(() => {
      context.setUserData({
        leagues: {
          [leagueRef.id]: {
            admin: true,
            manager: false,
          },
        },
      });
      context.setUserLeagues({
        [leagueRef.id]: leagueInfo,
      });
      setLoading(false);
      navigation.navigate('League', {
        leagueId: leagueRef.id,
        isAdmin: true,
        newLeague: true,
      });
    });
  };

  return (
    <FormView>
      <FullScreenLoading visible={loading} />
      <FormContent>
        <PickerContainer
          visible={showPicker}
          onCancel={() => {
            setTempPlatform(platform);
            setShowPicker(false);
          }}
          onApply={() => {
            setPlatform(tempPlatform);
            setShowPicker(false);
          }}>
          <Picker
            selectedValue={tempPlatform}
            onValueChange={(itemValue) => setTempPlatform(itemValue)}>
            <Picker.Item
              label="Playstation"
              value="ps"
              color={APP_COLORS.Light}
            />
            <Picker.Item label="Xbox" value="xb" color={APP_COLORS.Light} />
          </Picker>
        </PickerContainer>
        <TextField
          onChangeText={(text) => setLeagueName(text)}
          value={leagueName}
          placeholder="League Name"
          autoCorrect={true}
          label="League Name"
        />
        <TextField
          value={platform === 'ps' ? 'Playstation' : 'Xbox'}
          placeholder="Select Platform"
          autoCorrect={true}
          label="Platform"
          onPress={() => setShowPicker(true)}
          fieldIco="chevron-down"
        />
      </FormContent>
      <BigButton
        onPress={hasLeague ? showLimitAlert : onCreateLeague}
        title="Create League"
      />
    </FormView>
  );
}
