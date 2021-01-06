import {IMatch, IMatchNavData, IUser, ILeague} from '../../../utils/interface';
import firestore from '@react-native-firebase/firestore';

const db = firestore();

const getUserMatches = async (
  userData: IUser,
  userLeagues: {[id: string]: ILeague},
) => {
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
            const {
              homeTeamId: home,
              awayTeamId: away,
              submissions,
            } = doc.data() as IMatch;
            const leagueData = userLeagues[leagueId];

            let matchData: IMatchNavData = {
              matchId: doc.id,
              homeTeamId: home,
              awayTeamId: away,
              clubId: clubId,
              manager: league.manager,
              leagueId: leagueId,
              leagueName: leagueData.name,
              homeTeamName: leagueData.clubs[home].name,
              awayTeamName: leagueData.clubs[away].name,
              submissions: submissions,
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
