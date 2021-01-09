import {useContext, useEffect, useState} from 'react';
import {IMatchNavData, IMatch, FixtureList} from '../../../utils/interface';
import firestore from '@react-native-firebase/firestore';
import {AppContext} from '../../../context/appContext';

const db = firestore();

const useGetMatches = (
  leagueId: string,
  published: boolean,
  conflict: boolean[],
) => {
  const [data, setData] = useState<FixtureList[]>([]);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [allLoaded, setAllLoaded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const context = useContext(AppContext);

  const league = context.userLeagues[leagueId];
  const userLeague = context.userData?.leagues[leagueId];
  const clubId = userLeague.clubId;
  const manager = userLeague.manager;
  const leagueName = context.userLeagues[leagueId].name;
  const admin = userLeague.admin;

  const leagueRef = db
    .collection('leagues')
    .doc(leagueId)
    .collection('matches');

  useEffect(() => {
    const firstPage = leagueRef
      .where('published', '==', published)
      .where('conflict', 'in', conflict)
      .orderBy('id', 'asc')
      .limit(10);

    const subscriber = firstPage.onSnapshot((snapshot) => {
      if (!snapshot.empty) {
        let matches: FixtureList[] = [];
        let lastVisibleDoc: any = null;
        lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];

        snapshot.forEach((doc) => {
          const matchData = doc.data() as IMatch;
          const matchId = doc.id;
          const awayTeamName = league.clubs[matchData.awayTeamId].name;
          const homeTeamName = league.clubs[matchData.homeTeamId].name;

          const match: IMatchNavData = {
            ...matchData,
            homeTeamName: homeTeamName,
            awayTeamName: awayTeamName,
            clubId: clubId,
            manager: manager,
            matchId: matchId,
            leagueId: leagueId,
            leagueName: leagueName,
            admin: admin,
          };

          const fixture: FixtureList = {
            key: matchId,
            data: match,
          };
          matches.push(fixture);
        });
        setData(matches);
        setLastVisible(lastVisibleDoc);
        setAllLoaded(matches.length < 10);
        setLoading(false);
      }
    });
    return subscriber;
  }, []);

  const onLoadMore = async () => {
    setLoading(true);
    const nextPage = leagueRef
      .where('published', '==', published)
      .orderBy('id', 'asc')
      .startAfter(lastVisible)
      .limit(5);

    await nextPage
      .get()
      .then((snapshot) => {
        if (!snapshot.empty) {
          let matches: FixtureList[] = [];
          const lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];

          snapshot.forEach((doc) => {
            const matchData = doc.data() as IMatch;
            const matchId = doc.id;
            const awayTeamName = league.clubs[matchData.awayTeamId].name;
            const homeTeamName = league.clubs[matchData.homeTeamId].name;

            const match: IMatchNavData = {
              ...matchData,
              homeTeamName: homeTeamName,
              awayTeamName: awayTeamName,
              clubId: clubId,
              manager: manager,
              matchId: matchId,
              leagueId: leagueId,
              leagueName: leagueName,
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
      })
      .then(() => {
        setLoading(false);
      });
  };

  return {data, lastVisible, onLoadMore, allLoaded, loading};
};

export default useGetMatches;
