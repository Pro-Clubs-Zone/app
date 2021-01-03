import firestore from '@react-native-firebase/firestore';
import {IClubRequest, IPlayerRequestData} from '../../../utils/interface';

const db = firestore();
const batch = db.batch();

const handlePlayerRequest = async (
  data: IClubRequest[],
  {playerId, clubId, leagueId}: IPlayerRequestData,
  sectionTitle: string,
  acceptRequest: boolean,
) => {
  const playerRef = db.collection('users').doc(playerId);
  const clubRef = db
    .collection('leagues')
    .doc(leagueId)
    .collection('clubs')
    .doc(clubId);

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

export default handlePlayerRequest;
