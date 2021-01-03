import React, {useContext, useEffect, useState, useLayoutEffect} from 'react';
import {SectionList} from 'react-native';
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

  const leagueId = route.params.leagueId;
  const clubId = route.params.clubId;
  const context = useContext(AppContext);
  const requestContext = useContext(RequestContext);
  const {showActionSheetWithOptions} = useActionSheet();

  const club = context.userData.leagues[leagueId];
  const requests = requestContext.clubs;
  const requestSectionTitle =
    club.clubName + ' / ' + context.userLeagues[leagueId].name;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          name="cog"
          onPress={() =>
            navigation.navigate('Club Settings', {
              leagueId: leagueId,
              clubId: clubId,
            })
          }
        />
      ),
    });
  }, [navigation]);

  const roster: IClubRequest = {
    title: 'Roster',
    data: [],
  };

  const playerRequests: IClubRequest = {
    title: 'New requests',
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

    console.log(playerList, 'playerList');
    setData(playerList);
    sortPlayers(playerList);
    setLoading(false);
  }, []);

  const onHandlePlayerRequest = async (
    selectedPlayer: IPlayerRequestData,
    acceptRequest: boolean,
  ) => {
    await handleClubRequest(
      requests,
      selectedPlayer,
      requestSectionTitle,
      acceptRequest,
    )
      .then((newData) => {
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

  const onOpenActionSheet = (player: IPlayerRequestData) => {
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
        renderItem={({item}) => (
          <OneLine
            title={item.username}
            onPress={() => onOpenActionSheet(item)}
          />
        )}
        ItemSeparatorComponent={() => <ListSeparator />}
        renderSectionHeader={({section: {title}}) => (
          <ListHeading col1={title} />
        )}
      />
    </>
  );
}
