import React, {useState, createContext, Dispatch, SetStateAction} from 'react';
import {ILeague} from '../utils/interface';

const LeagueContext = createContext<{
  league: ILeague | null;
  setLeague: Dispatch<SetStateAction<ILeague>>;
  // isAdmin: boolean;
  // setIsAdmin: Dispatch<SetStateAction<boolean>>;
  leagueId: string | null;
  setLeagueId: Dispatch<SetStateAction<string>>;
}>(null);

const LeagueProvider = (props: any) => {
  // const [league, setLeague] = useState<ILeague>(null);
  const [leagueId, setLeagueId] = useState<string>(null);
  const [league, setLeague] = useState<ILeague>(null);

  return (
    <LeagueContext.Provider value={{leagueId, setLeagueId, league, setLeague}}>
      {props.children}
    </LeagueContext.Provider>
  );
};

export {LeagueProvider, LeagueContext};
