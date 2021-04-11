import functions from '@react-native-firebase/functions';
import firestore from '@react-native-firebase/firestore';
import {
  IMatch,
  IMatchNavData,
  MatchPlayerData,
  PlayerStatsInfo,
} from '../../../utils/interface';

const db = firestore();
const firFunc = functions();

const submitMatch = async (
  homeScore: string,
  awayScore: string,
  initialMatchData: IMatchNavData,
  players: Array<PlayerStatsInfo>,
  motm: string,
): Promise<string> => {
  const teamSubmission = {
    [initialMatchData.clubId]: {
      [initialMatchData.homeTeamId]: Number(homeScore),
      [initialMatchData.awayTeamId]: Number(awayScore),
    },
  };
  const motmSubmission = {
    [initialMatchData.clubId]: motm,
  };

  const matchRef = db
    .collection('leagues')
    .doc(initialMatchData.leagueId)
    .collection('matches')
    .doc(initialMatchData.matchId);

  let matchData: IMatch;
  let playerList: {[uid: string]: MatchPlayerData} = {};
  let notSubmittedPlayers: string[] = [];

  players.forEach((player) => {
    playerList[player.id] = {
      submitted: false,
      clubId: player.clubId,
      username: player.username,
      motm: player.id === motm ?? false,
      club: player.club,
    };
    notSubmittedPlayers.push(player.id);
  });

  await matchRef.get().then((res) => {
    matchData = res.data() as IMatch;
  });

  let submissionData: {
    submissions: {};
    players: {};
    motmSubmissions?: {};
    notSubmittedPlayers: string[];
  } = {
    submissions: teamSubmission,
    players: playerList,
    notSubmittedPlayers: notSubmittedPlayers,
  };

  if (motm !== undefined) {
    submissionData.motmSubmissions = motmSubmission;
  }

  await matchRef.set(submissionData, {merge: true});

  if (
    matchData.submissions &&
    Object.keys(matchData.submissions).length === 1
  ) {
    const controlMatch = firFunc.httpsCallable('matchSubmission');

    let match: IMatch = {
      ...initialMatchData,
      ...matchData,
      submissions: {...matchData.submissions, ...teamSubmission},
    };

    if (motm !== undefined) {
      match.motmSubmissions = {...matchData.motmSubmissions, ...motmSubmission};
    }

    try {
      const submissionResult = await controlMatch({match: match});
      return submissionResult.data;
    } catch (error) {
      throw new Error(error);
    }
  } else {
    return 'First Submission';
  }
};

export default submitMatch;
