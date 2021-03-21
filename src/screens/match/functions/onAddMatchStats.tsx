import firestore from '@react-native-firebase/firestore';
import {IMatchNavData, PlayerStats} from '../../../utils/interface';

const db = firestore();

interface SelectMenu {
  name: string;
  id: string;
}

const addMatchStats = async (
  match: IMatchNavData,
  playerData: Array<SelectMenu & PlayerStats>,
  motm: string,
) => {
  const ref = db
    .collection('leagues')
    .doc(match.leagueId)
    .collection('stats')
    .doc('players');

  const batch = db.batch();

  playerData.forEach((player) => {
    const isMotm = player.id === motm;

    const stats = {
      [player.id]: {
        goals: firestore.FieldValue.increment(
          player.goals ? Number(player.goals) : 0,
        ),
        assists: firestore.FieldValue.increment(
          player.assists ? Number(player.assists) : 0,
        ),
        matches: firestore.FieldValue.increment(1),
        motm: firestore.FieldValue.increment(isMotm ? 1 : 0),
        club: player.club,
        clubId: player.clubId,
        username: player.name,
      },
    };

    batch.update(ref, stats);
  });

  await batch.commit().catch((err) => console.log('error', err));
};

export default addMatchStats;
