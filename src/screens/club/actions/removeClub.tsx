import firestore from '@react-native-firebase/firestore';
import {IClubRosterMember} from '../../../utils/interface';
import RNRestart from 'react-native-restart';

const removeClub = async (
  leagueId: string,
  clubId: string,
  adminId: string,
  clubRoster: {[uid: string]: IClubRosterMember},
) => {
  const db = firestore();
  const batch = db.batch();

  const clubRef = db
    .collection('leagues')
    .doc(leagueId)
    .collection('clubs')
    .doc(clubId);

  for (const playerId of Object.keys(clubRoster)) {
    const playerRef = db.collection('users').doc(playerId);
    if (playerId === adminId) {
      batch.update(playerRef, {
        ['leagues.' + leagueId + '.manager']: firestore.FieldValue.delete(),
        ['leagues.' + leagueId + '.clubId']: firestore.FieldValue.delete(),
        ['leagues.' + leagueId + '.accepted']: firestore.FieldValue.delete(),
        ['leagues.' + leagueId + '.clubName']: firestore.FieldValue.delete(),
      });
    } else {
      batch.update(playerRef, {
        ['leagues.' + leagueId]: firestore.FieldValue.delete(),
      });
    }
  }
  batch.delete(clubRef);

  await batch.commit().then(() => {
    RNRestart.Restart();
  });
};

export default removeClub;
