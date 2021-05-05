import React, {useContext, useEffect, useState} from 'react';
import {FlatList} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {RouteProp} from '@react-navigation/native';
import {LeagueStackType} from '../league/league';
import {LeagueContext} from '../../context/leagueContext';
import {t} from '@lingui/macro';
import i18n from '../../utils/i18n';
import {StackNavigationProp} from '@react-navigation/stack';
import {IClub, IClubRosterMember, IFlatList} from '../../utils/interface';
import {ListHeading, ListSeparator, OneLine} from '../../components/listItems';
import FullScreenLoading from '../../components/loading';

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
  const leagueId = leagueContext.leagueId;

  useEffect(() => {
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
            const rosterData: Roster = {
              id: memberId,
              data: member,
            };
            fullRoster.push(rosterData);
          }
          setClubInfo({...rest});
          setClubRoster(fullRoster);
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
