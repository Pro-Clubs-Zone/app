import React, {useContext} from 'react';
import {View, Alert} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import {AppContext} from '../../context/appContext';
import {LeagueStackType} from '../league/league';
import {LeagueContext} from '../../context/leagueContext';
import removeClub from './actions/removeClub';
import removePlayer from './actions/removePlayer';
import {AuthContext} from '../../context/authContext';
import {CardMedium} from '../../components/cards';
import {t} from '@lingui/macro';
import i18n from '../../utils/i18n';
import {CommonActions} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

type ScreenRouteProp = RouteProp<LeagueStackType, 'Club Settings'>;
type ScreenNavigationProp = StackNavigationProp<
  LeagueStackType,
  'Club Settings'
>;

type Props = {
  route: ScreenRouteProp;
  navigation: ScreenNavigationProp;
};

export default function ClubSettings({route, navigation}: Props) {
  const user = useContext(AuthContext);
  const context = useContext(AppContext);
  const leagueContext = useContext(LeagueContext);

  const playerId = user.uid!;
  const leagueId = leagueContext.leagueId;
  const clubId = route.params.clubId;
  const clubRoster = context.userLeagues![leagueId].clubs![clubId].roster;
  const isManager = context.userData!.leagues![leagueId].manager;
  const admins = leagueContext.league.admins;
  const leagueScheduled = leagueContext.league.scheduled;
  const clubName = context.userData.leagues[leagueId].clubName;

  const onRemoveClub = async () => {
    if (leagueScheduled) {
      Alert.alert(
        i18n._(t`Remove Club`),
        i18n._(t`You cannot remove club when league is scheduled`),
        [
          {
            text: i18n._(t`Close`),
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
    } else {
      Alert.alert(
        i18n._(t`Remove Club`),
        i18n._(
          t`Are you sure you want to remove your club? This action can't be undone`,
        ),
        [
          {
            text: i18n._(t`Remove`),
            onPress: () => {
              removeClub(leagueId, clubId, admins, clubRoster).then(() => {
                navigation.dispatch(
                  CommonActions.reset({
                    index: 1,
                    routes: [{name: 'Home'}],
                  }),
                );
              });
            },
            style: 'destructive',
          },
          {
            text: i18n._(t`Cancel`),
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
      i18n._(
        t`Are you sure you want to leave this club? This action can't be undone`,
      ),
      [
        {
          text: i18n._(t`Leave`),
          onPress: () => {
            removePlayer({leagueId, playerId, clubId, clubName}).then(() => {
              navigation.dispatch(
                CommonActions.reset({
                  index: 1,
                  routes: [{name: 'Home'}],
                }),
              );
            });
          },
          style: 'destructive',
        },
        {
          text: i18n._(t`Cancel`),
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
  };

  return (
    <View
      style={{
        flex: 1,
      }}>
      {isManager ? (
        <CardMedium title={i18n._(t`Remove Club`)} onPress={onRemoveClub} />
      ) : (
        <CardMedium title={i18n._(t`Leave Club`)} onPress={onRemovePlayer} />
      )}
    </View>
  );
}
