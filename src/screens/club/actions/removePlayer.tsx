import firestore from '@react-native-firebase/firestore';
import {IPlayerRequestData} from '../../../utils/interface';

const removePlayer = async (selectedPlayer: IPlayerRequestData) => {
  const db = firestore();
  const batch = db.batch();

  const clubRef = db
    .collection('leagues')
    .doc(selectedPlayer.leagueId)
    .collection('clubs')
    .doc(selectedPlayer.clubId);
  const playerRef = db.collection('users').doc(selectedPlayer.playerId);

  batch.update(playerRef, {
    ['leagues.' + selectedPlayer.leagueId]: firestore.FieldValue.delete(),
  });

  batch.update(clubRef, {
    ['roster.' + selectedPlayer.playerId]: firestore.FieldValue.delete(),
  });

  await batch.commit();
};

export default removePlayer;
