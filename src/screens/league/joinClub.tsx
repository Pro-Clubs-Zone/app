import React, {useContext, useEffect, useState} from 'react';
import {Alert, FlatList} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {AppContext} from '../../context/appContext';
import {AuthContext} from '../../context/authContext';
import {IClub, IClubRosterMember, IUserLeague} from '../../utils/interface';
import {RouteProp} from '@react-navigation/native';
import {LeagueStackType} from './league';
import FullScreenLoading from '../../components/loading';
import {ListHeading, TwoLine, ListSeparator} from '../../components/listItems';
import {verticalScale} from 'react-native-size-matters';
import EmptyState from '../../components/emptyState';
import {StackNavigationProp} from '@react-navigation/stack';

type ScreenRouteProp = RouteProp<LeagueStackType, 'Join Club'>;
type ScreenNavigationProp = StackNavigationProp<LeagueStackType, 'Join Club'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

const db = firestore();
type ClubListItem = IClub & {key: string};

export default function JoinClub({route, navigation}: Props) {
  const [data, setData] = useState<ClubListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const context = useContext(AppContext);
  const user = useContext(AuthContext);
  const uid = user?.uid;
  const userRef = db.collection('users').doc(uid);
  const leagueId = route.params.leagueId;
  const leagueRef = db.collection('leagues').doc(leagueId);
  const leagueClubs = leagueRef.collection('clubs');

  useEffect(() => {
    let retrievedClubs: ClubListItem[] = [];
    leagueClubs
      .where('accepted', '==', true)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          retrievedClubs.push({...(doc.data() as IClub), key: doc.id});
        });
        setData(retrievedClubs);
      })
      .then(() => {
        setLoading(false);
      });
  }, []);

  const onSendRequestConfirm = async (clubId: string) => {
    const clubRef = leagueClubs.doc(clubId);
    const userInfo: {[leagueId: string]: IUserLeague} = {
      [leagueId]: {
        clubId: clubId,
        accepted: false,
        manager: false,
      },
    };
    const rosterMember: {[uid: string]: IClubRosterMember} = {
      [uid]: {
        accepted: false,
        username: context?.userData?.username,
      },
    };
    const batch = db.batch();

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
        leagues: userInfo,
      },
      {merge: true},
    );
    return batch.commit();
  };

  const onSendRequest = (clubId: string) => {
    console.log('onsendrequest');
    Alert.alert(
      'Join Club',
      'Send request to "club name" to join?',
      [
        {
          text: 'Send Request',
          onPress: () => {
            setLoading(true);
            onSendRequestConfirm(clubId)
              .then(() => setLoading(false))
              .then(() => {
                navigation.goBack();
              });
          },
        },
        {
          text: 'Cancel',
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
        renderItem={({item}) => (
          <TwoLine
            title={item.name}
            sub={item.managerId}
            onPress={() => onSendRequest(item.key)}
            icon
          />
        )}
        ListHeaderComponent={() =>
          data.length !== 0 && <ListHeading col1="Clubs" />
        }
        ItemSeparatorComponent={() => <ListSeparator />}
        ListEmptyComponent={() => (
          <EmptyState title="No Public Leagues" body="Check out later" />
        )}
        getItemLayout={(data, index) => ({
          length: verticalScale(56),
          offset: verticalScale(57) * index,
          index,
        })}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: data.length === 0 ? 'center' : null,
        }}
      />
    </>
  );
}
