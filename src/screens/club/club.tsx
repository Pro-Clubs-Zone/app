import React, {useContext, useEffect, useState, useLayoutEffect} from 'react';
import {Text, View, Button, SectionList} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {IClubRosterMember} from '../../utils/interface';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {AppContext} from '../../context/appContext';
import {LeagueStackType} from '../league/league';

// TODO: Update context on changes

type ScreenNavigationProp = StackNavigationProp<LeagueStackType, 'My Club'>;
type ScreenRouteProp = RouteProp<LeagueStackType, 'My Club'>;

type PlayerData = IClubRosterMember & {id: string};

interface PlayerList {
  title: string;
  data: IClubRosterMember[];
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
  const [sectionedData, setSectionedData] = useState([]);

  const leagueId = route.params.leagueId;
  const clubId = route.params.clubId;
  const context = useContext(AppContext);

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

    let playerList: PlayerData[] = [];
    let playerInfo: PlayerData;
    for (const [playerId, player] of Object.entries(clubRoster)) {
      playerInfo = {...player, id: playerId};
      playerList.push(playerInfo);
    }

    console.log(playerList, 'playerList');
    setData(playerList);
    sortPlayers(playerList);
  }, [context]);

  const onPlayerAccept = (playerId: string) => {
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

    return batch.commit();
  };

  const onPlayerDecline = (playerId: string) => {
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
    return batch.commit();
  };

  return (
    <View>
      <SectionList
        sections={sectionedData}
        keyExtractor={(item) => item.id}
        renderItem={({item}) => (
          <Players
            username={item.username}
            onAccept={() => onPlayerAccept(item.id)}
            onDecline={() => onPlayerDecline(item.id)}
          />
        )}
        renderSectionHeader={({section: {title}}) => <Text>{title}</Text>}
      />
    </View>
  );
}

const Players = (props) => {
  return (
    <View>
      <Text>{props.username}</Text>
      <Button title="acp" onPress={props.onAccept} />
      <Button title="decline" onPress={props.onDecline} />
    </View>
  );
};
