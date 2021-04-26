import {useContext, useEffect, useState} from 'react';
import {
  IClub,
  IClubRequestData,
  ILeagueRequest,
} from '../../../utils/interface';
import {AppContext} from '../../../context/appContext';
import firestore from '@react-native-firebase/firestore';

const useGetLeagueRequests = () => {
  const [data, setData] = useState<ILeagueRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);

  const context = useContext(AppContext);
  // const requestContext = useContext(RequestContext);

  const db = firestore();

  useEffect(() => {
    if (context.userLeagues) {
      setLoading(true);
      const ownerIds: string[] = [];
      for (const league of Object.values(context.userLeagues)) {
        ownerIds.push(league.ownerId);
      }

      const query = db
        .collectionGroup('clubs')
        .where('leagueOwnerId', 'in', ownerIds)
        .where('accepted', '==', false);

      const getRequests = query.onSnapshot((snapshot) => {
        let requests: ILeagueRequest[] = [];
        let requestCount = 0;
        if (snapshot.empty) {
          return setLoading(false);
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
            leagueId: leagueId,
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

          //   leagueData.data = [...leagueData.data, clubData];
          requestCount++;
        });

        // if (leagueData.data.length !== 0) {
        //   requests.push(leagueData);
        // }
        // requestContext.setLeagueCount(requestCount);
        // requestContext.setLeagues(requests);
        setData(requests);
        setCount(requestCount);
        setLoading(false);
      });

      return getRequests;
    }
  }, [context.userLeagues]);

  return {data, count, loading};
};

export default useGetLeagueRequests;
