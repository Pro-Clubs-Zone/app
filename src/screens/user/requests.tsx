import React, {useContext, useEffect, useState} from 'react';
import {Text, View, Button, SectionList} from 'react-native';
import {AuthContext, RequestContext} from '../../utils/context';
import firestore from '@react-native-firebase/firestore';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {IClubRequest, ILeagueRequest, IMyRequests} from '../../utils/interface';

const db = firestore();
const Tab = createMaterialTopTabNavigator();

export default function Requests() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Club" component={ClubRequests} />
      <Tab.Screen name="League" component={LeagueRequests} />
      <Tab.Screen name="Sent" component={MySentRequests} />
    </Tab.Navigator>
  );
}

function ClubRequests() {
  const requestsContext = useContext(RequestContext);
  const requests: IClubRequest[] | undefined = requestsContext?.clubs;
  console.log(requestsContext);

  const [data, setData] = useState<IClubRequest[] | undefined>(requests);
  type Props = {
    playerId: string;
    clubId: string;
    leagueId: string;
  };

  const onAcceptPlayer = (
    {playerId, clubId, leagueId}: Props,
    sectionTitle: string,
  ) => {
    const sectionIndex = data.findIndex(
      (section) => section.title === sectionTitle,
    );

    const unacceptedPlayers = data[sectionIndex].data.filter((player) => {
      return player.playerId !== playerId;
    });

    const newData = [...data];
    newData[sectionIndex].data = unacceptedPlayers;

    if (unacceptedPlayers.length === 0) {
      newData.splice(sectionIndex, 1);
    }
    setData(newData);

    console.log(unacceptedPlayers);

    const clubRef = db
      .collection('leagues')
      .doc(leagueId)
      .collection('clubs')
      .doc(`${clubId}`);

    clubRef.update({
      ['roster.' + playerId + '.accepted']: true,
    });

    const currentCount = requestsContext?.requestCount;

    requestsContext?.setClubs(newData);
    requestsContext?.setClubCount(currentCount === 1 ? 0 : currentCount - 1);
  };

  return (
    <View>
      <SectionList
        sections={data}
        keyExtractor={(item) => item.username}
        renderItem={({item, section}) => (
          <Item
            title={item.username}
            onPress={() => onAcceptPlayer(item, section.title)}
            button="accept"
          />
        )}
        renderSectionHeader={({section: {title}}) => <Text>{title}</Text>}
      />
    </View>
  );
}

function LeagueRequests() {
  const requestsContext = useContext(RequestContext);
  const requests: ILeagueRequest[] | undefined = requestsContext?.myRequests;

  const [data, setData] = useState<ILeagueRequest[] | undefined>(requests);

  type Props = {
    clubId: string;
    leagueId: string;
  };

  const onAcceptClub = ({clubId, leagueId}: Props, sectionTitle: string) => {
    const clubRef = db
      .collection('leagues')
      .doc(leagueId)
      .collection('clubs')
      .doc(clubId);

    clubRef.update({
      accepted: true,
    });

    const sectionIndex = data.findIndex(
      (section) => section.title === sectionTitle,
    );

    const unacceptedClubs = data[sectionIndex].data.filter((club) => {
      return club.clubId !== clubId;
    });
    const newData = [...data];
    newData[sectionIndex].data = unacceptedClubs;

    if (unacceptedClubs.length === 0) {
      newData.splice(sectionIndex, 1);
    }
    setData(newData);

    requestsContext?.setLeagues(newData);

    const currentCount = requestsContext?.requestCount;
    requestsContext?.setLeagueCount(currentCount === 1 ? 0 : currentCount - 1);
  };

  return (
    <SectionList
      sections={data}
      keyExtractor={(item) => item.clubId}
      renderItem={({item, section}) => (
        <Item
          title={item.name}
          onPress={() => onAcceptClub(item, section.title)}
          button="accept"
        />
      )}
      renderSectionHeader={({section: {title}}) => <Text>{title}</Text>}
    />
  );
}

function MySentRequests() {
  const requestsContext = useContext(RequestContext);
  const user = useContext(AuthContext);
  const requests: IMyRequests[] | undefined = requestsContext?.myRequests;

  const [data, setData] = useState<IMyRequests[] | undefined>(requests);

  const uid = user?.uid;

  type Props = {
    clubId: string;
    leagueId: string;
  };

  const onCancelRequest = ({clubId, leagueId}: Props, sectionTitle: string) => {
    const clubRef = db
      .collection('leagues')
      .doc(leagueId)
      .collection('clubs')
      .doc(clubId);

    const userRef = db.collection('users').doc(uid);
    const batch = db.batch();

    const sectionIndex = data.findIndex(
      (section) => section.title === sectionTitle,
    );

    const newData = [...data];

    if (sectionTitle == 'Club Requests') {
      const openClubRequests = data[sectionIndex].data.filter((club) => {
        return club.clubId !== clubId;
      });

      newData[sectionIndex].data = openClubRequests;

      if (openClubRequests.length === 0) {
        newData.splice(sectionIndex, 1);
      }

      setData(newData);

      requestsContext?.setMyClubRequests(newData[sectionIndex]);

      batch.update(clubRef, {
        ['roster.' + uid]: firestore.FieldValue.delete(),
      });
      batch.update(userRef, {
        ['leagues.' + leagueId]: firestore.FieldValue.delete(),
      });
    } else {
      const openLeagueRequests = data[sectionIndex].data.filter((league) => {
        return league.leagueId !== leagueId;
      });

      newData[sectionIndex].data = openLeagueRequests;

      if (openLeagueRequests.length === 0) {
        newData.splice(sectionIndex, 1);
      }

      setData(newData);
      requestsContext?.setMyLeagueRequests(newData[sectionIndex]);

      batch.delete(clubRef);
      batch.update(userRef, {
        ['leagues.' + leagueId]: firestore.FieldValue.delete(),
      });
    }
    batch.commit();
  };

  return (
    <View>
      <SectionList
        sections={data}
        keyExtractor={(item) => item.clubId}
        renderItem={({item, section}) => (
          <Item
            title={item.clubName}
            button="cancel"
            onPress={() => onCancelRequest(item, section.title)}
          />
        )}
        renderSectionHeader={({section: {title, key}}) => (
          <Text key={key}>{title}</Text>
        )}
      />
    </View>
  );
}

const Item = ({title, button, onPress}) => (
  <View>
    <Text>{title}</Text>
    <Button title={button} onPress={onPress} />
  </View>
);
