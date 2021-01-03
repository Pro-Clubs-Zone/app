import React, {useContext, useState} from 'react';
import {SectionList} from 'react-native';
import {AuthContext} from '../../context/authContext';
import {RequestContext} from '../../context/requestContext';
import firestore from '@react-native-firebase/firestore';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {
  IClubRequest,
  ILeagueRequest,
  IMyRequests,
  IPlayerRequestData,
} from '../../utils/interface';
import {ListHeading, ListSeparator, OneLine} from '../../components/listItems';
import EmptyState from '../../components/emptyState';
import {useActionSheet} from '@expo/react-native-action-sheet';
import onAcceptPlayer from '../club/actions/onAcceptPlayer';
import {AppContext} from '../../context/appContext';

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
  const requestContext = useContext(RequestContext);
  const {showActionSheetWithOptions} = useActionSheet();
  const requests: IClubRequest[] = requestContext.clubs;
  const context = useContext(AppContext);

  const [data, setData] = useState<IClubRequest[]>(() => requests);

  const acceptPlayer = (
    selectedPlayer: IPlayerRequestData,
    sectionTitle: string,
  ) => {
    onAcceptPlayer(data, selectedPlayer, sectionTitle)
      .then((newData) => {
        setData(newData);
        requestContext.setClubs(newData);
        const currentCount = requestContext.requestCount;
        requestContext.setClubCount(currentCount === 1 ? 0 : currentCount - 1);
      })
      .then(() => {
        const currentLeagueData = {...context.userLeagues};
        currentLeagueData[selectedPlayer.leagueId].clubs[
          selectedPlayer.clubId
        ].roster[selectedPlayer.playerId].accepted = true;
        context.setUserLeagues(currentLeagueData);
      });
  };

  const onOpenActionSheet = (item: IPlayerRequestData, title: string) => {
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
            acceptPlayer(item, title);
            break;
          case 1:
            console.log('decline player');
            break;
        }
      },
    );
  };

  return (
    <SectionList
      sections={data}
      stickySectionHeadersEnabled={true}
      keyExtractor={(item) => item.playerId}
      renderItem={({item, section}) => (
        <OneLine
          title={item.username}
          onPress={() => onOpenActionSheet(item, section.title)}
        />
      )}
      ItemSeparatorComponent={() => <ListSeparator />}
      renderSectionHeader={({section: {title}}) => <ListHeading col1={title} />}
      ListEmptyComponent={() => (
        <EmptyState title="No Public Leagues" body="Check out later" />
      )}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: data.length === 0 ? 'center' : null,
      }}
    />
  );
}

function LeagueRequests() {
  const requestsContext = useContext(RequestContext);
  const {showActionSheetWithOptions} = useActionSheet();
  const requests: ILeagueRequest[] | undefined = requestsContext?.leagues;

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

  const onOpenActionSheet = (item: Props, title: string) => {
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
            onAcceptClub(item, title);
            break;
          case 1:
            console.log('decline club');
            break;
        }
      },
    );
  };

  return (
    <SectionList
      sections={data}
      stickySectionHeadersEnabled={true}
      keyExtractor={(item) => item.clubId}
      renderItem={({item, section}) => (
        <OneLine
          title={item.name}
          onPress={() => onOpenActionSheet(item, section.title)}
        />
      )}
      ItemSeparatorComponent={() => <ListSeparator />}
      renderSectionHeader={({section: {title}}) => <ListHeading col1={title} />}
      ListEmptyComponent={() => (
        <EmptyState title="No Public Leagues" body="Check out later" />
      )}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: data.length === 0 ? 'center' : null,
      }}
    />
  );
}

function MySentRequests() {
  const requestsContext = useContext(RequestContext);
  const user = useContext(AuthContext);
  const {showActionSheetWithOptions} = useActionSheet();

  const clubRequests: IMyRequests = requestsContext.myClubRequests;
  const leagueRequests: IMyRequests = requestsContext.myLeagueRequests;

  let requests: IMyRequests[] = [];

  clubRequests && requests.push(clubRequests);
  leagueRequests && requests.push(leagueRequests);

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

    if (sectionTitle === 'Club Requests') {
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

  const onOpenActionSheet = (item: Props, title: string) => {
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
            onCancelRequest(item, title);
            break;
          case 1:
            console.log('decline club');
            break;
        }
      },
    );
  };

  return (
    <SectionList
      sections={data}
      stickySectionHeadersEnabled={true}
      keyExtractor={(item) => item.clubId}
      renderItem={({item, section}) => (
        <OneLine
          title={item.clubName}
          onPress={() => onOpenActionSheet(item, section.title)}
        />
      )}
      ItemSeparatorComponent={() => <ListSeparator />}
      renderSectionHeader={({section: {title, key}}) => (
        <ListHeading key={key} col1={title} />
      )}
      ListEmptyComponent={() => (
        <EmptyState title="No Public Leagues" body="Check out later" />
      )}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: data.length === 0 ? 'center' : null,
      }}
    />
  );
}
