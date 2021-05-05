import React, {useContext, useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {FlatList} from 'react-native';
import {IClubStanding} from '../../utils/interface';
import {LeagueContext} from '../../context/leagueContext';
import {TableHeader, TableRow} from '../../components/standingItems';
import {ListSeparator} from '../../components/listItems';
import {verticalScale} from 'react-native-size-matters';
import FullScreenLoading from '../../components/loading';
import {StackNavigationProp} from '@react-navigation/stack';
import {LeagueStackType} from '../league/league';

const db = firestore();

type StandingsList = {
  key: string;
  data: IClubStanding;
};

type ScreenNavigationProp = StackNavigationProp<LeagueStackType, 'Standings'>;

type Props = {
  navigation: ScreenNavigationProp;
};

export default function LeagueStandings({navigation}: Props) {
  const [standings, setStandings] = useState<StandingsList[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const leagueContext = useContext(LeagueContext);
  const leagueId = leagueContext.leagueId;

  useEffect(() => {
    const getStandings = async () => {
      const standingsRef = db
        .collection('leagues')
        .doc(leagueId)
        .collection('stats')
        .doc('standings');

      try {
        const doc = await standingsRef.get();
        const standingsData = doc.data() as {[id: string]: IClubStanding};

        let leagueStandings: StandingsList[] = [];

        for (let [clubId, clubData] of Object.entries(standingsData)) {
          let clubStanding: StandingsList = {
            key: clubId,
            data: clubData,
          };
          leagueStandings.push(clubStanding);
        }
        leagueStandings.sort((a, b) => {
          const aDiff = a.data.scored - a.data.conceded;
          const bDiff = b.data.scored - b.data.conceded;

          if (a.data.points > b.data.points) {
            return -1;
          }
          if (a.data.points < b.data.points) {
            return 1;
          }
          if (aDiff > bDiff) {
            return -1;
          }
          if (aDiff < bDiff) {
            return 1;
          }
          if (a.data.won > b.data.won) {
            return -1;
          }
          if (a.data.won < b.data.won) {
            return 1;
          }
        });
        setStandings(leagueStandings);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        throw new Error(error);
      }
    };

    getStandings();
  }, [leagueId]);

  return (
    <>
      <FullScreenLoading visible={loading} />
      <FlatList
        data={standings}
        renderItem={({item, index}) => (
          <TableRow
            team={item.data.name}
            p={item.data.played}
            w={item.data.won}
            d={item.data.draw}
            l={item.data.lost}
            dif={item.data.scored - item.data.conceded}
            pts={item.data.points}
            position={index + 1}
            profile={() =>
              navigation.navigate('Club Profile', {
                clubId: item.key,
              })
            }
          />
        )}
        keyExtractor={(item) => item.key}
        ItemSeparatorComponent={() => <ListSeparator />}
        ListHeaderComponent={() => <TableHeader />}
        stickyHeaderIndices={[0]}
        bounces={false}
        getItemLayout={(item, index) => ({
          length: verticalScale(48),
          offset: verticalScale(49) * index,
          index,
        })}
      />
    </>
  );
}
