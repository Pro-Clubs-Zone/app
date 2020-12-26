import React, {useContext} from 'react';
import {Text, View, Button} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import functions from '@react-native-firebase/functions';
import {AppContext} from '../../context/appContext';
import {LeagueContext} from '../../context/leagueContext';
import {LeagueStackType} from '../league/leagueStack';

type ScreenNavigationProp = StackNavigationProp<
  LeagueStackType,
  'League Pre-Season'
>;

type Props = {
  navigation: ScreenNavigationProp;
};
const firFunc = functions();

export default function LeaguePreSeason({navigation}: Props) {
  const context = useContext(AppContext);
  const leagueContext = useContext(LeagueContext);

  const leagueId = leagueContext.leagueId;
  const userClub = context.userData.leagues[leagueId];

  const scheduleMatches = async () => {
    const functionRef = firFunc.httpsCallable('scheduleMatches');
    functionRef({leagueId: leagueId})
      .then((response) => {
        console.log('message from cloud', response);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <View>
      <Button onPress={scheduleMatches} title="Schedule Matches" />
      <Button
        title="Clubs"
        onPress={() =>
          navigation.navigate('Clubs', {
            leagueId: leagueId,
          })
        }
      />
      <Button title="Invite Clubs" />
      {userClub.manager ? (
        <Button
          title="My Club"
          onPress={() =>
            navigation.navigate('My Club', {
              leagueId: leagueId,
              clubId: userClub.clubId,
              manager: userClub.manager,
            })
          }
        />
      ) : (
        <Button
          title="Create My Club"
          onPress={() =>
            navigation.navigate('Create Club', {
              leagueId: leagueId,
              isAdmin: true,
            })
          }
        />
      )}
    </View>
  );
}
