import React, {useContext, useEffect, useLayoutEffect, useState} from 'react';
import {FlatList, Alert} from 'react-native';
// import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {LeagueContext} from '../../context/leagueContext';
import {ListSeparator, OneLine} from '../../components/listItems';
import {t} from '@lingui/macro';
import i18n from '../../utils/i18n';
import FullScreenLoading from '../../components/loading';
import firestore from '@react-native-firebase/firestore';
import {LeagueStackType} from './league';
import {IFlatList} from '../../utils/interface';
import {IconButton} from '../../components/buttons';
import functions from '@react-native-firebase/functions';
import {AppContext} from '../../context/appContext';

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

export default function LeagueTeam({navigation}: Props) {
  const [data, setData] = useState<Admins[]>([]);
  const [loading, setLoading] = useState(false);

  const leagueContext = useContext(LeagueContext);
  const context = useContext(AppContext);

  const leagueId = leagueContext.leagueId;
  const isOwner = context.userData.leagues[leagueId].owner;

  useLayoutEffect(() => {
    const onInviteAdmin = async () => {
      const inviteAdmin = firFunc.httpsCallable('inviteAdmin');
      const ownerUsername = Object.values(leagueContext.league.admins).filter(
        (admin) => admin.owner === true,
      )[0].username;

      try {
        setLoading(true);
        await inviteAdmin({
          email: 'ziya.fenn@gmail.com',
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
              onPress: () => setLoading(false),
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
              onPress: () => setLoading(false),
            },
          ],
          {cancelable: false},
        );
      }
    };

    if (isOwner) {
      navigation.setOptions({
        headerRight: () => (
          <IconButton
            name="account-multiple-plus"
            onPress={() => onInviteAdmin()}
          />
        ),
      });
    }
  }, [leagueContext, context]);

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

  if (loading) {
    return <FullScreenLoading visible={true} />;
  }

  return (
    <FlatList
      data={data}
      renderItem={({item}) => (
        <OneLine
          title={item.data.username}
          rightIcon={isOwner ? (!item.data.owner ? 'delete' : null) : null}
          onPress={() => console.log('remove')}
        />
      )}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={() => <ListSeparator />}
    />
  );
}
