import firestore from '@react-native-firebase/firestore';
import {IClub, IClubRequestData} from '../../../utils/interface';

type Props = {
  oldClub: IClubRequestData;
  newClub: IClubRequestData;
};

const swapClubs = async ({oldClub, newClub}: Props) => {
  const db = firestore();
  const batch = db.batch();
  const leagueId = oldClub.leagueId;
  const clubRef = db.collection('leagues').doc(leagueId).collection('clubs');

  const usersRef = db.collection('users');

  const newClubData: IClub = {
    accepted: true,
    created: newClub.created,
    managerId: newClub.managerId,
    managerUsername: newClub.managerUsername,
    name: newClub.name,
    roster: {...newClub.roster},
  };

  batch.set(clubRef.doc(oldClub.clubId), newClubData);
  batch.delete(clubRef.doc(newClub.clubId));

  for (const playerId of Object.keys(oldClub.roster)) {
    batch.set(
      usersRef.doc(playerId),
      {
        leagues: {[leagueId]: firestore.FieldValue.delete()},
      },
      {merge: true},
    );
  }

  for (const playerId of Object.keys(newClub.roster)) {
    batch.set(
      usersRef.doc(playerId),
      {
        leagues: {
          [leagueId]: {
            clubId: oldClub.clubId,
            accepted: true,
          },
        },
      },
      {merge: true},
    );
  }

  await batch.commit();
};

export default swapClubs;
