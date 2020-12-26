import firestore from '@react-native-firebase/firestore';
import {IClub, ILeague, IUser} from '../../../utils/interface';

const db = firestore();

const getLeaguesClubs = async (
  userData: IUser,
): Promise<{
  userData: IUser;
  userLeagues: {[league: string]: ILeague};
}> => {
  const leagues = Object.entries(userData.leagues);
  const leaguesRef = db.collection('leagues');

  let userLeagues: {[league: string]: ILeague} = {};

  for (const [leagueId, league] of leagues) {
    const clubRef = leaguesRef.doc(leagueId).collection('clubs');

    await leaguesRef
      .doc(leagueId)
      .get()
      .then((doc) => {
        userLeagues = {...userLeagues, [doc.id]: doc.data() as ILeague};
      })
      .then(async () => {
        await clubRef.get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            console.log('club', doc.data());
            userLeagues[leagueId].clubs = {
              ...userLeagues[leagueId].clubs,
              [doc.id]: doc.data() as IClub,
            };
          });
        });
      });
  }

  return {
    userLeagues,
    userData,
  };
};

export default getLeaguesClubs;
