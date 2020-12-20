import functions from '@react-native-firebase/functions';
import firestore from '@react-native-firebase/firestore';
import {IMatchNavData} from '../../../utils/interface';

const db = firestore();
const firFunc = functions();

const onConflictResolve = (data: IMatchNavData, teamId: string) => {
  const matchRef = db
    .collection('leagues')
    .doc(data.leagueId)
    .collection('matches')
    .doc(data.matchId);

  const selectedResult = data.submissions[teamId];

  console.log(data, teamId);

  matchRef
    .set(
      {
        result: selectedResult,
        conflict: false,
        published: true,
      },
      {
        merge: true,
      },
    )
    .then(() => {
      console.log('conflict resolved');
    });
};

export default onConflictResolve;
