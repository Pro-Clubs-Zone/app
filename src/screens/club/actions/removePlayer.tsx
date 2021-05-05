import firestore from '@react-native-firebase/firestore';
import {IPlayerRequestData, Transfer} from '../../../utils/interface';

const removePlayer = async ({
  leagueId,
  playerId,
  clubId,
  clubName,
  username,
}: Partial<IPlayerRequestData> & {clubName: string}) => {
  const db = firestore();
  const batch = db.batch();

  const clubRef = db
    .collection('leagues')
    .doc(leagueId)
    .collection('clubs')
    .doc(clubId);
  const playerRef = db.collection('users').doc(playerId);
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
      joined: false,
      playerId,
    },
  };

  batch.update(playerRef, {
    ['leagues.' + leagueId]: firestore.FieldValue.delete(),
  });

  batch.update(clubRef, {
    ['roster.' + playerId]: firestore.FieldValue.delete(),
  });

  batch.set(transfersRef, transferItem, {merge: true});

  await batch.commit();
};

export default removePlayer;
