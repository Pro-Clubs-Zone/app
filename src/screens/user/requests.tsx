import React, {useContext, useEffect, useState} from 'react';
import {SectionList, Alert} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {
  IClubRequestData,
  IMyRequests,
  IPlayerRequestData,
  ISentRequest,
  IUserLeague,
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
import useGetClubRequests from './actions/useGetClubRequests';
import {RouteProp} from '@react-navigation/native';
import {AppNavStack} from '../index';
import {StackNavigationProp} from '@react-navigation/stack';
import {RequestContext} from '../../context/requestContext';

const Tab = createMaterialTopTabNavigator();

type ScreenNavigationProp = StackNavigationProp<AppNavStack, 'Requests'>;
type ScreenRouteProp = RouteProp<AppNavStack, 'Requests'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

export default function Requests({navigation, route}: Props) {
  const uid = route.params.uid;
  const requestContext = useContext(RequestContext);
  const context = useContext(AppContext);
  let sentRequests = 0;

  for (const league of Object.values(context.userData.leagues)) {
    if (!league.accepted && league.clubId) {
      sentRequests++;
    }
  }

  return (
    <Tab.Navigator lazy={true}>
      <Tab.Screen
        name="Club"
        component={ClubRequests}
        options={{
          title: i18n._(t`Club - ${requestContext.totalClubCount}`),
        }}
        initialParams={{uid}}
      />
      <Tab.Screen
        name="League"
        component={LeagueRequests}
        options={{
          title: i18n._(t`League - ${requestContext.totalLeagueCount}`),
        }}
        initialParams={{uid}}
      />
      <Tab.Screen
        name="Sent"
        component={MySentRequests}
        options={{
          title: i18n._(t`Sent - ${sentRequests}`),
        }}
        initialParams={{uid}}
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
      const leagueAdmins = context.userLeagues[selectedPlayer.leagueId].admins;
      const isPlayerAdmin = Object.keys(leagueAdmins).some(
        (adminUid) => adminUid === selectedPlayer.playerId,
      );
      const clubName =
        context.userData.leagues[selectedPlayer.leagueId].clubName;
      await handleClubRequest(
        selectedPlayer,
        acceptRequest,
        clubName,
        isPlayerAdmin,
      );

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

function LeagueRequests({navigation, route}) {
  const context = useContext(AppContext);
  const {showActionSheetWithOptions} = useActionSheet();
  const uid = route.params.uid;
  const [loading, setLoading] = useState(false);
  const leagueRequests = useGetLeagueRequests(uid);

  const onHandleLeagueRequest = async (
    selectedClub: IClubRequestData,
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
      await handleLeagueRequest(selectedClub, acceptRequest);

      // const currentLeagueData = {...context.userLeagues};
      // if (acceptRequest) {
      //   currentLeagueData[selectedClub.leagueId].clubs[
      //     selectedClub.clubId
      //   ].accepted = true;
      // } else {
      //   delete currentLeagueData[selectedClub.leagueId].clubs[
      //     selectedClub.clubId
      //   ];
      // }
      // context.setUserLeagues(currentLeagueData);
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
            onHandleLeagueRequest(item, true);
            break;
          case 1:
            onHandleLeagueRequest(item, false);
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

function MySentRequests({navigation, route}) {
  const [data, setData] = useState<IMyRequests[]>([]);
  const [loading, setLoading] = useState(true);
  const db = firestore();
  const batch = db.batch();

  const context = useContext(AppContext);
  const uid = route.params.uid;
  const userData = context.userData;
  const userRef = db.collection('users').doc(uid);

  useEffect(() => {
    const requests: IMyRequests[] = [];
    for (const [leagueId, league] of Object.entries(userData.leagues)) {
      const leagueName = context.userLeagues[leagueId].name;
      let requestData: IMyRequests = {
        title: '',
        data: [],
      };

      if (!league.accepted && league.clubId) {
        const myRequestData: ISentRequest = {
          accepted: league.accepted,
          clubId: league.clubId,
          leagueId: leagueId,
          leagueName: leagueName,
          clubName: league.clubName,
          manager: league.manager,
        };
        if (league.manager) {
          if (requests.length === 0) {
            requestData = {
              title: i18n._(t`League Requests`),
              data: [myRequestData],
            };
            requests.push(requestData);
          } else {
            requests.map((section, index) => {
              if (section.title === 'League Requests') {
                requests[index].data.push(myRequestData);
              } else {
                requestData = {
                  title: i18n._(t`League Requests`),
                  data: [myRequestData],
                };
                requests.push(requestData);
              }
            });
          }
        } else {
          if (requests.length === 0) {
            requestData = {
              title: i18n._(t`Club Requests`),
              data: [myRequestData],
            };
            requests.push(requestData);
          } else {
            requests.map((section, index) => {
              if (section.title === 'Club Requests') {
                requests[index].data.push(myRequestData);
              } else {
                requestData = {
                  title: i18n._(t`Club Requests`),
                  data: [myRequestData],
                };
                requests.push(requestData);
              }
            });
          }
        }
      }
    }
    setData(requests);
    setLoading(false);
  }, [context.userData]);

  const onCancelRequestConfirm = async (myRequest: ISentRequest) => {
    setLoading(true);

    const isAdmin = userData.leagues[myRequest.leagueId].admin;
    const removeClubFromAdmin: Partial<IUserLeague> = {
      accepted: firestore.FieldValue.delete(),
      clubId: firestore.FieldValue.delete(),
      clubName: firestore.FieldValue.delete(),
      manager: firestore.FieldValue.delete(),
    };
    const clubRef = db
      .collection('leagues')
      .doc(myRequest.leagueId)
      .collection('clubs')
      .doc(myRequest.clubId);

    if (!myRequest.manager) {
      batch.update(clubRef, {
        ['roster.' + uid]: firestore.FieldValue.delete(),
      });
    } else {
      batch.delete(clubRef);
    }

    console.log('isadmin', isAdmin);

    batch.set(
      userRef,
      {
        leagues: {
          [myRequest.leagueId]: isAdmin
            ? removeClubFromAdmin
            : firestore.FieldValue.delete(),
        },
      },
      {merge: true},
    );

    let updatedUserData = {...userData};
    let updatedUserLeagues = {...context.userLeagues};

    if (isAdmin) {
      const {admin, owner} = updatedUserData.leagues[myRequest.leagueId];
      updatedUserData.leagues[myRequest.leagueId] = {
        admin,
        owner,
      };
      console.log(updatedUserData.leagues[myRequest.leagueId]);
    } else {
      delete updatedUserData.leagues[myRequest.leagueId];
      delete updatedUserLeagues[myRequest.leagueId];
    }

    await batch.commit();
    context.setUserData(updatedUserData);
    context.setUserLeagues(updatedUserLeagues);
    setLoading(false);
  };

  const onCancelRequest = (item: ISentRequest) => {
    Alert.alert(
      i18n._(t`Remove Request`),
      i18n._(t`Are you sure you want to remove your sent request?`),
      [
        {
          text: i18n._(t`Remove`),
          onPress: () => {
            onCancelRequestConfirm(item);
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
    <>
      <FullScreenLoading visible={loading} />
      <SectionList
        sections={data}
        stickySectionHeadersEnabled={true}
        keyExtractor={(item) => item.clubId}
        renderItem={({item}) => (
          <OneLine
            title={item.clubName}
            onIconPress={() => onCancelRequest(item)}
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
    </>
  );
}
