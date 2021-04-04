import firestore from '@react-native-firebase/firestore';
import {IMatchNavData, PlayerStatsInfo} from '../../../utils/interface';

const db = firestore();

const addMatchStats = async (
  match: IMatchNavData,
  playerData: Array<PlayerStatsInfo>,
  // motm: string,
) => {
  const totalStatsRef = db
    .collection('leagues')
    .doc(match.leagueId)
    .collection('stats')
    .doc('players');

  const batch = db.batch();

  playerData.forEach((player) => {
    const matchStatsRef = totalStatsRef
      .collection('playerMatches')
      .doc(player.id);

    // const isMotm = player.id === motm ? 1 : 0;

    const totalStats = {
      [player.id]: {
        matches: firestore.FieldValue.increment(1),
        //      motm: firestore.FieldValue.increment(isMotm),
        club: player.club,
        clubId: player.clubId,
        username: player.username,
      },
    };

    const matchStats = {
      [match.matchId]: {
        motm: 0,
      },
    };

    batch.set(totalStatsRef, totalStats, {merge: true});
    batch.set(matchStatsRef, matchStats, {merge: true});
  });

  await batch.commit().catch((err) => console.log('error', err));
};

export default addMatchStats;
