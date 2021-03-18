import functions from '@react-native-firebase/functions';
import {IMatchNavData} from '../../../utils/interface';

const firFunc = functions();

const onConflictResolve = async (
  data: IMatchNavData,
  selectedResult: {},
  conflict = false,
): Promise<string> => {
  const resolveConflict = firFunc.httpsCallable('conflictResolution');

  return resolveConflict({
    match: data,
    result: selectedResult,
    conflict: conflict,
  })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error);
    });
};

export default onConflictResolve;
