import React, {useContext, useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {FlatList} from 'react-native';
import {IClubStanding} from '../../utils/interface';
import {LeagueContext} from '../../context/leagueContext';
import {TableHeader, TableRow} from '../../components/standingItems';
import {ListSeparator} from '../../components/listItems';
import {verticalScale} from 'react-native-size-matters';

const db = firestore();

type StandingsList = {
  key: string;
  data: IClubStanding;
};

export default function LeagueStandings() {
  //  const [data, setData] = useState<{[id: string]: IClubStanding}>({});
  const [standings, setStandings] = useState<StandingsList[]>([]);

  const leagueContext = useContext(LeagueContext);
  const leagueId = leagueContext.leagueId;

  useEffect(() => {
    console.log('standings');

    const standingsRef = db
      .collection('leagues')
      .doc(leagueId)
      .collection('stats')
      .doc('standings');

    standingsRef.get().then((doc) => {
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
        return b.data.points - a.data.points;
      });
      setStandings(leagueStandings);
    });
  }, [leagueId]);

  return (
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
  );
}
