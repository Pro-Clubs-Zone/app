import React, {useContext} from 'react';
import {View, Alert} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import {AppContext} from '../../context/appContext';
import {LeagueStackType} from '../league/league';
import {LeagueContext} from '../../context/leagueContext';
import removeClub from './actions/removeClub';
import removePlayer from './actions/removePlayer';
import {AuthContext} from '../../context/authContext';
import RNRestart from 'react-native-restart';
import {CardMedium} from '../../components/cards';
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
  const user = useContext(AuthContext);
  const context = useContext(AppContext);
  const leagueContext = useContext(LeagueContext);

  const playerId = user.uid;
  const leagueId = leagueContext.leagueId;
  const clubId = route.params.clubId;
  const clubRoster = context.userLeagues[leagueId].clubs[clubId].roster;
  const isManager = context.userData.leagues[leagueId].manager;
  const adminId = leagueContext.league.adminId;
  const leagueScheduled = leagueContext.league.scheduled;

  //TODO: if admin, do not restart.

  const onRemoveClub = async () => {
    if (leagueScheduled) {
      Alert.alert(
        'Remove Club',
        'You cannot remove club when league is scheduled',
        [
          {
            text: 'Close',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
    } else {
      Alert.alert(
        'Remove Club',
        'Remove club?',
        [
          {
            text: 'Remove',
            onPress: () => {
              removeClub(leagueId, clubId, adminId, clubRoster).then(() => {
                RNRestart.Restart();
              });
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
    }
  };

  const onRemovePlayer = async () => {
    Alert.alert(
      'Leave Club',
      "Are you sure you want to leavue this club? This can't be undone",
      [
        {
          text: 'Remove',
          onPress: () => {
            removePlayer({leagueId, playerId, clubId}).then(() => {
              RNRestart.Restart();
            });
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
      {isManager ? (
        <CardMedium title="Remove Club" onPress={onRemoveClub} />
      ) : (
        <CardMedium title="Leave Club" onPress={onRemovePlayer} />
      )}
    </View>
  );
}
