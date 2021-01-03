import React, {useContext, useEffect, useState, useLayoutEffect} from 'react';
import {Button, SectionList} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {IClubRequest, IPlayerRequestData} from '../../utils/interface';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {AppContext} from '../../context/appContext';
import {LeagueStackType} from '../league/league';
import {ListHeading, OneLine, ListSeparator} from '../../components/listItems';
import FullScreenLoading from '../../components/loading';
import {useActionSheet} from '@expo/react-native-action-sheet';
import onAcceptPlayer from './actions/onAcceptPlayer';
import {RequestContext} from '../../context/requestContext';

// TODO: Update context on changes

type ScreenNavigationProp = StackNavigationProp<LeagueStackType, 'My Club'>;
type ScreenRouteProp = RouteProp<LeagueStackType, 'My Club'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

const db = firestore();
const batch = db.batch();

export default function Club({navigation, route}: Props) {
  const [data, setData] = useState<IPlayerRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionedData, setSectionedData] = useState<IClubRequest[]>([]);

  const leagueId = route.params.leagueId;
  const clubId = route.params.clubId;
  const context = useContext(AppContext);
  const requestContext = useContext(RequestContext);
  const {showActionSheetWithOptions} = useActionSheet();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          title="settings"
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

  const clubRef = db
    .collection('leagues')
    .doc(leagueId)
    .collection('clubs')
    .doc(clubId);

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

  const acceptPlayer = async (selectedPlayer: IPlayerRequestData) => {
    setLoading(true);
    const club = context.userData.leagues[leagueId];
    const requests = requestContext.clubs;
    const requestSectionTitle =
      club.clubName + ' / ' + context.userLeagues[leagueId].name;

    const updatedList: IPlayerRequestData[] = data.map((player) => {
      if (player.playerId === selectedPlayer.playerId) {
        player.accepted = true;
      }
      return player;
    });

    onAcceptPlayer(requests, selectedPlayer, requestSectionTitle)
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
      })
      .then(() => {
        setData(updatedList);
        sortPlayers(updatedList);
        setLoading(false);
      });
  };

  const onPlayerDecline = async (playerId: string) => {
    setLoading(true);
    const declinedPlayer: PlayerData | undefined = data.find(
      (player) => player.id === playerId,
    );
    const updatedList: PlayerData[] = data.filter(
      (player) => player.id !== playerId,
    );
    setData(updatedList);
    sortPlayers(updatedList);
    const playerRef = db.collection('users').doc(declinedPlayer.id);
    batch.update(playerRef, {
      [`leagues.${leagueId}`]: firestore.FieldValue.delete(),
    });
    batch.update(clubRef, {
      ['roster.' + playerId]: firestore.FieldValue.delete(),
    });
    return batch.commit().then(() => setLoading(false));
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
            acceptPlayer(player);
            break;
          case 1:
            onPlayerDecline(playerId);
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
