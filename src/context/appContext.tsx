import React, {useState, createContext, Dispatch, SetStateAction} from 'react';
import {IUser, ILeague, FixtureList} from '../utils/interface';

const AppContext = createContext<{
  userData: IUser | null;
  setUserData: Dispatch<SetStateAction<IUser | null>>;
  userMatches: FixtureList[] | null;
  setUserMatches: Dispatch<SetStateAction<FixtureList[] | null>>;
  userLeagues: {
    [league: string]: ILeague;
  } | null;
  setUserLeagues: Dispatch<
    SetStateAction<{
      [league: string]: ILeague;
    } | null>
  >;
} | null>(null);

const AppProvider = (props: any) => {
  const [userData, setUserData] = useState<IUser | null>(null);
  const [userLeagues, setUserLeagues] = useState<{
    [league: string]: ILeague;
  } | null>(null);
  const [userMatches, setUserMatches] = useState<FixtureList[]>([]);

  return (
    <AppContext.Provider
      value={{
        userData,
        setUserData,
        userLeagues,
        setUserLeagues,
        userMatches,
        setUserMatches,
      }}>
      {props.children}
    </AppContext.Provider>
  );
};

export {AppProvider, AppContext};
