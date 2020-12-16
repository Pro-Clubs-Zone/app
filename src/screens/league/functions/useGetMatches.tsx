import {useContext, useEffect, useState} from 'react';
import {IMatchNavData, IMatch, ILeague} from '../../../utils/interface';
import firestore from '@react-native-firebase/firestore';
import {AppContext} from '../../../utils/context';

type FixtureList = {
  key: string;
  data: IMatchNavData;
};
const db = firestore();

const useGetMatches = (
  leagueId: string,
  published: boolean,
  conflict: boolean[],
) => {
  const [data, setData] = useState<FixtureList[]>([]);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [allLoaded, setAllLoaded] = useState<boolean>(false);

  const context = useContext(AppContext);

  useEffect(() => {
    const league = context?.userLeagues[leagueId];
    const userLeague = context?.userData?.leagues[leagueId];
    const clubId = userLeague?.clubId;
    const manager = userLeague?.manager;

    const leagueRef = db
      .collection('leagues')
      .doc(leagueId)
      .collection('matches');

    const firstPage = leagueRef
      .where('published', '==', published)
      .where('conflict', 'in', conflict)
      .orderBy('id', 'asc')
      .limit(2);

    firstPage.get().then((snapshot) => {
      if (!snapshot.empty) {
        let matches: FixtureList[] = [];
        const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
        console.log('first page', published);

        snapshot.forEach((doc) => {
          const matchData = doc.data() as IMatch;
          const matchId = doc.id;
          const awayTeamName = league.clubs[matchData.away].name;
          const homeTeamName = league.clubs[matchData.home].name;

          const match: IMatchNavData = {
            ...matchData,
            homeTeamName: homeTeamName,
            awayTeamName: awayTeamName,
            clubId: clubId,
            manager: manager,
            matchId: matchId,
            leagueId: leagueId,
          };

          const fixture: FixtureList = {
            key: matchId,
            data: match,
          };
          matches.push(fixture);
        });
        setData(matches);
        setLastVisible(lastVisibleDoc);
      }
    });
  }, [leagueId]);

  const onLoadMore = () => {
    const leagueRef = db
      .collection('leagues')
      .doc(leagueId)
      .collection('matches');

    const nextPage = leagueRef
      .where('published', '==', published)
      .orderBy('id', 'asc')
      .startAfter(lastVisible)
      .limit(1);

    nextPage.get().then((snapshot) => {
      if (!snapshot.empty) {
        let matches: FixtureList[] = [];
        const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];

        snapshot.forEach((doc) => {
          const matchData = doc.data() as IMatch;
          const matchId = doc.id;
          const awayTeamName = leagueData?.clubs[matchData.away].name;
          const homeTeamName = leagueData?.clubs[matchData.home].name;

          const match: IMatchNavData = {
            ...matchData,
            homeTeamName: homeTeamName,
            awayTeamName: awayTeamName,
          };

          const fixture: FixtureList = {
            key: matchId,
            data: match,
          };
          matches.push(fixture);
        });
        setData([...data, ...matches]);
        setLastVisible(lastVisibleDoc);
      } else {
        setAllLoaded(true);
      }
    });
  };

  return {data, lastVisible, onLoadMore, allLoaded};
};

export default useGetMatches;
