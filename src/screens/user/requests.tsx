import React, {useContext, useState} from 'react';
import {SectionList, Alert} from 'react-native';
import {AuthContext} from '../../context/authContext';
import {RequestContext} from '../../context/requestContext';
import firestore from '@react-native-firebase/firestore';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {
  IClubRequestData,
  IMyRequests,
  IPlayerRequestData,
  ISentRequest,
} from '../../utils/interface';
import {
  ListHeading,
  ListSeparator,
  OneLine,
  TwoLine,
} from '../../components/listItems';
import EmptyState from '../../components/emptyState';
import {useActionSheet} from '@expo/react-native-action-sheet';
import handleClubRequest from '../club/actions/handleClubRequest';
import {AppContext} from '../../context/appContext';
import handleLeagueRequest from '../club/actions/handleLeagueRequest';
import FullScreenLoading from '../../components/loading';
import {t} from '@lingui/macro';
import i18n from '../../utils/i18n';
import useGetLeagueRequests from './actions/useGetLeagueRequests';
import useGetClubRequests from './actions/useGetLeagueRequests copy';
import {RouteProp} from '@react-navigation/native';
import {AppNavStack} from '../index';
import {StackNavigationProp} from '@react-navigation/stack';

const Tab = createMaterialTopTabNavigator();

type ScreenNavigationProp = StackNavigationProp<AppNavStack, 'Requests'>;
type ScreenRouteProp = RouteProp<AppNavStack, 'Requests'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

export default function Requests({navigation, route}: Props) {
  // const requestContext = useContext(RequestContext);
  // const myClubReq = requestContext.myClubRequests?.data.length ?? 0;
  //  const myLeagueReq = requestContext.myLeagueRequests?.data.length ?? 0;

  const uid = route.params.uid;
  const leagueRequests = useGetLeagueRequests();
  const clubRequests = useGetClubRequests(uid);

  return (
    <Tab.Navigator lazy={true}>
      <Tab.Screen
        name="Club"
        component={ClubRequests}
        options={{
          title: i18n._(t`Club - ${clubRequests.count}`),
        }}
        initialParams={{uid}}
      />
      <Tab.Screen
        name="League"
        component={LeagueRequests}
        options={{
          title: i18n._(t`League - ${leagueRequests.count}`),
        }}
      />
      <Tab.Screen
        name="Sent"
        component={MySentRequests}
        options={{
          title: i18n._(t`Sent - ${5}`),
        }}
      />
    </Tab.Navigator>
  );
}

function ClubRequests({navigation, route}) {
  const {showActionSheetWithOptions} = useActionSheet();
  const context = useContext(AppContext);

  const uid = route.params.uid;

  const [loading, setLoading] = useState(false);

  const clubRequests = useGetClubRequests(uid);

  const onHandlePlayerRequest = async (
    selectedPlayer: IPlayerRequestData,
    sectionTitle: string,
    acceptRequest: boolean,
  ) => {
    try {
      setLoading(true);
      await handleClubRequest(
        clubRequests.data,
        selectedPlayer,
        sectionTitle,
        acceptRequest,
      );
      // setData(newData);
      // requestContext.setClubs(newData);
      // const currentCount = requestContext.requestCount;
      // requestContext.setClubCount(currentCount === 1 ? 0 : currentCount - 1);

      const currentLeagueData = {...context.userLeagues};
      if (acceptRequest) {
        currentLeagueData[selectedPlayer.leagueId].clubs[
          selectedPlayer.clubId
        ].roster[selectedPlayer.playerId].accepted = true;
      } else {
        delete currentLeagueData[selectedPlayer.leagueId].clubs[
          selectedPlayer.clubId
        ].roster[selectedPlayer.playerId];
      }
      context.setUserLeagues(currentLeagueData);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw new Error(error);
    }
  };

  const onOpenActionSheet = (item: IPlayerRequestData, title: string) => {
    const options = [i18n._(t`Accept`), i18n._(t`Decline`), i18n._(t`Cancel`)];
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
            onHandlePlayerRequest(item, title, true);
            break;
          case 1:
            onHandlePlayerRequest(item, title, false);
            break;
        }
      },
    );
  };

  return (
    <>
      <FullScreenLoading visible={loading || clubRequests.loading} />
      <SectionList
        sections={clubRequests.data}
        stickySectionHeadersEnabled={true}
        keyExtractor={(item) => item.playerId}
        renderItem={({item, section}) => (
          <OneLine
            title={item.username}
            onPress={() => onOpenActionSheet(item, section.title)}
          />
        )}
        ItemSeparatorComponent={() => <ListSeparator />}
        renderSectionHeader={({section: {title}}) => (
          <ListHeading col1={title} />
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title={i18n._(t`Club Requests`)}
            body={i18n._(t`Received club requests will appear here`)}
          />
        )}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: clubRequests.data.length === 0 ? 'center' : null,
        }}
      />
    </>
  );
}

