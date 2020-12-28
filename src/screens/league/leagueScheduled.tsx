import React, {useContext} from 'react';
import {ScrollView} from 'react-native';
import {LeagueStackType} from './league';
import {StackNavigationProp} from '@react-navigation/stack';
import {AppContext} from '../../context/appContext';
import {LeagueContext} from '../../context/leagueContext';
import {
  CardMedium,
  CardSmall,
  CardSmallContainer,
} from '../../components/cards';
import {verticalScale} from 'react-native-size-matters';

type ScreenNavigationProp = StackNavigationProp<
  LeagueStackType,
  'League Scheduled'
>;

type Props = {
  navigation: ScreenNavigationProp;
};

export default function LeagueScheduled({navigation}: Props) {
  const context = useContext(AppContext);
  const leagueContext = useContext(LeagueContext);

  const leagueId = leagueContext.leagueId;
  const userClub = context.userData.leagues[leagueId];

  console.log(leagueId);

  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: verticalScale(16),
      }}
      showsVerticalScrollIndicator={false}>
      <CardMedium
        title="Report Center"
        onPress={() =>
          navigation.navigate('Report Center', {
            leagueId: leagueId,
          })
        }
      />
      <CardSmallContainer>
        <CardSmall
          title="Standings"
          onPress={() =>
            navigation.navigate('Standings', {
              leagueId: leagueId,
            })
          }
        />
        <CardSmall
          title="Fixtures"
          onPress={() =>
            navigation.navigate('Fixtures', {
              leagueId: leagueId,
            })
          }
        />
      </CardSmallContainer>
      <CardMedium
        title="My Club"
        onPress={() =>
          navigation.navigate('My Club', {
            leagueId: leagueId,
            clubId: userClub.clubId,
            manager: userClub.manager,
          })
        }
      />
    </ScrollView>
  );

  // return (
  //   <View>
  //     <Text>League Home</Text>
  //     <Button
  //       title="Standings"
  //       onPress={() =>
  //         navigation.navigate('Standings', {
  //           leagueId: leagueId,
  //         })
  //       }
  //     />
  //     <Button
  //       title="Fixtures"
  //       onPress={() =>
  //         navigation.navigate('Fixtures', {
  //           leagueId: leagueId,
  //         })
  //       }
  //     />

  //     <Button
  //       title="My Club"
  //       onPress={() =>
  //         navigation.navigate('My Club', {
  //           leagueId: leagueId,
  //           clubId: userClub.clubId,
  //           manager: userClub.manager,
  //         })
  //       }
  //     />

  //     <Button
  //       title="Report Center"
  //       onPress={() =>
  //         navigation.navigate('Report Center', {
  //           leagueId: leagueId,
  //         })
  //       }
  //     />
  //   </View>
  // );
}
