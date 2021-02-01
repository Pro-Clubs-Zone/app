import React, {useState, createContext, Dispatch, SetStateAction} from 'react';
import {IClubRequest, ILeagueRequest, IMyRequests} from '../utils/interface';

type RequestContextType = {
  clubs: IClubRequest[];
  leagues: ILeagueRequest[];
  myClubRequests: IMyRequests | null;
  myLeagueRequests: IMyRequests | null;
  setClubs: Dispatch<SetStateAction<IClubRequest[]>>;
  setLeagues: Dispatch<SetStateAction<ILeagueRequest[]>>;
  setMyLeagueRequests: Dispatch<SetStateAction<IMyRequests | null>>;
  setMyClubRequests: Dispatch<SetStateAction<IMyRequests | null>>;
  setLeagueCount: Dispatch<SetStateAction<number>>;
  setClubCount: Dispatch<SetStateAction<number>>;
  requestCount: number;
  resetRequests: () => void;
};

const RequestContext = createContext<RequestContextType>(
  {} as RequestContextType,
);

const RequestProvider = (props: any) => {
  const [myClubRequests, setMyClubRequests] = useState<IMyRequests | null>(
    null,
  );
  const [myLeagueRequests, setMyLeagueRequests] = useState<IMyRequests | null>(
    null,
  );
  const [clubs, setClubs] = useState<IClubRequest[]>([]);
  const [leagues, setLeagues] = useState<ILeagueRequest[]>([]);
  const [leagueCount, setLeagueCount] = useState<number>(0);
  const [clubCount, setClubCount] = useState<number>(0);

  const requestCount: number = leagueCount + clubCount;

  const resetRequests = () => {
    setClubs([]);
    setLeagues([]);
    setLeagueCount(0);
    setClubCount(0);
    setMyLeagueRequests(null);
    setMyClubRequests(null);
  };

  return (
    <RequestContext.Provider
      value={{
        myClubRequests,
        myLeagueRequests,
        clubs,
        leagues,
        setClubs,
        setLeagues,
        setMyLeagueRequests,
        setMyClubRequests,
        setLeagueCount,
        setClubCount,
        requestCount,
        resetRequests,
      }}>
      {props.children}
    </RequestContext.Provider>
  );
};

export {RequestContext, RequestProvider};
