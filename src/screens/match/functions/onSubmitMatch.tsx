import functions from '@react-native-firebase/functions';
import firestore from '@react-native-firebase/firestore';
import {IMatchNavData} from '../../../utils/interface';

const db = firestore();
const firFunc = functions();

const onSubmitMatch = (
  homeScore: number,
  awayScore: number,
  matchData: IMatchNavData,
) => {
  const teamSubmission = {
    [matchData.clubId]: {
      [matchData.home]: homeScore,
      [matchData.away]: awayScore,
    },
  };
  const matchRef = db
    .collection('leagues')
    .doc(matchData.leagueId)
    .collection('matches')
    .doc(matchData.matchId);

  matchRef
    .set(
      {
        submissions: teamSubmission,
      },
      {merge: true},
    )
    .then(() => {
      if (
        matchData.submissions &&
        Object.keys(matchData.submissions).length === 1
      ) {
        const controlMatch = firFunc.httpsCallable('matchSubmission');
        const match: IMatchNavData = {
          ...matchData,
          submissions: {...matchData.submissions, ...teamSubmission},
        };
        console.log({...match});

        controlMatch({data: match})
          .then((response) => {
            console.log('message from cloud', response);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
  // .then(() => {
  //   navigation.goBack();
  // });
};

export default onSubmitMatch;
