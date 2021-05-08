import firestore from '@react-native-firebase/firestore';
import {
  IPlayerRequestData,
  IUserLeague,
  Transfer,
} from '../../../utils/interface';

const handleClubRequest = async (
  {playerId, clubId, leagueId, username}: IPlayerRequestData,
  acceptRequest: boolean,
  clubName: string,
  isAdmin: boolean,
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

  const removeClubFromAdmin: Partial<IUserLeague> = {
    accepted: firestore.FieldValue.delete(),
    clubId: firestore.FieldValue.delete(),
    clubName: firestore.FieldValue.delete(),
    manager: firestore.FieldValue.delete(),
  };

  if (acceptRequest) {
    batch.update(clubRef, {
      ['roster.' + playerId + '.accepted']: true,
    });
    batch.update(playerRef, {
      ['leagues.' + leagueId + '.accepted']: true,
    });
    batch.set(transfersRef, transferItem, {merge: true});
  } else {
    batch.set(
      playerRef,
      {
        [`leagues.${leagueId}`]: isAdmin
          ? removeClubFromAdmin
          : firestore.FieldValue.delete(),
      },
      {merge: true},
    );
    batch.update(clubRef, {
      ['roster.' + playerId]: firestore.FieldValue.delete(),
    });
  }

  await batch.commit();
};

export default handleClubRequest;
