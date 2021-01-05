import functions from '@react-native-firebase/functions';
import {IMatchNavData} from '../../../utils/interface';

const firFunc = functions();

const onConflictResolve = async (data: IMatchNavData, teamId: string) => {
  const selectedResult = data.submissions[teamId];
  const resolveConflict = firFunc.httpsCallable('conflictResolution');

  await resolveConflict({match: data, result: selectedResult})
    .then((response) => {
      console.log('message from cloud', response);
    })
    .catch((error) => {
      console.log(error);
    });
};

export default onConflictResolve;