function LeagueRequests() {
  const context = useContext(AppContext);
  // const requestContext = useContext(RequestContext);
  const {showActionSheetWithOptions} = useActionSheet();
  // const requests: ILeagueRequest[] = requestContext.leagues;

  //const [data, setData] = useState<ILeagueRequest[]>(requests);

  const [loading, setLoading] = useState(false);
  const leagueRequests = useGetLeagueRequests();

  const onHandleLeagueRequest = async (
    selectedClub: IClubRequestData,
    sectionTitle: string,
    acceptRequest: boolean,
  ) => {
    const userLeague = context.userLeagues[selectedClub.leagueId];
    if (userLeague.acceptedClubs === userLeague.teamNum) {
      return Alert.alert(
        i18n._(t`Team Limit Reached`),
        i18n._(
          t`Can't accept club due to league team limit. Either remove accepted teams or decline this request.`,
        ),
        [
          {
            text: i18n._(t`Close`),
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
    }
    try {
      setLoading(true);
      await handleLeagueRequest(
        leagueRequests.data,
        selectedClub,
        sectionTitle,
        acceptRequest,
      );
      //   requestContext.setLeagues(newData);
      //   const currentCount = requestContext.requestCount;
      //  requestContext.setLeagueCount(currentCount === 1 ? 0 : currentCount - 1);
      //  setData(newData);

      const currentLeagueData = {...context.userLeagues};
      if (acceptRequest) {
        currentLeagueData[selectedClub.leagueId].clubs[
          selectedClub.clubId
        ].accepted = true;
      } else {
        delete currentLeagueData[selectedClub.leagueId].clubs[
          selectedClub.clubId
        ];
      }
      context.setUserLeagues(currentLeagueData);
      setLoading(false);
    } catch (error) {
      console.log(error);

      setLoading(false);
      throw new Error(error);
    }
  };

  const onOpenActionSheet = (item: IClubRequestData, title: string) => {
    const options = [i18n._(t`Accept`), i18n._(t`Decline`), i18n._(t`Cancel`)];
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
            onHandleLeagueRequest(item, title, true);
            break;
          case 1:
            onHandleLeagueRequest(item, title, false);
            break;
        }
      },
    );
  };

  return (
    <>
      <FullScreenLoading visible={loading || leagueRequests.loading} />
      <SectionList
        sections={leagueRequests.data}
        stickySectionHeadersEnabled={true}
        keyExtractor={(item) => item.clubId}
        renderItem={({item, section}) => (
          <TwoLine
            title={item.name}
            sub={item.managerUsername}
            onPress={() => onOpenActionSheet(item, section.title)}
            rightDefaultIcon
          />
        )}
        ItemSeparatorComponent={() => <ListSeparator />}
        renderSectionHeader={({section: {title}}) => (
          <ListHeading col1={title} />
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title={i18n._(t`League Requests`)}
            body={i18n._(t`Received league requests will appear here`)}
          />
        )}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: leagueRequests.data.length === 0 ? 'center' : null,
        }}
      />
    </>
  );
}

function MySentRequests() {
  const db = firestore();
  const batch = db.batch();
  const requestContext = useContext(RequestContext);
  const user = useContext(AuthContext);

  const clubRequests: IMyRequests = requestContext.myClubRequests;
  const leagueRequests: IMyRequests = requestContext.myLeagueRequests;

  let requests: IMyRequests[] = [];

  clubRequests && requests.push(clubRequests);
  leagueRequests && requests.push(leagueRequests);

  const [data, setData] = useState<IMyRequests[]>(requests);

  const uid = user?.uid;

  const onCancelRequestConfirm = async (
    myRequest: ISentRequest,
    sectionTitle: string,
  ) => {
    const clubRef = db
      .collection('leagues')
      .doc(myRequest.leagueId)
      .collection('clubs')
      .doc(myRequest.clubId);

    const userRef = db.collection('users').doc(uid);

    const sectionIndex = data.findIndex(
      (section) => section.title === sectionTitle,
    );

    const newData = [...data];

    if (sectionTitle === 'Club Requests') {
      const openClubRequests = data[sectionIndex].data.filter((club) => {
        return club.clubId !== myRequest.clubId;
      });

      newData[sectionIndex].data = openClubRequests;

      if (openClubRequests.length === 0) {
        newData.splice(sectionIndex, 1);
      }

      setData(newData);

      requestContext?.setMyClubRequests(newData[sectionIndex]);

      batch.update(clubRef, {
        ['roster.' + uid]: firestore.FieldValue.delete(),
      });
      batch.update(userRef, {
        ['leagues.' + myRequest.leagueId]: firestore.FieldValue.delete(),
      });
    } else {
      const openLeagueRequests = data[sectionIndex].data.filter((league) => {
        return league.leagueId !== myRequest.leagueId;
      });

      newData[sectionIndex].data = openLeagueRequests;

      if (openLeagueRequests.length === 0) {
        newData.splice(sectionIndex, 1);
      }

      setData(newData);
      requestContext?.setMyLeagueRequests(newData[sectionIndex]);

      batch.delete(clubRef);
      batch.update(userRef, {
        ['leagues.' + myRequest.leagueId]: firestore.FieldValue.delete(),
      });
    }
    await batch.commit();
  };

  const onCancelRequest = (item: ISentRequest, title: string) => {
    Alert.alert(
      i18n._(t`Remove Request`),
      i18n._(t`Are you sure you want to remove your sent request?`),
      [
        {
          text: i18n._(t`Remove`),
          onPress: () => {
            onCancelRequestConfirm(item, title);
          },
          style: 'destructive',
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
    <SectionList
      sections={data}
      stickySectionHeadersEnabled={true}
      keyExtractor={(item) => item.clubId}
      renderItem={({item, section}) => (
        <OneLine
          title={item.clubName}
          onIconPress={() => onCancelRequest(item, section.title)}
          rightIcon="minus-circle"
        />
      )}
      ItemSeparatorComponent={() => <ListSeparator />}
      renderSectionHeader={({section: {title, key}}) => (
        <ListHeading key={key} col1={title} />
      )}
      ListEmptyComponent={() => (
        <EmptyState
          title={i18n._(t`Sent Requests`)}
          body={i18n._(t`All your sent requests will appear here`)}
        />
      )}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: data.length === 0 ? 'center' : null,
      }}
    />
  );
}
