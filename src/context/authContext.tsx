import React, {useEffect, useState, createContext} from 'react';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import {LogBox} from 'react-native';

const db = firestore();
const firAuth = auth();
const firFunc = functions();

const AuthContext = createContext<{uid: string}>(null);

const AuthProvider = (props: any) => {
  const [user, setUser] = useState<{uid: string} | null>(null);

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
      LogBox.ignoreLogs(['Remote debugger is in a background']);
      LogBox.ignoreLogs(['DevTools failed to load SourceMap:']); // Ignore log notification by message
    }
    const subscriber = firAuth.onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
    //FIXME:  double call;
  }, []);

  return (
    <AuthContext.Provider value={user}>{props.children}</AuthContext.Provider>
  );
};

export {AuthContext, AuthProvider};
