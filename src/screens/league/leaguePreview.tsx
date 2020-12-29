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
    const userLeague = context.userData.leagues?.[leagueId];

    console.log(userLeague, 'userdata');
    if (userLeague) {
      setAccepted(userLeague.accepted);
      return userInLeague();
    } else {
      return showUserTypeSelection();
    }
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
            navigation.navigate('Create Club', {
              leagueId,
            });
            break;
          case 1:
            navigation.navigate('Join Club', {
              leagueId,
            });
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
