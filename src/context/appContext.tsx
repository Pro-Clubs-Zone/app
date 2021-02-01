import React, {useState, createContext, Dispatch, SetStateAction} from 'react';
import {IUser, ILeague, FixtureList} from '../utils/interface';

type AppContextType = {
  userData: IUser | undefined;
  setUserData: Dispatch<SetStateAction<IUser | undefined>>;
  userMatches: FixtureList[] | [];
  setUserMatches: Dispatch<SetStateAction<FixtureList[] | []>>;
  userLeagues:
    | {
        [league: string]: ILeague;
      }
    | undefined;
  setUserLeagues: Dispatch<
    SetStateAction<
      | {
          [league: string]: ILeague;
        }
      | undefined
    >
  >;
};

const AppContext = createContext<AppContextType>({} as AppContextType);

const AppProvider = (props: any) => {
  const [userData, setUserData] = useState<IUser>();
  const [userLeagues, setUserLeagues] = useState<{
    [league: string]: ILeague;
  }>();
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
