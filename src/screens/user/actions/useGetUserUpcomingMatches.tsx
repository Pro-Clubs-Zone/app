import {
  IMatch,
  IMatchNavData,
  IUser,
  ILeague,
  FixtureList,
} from '../../../utils/interface';
import firestore from '@react-native-firebase/firestore';

const getUserUpcomingMatches = async (
  userData: IUser,
  userLeagues: {[id: string]: ILeague},
): Promise<FixtureList[]> => {
  const db = firestore();
  let matches: FixtureList[] = [];

  for (const [leagueId, league] of Object.entries(userData.leagues)) {
    const clubId = league.clubId;
    const userLeague = userData.leagues[leagueId];
    const admin = userLeague.admin;
    const accepted = league.accepted;

    if (clubId && accepted) {
      const matchesSnapshot = db
        .collection('leagues')
        .doc(leagueId)
        .collection('matches');

      try {
        const upcomingMatches = await matchesSnapshot
          .where('teams', 'array-contains', clubId)
          .where('published', '==', false)
          .orderBy('id', 'asc')
          .limit(4)
          .get();

        upcomingMatches.forEach((doc) => {
          const matchData = doc.data() as IMatch;
          const matchId = doc.id;
          const leagueData = userLeagues[leagueId];
          const homeTeamName = leagueData.clubs[matchData.homeTeamId].name;
          const awayTeamName = leagueData.clubs[matchData.awayTeamId].name;

          let match: IMatchNavData = {
            ...matchData,
            matchId: doc.id,
            clubId: clubId,
            manager: league.manager,
            leagueId: leagueId,
            leagueName: leagueData.name,
            homeTeamName: homeTeamName,
            awayTeamName: awayTeamName,
            admin: admin,
            //  statsSubmitted: false,
          };

          const fixture: FixtureList = {
            id: matchId,
            data: match,
          };

          matches.push(fixture);
        });
      } catch (error) {
        throw new Error(error);
      }
    }
  }

  return matches;
};

export default getUserUpcomingMatches;
