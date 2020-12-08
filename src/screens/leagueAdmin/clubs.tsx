import React, {useContext, useEffect, useState} from 'react';
import {Text, View, Button, SectionList} from 'react-native';
import {AppContext} from '../../utils/context';

import firestore from '@react-native-firebase/firestore';

const db = firestore();

interface ClubList {
  title: string;
  data: object[];
}

interface SectionedList extends Array<ClubList> {}

let sectionedDataDefault: SectionedList = [
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
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sectionedData, setSectionedData] = useState(sectionedDataDefault);

  const leagueId = route.params.leagueId;

  const leagueClubs = db
    .collection('leagues')
    .doc(leagueId)
    .collection('clubs');

  const sortClubs = (clubs: []) => {
    let sortedClubs: SectionedList = [
      {
        title: 'New requests',
        data: [],
      },
      {
        title: 'Accepted',
        data: [],
      },
    ];

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
      let clubList: any = [];
      let clubInfo: any;
      querySnapshot.forEach((doc) => {
        clubInfo = doc.data();
        clubInfo.id = doc.id;
        clubList = [...clubList, clubInfo];
        // doc.data() is never undefined for query doc snapshots
      });

      console.log(clubList, 'clublist');
      setData(clubList);
      sortClubs(clubList);
    });
  }, []);

  const onClubAccept = (clubId) => {
    const updatedList: any = data;
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

  const onClubDecline = (clubId) => {
    const declinedClub: any = data.find((club) => club.id === clubId);
    const updatedList: any = data.filter((club) => club.id !== clubId);
    setData(updatedList);
    sortClubs(updatedList);
    const clubRef = leagueClubs.doc(clubId);
    const managerRef = db.collection('users').doc(declinedClub.managerId);
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
