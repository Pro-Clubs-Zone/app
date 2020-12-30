import React, {useContext, useEffect, useState} from 'react';
import {Text, View, Button, SectionList} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {IClub} from '../../utils/interface';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {AppContext} from '../../context/appContext';
import {LeagueStackType} from '../league/league';

type ScreenNavigationProp = StackNavigationProp<LeagueStackType, 'Clubs'>;
type ScreenRouteProp = RouteProp<LeagueStackType, 'Clubs'>;

type ClubData = IClub & {id: string};
interface ClubList {
  title: string;
  data: ClubData[];
}

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

const db = firestore();

export default function Clubs({route}: Props) {
  const [data, setData] = useState<ClubData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionedData, setSectionedData] = useState([]);

  const leagueId = route.params.leagueId;
  const context = useContext(AppContext);

  const leagueClubsRef = db
    .collection('leagues')
    .doc(leagueId)
    .collection('clubs');

  const acceptedClubList = {
    title: 'Accepted',
    data: [] as ClubData[],
  };

  const clubRequestList = {
    title: 'New requests',
    data: [] as ClubData[],
  };

  const sortClubs = (clubs: ClubData[]) => {
    clubs.forEach((club) => {
      if (club.accepted) {
        acceptedClubList.data.push(club);
      } else {
        clubRequestList.data.push(club);
      }
    });

    let sortedClubs: ClubList[] = [];

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

    let clubList: ClubData[] = [];
    let clubInfo: ClubData;
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
    const updatedList: ClubData[] = data.map((club) => {
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

  return (
    <SectionList
      sections={sectionedData}
      keyExtractor={(item) => item.id}
      renderItem={({item}) => (
        <Club
          name={item.name}
          onAccept={() => onClubAccept(item.id)}
          onDecline={() => onClubDecline(item.id)}
        />
      )}
      renderSectionHeader={({section: {title}}) => <Text>{title}</Text>}
    />
  );
}

const Club = (props) => {
  return (
    <View>
      <Text>{props.name}</Text>
      <Button title="acp" onPress={props.onAccept} />
      <Button title="decline" onPress={props.onDecline} />
    </View>
  );
};
