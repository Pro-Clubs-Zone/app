import React, {useEffect, useState, createContext} from 'react';
import auth from '@react-native-firebase/auth';

const firAuth = auth();

type AuthContextType = {
  uid: string | null;
  displayName: string | null;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const AuthProvider = (props: any) => {
  const [uid, setUid] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    function onAuthStateChanged(firUser: any): void {
      if (firUser) {
        setUid(firUser.uid);
        setDisplayName(firUser.displayName);
      } else {
        setUid(null);
        setDisplayName(null);
      }
    }
    const subscriber = firAuth.onUserChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, [uid]);

  return (
    <AuthContext.Provider value={{uid, displayName}}>
      {props.children}
    </AuthContext.Provider>
  );
};

export {AuthContext, AuthProvider};
