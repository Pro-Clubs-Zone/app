import React, {useEffect, useState, createContext} from 'react';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import {LogBox} from 'react-native';

const db = firestore();
const firAuth = auth();
const firFunc = functions();

const AuthContext = createContext<{
  uid: string;
  authInit: boolean;
}>(null);

const AuthProvider = (props: any) => {
  const [uid, setUid] = useState<string | null>(null);
  const [authInit, setAuthInit] = useState<boolean>(false);

  useEffect(() => {
    if (__DEV__) {
      firFunc.useFunctionsEmulator('http://192.168.0.13:5001');
      firAuth.useEmulator('http://192.168.0.13:9099');
      db.settings({
        host: '192.168.0.13:8080',
        ssl: false,
        persistence: false,
        cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
      });
      LogBox.ignoreLogs(['Remote debugger is in a background']);
      LogBox.ignoreLogs(['DevTools failed to load SourceMap:']); // Ignore log notification by message
    }
    function onAuthStateChanged(firUser: any): void {
      const initWithUser = !authInit && firUser !== null;
      const initWithOutUser = !authInit && firUser === null;
      const signIn = authInit && firUser !== null && uid === null;
      const signOut = authInit && firUser === null && uid !== null;

      if (initWithUser) {
        console.log('write uid');

        setUid(firUser.uid);
        setAuthInit(true);
      }

      if (initWithOutUser) {
        console.log('no user');
        setAuthInit(true);
      }

      if (signIn) {
        console.log('logged in');
        setUid(firUser.uid);
      }

      if (signOut) {
        console.log('logged out');
        setUid(null);
        setAuthInit(false);
      }
    }
    const subscriber = firAuth.onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, [authInit, uid]);

  return (
    <AuthContext.Provider value={{uid, authInit}}>
      {props.children}
    </AuthContext.Provider>
  );
};

export {AuthContext, AuthProvider};
