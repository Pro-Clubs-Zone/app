import React, {useEffect, useState, createContext} from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import App from '../../App';

interface AppContext {
  userData: object;
  userLeagues: object;
  userClubs: object;
  userCreatedLeagues: object;
  update?: any;
}

const appContextValue: AppContext = {
  userData: {},
  userLeagues: {},
  userClubs: {},
  userCreatedLeagues: {},
};

const AppContext = createContext(null);
const AuthContext = createContext(null);
const db = firestore();
const firAuth = auth();
const firFunc = functions();

const AppProvider = (props: any) => {
  const [data, setData] = useState();

  const update = (newData: object) => {
    console.log('new data', newData);
    console.log('old data', data);
    console.log('how it looks', {...data, ...newData});
    setData({...data, ...newData});
  };

  // const value: AppContext | null = {
  //   userData: data.userData,
  //   userLeagues: data.userLeagues,
  //   userClubs: data.userClubs,
  //   userCreatedLeagues: data.userCreatedLeagues,
  //   update: update,
  // };

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
