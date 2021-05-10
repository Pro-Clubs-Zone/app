import {useContext, useEffect, useState} from 'react';
import {
  IClub,
  IClubRequest,
  IPlayerRequestData,
} from '../../../utils/interface';
import {AppContext} from '../../../context/appContext';
import firestore from '@react-native-firebase/firestore';
import {RequestContext} from '../../../context/requestContext';

const useGetClubRequests = (uid: string) => {
  const [data, setData] = useState<IClubRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);

  const context = useContext(AppContext);
  const requestContext = useContext(RequestContext);

  const db = firestore();

  useEffect(() => {
    try {
      if (context.userLeagues !== undefined) {
        console.log(context.userLeagues);
        setLoading(true);
        const ownerIds: string[] = [];
        for (const league of Object.values(context.userLeagues)) {
          ownerIds.push(league.ownerId);
        }

        const query = db
          .collectionGroup('clubs')
          .where('managerId', '==', uid)
          .where('accepted', '==', true);

        const getRequests = query.onSnapshot((snapshot) => {
          let requests: IClubRequest[] = [];
          let totalRequestCount = 0;
          let clubRequestCount: {
            [name: string]: number;
          } = {};
          if (snapshot.empty) {
            setLoading(false);
            setData([]);
            setCount(0);
            requestContext.setTotalClubCount(0);
            requestContext.setClubCount({});
            return {data, count, loading};
          }
          snapshot.forEach((doc) => {
            const leagueId: string = doc.ref.parent.parent.id;
            const leagueName = context.userLeagues[leagueId].name;
            const club = doc.data() as IClub;
            const clubId = doc.id;

            for (const [playerId, player] of Object.entries(club.roster)) {
              if (player.accepted === false) {
                let playerData: IPlayerRequestData = {
                  ...player,
                  clubId: clubId,
                  leagueId: leagueId,
                  playerId: playerId,
                };

                let clubData: IClubRequest = {
                  title: '',
                  data: [],
                };

                if (requests.length === 0) {
                  clubData = {
                    title: club.name + ' / ' + leagueName,
                    data: [playerData],
                  };
                  requests.push(clubData);
                } else {
                  requests.map((request, index) => {
                    if (request.title === club.name + ' / ' + leagueName) {
                      requests[index].data.push(playerData);
                    } else {
                      clubData = {
                        title: club.name + ' / ' + leagueName,
                        data: [playerData],
                      };
                      requests.push(clubData);
                    }
                  });
                }
                if (clubRequestCount[clubId] === undefined) {
                  clubRequestCount[clubId] = 1;
                } else {
                  clubRequestCount[clubId] += 1;
                }
                totalRequestCount++;
              }
            }
          });
          requestContext.setTotalClubCount(totalRequestCount);
          requestContext.setClubCount(clubRequestCount);
          setData(requests);
          setCount(totalRequestCount);
          setLoading(false);
        });

        return getRequests;
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
      throw new Error(err);
    }
  }, [context.userLeagues]);

  return {data, count, loading};
};

export default useGetClubRequests;
