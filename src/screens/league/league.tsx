import React, {useState, useEffect, useContext} from 'react';
import {Text, View, Button} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {AppContext, AuthContext} from '../../utils/context';
import LeaguePreview from './leaguePreview';
import LeaguePreSeason from '../leagueAdmin/leaguePreSeason';
import {ILeague} from '../../utils/interface';
import {LeaguesStackType} from '../user/leaguesStack';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';

// TODO: Create Custom Nav Stack https://reactnavigation.org/docs/auth-flow/#how-it-will-work

type ScreenNavigationProp = StackNavigationProp<
  LeaguesStackType,
  'League State Nav'
>;

type ScreenRouteProp = RouteProp<LeaguesStackType, 'League State Nav'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

const db = firestore();

export default function League({route, navigation}: Props) {
  const [league, setLeague] = useState<ILeague>();
  const [loading, setLoading] = useState<boolean>(true);
  const user = useContext(AuthContext);
  const context = useContext(AppContext);
  const userData = context?.userData;
  const uid = user?.uid;
  const leagueId = route.params.leagueId;

  useEffect(() => {
    console.log('effect on league');
    //TODO: Check if league exists in context
    const leagueRef = db.collection('leagues').doc(leagueId);
    let leagueInfo: ILeague;
    leagueRef.get().then((doc) => {
      leagueInfo = doc.data() as ILeague;
      setLeague(leagueInfo);
      setLoading(false);
    });
  }, [leagueId]);

  if (userData?.leagues && userData?.leagues[leagueId]) {
    if (league?.scheduled) {
      return <League navigation={navigation} route={route} />;
    } else {
      if (league?.adminId === uid) {
        return <LeaguePreSeason navigation={navigation} route={route} />;
      } else {
        return (
          <LeaguePreview
            //  data={data}
            route={route}
            navigation={navigation}
          />
        );
      }
    }
  } else {
    return (
      <LeaguePreview
        //  data={data}
        route={route}
        navigation={navigation}
      />
    );
  }
}
