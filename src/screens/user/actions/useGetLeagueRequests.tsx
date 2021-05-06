import {useContext, useEffect, useState} from 'react';
import {
  IClub,
  IClubRequestData,
  ILeagueRequest,
} from '../../../utils/interface';
import {AppContext} from '../../../context/appContext';
import firestore from '@react-native-firebase/firestore';
import {t} from '@lingui/macro';
import i18n from '../../../utils/i18n';
const useGetLeagueRequests = (uid: string) => {
  const [data, setData] = useState<ILeagueRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);

  const context = useContext(AppContext);
  // const requestContext = useContext(RequestContext);

  const db = firestore();

  useEffect(() => {
    if (context.userLeagues) {
      const leagueIds: string[] = [];
      for (const [leagueId, league] of Object.entries(context.userLeagues)) {
        if (league.admins[uid] !== undefined) {
          leagueIds.push(leagueId);
        }
      }
      if (leagueIds.length !== 0) {
        setLoading(true);
        const query = db
          .collectionGroup('clubs')
          .where('leagueId', 'in', leagueIds)
          .where('accepted', '==', false);

        const getRequests = query.onSnapshot((snapshot) => {
          let requests: ILeagueRequest[] = [];
          let requestCount = 0;
          if (snapshot.empty) {
            setLoading(false);
            setData([]);
            setCount(0);
            return {data, count, loading};
          }

          snapshot.forEach((doc) => {
            const leagueId: string = doc.ref.parent.parent.id;
            const leagueName = context.userLeagues[leagueId].name;
            const club = doc.data() as IClub;
            const clubId = doc.id;

            let leagueData: ILeagueRequest = {
              title: '',
              data: [],
            };

            let clubData: IClubRequestData = {
              ...club,
              clubId: clubId,
            };

            if (requests.length === 0) {
              leagueData = {
                title: leagueName,
                data: [clubData],
              };
              requests.push(leagueData);
            } else {
              requests.map((request, index) => {
                if (request.title === leagueName) {
                  requests[index].data.push(clubData);
                } else {
                  leagueData = {
                    title: leagueName,
                    data: [clubData],
                  };
                  requests.push(leagueData);
                }
              });
            }
            requestCount++;
          });

          setData(requests);
          setCount(requestCount);
          setLoading(false);
        });

        return getRequests;
      }
    }
  }, [context.userLeagues]);

  return {data, count, loading};
};

export default useGetLeagueRequests;
