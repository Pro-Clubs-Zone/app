import React, {
  useEffect,
  useState,
  createContext,
  Dispatch,
  SetStateAction,
} from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import {
  IClubRequest,
  ILeagueRequest,
  IMyRequests,
  IUser,
  ILeague,
} from './interface';

const AppContext = createContext<{
  userData: IUser | null;
  setUserData: Dispatch<SetStateAction<IUser | null>>;
  userLeagues: {
    [league: string]: ILeague;
  } | null;
  setUserLeagues: Dispatch<
    SetStateAction<{
      [league: string]: ILeague;
    } | null>
  >;
} | null>(null);

const AuthContext = createContext<{uid: string} | undefined>(undefined);

const RequestContext = createContext<{
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
} | null>(null);

const db = firestore();
const firAuth = auth();
const firFunc = functions();

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

const AppProvider = (props: any) => {
  const [userData, setUserData] = useState<IUser | null>(null);
  const [userLeagues, setUserLeagues] = useState<{
    [league: string]: ILeague;
  } | null>(null);

  return (
    <AppContext.Provider
      value={{userData, setUserData, userLeagues, setUserLeagues}}>
      {props.children}
    </AppContext.Provider>
  );
};

const AuthProvider = (props: any) => {
  const [user, setUser] = useState<{uid: string} | undefined>(undefined);

  function onAuthStateChanged(firUser: any): void {
    setUser(firUser);
  }
  useEffect(() => {
    if (__DEV__) {
      firFunc.useFunctionsEmulator('http://localhost:5001');
      firAuth.useEmulator('http://localhost:9099');
      db.settings({
        host: 'localhost:8080',
        ssl: false,
        persistence: false,
        cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
      });
    }
    const subscriber = firAuth.onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
    //FIXME:  double call;
  }, []);

  return (
    <AuthContext.Provider value={user}>{props.children}</AuthContext.Provider>
  );
};

export {
  AppProvider,
  AppContext,
  AuthProvider,
  AuthContext,
  RequestContext,
  RequestProvider,
};
