import React, {useContext, useEffect, useState, useLayoutEffect} from 'react';
import {Button, SectionList} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {IClubRosterMember} from '../../utils/interface';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {AppContext} from '../../context/appContext';
import {LeagueStackType} from '../league/league';
import {ListHeading, OneLine, ListSeparator} from '../../components/listItems';
import FullScreenLoading from '../../components/loading';
import {useActionSheet} from '@expo/react-native-action-sheet';

// TODO: Update context on changes

type ScreenNavigationProp = StackNavigationProp<LeagueStackType, 'My Club'>;
type ScreenRouteProp = RouteProp<LeagueStackType, 'My Club'>;

type PlayerData = IClubRosterMember & {id: string};

interface PlayerList {
  title: string;
  data: PlayerData[];
}

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

const db = firestore();
const batch = db.batch();

export default function Club({navigation, route}: Props) {
  const [data, setData] = useState<PlayerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionedData, setSectionedData] = useState<PlayerList[]>([]);

  const leagueId = route.params.leagueId;
  const clubId = route.params.clubId;
  const context = useContext(AppContext);
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

  const roster = {
    title: 'Roster',
    data: [] as PlayerData[],
  };

  const playerRequests = {
    title: 'New requests',
    data: [] as PlayerData[],
  };

  const sortPlayers = (clubs: PlayerData[]) => {
    clubs.forEach((club) => {
      if (club.accepted) {
        roster.data.push(club);
      } else {
        playerRequests.data.push(club);
      }
    });

    let sortedPlayers: PlayerList[] = [];

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
    console.log('====================================');
    console.log(context.userLeagues);
    console.log('====================================');
    let playerList: PlayerData[] = [];
    let playerInfo: PlayerData;
    for (const [playerId, player] of Object.entries(clubRoster)) {
      playerInfo = {...player, id: playerId};
      playerList.push(playerInfo);
    }

    console.log(playerList, 'playerList');
    setData(playerList);
    sortPlayers(playerList);
    setLoading(false);
  }, []);

  const onPlayerAccept = async (playerId: string) => {
    setLoading(true);

    const updatedList: PlayerData[] = data.map((player) => {
      if (player.id === playerId) {
        player.accepted = true;
      }
      return player;
    });

    setData(updatedList);
    sortPlayers(updatedList);

    const playerRef = db.collection('users').doc(playerId);

    batch.update(clubRef, {
      ['roster.' + playerId + '.accepted']: true,
    });
    batch.update(playerRef, {
      ['leagues.' + leagueId + '.accepted']: true,
    });

    // const currentLeagueData = context.userLeagues[leagueId];
    // const currentClubData = currentLeagueData.clubs[clubId];
    // const currentClubRosterData = currentClubData.roster;

    // context.setUserLeagues({
    //   ...currentLeagueData,

    // });
    return batch.commit().then(() => setLoading(false));
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

  const onOpenActionSheet = (playerId: string) => {
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
            onPlayerAccept(playerId);
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
        keyExtractor={(item) => item.id}
        renderItem={({item}) => (
          <OneLine
            title={item.username}
            onPress={() => onOpenActionSheet(item.id)}
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
