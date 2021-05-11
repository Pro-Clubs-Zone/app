import firestore from '@react-native-firebase/firestore';
import {IPlayerRequestData, Transfer} from '../../../utils/interface';

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

  if (acceptRequest) {
    batch.update(clubRef, {
      ['roster.' + playerId + '.accepted']: true,
    });
    batch.update(playerRef, {
      ['leagues.' + leagueId + '.accepted']: true,
    });
    batch.set(transfersRef, transferItem, {merge: true});
  } else {
    if (isAdmin) {
      batch.update(playerRef, {
        ['leagues.' + leagueId + '.accepted']: firestore.FieldValue.delete(),
        ['leagues.' + leagueId + '.clubId']: firestore.FieldValue.delete(),
        ['leagues.' + leagueId + '.clubName']: firestore.FieldValue.delete(),
        ['leagues.' + leagueId + '.manager']: firestore.FieldValue.delete(),
      });
    } else {
      batch.update(playerRef, {
        ['leagues.' + leagueId]: firestore.FieldValue.delete(),
      });
    }
    batch.update(clubRef, {
      ['roster.' + playerId]: firestore.FieldValue.delete(),
    });
  }

  await batch.commit();
};

export default handleClubRequest;
