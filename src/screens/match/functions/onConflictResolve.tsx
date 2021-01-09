import functions from '@react-native-firebase/functions';
import {IMatchNavData} from '../../../utils/interface';

const firFunc = functions();

const onConflictResolve = async (
  data: IMatchNavData,
  teamId: string,
): Promise<string> => {
  const selectedResult = data.submissions[teamId];
  const resolveConflict = firFunc.httpsCallable('conflictResolution');

  return resolveConflict({match: data, result: selectedResult})
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error);
    });
};

export default onConflictResolve;
