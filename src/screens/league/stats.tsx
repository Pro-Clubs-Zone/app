import React, {useContext, useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {SectionList} from 'react-native';
import {ISectionList, PlayerStats} from '../../utils/interface';
import {LeagueContext} from '../../context/leagueContext';
import {ListHeading, TwoLine} from '../../components/listItems';

const db = firestore();

type StatData = {club: string; username: string; value: number};

interface SectionData extends ISectionList {
  data: StatData[];
}

export default function Stats() {
  const [data, setData] = useState<SectionData[]>();

  const leagueContext = useContext(LeagueContext);
  const leagueId = leagueContext.leagueId;

  useEffect(() => {
    const playerStatsRef = db
      .collection('leagues')
      .doc(leagueId)
      .collection('stats')
      .doc('players');

    let dataStructure: SectionData[] = [
      {
        title: 'Goalscorers',
        data: [],
      },
      {
        title: 'Assists',
        data: [],
      },
      {
        title: 'MOTMs',
        data: [],
      },
      {
        title: 'Most matches',
        data: [],
      },
    ];

    let goalscorers: StatData[] = [];
    let assists: StatData[] = [];
    let motms: StatData[] = [];
    let matches: StatData[] = [];

    playerStatsRef.get().then((res) => {
      let statsData = res.data() as PlayerStats[];

      for (const player of Object.values(statsData)) {
        let statObject: {
          username: string;
          club: string;
          value: number;
        };

        if (player.goals > 0) {
          statObject = {
            club: player.club,
            username: player.username,
            value: player.goals,
          };
          goalscorers.push(statObject);
        }
        if (player.assists > 0) {
          statObject = {
            club: player.club,
            username: player.username,
            value: player.assists,
          };
          assists.push(statObject);
        }
        if (player.motm > 0) {
          statObject = {
            club: player.club,
            username: player.username,
            value: player.motm,
          };
          motms.push(statObject);
        }
        if (player.matches > 0) {
          statObject = {
            club: player.club,
            username: player.username,
            value: player.matches,
          };
          matches.push(statObject);
        }
      }

      goalscorers.sort((a, b) => b.value - a.value);
      dataStructure[0].data = goalscorers.slice(0, 10);

      assists.sort((a, b) => b.value - a.value);
      dataStructure[1].data = assists.slice(0, 10);

      motms.sort((a, b) => b.value - a.value);
      dataStructure[2].data = motms.slice(0, 10);

      matches.sort((a, b) => b.value - a.value);
      dataStructure[3].data = matches.slice(0, 10);

      setData(dataStructure);
    });
  }, [leagueId]);

  return (
    <SectionList
      sections={data}
      keyExtractor={(item, index) => item.username + index}
      renderItem={({item}) => (
        <TwoLine title={item.username} sub={item.club} value={item.value} />
      )}
      renderSectionHeader={({section: {title}}) => <ListHeading col1={title} />}
    />
  );
}
