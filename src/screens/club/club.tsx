import React, {useContext, useEffect, useState, useLayoutEffect} from 'react';
import {Alert, SectionList} from 'react-native';
import {IClubRequest, IPlayerRequestData} from '../../utils/interface';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {AppContext} from '../../context/appContext';
import {LeagueStackType} from '../league/league';
import {ListHeading, OneLine, ListSeparator} from '../../components/listItems';
import FullScreenLoading from '../../components/loading';
import {useActionSheet} from '@expo/react-native-action-sheet';
import handleClubRequest from './actions/handleClubRequest';
import {RequestContext} from '../../context/requestContext';
import {IconButton} from '../../components/buttons';
import {LeagueContext} from '../../context/leagueContext';
import removePlayer from './actions/removePlayer';
import {t} from '@lingui/macro';
import i18n from '../../utils/i18n';

type ScreenNavigationProp = StackNavigationProp<LeagueStackType, 'My Club'>;
type ScreenRouteProp = RouteProp<LeagueStackType, 'My Club'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

export default function Club({navigation, route}: Props) {
  const [data, setData] = useState<IPlayerRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionedData, setSectionedData] = useState<IClubRequest[]>([]);

  const context = useContext(AppContext);
  const requestContext = useContext(RequestContext);
  const leagueContext = useContext(LeagueContext);
  const {showActionSheetWithOptions} = useActionSheet();

  const clubId = route.params.clubId;
  const leagueId = leagueContext.leagueId;
  const club = context.userData.leagues[leagueId];
  const requests = requestContext.clubs;
  const requestSectionTitle =
    club.clubName + ' / ' + context.userLeagues[leagueId].name;

  const isManager = context.userData.leagues[leagueId].manager;
  const managerId = context.userLeagues[leagueId].clubs[clubId].managerId;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          name="cog"
          onPress={() =>
            navigation.navigate('Club Settings', {
              clubId: clubId,
            })
          }
        />
      ),
    });
  }, [navigation]);

  const roster: IClubRequest = {
    title: i18n._(t`Roster`),
    data: [],
  };

  const playerRequests: IClubRequest = {
    title: i18n._(t`New requests`),
    data: [],
  };

  const sortPlayers = (players: IPlayerRequestData[]) => {
    players.forEach((player) => {
      if (player.accepted) {
        roster.data.push(player);
      } else {
        playerRequests.data.push(player);
      }
    });

    let sortedPlayers: IClubRequest[] = [];

    if (roster.data.length !== 0) {
      sortedPlayers.push(roster);
    }
    if (playerRequests.data.length !== 0) {
      sortedPlayers.push(playerRequests);
    }
    setSectionedData(sortedPlayers);
  };

  useEffect(() => {
    const clubRoster = context.userLeagues[leagueId].clubs[clubId].roster;
    let playerList: IPlayerRequestData[] = [];
    let playerInfo: IPlayerRequestData;
    for (const [playerId, player] of Object.entries(clubRoster)) {
      playerInfo = {
        ...player,
        playerId: playerId,
        clubId: clubId,
        leagueId: leagueId,
      };
      playerList.push(playerInfo);
    }

    setData(playerList);
    sortPlayers(playerList);
    setLoading(false);
  }, [context]);

  const onHandlePlayerRequest = async (
    selectedPlayer: IPlayerRequestData,
    acceptRequest: boolean,
  ) => {
    try {
      const newData = await handleClubRequest(
        requests,
        selectedPlayer,
        requestSectionTitle,
        acceptRequest,
      );

      requestContext.setClubs(newData);
      const currentCount = requestContext.requestCount;
      requestContext.setClubCount(currentCount === 1 ? 0 : currentCount - 1);

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
    } catch (error) {
      throw new Error(error);
    }
  };

  const onAcceptPlayer = async (selectedPlayer: IPlayerRequestData) => {
    setLoading(true);

    const updatedList: IPlayerRequestData[] = data.map((player) => {
      if (player.playerId === selectedPlayer.playerId) {
        player.accepted = true;
      }
      return player;
    });

    onHandlePlayerRequest(selectedPlayer, true).then(() => {
      setData(updatedList);
      sortPlayers(updatedList);
      setLoading(false);
    });
  };

  const onDeclinePlayer = async (selectedPlayer: IPlayerRequestData) => {
    setLoading(true);

    const updatedList: IPlayerRequestData[] = data.filter(
      (player) => player.playerId !== selectedPlayer.playerId,
    );

    onHandlePlayerRequest(selectedPlayer, false).then(() => {
      setData(updatedList);
      sortPlayers(updatedList);
      setLoading(false);
    });
  };

  const onRemovePlayer = async (selectedPlayer: IPlayerRequestData) => {
    setLoading(true);

    const updatedList: IPlayerRequestData[] = data.filter(
      (player) => player.playerId !== selectedPlayer.playerId,
    );

    await removePlayer(selectedPlayer);
    const currentLeagueData = {...context.userLeagues};
    delete currentLeagueData[selectedPlayer.leagueId].clubs[
      selectedPlayer.clubId
    ].roster[selectedPlayer.playerId];

    context.setUserLeagues(currentLeagueData);

    setData(updatedList);
    sortPlayers(updatedList);
    setLoading(false);
  };

  const onAcceptedPlayer = (player: IPlayerRequestData) => {
    Alert.alert(
      i18n._(t`Remove Player`),
      i18n._(t`Are you sure you want to remove this player?`),
      [
        {
          text: i18n._(t`Remove`),
          onPress: () => {
            onRemovePlayer(player);
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

  const onUnacceptedPlayer = (player: IPlayerRequestData) => {
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
            onAcceptPlayer(player);
            break;
          case 1:
            onDeclinePlayer(player);
            break;
        }
      },
    );
  };

  return (
    <>
      <FullScreenLoading visible={loading} />
      <SectionList
        sections={sectionedData}
        keyExtractor={(item) => item.playerId}
        renderItem={({item}) =>
          item.playerId !== managerId && isManager ? (
            item.accepted ? (
              <OneLine
                title={item.username}
                rightIcon="minus-circle"
                onIconPress={() => onAcceptedPlayer(item)}
              />
            ) : (
              <OneLine
                title={item.username}
                onPress={() => onUnacceptedPlayer(item)}
              />
            )
          ) : (
            <OneLine title={item.username} />
          )
        }
        ItemSeparatorComponent={() => <ListSeparator />}
        renderSectionHeader={({section: {title}}) => (
          <ListHeading col1={title} />
        )}
      />
    </>
  );
}
