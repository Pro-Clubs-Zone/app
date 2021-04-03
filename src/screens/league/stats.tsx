import React, {useContext, useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {SectionList} from 'react-native';
import {
  ISectionList,
  OutfieldPlayerStats,
  GoalkeeperStats,
  PlayerStatsInfo,
} from '../../utils/interface';
import {LeagueContext} from '../../context/leagueContext';
import {ListHeading, TwoLine} from '../../components/listItems';
import FullScreenLoading from '../../components/loading';
import EmptyState from '../../components/emptyState';
import i18n from '../../utils/i18n';
import {t} from '@lingui/macro';

const db = firestore();

type StatData = {club: string; username: string; value: number};

interface SectionData extends ISectionList {
  data: StatData[];
}

export default function Stats() {
  const [data, setData] = useState<SectionData[]>();
  const [loading, setLoading] = useState<boolean>(true);

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
        title: 'Key Passes',
        data: [],
      },
      {
        title: 'Key Dribbles',
        data: [],
      },
      {
        title: 'Won Tackles',
        data: [],
      },
      {
        title: 'Appearances',
        data: [],
      },
    ];

    let stats: {
      [stat: string]: StatData[];
    } = {
      goals: [],
      assists: [],
      motm: [],
      matches: [],
      keyPasses: [],
      keyDribbles: [],
      wonTackles: [],
    };

    const getPlayerStats = async () => {
      const playerList = await playerStatsRef.get();

      let statsData = playerList.data() as Array<
        PlayerStatsInfo & OutfieldPlayerStats & GoalkeeperStats
      >;

      for (const player of Object.values(statsData)) {
        let statObject: StatData;
        console.log('statsData', player);

        const addStats = (
          stat: string,
          value: number,
          dataStructureIndex: number,
        ) => {
          if (value && value > 0) {
            statObject = {
              club: player.club,
              username: player.username,
              value: value,
            };

            stats[stat].push(statObject);
          }

          console.log('stats', statObject);
          stats[stat].sort((a, b) => b.value - a.value);
          dataStructure[dataStructureIndex].data = stats[stat].slice(0, 10);
          console.log('dataStructure', dataStructure);
        };

        addStats('goals', player.goals, 0);
        addStats('assists', player.assists, 1);
        addStats('motm', player.motm as number, 2);
        addStats('keyPasses', player.keyPasses, 3);
        addStats('keyDribbles', player.keyDribbles, 4);
        addStats('wonTackles', player.wonTackles, 5);
        //         addStats('rating', player.rating, 4);
        addStats('matches', player.matches, 6);

        // AVG Rating

        // Most Tackles
        // Most Clean Sheat
      }

      setData(dataStructure);
      setLoading(false);
    };

    try {
      getPlayerStats();
    } catch (error) {
      console.log(error);
    }
  }, [leagueId]);

  return (
    <>
      <FullScreenLoading visible={loading} />
      <SectionList
        sections={data}
        keyExtractor={(item, index) => item.username + index}
        renderItem={({item}) => (
          <TwoLine title={item.username} sub={item.club} value={item.value} />
        )}
        renderSectionHeader={({section: {title}}) => (
          <ListHeading col1={title} />
        )}
        renderSectionFooter={({section}) => {
          if (section.data.length === 0) {
            return (
              <EmptyState
                //      title={i18n._(t`No stats available`)}
                title={i18n._(t`No players yet`)}
              />
            );
          }
        }}
        ListEmptyComponent={() => (
          <EmptyState
            title={i18n._(t`No stats available`)}
            body={i18n._(t`This league currently has no submitted matches`)}
          />
        )}
      />
    </>
  );
}
