import React, {useContext, useEffect, useState} from 'react';
import {Text, View, Button} from 'react-native';
import {AppContext, AuthContext} from '../../utils/context';
import auth from '@react-native-firebase/auth';
import {createStackNavigator} from '@react-navigation/stack';
import SignUp from '../auth/signUp';
import functions from '@react-native-firebase/functions';
import SignIn from '../auth/signIn';
import firestore from '@react-native-firebase/firestore';

const firFunc = functions();
const firAuth = auth();
const db = firestore();

function Home() {
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator initialRouteName="Leagues">
      <Stack.Screen name="Home" component={HomeContent} />
      <Stack.Screen name="Sign Up" component={SignUp} />
      <Stack.Screen name="Sign In" component={SignIn} />
    </Stack.Navigator>
  );
}

function HomeContent({navigation}) {
  const [loading, setLoading] = useState(true);
  const [userUid, setUserUid] = useState(null);

  const context = useContext(AppContext);
  const user = useContext(AuthContext);
  const leaguesRef = db.collection('leagues');

  useEffect(() => {
    if (user) {
      setUserUid(user.uid);
      console.log('updateUserUid');
    }
  }, [user]);

  const getLeaguesClubs = (userData: object) => {
    console.log('getLeaguesClubs');
    let userLeagues: object = {};
    let userClubs: object = {};
    const leagues: any[] = Object.entries(userData.leagues);
    for (const [league, data] of leagues) {
      leaguesRef
        .doc(league)
        .get()
        .then((doc) => {
          userLeagues = {...userLeagues, [doc.id]: doc.data()};
        })
        .then(() => {
          leaguesRef
            .doc(league)
            .collection('clubs')
            .doc(data.club)
            .get()
            .then((doc) => {
              userClubs = {...userClubs, [doc.id]: doc.data()};
              context.update({userClubs: userClubs, userLeagues: userLeagues});
            });
        });
    }
  };

  const getCreatedLeagues = (userData) => {
    console.log('getAdmin');
    let userCreatedLeagues: object = {};
    const leagues: any[] = Object.keys(userData.createdLeagues);
    leagues.forEach((league) => {
      leaguesRef
        .doc(league)
        .get()
        .then((doc) => {
          userCreatedLeagues = {...userCreatedLeagues, [doc.id]: doc.data()};
          context.update({userCreatedLeagues: userCreatedLeagues});
        })
        .then(() => {
          setLoading(false);
        });
    });
  };

  useEffect(() => {
    if (user) {
      const userRef = db.collection('users').doc(userUid);
      let userData: any;
      const subscriber = userRef.onSnapshot((doc) => {
        console.log('call to fir');
        userData = doc.data();
        context.update({userData: userData});
        userData?.leagues && getLeaguesClubs(userData);
        userData?.createdLeagues && getCreatedLeagues(userData);
      });
      return subscriber;
    } else {
      setLoading(false);
    }
  }, [userUid]);

  //TODO get requests to club
  //TODO get requests to leagues
  //TODO Get scheduled matches for all leagues
  //TODO report center

  // const testFunc = async () => {
  //   const test = firFunc.httpsCallable('scheduleMatches');
  //   test({message: 'hey yooo'})
  //     .then((response) => {
  //       console.log('message from cloud', response);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // };

  const onSignOut = () => {
    firAuth.signOut().then(() => {
      setUserUid(null);
      context.update({
        userData: {},
        userLeagues: {},
        userClubs: {},
        userCreatedLeagues: {},
      });
    });
  };

  if (loading) {
    return (
      <View>
        <Text>LOADING....</Text>
      </View>
    );
  }

  return (
    <View>
      <Text>Home Screen</Text>
      <Text>{context.data?.userData?.username}</Text>
      <CustomButton
        onPress={user ? onSignOut : () => navigation.navigate('Sign Up')}
        title={user ? 'Logout' : 'Sign Up'}
      />
      <Button onPress={() => navigation.navigate('Sign In')} title="SignIn" />
    </View>
  );
}

const CustomButton = (props) => {
  return (
    <Button
      onPress={props.onPress}
      title={props.title}
      color="#841584"
      accessibilityLabel="Learn more about this purple button"
    />
  );
};

export default Home;
