import React, {useEffect, useState, createContext} from 'react';
import auth from '@react-native-firebase/auth';

const firAuth = auth();

type AuthContextType = {
  uid: string | null;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const AuthProvider = (props: any) => {
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    function onAuthStateChanged(firUser: any): void {
      if (firUser) {
        setUid(firUser.uid);
      } else {
        setUid(null);
      }
    }
    const subscriber = firAuth.onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, [uid]);

  return (
    <AuthContext.Provider value={{uid}}>{props.children}</AuthContext.Provider>
  );
};

export {AuthContext, AuthProvider};
