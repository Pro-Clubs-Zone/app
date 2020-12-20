import React, {useState, createContext, Dispatch, SetStateAction} from 'react';

const LeagueContext = createContext<{
  // league: ILeague | null;
  // setLeague: Dispatch<SetStateAction<ILeague>>;
  // isAdmin: boolean;
  // setIsAdmin: Dispatch<SetStateAction<boolean>>;
  leagueId: string | null;
  setLeagueId: Dispatch<SetStateAction<string>>;
}>(null);

const LeagueProvider = (props: any) => {
  // const [league, setLeague] = useState<ILeague>(null);
  const [leagueId, setLeagueId] = useState<string>(null);

  return (
    <LeagueContext.Provider value={{leagueId, setLeagueId}}>
      {props.children}
    </LeagueContext.Provider>
  );
};

export {LeagueProvider, LeagueContext};
