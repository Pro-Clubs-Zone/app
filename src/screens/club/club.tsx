import React, {useContext, useEffect, useState, useLayoutEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import {Alert, SectionList} from 'react-native';
import {IClub, IClubRequest, IPlayerRequestData} from '../../utils/interface';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {AppContext} from '../../context/appContext';
import {LeagueStackType} from '../league/league';
import {ListHeading, OneLine, ListSeparator} from '../../components/listItems';
import FullScreenLoading from '../../components/loading';
import {useActionSheet} from '@expo/react-native-action-sheet';
import handleClubRequest from './actions/handleClubRequest';
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

const db = firestore();

export default function Club({navigation, route}: Props) {
  const [data, setData] = useState<IPlayerRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionedData, setSectionedData] = useState<IClubRequest[]>([]);
  const [managerId, setManagerId] = useState<string>();

  const context = useContext(AppContext);
  const leagueContext = useContext(LeagueContext);
  const {showActionSheetWithOptions} = useActionSheet();

  const clubId = route.params.clubId;
  const leagueId = leagueContext.leagueId;
  const club = context.userData.leagues[leagueId];

  const isManager = context.userData.leagues[leagueId].manager;

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
    title: i18n._(t`New Requests`),
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
    const clubRef = db
      .collection('leagues')
      .doc(leagueId)
      .collection('clubs')
      .doc(clubId);

    const getData = async () => {
      clubRef.get().then((doc) => {
        const clubData = doc.data() as IClub;
        console.log(clubData);

        let playerList: IPlayerRequestData[] = [];
        let playerInfo: IPlayerRequestData;
        for (const [playerId, player] of Object.entries(clubData.roster)) {
          playerInfo = {
            ...player,
            playerId: playerId,
            clubId: clubId,
            leagueId: leagueId,
          };
          playerList.push(playerInfo);
        }
        setManagerId(clubData.managerId);
        setData(playerList);
        sortPlayers(playerList);
        setLoading(false);
      });
    };
    getData();
  }, [leagueId, clubId]);

  const onAcceptPlayer = async (selectedPlayer: IPlayerRequestData) => {
    setLoading(true);
    const isPlayerAdmin = Object.keys(leagueContext.league.admins).some(
      (adminUid) => adminUid === selectedPlayer.playerId,
    );

    const updatedList: IPlayerRequestData[] = data.map((player) => {
      if (player.playerId === selectedPlayer.playerId) {
        player.accepted = true;
      }
      return player;
    });

    await handleClubRequest(selectedPlayer, true, club.clubName, isPlayerAdmin);
    setData(updatedList);
    sortPlayers(updatedList);
    setLoading(false);
  };

  const onDeclinePlayer = async (selectedPlayer: IPlayerRequestData) => {
    setLoading(true);
    const isPlayerAdmin = Object.keys(leagueContext.league.admins).some(
      (adminUid) => adminUid === selectedPlayer.playerId,
    );
    const updatedList: IPlayerRequestData[] = data.filter(
      (player) => player.playerId !== selectedPlayer.playerId,
    );

    try {
      await handleClubRequest(
        selectedPlayer,
        false,
        club.clubName,
        isPlayerAdmin,
      );
      setData(updatedList);
      sortPlayers(updatedList);
      setLoading(false);
    } catch (err) {
      console.log(err);
      throw new Error(err);
    }
  };

  const onRemovePlayer = async (selectedPlayer: IPlayerRequestData) => {
    setLoading(true);
    const leagueAdmins = leagueContext.league.admins;
    const isAdmin = Object.keys(leagueAdmins).some(
      (adminUid) => adminUid === selectedPlayer.playerId,
    );
    const updatedList: IPlayerRequestData[] = data.filter(
      (player) => player.playerId !== selectedPlayer.playerId,
    );

    await removePlayer({
      ...selectedPlayer,
      clubName: club.clubName,
      isAdmin,
    });

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
