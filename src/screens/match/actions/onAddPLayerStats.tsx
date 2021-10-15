import firestore from '@react-native-firebase/firestore';
import {
  GoalkeeperStats,
  IMatchNavData,
  MatchPlayerData,
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

  let totalStats = {} as GoalkeeperStats | OutfieldPlayerStats;

  let matchPlayerData: {[uid: string]: Partial<MatchPlayerData>} = {
    [uid]: {
      submitted: true,
      rating: playerStats.rating,
      goals: 0,
    },
  };

  if (playerStats.goals && playerStats.goals > 0) {
    matchPlayerData[uid].goals = playerStats.goals;
  }

  if (isGK) {
    totalStats = {
      rating: firestore.FieldValue.arrayUnion(playerStats.rating),
      shotsAgainst: firestore.FieldValue.increment(playerStats.shotsAgainst),
      shotsOnTarget: firestore.FieldValue.increment(playerStats.shotsOnTarget),
      saves: firestore.FieldValue.increment(playerStats.saves),
      goalsConceded: firestore.FieldValue.increment(playerStats.goalsConceded),
      saveSuccessRate: firestore.FieldValue.increment(
        playerStats.saveSuccessRate,
      ),
      shootoutSaves: firestore.FieldValue.increment(playerStats.shootoutSaves),
      shootoutGoalsConceded: firestore.FieldValue.increment(
        playerStats.shootoutGoalsConceded,
      ),
    };
  } else {
    totalStats = {
      rating: firestore.FieldValue.arrayUnion(playerStats.rating),
      goals: firestore.FieldValue.increment(playerStats.goals),
      assists: firestore.FieldValue.increment(playerStats.assists),
      shots: firestore.FieldValue.increment(playerStats.shots),
      shotsAccuracy: firestore.FieldValue.increment(playerStats.shotsAccuracy),
      passes: firestore.FieldValue.increment(playerStats.passes),
      passAccuracy: firestore.FieldValue.increment(playerStats.passAccuracy),
      dribbles: firestore.FieldValue.increment(playerStats.dribbles),
      dribblesSuccessRate: firestore.FieldValue.increment(
        playerStats.dribblesSuccessRate,
      ),
      tackles: firestore.FieldValue.increment(playerStats.tackles),
      tackleSuccessRate: firestore.FieldValue.increment(
        playerStats.tackleSuccessRate,
      ),
      offsides: firestore.FieldValue.increment(playerStats.offsides),
      fouls: firestore.FieldValue.increment(playerStats.fouls),
      possessionWon: firestore.FieldValue.increment(playerStats.possessionWon),
      possessionLost: firestore.FieldValue.increment(
        playerStats.possessionLost,
      ),
      minutesPlayed: firestore.FieldValue.increment(playerStats.minutesPlayed),
      distanceCovered: firestore.FieldValue.increment(
        playerStats.distanceCovered,
      ),
      distanceSprinted: firestore.FieldValue.increment(
        playerStats.distanceSprinted,
      ),
    };
  }

  batch.set(totalStatsRef, {[uid]: totalStats}, {merge: true});
  batch.set(matchStatsRef, {[match.matchId]: playerStats}, {merge: true});
  batch.set(matchRef, {players: matchPlayerData}, {merge: true});
  batch.set(
    matchRef,
    {
      notSubmittedPlayers: firestore.FieldValue.arrayRemove(uid),
    },
    {merge: true},
  );

  await batch.commit().catch((err) => console.log('error', err));
};

export default addPlayerStats;
