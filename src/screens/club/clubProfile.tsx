import React, {useContext, useLayoutEffect, useState} from 'react';
import {Alert, FlatList} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {RouteProp} from '@react-navigation/native';
import {LeagueStackType} from '../league/league';
import {LeagueContext} from '../../context/leagueContext';
import {t} from '@lingui/macro';
import i18n from '../../utils/i18n';
import {StackNavigationProp} from '@react-navigation/stack';
import {
  IClub,
  IClubRosterMember,
  IFlatList,
  IUserLeague,
} from '../../utils/interface';
import {ListHeading, ListSeparator, OneLine} from '../../components/listItems';
import FullScreenLoading from '../../components/loading';
import {AuthContext} from '../../context/authContext';
import {IconButton} from '../../components/buttons';
import {AppContext} from '../../context/appContext';
import sendPlayerRequest from './actions/sendPlayerRequest';

type ScreenRouteProp = RouteProp<LeagueStackType, 'Club Settings'>;
type ScreenNavigationProp = StackNavigationProp<
  LeagueStackType,
  'Club Settings'
>;

type Props = {
  route: ScreenRouteProp;
  navigation: ScreenNavigationProp;
};

interface Roster extends IFlatList {
  data: IClubRosterMember;
}

const db = firestore();

export default function ClubProfile({navigation, route}: Props) {
  const [clubInfo, setClubInfo] = useState<Partial<IClub>>();
  const [clubRoster, setClubRoster] = useState<Roster[]>([]);
  const [loading, setLoading] = useState(true);

  const clubId = route.params.clubId;
  const leagueContext = useContext(LeagueContext);
  const user = useContext(AuthContext);
  const context = useContext(AppContext);
  const uid = user.uid;
  const leagueId = leagueContext.leagueId;

  const onSendRequestConfirm = async (clubName: string) => {
    try {
      setLoading(true);
      const userInfo: IUserLeague = {
        clubId: clubId,
        accepted: false,
        manager: false,
        clubName,
      };
      await sendPlayerRequest(uid, user.displayName, leagueId, userInfo);
      let userDataCopy = {...context.userData};
      let userLeagueData = {...userDataCopy.leagues[leagueId], ...userInfo};
      userDataCopy.leagues[leagueId] = userLeagueData;

      // let userLeagues = {...context.userLeagues};
      // userLeagues = {
      //   [leagueId]: leagueContext.league,
      // };
      console.log(userDataCopy);

      //    context.setUserData(userData);

      //    context.setUserLeagues(userLeagues);
      setLoading(false);
      navigation.goBack();
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const onSendRequest = (clubName: string) => {
    Alert.alert(
      i18n._(t`Join Club`),
      i18n._(t`Send request to ${clubName} to join?`),
      [
        {
          text: i18n._(t`Send Request`),
          onPress: () => onSendRequestConfirm(clubName),
        },
        {
          text: i18n._(t`Cancel`),
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
  };

  useLayoutEffect(() => {
    const clubRef = db
      .collection('leagues')
      .doc(leagueId)
      .collection('clubs')
      .doc(clubId);

    const getData = async () => {
      let fullRoster: Roster[] = [];
      await clubRef
        .get()
        .then((doc) => {
          const clubData = doc.data() as IClub;
          const {roster, ...rest} = clubData;
          for (const [memberId, member] of Object.entries(roster)) {
            if (member.accepted) {
              const rosterData: Roster = {
                id: memberId,
                data: member,
              };
              fullRoster.push(rosterData);
            }
          }

          setClubInfo(rest);
          setClubRoster(fullRoster);

          const admins = leagueContext.league.admins;
          const isAdmin = Object.keys(admins).some(
            (adminUid) => adminUid === uid,
          );
          const userClub = context.userData.leagues[leagueId].clubId;

          if (isAdmin && !userClub) {
            navigation.setOptions({
              headerRight: () => (
                <IconButton
                  name="send"
                  onPress={() => onSendRequest(rest.name)}
                />
              ),
            });
          }

          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          throw new Error(err);
        });
    };
    getData();
  }, [clubId]);

  if (loading) {
    return <FullScreenLoading visible={true} />;
  }
  return (
    <FlatList
      data={clubRoster}
      ListHeaderComponent={() => (
        <ListHeading col1={i18n._(t`${clubInfo.name} Roster`)} />
      )}
      ItemSeparatorComponent={() => <ListSeparator />}
      renderItem={({item}) => (
        <OneLine
          title={item.data.username}
          leftIcon={
            item.data.username === clubInfo.managerUsername
              ? 'account-tie'
              : 'run'
          }
        />
      )}
    />
  );
}
