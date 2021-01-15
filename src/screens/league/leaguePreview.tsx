import React, {useState, useContext} from 'react';
import {Text, View, Alert, Button} from 'react-native';
import {AuthContext} from '../../context/authContext';
import {LeagueStackType} from './league';
import {StackNavigationProp} from '@react-navigation/stack';
import {LeagueContext} from '../../context/leagueContext';
import {AppContext} from '../../context/appContext';
import {useActionSheet} from '@expo/react-native-action-sheet';

type ScreenNavigationProp = StackNavigationProp<
  LeagueStackType,
  'League Preview'
>;

type Props = {
  navigation: ScreenNavigationProp;
};

export default function LeaguePreview({navigation}: Props) {
  const [accepted, setAccepted] = useState<boolean>(false);

  const leagueContext = useContext(LeagueContext);
  const user = useContext(AuthContext);
  const context = useContext(AppContext);
  const {showActionSheetWithOptions} = useActionSheet();

  const leagueId = leagueContext.leagueId;

  const onCheckUserInLeague = () => {
    const userLeague = context.userData?.leagues?.[leagueId];

    console.log('league preview render');
    if (userLeague) {
      setAccepted(userLeague.accepted);
      return userInLeague();
    } else {
      if (leagueContext.league.scheduled) {
        return showJoinAsPlayer();
      } else {
        return showUserTypeSelection();
      }
    }
  };

  const showJoinAsPlayer = () => {
    Alert.alert(
      'Join as a Player',
      'You can join only as a player as this league has already started',
      [
        {
          text: 'Join',
          onPress: () => navigation.navigate('Join Club'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
  };

  const showUserTypeSelection = () => {
    const options = ['Manager', 'Player', 'Cancel'];
    const cancelButtonIndex = 2;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            if (user.uid) {
              navigation.navigate('Create Club', {
                isAdmin: false,
                newLeague: false,
              });
            } else {
              navigation.navigate('Sign Up', {
                redirectedFrom: 'createClub',
                data: {
                  leagueId: leagueId,
                },
              });
            }

            break;
          case 1:
            if (user.uid) {
              navigation.navigate('Join Club');
            } else {
              navigation.navigate('Sign Up', {
                redirectedFrom: 'joinClub',
                data: {
                  leagueId: leagueId,
                },
              });
            }
            break;
        }
      },
    );
  };

  const userInLeague = () => {
    Alert.alert(
      'Join League',
      accepted ? 'League not started' : 'Request already sent',
      [
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
      <Text>{leagueId}</Text>
      <Button
        title="Join League"
        onPress={() =>
          user
            ? onCheckUserInLeague()
            : navigation.navigate('Home', {
                screen: 'Sign Up',
              })
        }
      />
    </View>
  );
}
