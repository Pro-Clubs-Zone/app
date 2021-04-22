import React, {useEffect, useState, createContext} from 'react';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';

const firAuth = auth();

type AuthContextType = {
  uid: string | null;
  displayName: string | null;
  emailVerified: boolean;
  currentUser: FirebaseAuthTypes.User;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const AuthProvider = (props: any) => {
  const [currentUser, setCurrentUser] = useState<FirebaseAuthTypes.User>();
  const [uid, setUid] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState<boolean>(null);

  useEffect(() => {
    function onAuthStateChanged(firUser: FirebaseAuthTypes.User): void {
      if (firUser) {
        setUid(firUser.uid);
        setDisplayName(firUser.displayName);
        setEmailVerified(firUser.emailVerified);
        setCurrentUser(firUser);
      } else {
        setUid(null);
        setDisplayName(null);
        setEmailVerified(null);
        setCurrentUser(null);
      }
    }
    const subscriber = firAuth.onUserChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  return (
    <AuthContext.Provider
      value={{uid, displayName, emailVerified, currentUser}}>
      {props.children}
    </AuthContext.Provider>
  );
};

export {AuthContext, AuthProvider};
