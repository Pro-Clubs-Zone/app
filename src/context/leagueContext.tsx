import React, {useState, createContext, Dispatch, SetStateAction} from 'react';
import {ILeague} from '../utils/interface';

type LeagueContextType = {
  league: ILeague;
  setLeague: Dispatch<SetStateAction<ILeague>>;
  leagueId: string;
  setLeagueId: Dispatch<SetStateAction<string>>;
};

const LeagueContext = createContext<LeagueContextType>({} as LeagueContextType);

const LeagueProvider = (props: any) => {
  // const [league, setLeague] = useState<ILeague>(null);
  const [leagueId, setLeagueId] = useState<string>('');
  const [league, setLeague] = useState<ILeague>({} as ILeague);

  return (
    <LeagueContext.Provider value={{leagueId, setLeagueId, league, setLeague}}>
      {props.children}
    </LeagueContext.Provider>
  );
};

export {LeagueProvider, LeagueContext};
