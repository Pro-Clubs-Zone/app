import React, {useEffect, useState, createContext} from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';

interface AppContext {
  userData: object;
  userLeagues: object;
  //  userClubs: object;
}

const appContextValue: AppContext = {
  userData: {},
  userLeagues: {},
  //  userClubs: {},
};

const AppContext = createContext({});
const AuthContext = createContext(null);
const db = firestore();
const firAuth = auth();
const firFunc = functions();

const AppProvider = (props: any) => {
  const [data, setData] = useState(appContextValue);

  const update = (newData: AppContext) => {
    setData(newData);
  };

  return (
    <AppContext.Provider value={{data, update}}>
      {props.children}
    </AppContext.Provider>
  );
};

const AuthProvider = (props: any) => {
  const [user, setUser] = useState(null);
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

export {AppProvider, AppContext, AuthProvider, AuthContext};
