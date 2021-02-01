import React, {useState, createContext, Dispatch, SetStateAction} from 'react';
import {ILeague} from '../utils/interface';

type LeagueContextType = {
  league: ILeague | undefined;
  setLeague: Dispatch<SetStateAction<ILeague | undefined>>;
  leagueId: string | undefined;
  setLeagueId: Dispatch<SetStateAction<string | undefined>>;
};

const LeagueContext = createContext<LeagueContextType>({} as LeagueContextType);

const LeagueProvider = (props: any) => {
  // const [league, setLeague] = useState<ILeague>(null);
  const [leagueId, setLeagueId] = useState<string>();
  const [league, setLeague] = useState<ILeague>();

  return (
    <LeagueContext.Provider value={{leagueId, setLeagueId, league, setLeague}}>
      {props.children}
    </LeagueContext.Provider>
  );
};

export {LeagueProvider, LeagueContext};
