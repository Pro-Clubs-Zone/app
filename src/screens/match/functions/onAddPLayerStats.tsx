import firestore from '@react-native-firebase/firestore';
import {
  CommonPlayerStats,
  GoalkeeperStats,
  IMatchNavData,
  OutfieldPlayerStats,
} from '../../../utils/interface';

const db = firestore();

const addPlayerStats = async (
  match: IMatchNavData,
  playerStats: Partial<GoalkeeperStats & OutfieldPlayerStats>,
  uid: string,
  isGK: boolean,
) => {
  const batch = db.batch();

  const totalStatsRef = db
    .collection('leagues')
    .doc(match.leagueId)
    .collection('stats')
    .doc('players');

  const matchStatsRef = totalStatsRef.collection('playerMatches').doc(uid);

  const matchRef = db
    .collection('leagues')
    .doc(match.leagueId)
    .collection('matches')
    .doc(match.matchId);

  let totalStats: GoalkeeperStats | OutfieldPlayerStats = {};

  const commonStats: CommonPlayerStats = {
    rating: firestore.FieldValue.increment(playerStats.rating),
    assists: firestore.FieldValue.increment(playerStats.assists),
    completedShortPasses: firestore.FieldValue.increment(
      playerStats.completedShortPasses,
    ),
    completedMediumPasses: firestore.FieldValue.increment(
      playerStats.completedMediumPasses,
    ),
    completedLongPasses: firestore.FieldValue.increment(
      playerStats.completedLongPasses,
    ),
    failedShortPasses: firestore.FieldValue.increment(
      playerStats.failedShortPasses,
    ),
    failedMediumPasses: firestore.FieldValue.increment(
      playerStats.failedMediumPasses,
    ),
    failedLongPasses: firestore.FieldValue.increment(
      playerStats.failedLongPasses,
    ),
    keyPasses: firestore.FieldValue.increment(playerStats.keyPasses),
    successfulCrosses: firestore.FieldValue.increment(
      playerStats.successfulCrosses,
    ),
    failedCrosses: firestore.FieldValue.increment(playerStats.failedCrosses),
    interceptions: firestore.FieldValue.increment(playerStats.interceptions),
    blocks: firestore.FieldValue.increment(playerStats.blocks),
    outOfPosition: firestore.FieldValue.increment(playerStats.outOfPosition),
    possessionWon: firestore.FieldValue.increment(playerStats.possessionWon),
    possessionLost: firestore.FieldValue.increment(playerStats.possessionLost),
    clearances: firestore.FieldValue.increment(playerStats.clearances),
    headersWon: firestore.FieldValue.increment(playerStats.headersWon),
    heardersLost: firestore.FieldValue.increment(playerStats.heardersLost),
  };

  if (isGK) {
    totalStats = {
      goalsConceded: firestore.FieldValue.increment(playerStats.goalsConceded),
      shotsCaught: firestore.FieldValue.increment(playerStats.shotsCaught),
      shotsParried: firestore.FieldValue.increment(playerStats.shotsParried),
      crossesCaught: firestore.FieldValue.increment(playerStats.crossesCaught),
      ballsStriped: firestore.FieldValue.increment(playerStats.ballsStriped),
      ...commonStats,
    };
  } else {
    totalStats = {
      goals: firestore.FieldValue.increment(playerStats.goals),
      shotsOnTarget: firestore.FieldValue.increment(playerStats.shotsOnTarget),
      shotsOffTarget: firestore.FieldValue.increment(
        playerStats.shotsOffTarget,
      ),
      keyDribbles: firestore.FieldValue.increment(playerStats.keyDribbles),
      fouled: firestore.FieldValue.increment(playerStats.fouled),
      successfulDribbles: firestore.FieldValue.increment(
        playerStats.successfulDribbles,
      ),
      wonTackles: firestore.FieldValue.increment(playerStats.wonTackles),
      lostTackles: firestore.FieldValue.increment(playerStats.lostTackles),
      fouls: firestore.FieldValue.increment(playerStats.fouls),
      penaltiesConceded: firestore.FieldValue.increment(
        playerStats.penaltiesConceded,
      ),
      ...commonStats,
    };
  }

  batch.set(totalStatsRef, {[uid]: totalStats}, {merge: true});
  batch.set(matchStatsRef, {[match.matchId]: playerStats}, {merge: true});
  batch.update(matchRef, {[`players.${uid}`]: true});

  await batch.commit().catch((err) => console.log('error', err));
};

export default addPlayerStats;
