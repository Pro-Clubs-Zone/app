import React, {useContext, useEffect, useState} from 'react';
import {Text, View, Button, SectionList} from 'react-native';
import {AppContext, AuthContext, RequestContext} from '../../utils/context';
import firestore from '@react-native-firebase/firestore';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {
  ClubInt,
  ClubRequestData,
  ClubRequestInt,
  LeagueRequestInt,
  MyRequests,
  SectionListInt,
} from '../../utils/globalTypes';

const db = firestore();
const Tab = createMaterialTopTabNavigator();

export default function Requests({navigation}) {
  const requestsContext = useContext(RequestContext);
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Club"
        component={ClubRequests}
        initialParams={[requestsContext?.clubs]}
      />
      <Tab.Screen
        name="League"
        component={LeagueRequests}
        initialParams={[requestsContext?.leagues]}
      />
      <Tab.Screen
        name="Sent"
        component={MySentRequests}
        initialParams={[requestsContext?.myRequests]}
      />
    </Tab.Navigator>
  );
}

function ClubRequests({navigation, route}) {
  const [data, setData] = useState<ClubRequestInt[]>(() => [
    ...route.params[0],
  ]);
  const requestContext = useContext(RequestContext);

  type Props = {
    playerId: string;
    clubId: string;
    leagueId: string;
  };

  const onAcceptPlayer = (
    {playerId, clubId, leagueId}: Props,
    sectionTitle: string,
  ) => {
    const leagueIndex = data.findIndex(
      (league) => league.title === sectionTitle,
    );

    const unacceptedPlayers = data[leagueIndex].data.filter((player) => {
      return player.playerId !== playerId;
    });

    const newData = [...data];
    newData[leagueIndex].data = unacceptedPlayers;

    if (unacceptedPlayers.length === 0) {
      newData.splice(leagueIndex, 1);
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

    requestContext?.setClubs(newData);
    requestContext?.setClubCount(requestContext.clubCount - 1);
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
          />
        )}
        renderSectionHeader={({section: {title}}) => <Text>{title}</Text>}
      />
    </View>
  );
}

function LeagueRequests({navigation, route}) {
  const [data, setData] = useState<LeagueRequestInt[]>(() => [
    ...route.params[0],
  ]);
  const requestContext = useContext(RequestContext);

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
    const leagueIndex = data.findIndex(
      (league) => league.title === sectionTitle,
    );

    const unacceptedClubs = data[leagueIndex].data.filter((club) => {
      return club.clubId !== clubId;
    });
    const newData = [...data];
    newData[leagueIndex].data = unacceptedClubs;

    if (unacceptedClubs.length === 0) {
      newData.splice(leagueIndex, 1);
    }
    setData(newData);

    requestContext?.setLeagues(newData);
    requestContext?.setLeagueCount(requestContext.leagueCount - 1);
  };

  return (
    <SectionList
      sections={data}
      keyExtractor={(item) => item.clubId}
      renderItem={({item, section}) => (
        <Item
          title={item.name}
          onPress={() => onAcceptClub(item, section.title)}
        />
      )}
      renderSectionHeader={({section: {title}}) => <Text>{title}</Text>}
    />
  );
}

function MySentRequests({navigation, route}) {
  const DATA: MyRequests[] = route.params[0];
  return (
    <View>
      <SectionList
        sections={DATA}
        keyExtractor={(item, index) => item + index}
        renderItem={({item}) => <Item title={item.clubName} />}
        renderSectionHeader={({section: {title, key}}) => (
          <Text key={key}>{title}</Text>
        )}
      />
    </View>
  );
}

const Item = ({title, onPress}) => (
  <View>
    <Text>{title}</Text>
    <Button title="accept" onPress={onPress} />
  </View>
);
