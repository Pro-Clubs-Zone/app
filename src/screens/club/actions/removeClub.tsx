import firestore from '@react-native-firebase/firestore';
import {IClubRosterMember, ILeagueAdmin} from '../../../utils/interface';

const removeClub = async (
  leagueId: string,
  clubId: string,
  admins: ILeagueAdmin,
  clubRoster: {[uid: string]: IClubRosterMember},
) => {
  const db = firestore();
  const batch = db.batch();

  const leagueRef = db.collection('leagues').doc(leagueId);

  const clubRef = leagueRef.collection('clubs').doc(clubId);

  for (const playerId of Object.keys(clubRoster)) {
    const playerRef = db.collection('users').doc(playerId);
    const isAdmin = Object.keys(admins).some(
      (adminUid) => adminUid === playerId,
    );
    if (isAdmin) {
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
  batch.update(leagueRef, {
    acceptedClubs: firestore.FieldValue.increment(-1),
  });
  batch.delete(clubRef);

  await batch.commit();
};

export default removeClub;
