import React, {useEffect, useState} from 'react';
import {FlatList} from 'react-native';

import {StackNavigationProp} from '@react-navigation/stack';
import {LeagueStackType} from './league';
import {ListHeading, ListSeparator, TwoLine} from '../../components/listItems';
import EmptyState from '../../components/emptyState';
import {t} from '@lingui/macro';
import i18n from '../../utils/i18n';
import FullScreenLoading from '../../components/loading';
import firestore from '@react-native-firebase/firestore';
import {RouteProp} from '@react-navigation/native';
import {Transfer} from '../../utils/interface';
import {APP_COLORS} from '../../utils/designSystem';

type ScreenNavigationProp = StackNavigationProp<
  LeagueStackType,
  'Transfer History'
>;
type ScreenRouteProp = RouteProp<LeagueStackType, 'Transfer History'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

const db = firestore();

export default function TransferHistory({navigation, route}: Props) {
  const [data, setData] = useState<{id: string; data: Transfer}[]>([]);
  const [loading, setLoading] = useState(true);

  const leagueId = route.params.leagueId;
  useEffect(() => {
    const transfersRef = db
      .collection('leagues')
      .doc(leagueId)
      .collection('stats')
      .doc('transfers');

    const getData = async () => {
      const transferHistory: {id: string; data: Transfer}[] = [];

      await transfersRef
        .get()
        .then((doc) => {
          if (doc.exists) {
            const transfers = doc.data() as Transfer;
            for (const [transferId, transferData] of Object.entries(
              transfers,
            )) {
              const transfer = {
                id: transferId,
                data: transferData,
              };
              transferHistory.push(transfer);
            }
            transferHistory.sort((a, b) => Number(b.id) - Number(a.id));
            setData(transferHistory);
          }
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          console.log(err);
          throw new Error(err);
        });
    };
    getData();
  }, [leagueId]);

  const convertDate = (milliseconds: string) => {
    const date = new Date(Number(milliseconds));
    const convertedDate = `${date.getDate()}.${date.getMonth()}`;

    return convertedDate;
  };

  if (loading) {
    return <FullScreenLoading visible={true} />;
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={() => (
        <ListHeading col1={i18n._(t`Transfer`)} col4={i18n._(t`Day/Month`)} />
      )}
      ListEmptyComponent={() => (
        <EmptyState
          title={i18n._(t`No Transfers`)}
          body={i18n._(t`All transfer history will appear here`)}
        />
      )}
      ItemSeparatorComponent={() => <ListSeparator />}
      renderItem={({item}) => (
        <TwoLine
          title={item.data.username}
          sub={item.data.clubName}
          leftIcon={item.data.joined ? 'arrow-right-bold' : 'arrow-left-bold'}
          iconColor={item.data.joined ? APP_COLORS.Green : APP_COLORS.Red}
          value={convertDate(item.id)}
        />
      )}
    />
  );
}
