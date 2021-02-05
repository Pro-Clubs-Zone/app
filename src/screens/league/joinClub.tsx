import React, {useContext, useEffect, useState} from 'react';
import {Alert, FlatList} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {AppContext} from '../../context/appContext';
import {AuthContext} from '../../context/authContext';
import {IClub, IClubRosterMember, IUserLeague} from '../../utils/interface';
import {LeagueStackType} from './league';
import FullScreenLoading from '../../components/loading';
import {ListHeading, TwoLine, ListSeparator} from '../../components/listItems';
import {verticalScale} from 'react-native-size-matters';
import EmptyState from '../../components/emptyState';
import {StackNavigationProp} from '@react-navigation/stack';
import {LeagueContext} from '../../context/leagueContext';
import analytics from '@react-native-firebase/analytics';
import {t} from '@lingui/macro';
import i18n from '../../utils/i18n';

type ScreenNavigationProp = StackNavigationProp<LeagueStackType, 'Join Club'>;

type Props = {
  navigation: ScreenNavigationProp;
};

const db = firestore();
type ClubListItem = IClub & {clubId: string};

export default function JoinClub({navigation}: Props) {
  const [data, setData] = useState<ClubListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const context = useContext(AppContext);
  const user = useContext(AuthContext);
  const leagueContext = useContext(LeagueContext);
  const uid = user.uid;
  const userRef = db.collection('users').doc(uid);
  const leagueId = leagueContext.leagueId;
  const leagueRef = db.collection('leagues').doc(leagueId);
  const leagueClubs = leagueRef.collection('clubs');

  useEffect(() => {
    let retrievedClubs: ClubListItem[] = [];
    leagueClubs
      .where('accepted', '==', true)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          retrievedClubs.push({...(doc.data() as IClub), clubId: doc.id});
        });
        setData(retrievedClubs);
      })
      .then(() => {
        setLoading(false);
      });
  }, []);

  const onSendRequestConfirm = async (club: ClubListItem) => {
    setLoading(true);
    const batch = db.batch();
    const clubRef = leagueClubs.doc(club.clubId);
    const userInfo: IUserLeague = {
      clubId: club.clubId,
      accepted: false,
      manager: false,
      clubName: club.name,
    };
    const rosterMember: {[uid: string]: IClubRosterMember} = {
      [uid as string]: {
        accepted: false,
        username: context.userData!.username,
      },
    };

    batch.set(
      clubRef,
      {
        roster: rosterMember,
      },
      {merge: true},
    );
    batch.set(
      userRef,
      {
        leagues: {
          [leagueId]: userInfo,
        },
      },
      {merge: true},
    );
    await batch.commit().then(async () => {
      await analytics().logJoinGroup({
        group_id: leagueContext.leagueId,
      });
      let userData = {...context.userData};
      userData.leagues = {
        ...userData.leagues,
        [leagueId]: userInfo,
      };

      // const userLeagues = {...context.userLeagues};
      // userLeagues[leagueId].clubs[club.clubId] = {
      //   ...userLeagues[leagueId].clubs[club.clubId],
      //   roster: rosterMember,
      // };

      context.setUserData(userData);
      //  context.setUserLeagues(userLeagues);
      setLoading(false);
      navigation.goBack();
    });
  };

  const onSendRequest = (club: ClubListItem) => {
    Alert.alert(
      i18n._(t`Join Club`),
      i18n._(t`Send request to ${club.name} to join?`),
      [
        {
          text: i18n._(t`Send Request`),
          onPress: () => {
            onSendRequestConfirm(club);
          },
        },
        {
          text: i18n._(t`Cancel`),
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
  };

  return (
    <>
      <FullScreenLoading visible={loading} />
      <FlatList
        data={data}
        keyExtractor={(item) => item.clubId}
        renderItem={({item}) => (
          <TwoLine
            title={item.name}
            sub={item.managerUsername}
            onPress={() => onSendRequest(item)}
            rightDefaultIcon
          />
        )}
        ListHeaderComponent={() =>
          data.length !== 0 && <ListHeading col1={i18n._(t`Clubs`)} />
        }
        ItemSeparatorComponent={() => <ListSeparator />}
        ListEmptyComponent={() => (
          <EmptyState
            title={i18n._(t`No Accepted Clubs`)}
            body={i18n._(
              t`Currently this league has no accepted clubs. Check out later`,
            )}
          />
        )}
        getItemLayout={(item, index) => ({
          length: verticalScale(56),
          offset: verticalScale(57) * index,
          index,
        })}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: data.length === 0 ? 'center' : undefined,
        }}
      />
    </>
  );
}
