import {AppContextInt, MatchInt, MatchData} from '../../../utils/interface';
import firestore from '@react-native-firebase/firestore';

const db = firestore();

const getUserMatches = async (data: AppContextInt) => {
  let upcomingMatches: MatchData[] = [];

  for (const [leagueId, league] of Object.entries(data.userData.leagues)) {
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
            const {home, away, submissions} = doc.data() as MatchInt;
            const leagueData = data.userLeagues[leagueId];

            let matchData: MatchData = {
              matchId: doc.id,
              home: home,
              away: away,
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
