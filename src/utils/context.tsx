import React, {useEffect, useState, createContext} from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import App from '../../App';

const AppContext = createContext(null);
const AuthContext = createContext(null);
const db = firestore();
const firAuth = auth();
const firFunc = functions();

interface AppContext {
  userData: object;
  userLeagueData: object;
  userClubData: object;
  userLeagueAdminData: object;
  update?: any;
}

const defaultValues: AppContext = {
  userData: {},
  userLeagueData: {},
  userClubData: {},
  userLeagueAdminData: {},
};

const AppProvider = (props: any) => {
  const [data, setData] = useState(defaultValues);

  const update = (newData: object) => {
    setData({...data, ...newData});
  };

  const value: AppContext | null = {
    userData: data.userData,
    userLeagueData: data.userLeagueData,
    userClubData: data.userClubData,
    userLeagueAdminData: data.userLeagueAdminData,
    update: update,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
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
