import React, {useContext} from 'react';
import {Text, View, Button, Alert} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import {AppContext} from '../../context/appContext';
import {LeagueStackType} from '../league/league';
import {LeagueContext} from '../../context/leagueContext';
import removeClub from './actions/removeClub';

// type ScreenNavigationProp = StackNavigationProp<
//   LeagueStackType,
//   'Club Settings'
// >;
type ScreenRouteProp = RouteProp<LeagueStackType, 'Club Settings'>;

type Props = {
  //  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

export default function ClubSettings({route}: Props) {
  const context = useContext(AppContext);
  const leagueContext = useContext(LeagueContext);

  const leagueId = leagueContext.leagueId;
  const clubId = route.params.clubId;
  const clubRoster = context.userLeagues[leagueId].clubs[clubId].roster;
  // const isAdmin = context.userData.leagues[leagueId].admin;
  const adminId = leagueContext.league.adminId;

  //TODO: if admin, do not restart.

  const onRemove = async () => {
    Alert.alert(
      'Remove Club',
      'Remove club?',
      [
        {
          text: 'Remove',
          onPress: () => {
            removeClub(leagueId, clubId, adminId, clubRoster);
          },
        },
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
  };

  return (
    <View>
      <Text>Club Settings</Text>
      <Button title="remove club" onPress={onRemove} />
    </View>
  );
}
