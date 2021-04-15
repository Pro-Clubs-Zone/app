import firestore from '@react-native-firebase/firestore';

const skipStatsSubmission = async (
  leagueId: string,
  matchId: string,
  playerId: string,
) => {
  const db = firestore();
  const batch = db.batch();
  const matchRef = db
    .collection('leagues')
    .doc(leagueId)
    .collection('matches')
    .doc(matchId);

  batch.update(matchRef, {
    notSubmittedPlayers: firestore.FieldValue.arrayRemove(playerId),
  });
  batch.set(
    matchRef,
    {players: {[playerId]: {submitted: true}}},
    {merge: true},
  );

  await batch.commit();
};

export default skipStatsSubmission;
