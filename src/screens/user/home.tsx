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
  //const [data, setData] = useState({})

  const context = useContext(AppContext);
  const user = useContext(AuthContext);
  const uid: string = user?.uid;
  const onSignOut = () => {
    firAuth.signOut().then(() => console.log('User signed out!'));
  };

  const userRef = db.collection('users').doc(uid);

  const getLeaguesClubs = (userData: object) => {
    let userLeagueData: object = {};
    let userClubData: object = {};
    const leaguesRef = db.collection('leagues');
    const userLeagues: any[] = Object.entries(userData.leagues);
    for (const [league, data] of userLeagues) {
      leaguesRef
        .doc(league)
        .get()
        .then((doc) => {
          userLeagueData = {...userLeagueData, [doc.id]: doc.data()};
        })
        .then(() => {
          leaguesRef
            .doc(league)
            .collection('clubs')
            .doc(data.club)
            .get()
            .then((doc) => {
              userClubData = {...userClubData, [doc.id]: doc.data()};
              context.update({
                userData: userData,
                userClubData: userClubData,
                userLeagueData: userLeagueData,
              });
            })
            .then(() => {
              setLoading(false);
            });
        });
    }
  };

  useEffect(() => {
    if (user) {
      let userData: any;
      userRef
        .get()
        .then((doc) => (userData = doc.data()))
        .then((receivedData) => getLeaguesClubs(receivedData));
    }
  }, []);

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
      <Text>{context.userData.username}</Text>
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
