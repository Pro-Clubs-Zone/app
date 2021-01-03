import React, {useContext, useEffect, useState} from 'react';
import {Text, View, Button, SectionList} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {IClubRequestData, ILeagueRequest} from '../../utils/interface';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {AppContext} from '../../context/appContext';
import {LeagueStackType} from '../league/league';
import {
  ListHeading,
  OneLine,
  ListSeparator,
  TwoLine,
} from '../../components/listItems';
import FullScreenLoading from '../../components/loading';
import {useActionSheet} from '@expo/react-native-action-sheet';

type ScreenNavigationProp = StackNavigationProp<LeagueStackType, 'Clubs'>;
type ScreenRouteProp = RouteProp<LeagueStackType, 'Clubs'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

const db = firestore();

export default function Clubs({route}: Props) {
  const [data, setData] = useState<IClubRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionedData, setSectionedData] = useState<ILeagueRequest[]>([]);

  const leagueId = route.params.leagueId;
  const context = useContext(AppContext);
  const {showActionSheetWithOptions} = useActionSheet();

  const leagueClubsRef = db
    .collection('leagues')
    .doc(leagueId)
    .collection('clubs');

  const acceptedClubList: ILeagueRequest = {
    title: 'Accepted',
    data: [],
  };

  const clubRequestList: ILeagueRequest = {
    title: 'New requests',
    data: [],
  };

  const sortClubs = (clubs: IClubRequestData[]) => {
    clubs.forEach((club) => {
      if (club.accepted) {
        acceptedClubList.data.push(club);
      } else {
        clubRequestList.data.push(club);
      }
    });

    let sortedClubs: ILeagueRequest[] = [];

    if (acceptedClubList.data.length !== 0) {
      sortedClubs.push(acceptedClubList);
    }
    if (clubRequestList.data.length !== 0) {
      sortedClubs.push(clubRequestList);
    }
    setSectionedData(sortedClubs);
  };

  useEffect(() => {
    const clubs = context.userLeagues[leagueId].clubs;

    let clubList: IClubRequestData[] = [];
    let clubInfo: IClubRequestData;
    if (clubs) {
      for (const [clubId, club] of Object.entries(clubs)) {
        clubInfo = {...club, id: clubId};
        clubList.push(clubInfo);
      }

      console.log(clubList, 'clublist');
      setData(clubList);
      sortClubs(clubList);
    }
  }, [context]);

  const onClubAccept = (clubId: string) => {
    const updatedList: IClubRequestData[] = data.map((club) => {
      if (club.id === clubId) {
        club.accepted = true;
      }
      return club;
    });

    setData(updatedList);
    sortClubs(updatedList);
    const clubRef = leagueClubsRef.doc(clubId);
    return clubRef.update({
      accepted: true,
    });
  };

  const onClubDecline = (clubId: string) => {
    const declinedClub: ClubData | undefined = data.find(
      (club) => club.id === clubId,
    );
    const updatedList: ClubData[] = data.filter((club) => club.id !== clubId);
    setData(updatedList);
    sortClubs(updatedList);
    const clubRef = leagueClubsRef.doc(clubId);
    const managerRef = db.collection('users').doc(declinedClub?.managerId);
    const batch = db.batch();
    batch.update(managerRef, {
      [`leagues.${leagueId}`]: firestore.FieldValue.delete(),
    });
    batch.delete(clubRef);
    return batch.commit();
  };

  const onOpenActionSheet = (club: IClubRequestData) => {
    const options = ['Accept', 'Decline', 'Cancel'];
    const destructiveButtonIndex = 1;
    const cancelButtonIndex = 2;

    showActionSheetWithOptions(
      {
        options,
        destructiveButtonIndex,
        cancelButtonIndex,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            //  onAcceptPlayer(player);
            break;
          case 1:
            // onDeclinePlayer(player);
            break;
        }
      },
    );
  };

  return (
    <SectionList
      sections={sectionedData}
      keyExtractor={(item) => item.clubId}
      renderItem={({item}) => (
        <TwoLine
          title={item.name}
          sub={item.managerUsername}
          onPress={() => onOpenActionSheet(item)}
        />
      )}
      ItemSeparatorComponent={() => <ListSeparator />}
      renderSectionHeader={({section: {title}}) => <ListHeading col1={title} />}
    />
  );
}
