import functions from '@react-native-firebase/functions';
import {IMatchNavData} from '../../../utils/interface';

const firFunc = functions();

const onConflictResolve = async (
  data: IMatchNavData,
  selectedTeam: string,
  adminResolution = false,
): Promise<string> => {
  const resolveConflict = firFunc.httpsCallable('conflictResolution');

  return resolveConflict({
    match: data,
    selectedTeam: selectedTeam,
    adminResolution,
  })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error);
    });
};

export default onConflictResolve;
