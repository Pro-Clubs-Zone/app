import React, {useState, createContext, Dispatch, SetStateAction} from 'react';
import {ILeague} from '../utils/interface';

const LeagueContext = createContext<{
  league: ILeague | null;
  setLeague: Dispatch<SetStateAction<ILeague>>;
  leagueId: string | null;
  setLeagueId: Dispatch<SetStateAction<string>>;
}>(null);

const LeagueProvider = (props: any) => {
  const [league, setLeague] = useState<ILeague>(null);
  const [leagueId, setLeagueId] = useState<string>(null);

  return (
    <LeagueContext.Provider value={{league, setLeague, leagueId, setLeagueId}}>
      {props.children}
    </LeagueContext.Provider>
  );
};

export {LeagueProvider, LeagueContext};
