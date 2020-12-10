import React, {useEffect, useState, createContext} from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import {AppContextInt, LeagueInt, RequestInt, UserDataInt} from './globalTypes';

const appContextValue: AppContextInt = {
  userData: {
    username: '',
  },
  userLeagues: {} as LeagueInt,
};

const AppContext = createContext<{
  data: Partial<AppContextInt>;
  update: (newData: Partial<AppContextInt>) => void;
} | null>(null);
const AuthContext = createContext<{uid: string} | null>(null);
const RequestContext = createContext<{
  club: RequestInt[] | null;
  league: RequestInt[] | null;
  updateClubs: (newData: RequestInt[]) => void;
  updateLeagues: (newData: RequestInt[]) => void;
} | null>(null);
const db = firestore();
const firAuth = auth();
const firFunc = functions();

const RequestProvider = (props: any) => {
  const [club, setClub] = useState<RequestInt[] | null>(null);
  const [league, setLeague] = useState<RequestInt[] | null>(null);

  const updateClubs = (newData: RequestInt[]) => {
    setClub(newData);
  };
  const updateLeagues = (newData: RequestInt[]) => {
    setLeague(newData);
  };

  return (
    <RequestContext.Provider value={{club, league, updateClubs, updateLeagues}}>
      {props.children}
    </RequestContext.Provider>
  );
};

const AppProvider = (props: any) => {
  const [data, setData] = useState<Partial<AppContextInt>>(appContextValue);

  const update = (newData: Partial<AppContextInt>) => {
    setData(newData);
  };

  return (
    <AppContext.Provider value={{data, update}}>
      {props.children}
    </AppContext.Provider>
  );
};

const AuthProvider = (props: any) => {
  const [user, setUser] = useState<{uid: string} | null>(null);
  const [emu] = useState(true);

  function onAuthStateChanged(firUser: any): void {
    setUser(firUser);
  }
  useEffect(() => {
    if (__DEV__ && emu) {
      firFunc.useFunctionsEmulator('http://localhost:5001');
      firAuth.useEmulator('http://localhost:9099');
      db.settings({host: 'localhost:8080', ssl: false});
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
