import functions from '@react-native-firebase/functions';
import firestore from '@react-native-firebase/firestore';
import {IMatch, IMatchNavData, PlayerStats} from '../../../utils/interface';

const db = firestore();
const firFunc = functions();

interface SelectMenu {
  id: string;
}

const submitMatch = async (
  homeScore: string,
  awayScore: string,
  initialMatchData: IMatchNavData,
  players: Array<SelectMenu & PlayerStats>,
): Promise<string> => {
  const teamSubmission = {
    [initialMatchData.clubId]: {
      [initialMatchData.homeTeamId]: Number(homeScore),
      [initialMatchData.awayTeamId]: Number(awayScore),
    },
  };
  const matchRef = db
    .collection('leagues')
    .doc(initialMatchData.leagueId)
    .collection('matches')
    .doc(initialMatchData.matchId);

  let matchData: IMatch;
  let playerList: {
    [id: string]: boolean;
  } = {};

  players.forEach((player) => {
    playerList[player.id] = false;
  });

  await matchRef.get().then((res) => {
    matchData = res.data() as IMatch;
  });

  return matchRef
    .set(
      {
        submissions: teamSubmission,
        players: playerList,
      },
      {merge: true},
    )
    .then(() => {
      if (
        matchData.submissions &&
        Object.keys(matchData.submissions).length === 1
      ) {
        const controlMatch = firFunc.httpsCallable('matchSubmission');
        const match: IMatch = {
          ...initialMatchData,
          ...matchData,
          submissions: {...matchData.submissions, ...teamSubmission},
        };

        return controlMatch({match: match})
          .then((response) => {
            return response.data;
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        return 'First Submission';
      }
    })
    .then((message) => {
      return message;
    });
};

export default submitMatch;
