import React, {useContext, useEffect, useLayoutEffect, useState} from 'react';
import {FlatList, Alert, Modal, View, Text} from 'react-native';
// import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {LeagueContext} from '../../context/leagueContext';
import {ListSeparator, OneLine} from '../../components/listItems';
import {t, Trans} from '@lingui/macro';
import i18n from '../../utils/i18n';
import FullScreenLoading from '../../components/loading';
import firestore from '@react-native-firebase/firestore';
import {LeagueStackType} from './league';
import {IFlatList, IUser} from '../../utils/interface';
import {IconButton, MinButton} from '../../components/buttons';
import functions from '@react-native-firebase/functions';
import {AppContext} from '../../context/appContext';
import {ScaledSheet} from 'react-native-size-matters';
import {APP_COLORS, TEXT_STYLES} from '../../utils/designSystem';
import TextField from '../../components/textField';

type ScreenNavigationProp = StackNavigationProp<LeagueStackType, 'League Team'>;

type Props = {
  navigation: ScreenNavigationProp;
  // route: ScreenRouteProp;
};

interface Admins extends IFlatList {
  data: {
    owner: boolean;
    username: string;
  };
}

const db = firestore();
const firFunc = functions();
const batch = db.batch();

export default function LeagueTeam({navigation}: Props) {
  const [data, setData] = useState<Admins[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const leagueContext = useContext(LeagueContext);
  const context = useContext(AppContext);

  const leagueId = leagueContext.leagueId;
  const isOwner = context.userData.leagues[leagueId].owner;

  const onChangeText = (input: string) => {
    setEmail(input);

    if (emailError) {
      setEmailError(null);
    }
  };

  const fieldValidation = async () => {
    const re = /\S+@\S+\.\S+/;
    const emailValid = re.test(email);

    let errorStatus = '';

    let noErrors = true;

    if (!emailValid && email !== '') {
      errorStatus = i18n._(t`Email is badly formatted`);
      noErrors = false;
    }
    if (email === '') {
      errorStatus = i18n._(t`Field can't be empty`);
      noErrors = false;
    }

    if (!noErrors) {
      setEmailError(errorStatus);
      return false;
    }

    return true;
  };

  const onInviteAdmin = async () => {
    const inviteAdmin = firFunc.httpsCallable('inviteAdmin');
    const ownerUsername = Object.values(leagueContext.league.admins).filter(
      (admin) => admin.owner === true,
    )[0].username;

    const noErrors = await fieldValidation();

    if (noErrors) {
      try {
        setLoading(true);
        await inviteAdmin({
          email: email,
          leagueId: leagueId,
          leagueName: leagueContext.league.name,
          ownerUsername: ownerUsername,
        });
        Alert.alert(
          i18n._(t`User invited`),
          i18n._(
            t`Confirmation is sent to user's email. Once confirmed, user will become an admin.`,
          ),
          [
            {
              text: i18n._(t`Close`),
              style: 'cancel',
              onPress: () => navigation.goBack(),
            },
          ],
          {cancelable: false},
        );
      } catch {
        Alert.alert(
          i18n._(t`Can't invite the user`),
          i18n._(t`User is not registered or not verified his email yet`),
          [
            {
              text: i18n._(t`Close`),
              style: 'cancel',
              onPress: () => {
                setLoading(false);
                setModalVisible(false);
                setEmail('');
              },
            },
          ],
          {cancelable: false},
        );
      }
    }
  };

  useLayoutEffect(() => {
    if (isOwner) {
      navigation.setOptions({
        headerRight: () => (
          <IconButton
            name="account-multiple-plus"
            onPress={() => setModalVisible(true)}
          />
        ),
      });
    }
  }, [context]);

  useEffect(() => {
    const admins = Object.entries(leagueContext.league.admins);
    let adminsList: Admins[] = [];

    for (const [adminUid, adminData] of admins) {
      console.log(adminUid, adminData);
      const admin = {
        id: adminUid,
        data: adminData,
      };
      adminsList.push(admin);
    }
    setData(adminsList);
  }, [leagueContext]);

  const onRemoveAdmin = (uid: string) => {
    Alert.alert(
      i18n._(t`Remove admin`),
      i18n._(t`Are you sure you want to remove selected admin?`),
      [
        {
          text: i18n._(t`Remove`),
          style: 'destructive',
          onPress: () => removeAdmin(uid),
        },
        {
          text: i18n._(t`Close`),
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
  };

  const removeAdmin = async (uid: string) => {
    const leagueRef = db.collection('leagues').doc(leagueId);
    const userRef = db.collection('users').doc(uid);

    setLoading(true);

    try {
      const getUserData = await userRef.get();
      const userData = getUserData.data() as IUser;
      const userHasClub = userData.leagues[leagueId].clubId;

      let dataToUpdate: any = {admin: false};

      if (!userHasClub) {
        dataToUpdate = firestore.FieldValue.delete();
      }

      batch.set(
        leagueRef,
        {
          admins: {
            [uid]: firestore.FieldValue.delete(),
          },
        },
        {merge: true},
      );

      batch.set(
        userRef,
        {
          leagues: {
            [leagueId]: dataToUpdate,
          },
        },
        {merge: true},
      );

      await batch.commit();
      const leagueData = {...leagueContext.league};
      delete leagueData.admins[uid];
      leagueContext.setLeague(leagueData);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw new Error(error);
    }
  };

  if (loading) {
    return <FullScreenLoading visible={true} />;
  }

  return (
    <>
      <Modal transparent={true} visible={modalVisible}>
        <View style={styles.modal}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text
                style={[
                  TEXT_STYLES.display5,
                  {
                    color: APP_COLORS.Dark,
                  },
                ]}>
                <Trans>Invite new admin</Trans>
              </Text>
            </View>
            <View style={styles.content}>
              <TextField
                label={i18n._(t`Email`)}
                placeholder={i18n._(t`Enter E-mail`)}
                keyboardType="email-address"
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="default"
                helper="example@gmail.com"
                error={emailError}
                maxLength={320}
                onChangeText={(text) => onChangeText(text)}
                value={email}
              />
            </View>
            <View style={styles.footer}>
              <MinButton
                secondary
                title={i18n._(t`Cancel`)}
                onPress={() => setModalVisible(false)}
              />
              <MinButton
                title={i18n._(t`Send invite`)}
                onPress={onInviteAdmin}
              />
            </View>
          </View>
        </View>
      </Modal>

      <FlatList
        data={data}
        renderItem={({item}) => (
          <OneLine
            title={item.data.username}
            rightIcon={isOwner ? (!item.data.owner ? 'delete' : null) : null}
            onIconPress={() => onRemoveAdmin(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <ListSeparator />}
      />
    </>
  );
}

//---------- Stylesheet ----------//

const styles = ScaledSheet.create({
  modal: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    flex: 1,
    padding: '24@vs',
    alignItems: 'center',
    paddingTop: '128@vs',
  },
  container: {
    backgroundColor: APP_COLORS.Primary,
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  header: {
    backgroundColor: APP_COLORS.Accent,
    paddingHorizontal: '8@vs',
    height: '48@vs',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: '16@vs',
    paddingVertical: '24@vs',
  },
  footer: {
    borderTopWidth: 1,
    borderColor: APP_COLORS.Secondary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '8@vs',
  },
});
