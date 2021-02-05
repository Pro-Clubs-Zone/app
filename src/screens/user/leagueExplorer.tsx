import React, {useState, useEffect} from 'react';
import {FlatList} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AppNavStack} from '../index';
import firestore from '@react-native-firebase/firestore';
import {ILeague} from '../../utils/interface';
import FullScreenLoading from '../../components/loading';
import {ListHeading, OneLine, ListSeparator} from '../../components/listItems';
import {verticalScale} from 'react-native-size-matters';
import EmptyState from '../../components/emptyState';
import {t} from '@lingui/macro';
import i18n from '../../utils/i18n';
type ScreenNavigationProp = StackNavigationProp<AppNavStack, 'League Explorer'>;

type Props = {
  navigation: ScreenNavigationProp;
};

const db = firestore();
type LeagueListItem = ILeague & {key: string};

export default function LeagueExplorer({navigation}: Props) {
  const [data, setData] = useState<LeagueListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const leagueCollection = db.collection('leagues');
    const subscriber = leagueCollection
      .where('private', '==', false)
      .where('scheduled', '==', false)
      .onSnapshot((querySnapshot) => {
        let retrievedLeagues: LeagueListItem[] = [];
        querySnapshot.forEach((doc) => {
          const leagueData = doc.data() as ILeague;
          retrievedLeagues.push({...leagueData, key: doc.id});
        });
        setData(retrievedLeagues);
        setLoading(false);
      });

    return subscriber;
  }, []);

  return (
    <>
      <FullScreenLoading visible={loading} />
      <FlatList
        data={data}
        renderItem={({item}) => (
          <OneLine
            title={item.name}
            leftIcon={
              item.platform === 'ps' ? 'sony-playstation' : 'microsoft-xbox'
            }
            key1={item.teamNum.toString()}
            onPress={() =>
              navigation.navigate('League', {
                leagueId: item.key,
                isAdmin: false,
                newLeague: false,
              })
            }
          />
        )}
        ListHeaderComponent={() =>
          data.length !== 0 && (
            <ListHeading col1={i18n._(t`League`)} col4={i18n._(t`Teams`)} />
          )
        }
        ItemSeparatorComponent={() => <ListSeparator />}
        ListEmptyComponent={() => (
          <EmptyState
            title={i18n._(t`No Public Leagues`)}
            body={i18n._(
              t`All new leagues are private by default. You can join one if you have an invitation code.`,
            )}
          />
        )}
        getItemLayout={(item, index) => ({
          length: verticalScale(56),
          offset: verticalScale(57) * index,
          index,
        })}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: data.length === 0 ? 'center' : undefined,
        }}
        stickyHeaderIndices={[0]}
      />
    </>
  );
}
