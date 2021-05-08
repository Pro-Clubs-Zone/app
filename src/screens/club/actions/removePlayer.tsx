import firestore from '@react-native-firebase/firestore';
import {
  IPlayerRequestData,
  IUserLeague,
  Transfer,
} from '../../../utils/interface';

const removePlayer = async ({
  leagueId,
  playerId,
  clubId,
  username,
  clubName,
  isAdmin,
}: Partial<IPlayerRequestData> & {clubName: string; isAdmin: boolean}) => {
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

  const removeClubFromAdmin: Partial<IUserLeague> = {
    accepted: firestore.FieldValue.delete(),
    clubId: firestore.FieldValue.delete(),
    clubName: firestore.FieldValue.delete(),
    manager: firestore.FieldValue.delete(),
  };

  batch.set(
    playerRef,
    {
      ['leagues.' + leagueId]: isAdmin
        ? removeClubFromAdmin
        : firestore.FieldValue.delete(),
    },
    {merge: true},
  );

  batch.update(clubRef, {
    ['roster.' + playerId]: firestore.FieldValue.delete(),
  });

  batch.set(transfersRef, transferItem, {merge: true});

  await batch.commit();
};

export default removePlayer;
