import React, {useContext, useEffect, useState} from 'react';
import {View, FlatList, ScrollView, Text} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AppNavStack} from '../index';
import {verticalScale, ScaledSheet} from 'react-native-size-matters';
import {CardMedium} from '../../components/cards';
import {t} from '@lingui/macro';
import i18n from '../../utils/i18n';
import {APP_COLORS, TEXT_STYLES} from '../../utils/designSystem';
import {AppContext} from '../../context/appContext';
import {IFlatList, ILeague} from '../../utils/interface';
import UserLeagueCard from '../../components/userLeagueCard';

type ScreenNavigationProp = StackNavigationProp<AppNavStack, 'Leagues'>;

type Props = {
  navigation: ScreenNavigationProp;
};

interface IleagueData extends IFlatList {
  data: ILeague & {clubName: string; isAdmin: boolean};
}

export default function Leagues({navigation}: Props) {
  const [data, setData] = useState<IleagueData[]>([]);

  const context = useContext(AppContext);

  useEffect(() => {
    const userLeagues = context.userLeagues;
    const userData = context.userData;

    if (userLeagues && userData) {
      const leagueList: IleagueData[] = [];

      for (const [leagueId, league] of Object.entries(userLeagues)) {
        const userLeague = userData.leagues![leagueId];
        const accepted = userLeague.accepted;
        const isAdmin = userLeague.admin;
        if (accepted || isAdmin) {
          const userClubName = userLeague.clubName;
          const updatedData = {
            ...league,
            clubName: userClubName!,
            isAdmin: !!isAdmin,
          };

          const leagueData: IleagueData = {
            id: leagueId,
            data: updatedData,
          };
          leagueList.push(leagueData);
        }
      }

      setData(leagueList);
    } else {
      setData([]);
    }
  }, [context]);

  return (
    <View style={{flex: 1}}>
      {data.length !== 0 && (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={TEXT_STYLES.caption}>My Leagues & Clubs</Text>
          </View>
          <FlatList
            data={data}
            horizontal={true}
            contentContainerStyle={styles.scrollContainer}
            showsHorizontalScrollIndicator={false}
            renderItem={({item}) => (
              <UserLeagueCard
                teamName={item.data.clubName}
                leagueName={item.data.name}
                conflictsCount={
                  item.data.isAdmin ? item.data.conflictMatchesCount : 0
                }
                onPress={() =>
                  navigation.navigate('League', {
                    leagueId: item.id,
                    isAdmin: item.data.isAdmin,
                    newLeague: false,
                  })
                }
              />
            )}
            keyExtractor={(item) => item.id}
          />
        </View>
      )}
      <ScrollView
        contentContainerStyle={{
          paddingBottom: verticalScale(16),
        }}
        showsVerticalScrollIndicator={false}>
        <CardMedium
          onPress={() => navigation.navigate('Create League')}
          title={i18n._(t`Create League`)}
          subTitle={i18n._(t`Set up the league and invite players`)}
        />
        <CardMedium
          onPress={() => navigation.navigate('League Explorer')}
          title={i18n._(t`League Explorer`)}
          subTitle={i18n._(t`Join leagues that are open to public`)}
        />
      </ScrollView>
    </View>
  );
}

//---------- Stylesheet ----------//

const styles = ScaledSheet.create({
  container: {
    backgroundColor: APP_COLORS.Primary,
    height: '128@vs',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: '16@vs',
    paddingHorizontal: '8@vs',
  },
  scrollContainer: {
    paddingHorizontal: '8@vs',
  },
});
