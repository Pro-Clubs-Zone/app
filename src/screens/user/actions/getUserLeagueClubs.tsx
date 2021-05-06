import firestore from '@react-native-firebase/firestore';
import {IClub, ILeague, IUser} from '../../../utils/interface';

const db = firestore();

const getLeaguesClubs = async (
  userData: IUser,
): Promise<{
  updatedUserData: IUser;
  userLeagues: {[league: string]: ILeague};
}> => {
  const leagues = Object.keys(userData.leagues);
  const leaguesRef = db.collection('leagues');

  let userLeagues: {[league: string]: ILeague} = {};
  let adminConflictCounts: number = 0;

  for (const leagueId of leagues) {
    //  const clubRef = leaguesRef.doc(leagueId).collection('clubs');

    await leaguesRef
      .doc(leagueId)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const league = doc.data() as ILeague;
          userLeagues = {...userLeagues, [doc.id]: league};
          if (userData.leagues[leagueId].admin) {
            adminConflictCounts += league.conflictMatchesCount;
          }
        }
      });
    // .then(async () => {
    //   await clubRef.get().then((querySnapshot) => {
    //     querySnapshot.forEach((doc) => {
    //       userLeagues[leagueId].clubs = {
    //         ...userLeagues[leagueId].clubs,
    //         [doc.id]: doc.data() as IClub,
    //       };
    //     });
    //   });
    // });
  }
  const updatedUserData: IUser = {
    ...userData,
    adminConflictCounts: adminConflictCounts,
  };

  return {
    userLeagues,
    updatedUserData,
  };
};

export default getLeaguesClubs;
