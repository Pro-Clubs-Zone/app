import React, {useState, createContext, Dispatch, SetStateAction} from 'react';

type RequestContextType = {
  setLeagueCount: Dispatch<SetStateAction<{[leagueId: string]: number}>>;
  setClubCount: Dispatch<SetStateAction<{[club: string]: number}>>;
  setTotalLeagueCount: Dispatch<SetStateAction<number>>;
  setTotalClubCount: Dispatch<SetStateAction<number>>;
  totalClubCount: number;
  totalLeagueCount: number;
  leagueCount: {[league: string]: number};
  clubCount: {[club: string]: number};
  totalCount: number;
  resetRequests: () => void;
};

const RequestContext = createContext<RequestContextType>(
  {} as RequestContextType,
);

const RequestProvider = (props: any) => {
  const [leagueCount, setLeagueCount] = useState<{[leagueId: string]: number}>(
    {},
  );
  const [clubCount, setClubCount] = useState<{[club: string]: number}>({});
  const [totalLeagueCount, setTotalLeagueCount] = useState<number>(0);
  const [totalClubCount, setTotalClubCount] = useState<number>(0);

  const resetRequests = () => {
    setLeagueCount({});
    setClubCount({});
    setTotalLeagueCount(0);
    setTotalClubCount(0);
  };

  const totalCount: number = totalLeagueCount + totalClubCount;

  return (
    <RequestContext.Provider
      value={{
        setLeagueCount,
        setClubCount,
        setTotalLeagueCount,
        setTotalClubCount,
        clubCount,
        leagueCount,
        totalLeagueCount,
        totalClubCount,
        totalCount,
        resetRequests,
      }}>
      {props.children}
    </RequestContext.Provider>
  );
};

export {RequestContext, RequestProvider};
