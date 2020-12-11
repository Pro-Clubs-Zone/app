import React, {useContext, useEffect, useState} from 'react';
import {
  Text,
  View,
  Button,
  SectionList,
  NativeSyntheticEvent,
  NativeTouchEvent,
} from 'react-native';
import {AppContext} from '../../utils/context';

import firestore from '@react-native-firebase/firestore';
import {ClubInt} from '../../utils/globalTypes';

const db = firestore();

type ClubData = ClubInt & {id: string};

interface ClubList {
  title: string;
  data: ClubData[];
}

let defaultData: ClubList[] = [
  {
    title: 'New requests',
    data: [],
  },
  {
    title: 'Accepted',
    data: [],
  },
];

export default function Clubs({navigation, route}) {
  const [data, setData] = useState<ClubData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionedData, setSectionedData] = useState(defaultData);

  const leagueId = route.params.leagueId;

  const leagueClubs = db
    .collection('leagues')
    .doc(leagueId)
    .collection('clubs');

  const sortClubs = (clubs: ClubData[]) => {
    let sortedClubs = defaultData;

    clubs.forEach((club) => {
      if (club.accepted) {
        sortedClubs[1].data.push(club);
      } else {
        sortedClubs[0].data.push(club);
      }
    });
    setSectionedData(sortedClubs);
  };

  useEffect(() => {
    leagueClubs.get().then((querySnapshot) => {
      let clubList: ClubData[] = [];
      let clubInfo: ClubData;
      querySnapshot.forEach((doc) => {
        clubInfo = {...(doc.data() as ClubInt), id: doc.id};
        clubList.push(clubInfo);
      });

      console.log(clubList, 'clublist');
      setData(clubList);
      sortClubs(clubList);
    });
  }, []);

  const onClubAccept = (clubId: string) => {
    const updatedList: ClubData[] = data;
    updatedList.map((club) => {
      if (club.id === clubId) {
        club.accepted = true;
      }
    });
    setData(updatedList);
    sortClubs(updatedList);
    const clubRef = leagueClubs.doc(clubId);
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
    const clubRef = leagueClubs.doc(clubId);
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
      keyExtractor={(item, index) => item + index}
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
    <View
      style={{
        height: 100,
        width: '100%',
      }}>
      <Text>{props.name}</Text>
      <Button title="acp" onPress={props.onAccept} />
      <Button title="decline" onPress={props.onDecline} />
    </View>
  );
};
