import firestore from '@react-native-firebase/firestore';
import {IClub, IClubRequestData} from '../../../utils/interface';
import analytics from '@react-native-firebase/analytics';

type Props = {
  oldClub: IClubRequestData;
  newClub: IClubRequestData;
};

const swapClubs = async ({oldClub, newClub}: Props) => {
  const db = firestore();
  const batch = db.batch();
  const leagueId = oldClub.leagueId;
  const leagueRef = db.collection('leagues').doc(leagueId);
  const clubRef = leagueRef.collection('clubs');
  const standingsRef = leagueRef.collection('stats').doc('standings');

  const usersRef = db.collection('users');

  const newClubData: IClub = {
    accepted: true,
    created: newClub.created,
    managerId: newClub.managerId,
    managerUsername: newClub.managerUsername,
    name: newClub.name,
    roster: {...newClub.roster},
    leagueId: newClub.leagueId,
  };

  batch.set(
    standingsRef,
    {[oldClub.clubId]: {name: newClub.name}},
    {merge: true},
  );
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

    batch.set(
      leagueRef,
      {
        clubIndex: {
          [oldClub.clubId]: newClub.name,
        },
      },
      {merge: true},
    );
  }

  await Promise.all([
    batch.commit(),
    analytics().logEvent('swap_clubs', {
      leagueId: leagueId,
    }),
  ]);
};

export default swapClubs;
