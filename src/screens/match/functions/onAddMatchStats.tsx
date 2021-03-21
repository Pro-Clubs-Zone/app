import firestore from '@react-native-firebase/firestore';
import {IMatchNavData, PlayerStats} from '../../../utils/interface';

const db = firestore();

interface SelectMenu {
  id: string;
}

const addMatchStats = async (
  match: IMatchNavData,
  playerData: Array<SelectMenu & PlayerStats>,
  motm: string,
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

    const isMotm = player.id === motm ? 1 : 0;

    const goals = player.goals ? Number(player.goals) : 0;
    const assists = player.assists ? Number(player.assists) : 0;

    const totalStats = {
      [player.id]: {
        goals: firestore.FieldValue.increment(goals),
        assists: firestore.FieldValue.increment(assists),
        matches: firestore.FieldValue.increment(1),
        motm: firestore.FieldValue.increment(isMotm),
        club: player.club,
        clubId: player.clubId,
        username: player.username,
      },
    };

    const matchStats = {
      [match.matchId]: {
        assists: assists,
        goals: goals,
        motm: isMotm,
        //    club: player.club,
        //    clubId: player.clubId,
        //    username: player.username,
      },
    };

    batch.set(totalStatsRef, totalStats, {merge: true});
    batch.set(matchStatsRef, matchStats, {merge: true});
  });

  await batch.commit().catch((err) => console.log('error', err));
};

export default addMatchStats;
