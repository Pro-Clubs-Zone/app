import firestore from '@react-native-firebase/firestore';
import {IPlayerRequestData} from '../../../utils/interface';

const removePlayer = async ({
  leagueId,
  playerId,
  clubId,
}: Partial<IPlayerRequestData>) => {
  const db = firestore();
  const batch = db.batch();

  const clubRef = db
    .collection('leagues')
    .doc(leagueId)
    .collection('clubs')
    .doc(clubId);
  const playerRef = db.collection('users').doc(playerId);

  batch.update(playerRef, {
    ['leagues.' + leagueId]: firestore.FieldValue.delete(),
  });

  batch.update(clubRef, {
    ['roster.' + playerId]: firestore.FieldValue.delete(),
  });

  await batch.commit();
};

export default removePlayer;
