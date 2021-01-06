import {IMatch, IMatchNavData, IUser, ILeague} from '../../../utils/interface';
import firestore from '@react-native-firebase/firestore';

const getUserMatches = async (
  userData: IUser,
  userLeagues: {[id: string]: ILeague},
) => {
  const db = firestore();

  let upcomingMatches: IMatchNavData[] = [];

  for (const [leagueId, league] of Object.entries(userData.leagues)) {
    const clubId = league.clubId;

    if (clubId) {
      const matchesSnapshot = db
        .collection('leagues')
        .doc(leagueId)
        .collection('matches');

      await matchesSnapshot
        .where('teams', 'array-contains', clubId)
        .orderBy('id', 'asc')
        .limit(10)
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            const match = doc.data() as IMatch;
            const homeTeamId = match.homeTeamId;
            const awayTeamId = match.awayTeamId;
            const leagueData = userLeagues[leagueId];

            let matchData: IMatchNavData = {
              ...match,
              matchId: doc.id,
              clubId: clubId,
              manager: league.manager,
              leagueId: leagueId,
              leagueName: leagueData.name,
              homeTeamName: leagueData.clubs[homeTeamId].name,
              awayTeamName: leagueData.clubs[awayTeamId].name,
            };
            upcomingMatches.push(matchData);
          });
        })
        .catch((err) => console.log('matches error', err));
    }
  }
  return upcomingMatches;
};

export default getUserMatches;
