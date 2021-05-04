import firestore from '@react-native-firebase/firestore';
import {
  IClubRequest,
  IPlayerRequestData,
  Transfer,
} from '../../../utils/interface';

const handleClubRequest = async (
  data: IClubRequest[],
  {playerId, clubId, leagueId, username}: IPlayerRequestData,
  sectionTitle: string,
  acceptRequest: boolean,
  clubName: string,
) => {
  const db = firestore();
  const batch = db.batch();

  const playerRef = db.collection('users').doc(playerId);
  const clubRef = db
    .collection('leagues')
    .doc(leagueId)
    .collection('clubs')
    .doc(clubId);
  const transfersRef = db
    .collection('leagues')
    .doc(leagueId)
    .collection('stats')
    .doc('transfers');

  const transferItem: {[playerId: string]: Transfer} = {
    [firestore.Timestamp.now().toMillis()]: {
      clubId,
      clubName,
      username,
      joined: true,
      playerId,
    },
  };

  const sectionIndex = data.findIndex(
    (section) => section.title === sectionTitle,
  );

  const unacceptedPlayers = data[sectionIndex].data.filter((player) => {
    return player.playerId !== playerId;
  });

  const newData = [...data];
  newData[sectionIndex].data = unacceptedPlayers;

  if (unacceptedPlayers.length === 0) {
    newData.splice(sectionIndex, 1);
  }

  if (acceptRequest) {
    batch.update(clubRef, {
      ['roster.' + playerId + '.accepted']: true,
    });
    batch.update(playerRef, {
      ['leagues.' + leagueId + '.accepted']: true,
    });
    batch.set(transfersRef, transferItem, {merge: true});
  } else {
    batch.update(playerRef, {
      [`leagues.${leagueId}`]: firestore.FieldValue.delete(),
    });
    batch.update(clubRef, {
      ['roster.' + playerId]: firestore.FieldValue.delete(),
    });
  }

  await batch.commit();

  return newData;
};

export default handleClubRequest;
