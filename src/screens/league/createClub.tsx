import React, {useContext, useState, useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import {AppContext} from '../../context/appContext';
import {AuthContext} from '../../context/authContext';
import {IClub, IUserLeague} from '../../utils/interface';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {LeagueStackType} from './league';
import {FormView, FormContent} from '../../components/templates';
import {BigButton} from '../../components/buttons';
import TextField from '../../components/textField';
import FullScreenLoading from '../../components/loading';
import {LeagueContext} from '../../context/leagueContext';

type ScreenNavigationProp = StackNavigationProp<LeagueStackType, 'Create Club'>;

type ScreenRouteProp = RouteProp<LeagueStackType, 'Create Club'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

const db = firestore();

export default function CreateClub({route, navigation}: Props) {
  const [clubName, setClubName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState({
    clubName: null,
  });

  const user = useContext(AuthContext);
  const context = useContext(AppContext);
  const leagueContext = useContext(LeagueContext);

  const leagueId = leagueContext.leagueId;
  const uid = user?.uid;
  const isAdmin = route?.params?.isAdmin;
  const username = context.userData.username;

  useEffect(() => {
    if (error.clubName && clubName !== '') {
      setError({...error, clubName: null});
    }
  }, [clubName]);

  const fieldValidation = async () => {
    if (clubName === '') {
      setError({...error, clubName: "Field can't be empty"});
      return false;
    }
    if (clubName.length < 4 && clubName !== '') {
      setError({...error, clubName: 'At least 4 letters'});
      return false;
    }
    return true;
  };

  const onCreateClub = () => {
    fieldValidation().then(async (noErrors) => {
      if (noErrors) {
        setLoading(true);
        const batch = db.batch();
        const leagueRef = db.collection('leagues').doc(leagueId);
        const userRef = db.collection('users').doc(uid);
        const clubRef = leagueRef.collection('clubs').doc();

        const clubInfo: IClub = {
          name: clubName,
          managerId: uid,
          managerUsername: username,
          accepted: isAdmin ? true : false,
          roster: {
            [uid]: {
              accepted: true,
              username: username,
            },
          },
          created: firestore.Timestamp.now(),
        };
        const userInfo: IUserLeague = {
          clubId: clubRef.id,
          manager: true,
          clubName: clubName,
          accepted: isAdmin ? true : false,
        };

        if (isAdmin) {
          batch.update(leagueRef, {
            acceptedClubs: firestore.FieldValue.increment(1),
          });
        }
        batch.set(clubRef, clubInfo);
        batch.set(
          userRef,
          {
            leagues: {
              [leagueId]: userInfo,
            },
          },
          {merge: true},
        );
        await batch.commit().then(() => {
          setLoading(false);
          navigation.goBack();
        });
      }
    });
  };

  return (
    <FormView>
      <FullScreenLoading visible={loading} />
      <FormContent>
        <TextField
          onChangeText={(text) => setClubName(text)}
          value={clubName}
          placeholder="Club Name"
          autoCorrect={false}
          label="Club Name"
          error={error.clubName}
          helper="Minimum 4 letters, no profanity"
        />
      </FormContent>
      <BigButton onPress={onCreateClub} title="Create Club" />
    </FormView>
  );
}
