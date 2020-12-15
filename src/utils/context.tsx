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
  AppContextInt,
  ClubRequestInt,
  LeagueRequestInt,
  MyRequests,
  UserDataInt,
} from './interface';

//TODO Fix undefined context problem

const appContextValue: AppContextInt = {
  userData: {} as UserDataInt,
  userLeagues: {},
};

const AppContext = createContext<{
  data: AppContextInt;
  setData: Dispatch<SetStateAction<AppContextInt>>;
} | null>(null);

const AuthContext = createContext<{uid: string} | undefined>(undefined);

const RequestContext = createContext<{
  clubs: ClubRequestInt[];
  leagues: LeagueRequestInt[];
  myRequests: MyRequests[];
  setClubs: Dispatch<SetStateAction<ClubRequestInt[]>>;
  setLeagues: Dispatch<SetStateAction<LeagueRequestInt[]>>;
  setMyLeagueRequests: Dispatch<SetStateAction<MyRequests>>;
  setMyClubRequests: Dispatch<SetStateAction<MyRequests>>;
  setLeagueCount: Dispatch<SetStateAction<number>>;
  setClubCount: Dispatch<SetStateAction<number>>;
  requestCount: number;
} | null>(null);

const db = firestore();
const firAuth = auth();
const firFunc = functions();

const RequestProvider = (props: any) => {
  const defaultRequest: MyRequests = {
    title: '',
    data: [],
  };
  const [myClubRequests, setMyClubRequests] = useState<MyRequests>(
    defaultRequest,
  );
  const [myLeagueRequests, setMyLeagueRequests] = useState<MyRequests>(
    defaultRequest,
  );
  const [clubs, setClubs] = useState<ClubRequestInt[]>([]);
  const [leagues, setLeagues] = useState<LeagueRequestInt[]>([]);
  const [leagueCount, setLeagueCount] = useState<number>(0);
  const [clubCount, setClubCount] = useState<number>(0);

  const myRequests: MyRequests[] = [myClubRequests, myLeagueRequests];
  const requestCount: number = leagueCount + clubCount;

  return (
    <RequestContext.Provider
      value={{
        myRequests,
        clubs,
        leagues,
        setClubs,
        setLeagues,
        setMyLeagueRequests,
        setMyClubRequests,
        setLeagueCount,
        setClubCount,
        requestCount,
      }}>
      {props.children}
    </RequestContext.Provider>
  );
};

const AppProvider = (props: any) => {
  const [data, setData] = useState<AppContextInt>(appContextValue);

  return (
    <AppContext.Provider value={{data, setData}}>
      {props.children}
    </AppContext.Provider>
  );
};

const AuthProvider = (props: any) => {
  const [user, setUser] = useState<{uid: string} | undefined>(undefined);
  const [emu] = useState(true);

  function onAuthStateChanged(firUser: any): void {
    setUser(firUser);
  }
  useEffect(() => {
    if (__DEV__ && emu) {
      firFunc.useFunctionsEmulator('http://localhost:5001');
      firAuth.useEmulator('http://localhost:9099');
      db.settings({host: 'localhost:8080', ssl: false, persistence: false});
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
