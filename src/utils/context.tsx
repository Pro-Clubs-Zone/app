import React, {useEffect, useState, createContext} from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';

const AppContext = createContext(null);
const db = firestore();
const firAuth = auth();
const firFunc = functions();

interface AppContext {
  user: object;
  userData: object;
  userLeagueData: object;
  userClubData: object;
  update: any;
}

const AppProvider = (props: any) => {
  const [data, setData] = useState({
    userData: {},
    userLeagueData: {},
    userClubData: {},
  });
  const [user, setUser] = useState({});
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
  }, []);

  const update = (newData: object) => {
    setData({...data, ...newData});
  };

  const value: AppContext = {
    user: user,
    userData: data.userData,
    userLeagueData: data.userLeagueData,
    userClubData: data.userClubData,
    update: update,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export {AppProvider, AppContext};
