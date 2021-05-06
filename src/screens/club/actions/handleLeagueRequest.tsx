import firestore from '@react-native-firebase/firestore';
import {IClubRequestData} from '../../../utils/interface';

const handleLeagueRequest = async (
  {clubId, leagueId, managerId, name}: IClubRequestData,
  acceptRequest: boolean,
) => {
  const db = firestore();
  const batch = db.batch();

  const leagueRef = db.collection('leagues').doc(leagueId);

  const clubRef = leagueRef.collection('clubs').doc(clubId);
  const managerRef = db.collection('users').doc(managerId);

  if (acceptRequest) {
    batch.update(clubRef, {
      accepted: true,
    });

    batch.update(managerRef, {
      ['leagues.' + leagueId + '.accepted']: true,
    });

    batch.update(leagueRef, {
      acceptedClubs: firestore.FieldValue.increment(1),
    });

    batch.set(
      leagueRef,
      {
        clubIndex: {
          [clubId]: name,
        },
      },
      {merge: true},
    );
  } else {
    batch.update(managerRef, {
      [`leagues.${leagueId}`]: firestore.FieldValue.delete(),
    });
    batch.delete(clubRef);
  }

  await batch.commit();
};

export default handleLeagueRequest;
