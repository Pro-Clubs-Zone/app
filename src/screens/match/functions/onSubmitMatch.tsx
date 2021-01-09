import functions from '@react-native-firebase/functions';
import firestore from '@react-native-firebase/firestore';
import {IMatchNavData} from '../../../utils/interface';

const db = firestore();
const firFunc = functions();

const onSubmitMatch = async (
  homeScore: string,
  awayScore: string,
  matchData: IMatchNavData,
): Promise<string> => {
  const teamSubmission = {
    [matchData.clubId]: {
      [matchData.homeTeamId]: Number(homeScore),
      [matchData.awayTeamId]: Number(awayScore),
    },
  };
  const matchRef = db
    .collection('leagues')
    .doc(matchData.leagueId)
    .collection('matches')
    .doc(matchData.matchId);

  return matchRef
    .set(
      {
        submissions: teamSubmission,
      },
      {merge: true},
    )
    .then(() => {
      // let message;
      if (
        matchData.submissions &&
        Object.keys(matchData.submissions).length === 1
      ) {
        const controlMatch = firFunc.httpsCallable('matchSubmission');
        const match: IMatchNavData = {
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

export default onSubmitMatch;
