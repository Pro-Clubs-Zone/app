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
import {Alert, View} from 'react-native';
import PickerContainer, {PickerItem} from '../../components/pickerContainer';
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
    name: '',
    description: '',
    platform: 'ps',
    teamNum: 8,
    matchNum: 2,
    adminId: uid,
    private: false,
    scheduled: false,
    created: firestore.Timestamp.now(),
  };

  type PickerProps = {
    platform: boolean;
    teamNum: boolean;
    matchNum: boolean;
  };

  const [data, setData] = useState<ILeague>(leagueInfoDefault);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasLeague, setHasLeague] = useState<boolean>(false);
  const [tempData, setTempData] = useState<Partial<ILeague>>({
    platform: data.platform,
    teamNum: data.teamNum,
    matchNum: data.matchNum,
  });
  const [showPicker, setShowPicker] = useState<PickerProps>({
    platform: false,
    teamNum: false,
    matchNum: false,
  });

  // useEffect(() => {
  //   if (userLeagues) {
  //     for (const league of Object.values(userLeagues)) {
  //       if (league.admin) {
  //         return setHasLeague(true);
  //       }
  //     }
  //   }
  // }, [userLeagues]);

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
    batch.set(leagueRef, data);
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
        [leagueRef.id]: data,
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
          selectedValue={tempData.platform}
          onValueChange={(itemValue) =>
            setTempData({...tempData, platform: itemValue})
          }
          visible={showPicker.platform}
          onCancel={() => {
            setTempData({...tempData, platform: data.platform});
            setShowPicker({...showPicker, platform: false});
          }}
          onApply={() => {
            setData({...data, platform: tempData.platform});
            setShowPicker({...showPicker, platform: false});
          }}>
          <PickerItem label="Playstation" value="ps" color={APP_COLORS.Light} />
          <PickerItem label="Xbox" value="xb" color={APP_COLORS.Light} />
        </PickerContainer>
        <PickerContainer
          selectedValue={tempData.teamNum}
          onValueChange={(itemValue) =>
            setTempData({...tempData, teamNum: itemValue})
          }
          visible={showPicker.teamNum}
          onCancel={() => {
            setTempData({...tempData, teamNum: data.teamNum});
            setShowPicker({...showPicker, teamNum: false});
          }}
          onApply={() => {
            setData({...data, teamNum: tempData.teamNum});
            setShowPicker({...showPicker, teamNum: false});
          }}>
          <PickerItem label="4 Teams" value={4} color={APP_COLORS.Light} />
          <PickerItem label="8 Teams" value={8} color={APP_COLORS.Light} />
        </PickerContainer>
        <PickerContainer
          selectedValue={tempData.matchNum}
          onValueChange={(itemValue) =>
            setTempData({...tempData, matchNum: itemValue})
          }
          visible={showPicker.matchNum}
          onCancel={() => {
            setTempData({...tempData, matchNum: data.matchNum});
            setShowPicker({...showPicker, matchNum: false});
          }}
          onApply={() => {
            setData({...data, matchNum: tempData.matchNum});
            setShowPicker({...showPicker, matchNum: false});
          }}>
          <PickerItem label="1 Match" value={1} color={APP_COLORS.Light} />
          <PickerItem label="2 Matches" value={2} color={APP_COLORS.Light} />
        </PickerContainer>
        <TextField
          onChangeText={(text) => setData({...data, name: text})}
          value={data.name}
          placeholder="League Name"
          label="League Name"
        />
        <TextField
          value={data.platform === 'ps' ? 'Playstation' : 'Xbox'}
          placeholder="Select Platform"
          label="Platform"
          onPress={() => setShowPicker({...showPicker, platform: true})}
          fieldIco="chevron-down"
        />
        <View
          style={{
            flexDirection: 'row',
          }}>
          <View
            style={{
              flex: 1,
              marginRight: 24,
            }}>
            <TextField
              placeholder="Teams"
              label="Teams"
              value={`${data.teamNum} Teams`}
              onPress={() => setShowPicker({...showPicker, teamNum: true})}
              fieldIco="chevron-down"
            />
          </View>
          <View
            style={{
              flex: 1,
            }}>
            <TextField
              value={`${data.matchNum} Matches`}
              placeholder="Matches"
              label="Matches"
              onPress={() => setShowPicker({...showPicker, matchNum: true})}
              fieldIco="chevron-down"
            />
          </View>
        </View>
        <TextField
          value={data.description}
          placeholder="Description"
          label="Description"
          multiline={true}
          onChangeText={(text) => setData({...data, description: text})}
          autoCapitalize="sentences"
        />
      </FormContent>
      <BigButton
        onPress={hasLeague ? showLimitAlert : onCreateLeague}
        title="Create League"
      />
    </FormView>
  );
}
