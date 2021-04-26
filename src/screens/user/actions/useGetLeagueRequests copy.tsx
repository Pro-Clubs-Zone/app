import {useContext, useEffect, useState} from 'react';
import {
  IClub,
  IClubRequest,
  IPlayerRequestData,
} from '../../../utils/interface';
import {AppContext} from '../../../context/appContext';
import firestore from '@react-native-firebase/firestore';

const useGetClubRequests = (uid: string) => {
  const [data, setData] = useState<IClubRequest[]>([]);
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

      const query = db.collectionGroup('clubs').where('managerId', '==', uid);

      const getRequests = query.onSnapshot((snapshot) => {
        let requests: IClubRequest[] = [];
        let requestCount = 0;
        if (snapshot.empty) {
          return setLoading(false);
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

              //   leagueData.data = [...leagueData.data, clubData];
              requestCount++;
            }
          }
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

export default useGetClubRequests;
