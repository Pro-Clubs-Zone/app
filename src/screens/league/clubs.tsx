import React, {useContext, useEffect, useRef, useState} from 'react';
import {Alert, SectionList} from 'react-native';
import {IClub, IClubRequestData, ILeagueRequest} from '../../utils/interface';
import firestore from '@react-native-firebase/firestore';
// import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
// import {LeagueStackType} from '../league/league';
import {AppContext} from '../../context/appContext';
import {ListHeading, ListSeparator, TwoLine} from '../../components/listItems';
import FullScreenLoading from '../../components/loading';
import {useActionSheet} from '@expo/react-native-action-sheet';
import handleLeagueRequest from '../club/actions/handleLeagueRequest';
import {RequestContext} from '../../context/requestContext';
import {LeagueContext} from '../../context/leagueContext';
import removeClub from '../club/actions/removeClub';
import EmptyState from '../../components/emptyState';
import {t} from '@lingui/macro';
import i18n from '../../utils/i18n';
import {StackNavigationProp} from '@react-navigation/stack';
import {LeagueStackType} from './league';
import Select from '../../components/select';
import swapClubs from '../club/actions/swapClubs';
import {AuthContext} from '../../context/authContext';

type ScreenNavigationProp = StackNavigationProp<LeagueStackType, 'Clubs'>;
type ScreenRouteProp = RouteProp<LeagueStackType, 'Clubs'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

const db = firestore();

export default function Clubs({navigation, route}: Props) {
  const [data, setData] = useState<IClubRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionedData, setSectionedData] = useState<ILeagueRequest[]>([]);
  const [swapClub, setSwapClub] = useState<IClubRequestData>();

  const context = useContext(AppContext);
  const requestContext = useContext(RequestContext);
  const leagueContext = useContext(LeagueContext);
  const user = useContext(AuthContext);

  const {showActionSheetWithOptions} = useActionSheet();

  const ref = useRef(null);

  const leagueId = leagueContext.leagueId;
  const admins = leagueContext.league.admins;

  const scheduled = route?.params?.scheduled;

  const sortClubs = (clubs: IClubRequestData[]) => {
    console.log('run sort');

    const acceptedClubList: ILeagueRequest = {
      title: i18n._(t`Accepted Clubs`),
      data: [],
    };

    const clubRequestList: ILeagueRequest = {
      title: i18n._(t`New Requests`),
      data: [],
    };

    clubs.forEach((club) => {
      if (club.accepted) {
        acceptedClubList.data.push(club);
      } else {
        clubRequestList.data.push(club);
      }
    });

    let sortedClubs: ILeagueRequest[] = [];

    if (acceptedClubList.data.length !== 0) {
      sortedClubs.push(acceptedClubList);
    }
    if (clubRequestList.data.length !== 0) {
      sortedClubs.push(clubRequestList);
    }
    setSectionedData(sortedClubs);
  };

  useEffect(() => {
    const clubsRef = db.collection('leagues').doc(leagueId).collection('clubs');

    const getData = clubsRef.onSnapshot((snapshot) => {
      let clubList: IClubRequestData[] = [];
      let clubInfo: IClubRequestData;
      snapshot.forEach((club) => {
        const clubData = club.data() as IClub;
        const clubId = club.id;
        clubInfo = {
          ...clubData,
          clubId: clubId,
          leagueId: leagueId,
        };
        clubList.push(clubInfo);
      });

      setData(clubList);
      sortClubs(clubList);
      setLoading(false);
    });

    return getData;
  }, [leagueId]);

  const onClubSwap = async (
    oldClub: IClubRequestData,
    newClub: IClubRequestData,
  ) => {
    setLoading(true);
    try {
      await swapClubs({oldClub, newClub});
      requestContext.setLeagueCount(requestContext.requestCount - 1);
      await user.currentUser.reload();
      setLoading(false);
      navigation.goBack();
    } catch (error) {
      setLoading(false);
      throw new Error(error);
    }
  };

  const onConfirmClubSwap = (oldClub: IClubRequestData, swapClubId: string) => {
    const isAdmin = Object.keys(admins).some(
      (adminUid) => adminUid === oldClub.managerId,
    );

    if (isAdmin) {
      return Alert.alert(
        i18n._(t`Can't swap admin club`),
        i18n._(t`Currently admins can't swap their own club`),
        [
          {
            text: i18n._(t`Close`),
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
    }
    const newClub = sectionedData[1].data.filter(
      (club) => club.clubId === swapClubId,
    );
    Alert.alert(
      i18n._(t`Swap Clubs`),
      i18n._(
        t`You are about to swap old club ${oldClub.name} with new club ${newClub[0].name}. This action can't be undone.`,
      ),
      [
        {
          text: i18n._(t`Cancel`),
          style: 'cancel',
        },
        {
          text: i18n._(t`Confirm Swap`),
          onPress: () => onClubSwap(oldClub, newClub[0]),
          style: 'destructive',
        },
      ],
      {cancelable: false},
    );
  };

  const onHandleLeagueRequest = async (
    selectedClub: IClubRequestData,
    acceptRequest: boolean,
  ) => {
    try {
      await handleLeagueRequest(selectedClub, acceptRequest);

      //   requestContext.setLeagues(newRequestData);
      //  const currentCount = requestContext.requestCount;
      //    /  requestContext.setLeagueCount(currentCount === 1 ? 0 : currentCount - 1);

      // const currentLeagueData = {...userLeagues};
      // const currentClub = currentLeagueData[selectedClub.leagueId].clubs![
      //   selectedClub.clubId
      // ];
      // if (acceptRequest) {
      //   if (currentClub !== undefined) {
      //     currentClub.accepted = true;
      //   } else {
      //     currentLeagueData[selectedClub.leagueId].clubs[
      //       selectedClub.clubId
      //     ] = selectedClub;
      //   }
      // } else {
      //   if (currentClub !== undefined) {
      //     delete currentLeagueData[selectedClub.leagueId].clubs![
      //       selectedClub.clubId
      //     ];
      //   }
      // }
      // context.setUserLeagues(currentLeagueData);
    } catch (error) {
      console.log(error);

      throw new Error(error);
    }
  };

  const onAcceptClub = async (selectedClub: IClubRequestData) => {
    if (leagueContext.league.acceptedClubs === leagueContext.league.teamNum) {
      return Alert.alert(
        i18n._(t`Team Limit Reached`),
        i18n._(
          t`Can't accept club due to league team limit. Remove or swap accepted clubs, or decline this request.`,
        ),
        [
          {
            text: i18n._(t`Close`),
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
    }
    setLoading(true);
    // const updatedList: IClubRequestData[] = data.map((club) => {
    //   if (club.clubId === selectedClub.clubId) {
    //     club.accepted = true;
    //   }
    //   return club;
    // });
    await onHandleLeagueRequest(selectedClub, true)
      .then(() => {
        //    const leagueData = {...leagueContext.league};
        //    leagueData.acceptedClubs += 1;
        //    leagueContext.setLeague(leagueData);
        // setData(updatedList);
        // sortClubs(updatedList);
        setLoading(false);
      })
      .catch((requestError) => {
        throw new Error(requestError);
      });
  };

  const onDeclineClub = async (selectedClub: IClubRequestData) => {
    setLoading(true);

    // const updatedList: IClubRequestData[] = data.filter(
    //   (club) => club.clubId !== selectedClub.clubId,
    // );
    await onHandleLeagueRequest(selectedClub, false);
    setLoading(false);
    // .then(() => {
    //   setData(updatedList);
    //   sortClubs(updatedList);
    //   setLoading(false);
    // });
  };

  const onUnacceptedClub = (club: IClubRequestData) => {
    const options = [i18n._(t`Accept`), i18n._(t`Decline`), i18n._(t`Cancel`)];
    const destructiveButtonIndex = 1;
    const cancelButtonIndex = 2;

    console.log('club', club);

    showActionSheetWithOptions(
      {
        options,
        destructiveButtonIndex,
        cancelButtonIndex,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            onAcceptClub(club);
            break;
          case 1:
            onDeclineClub(club);
            break;
        }
      },
    );
  };

  const onAcceptedClub = async (club: IClubRequestData) => {
    const clubRoster = club.roster;

    if (scheduled) {
      setSwapClub(club);
      return ref?.current?._toggleSelector();
      //return console.log(sectionedData[1].data);
    }

    Alert.alert(
      i18n._(t`Remove Club`),
      i18n._(
        t`You are about to remove ${club.name} from the league. This actions can't be undone.`,
      ),
      [
        {
          text: i18n._(t`Remove`),
          onPress: async () => {
            setLoading(true);
            await removeClub(leagueId, club.clubId, admins, clubRoster);
            // navigation.dispatch(
            //   CommonActions.reset({
            //     index: 1,
            //     routes: [{name: 'Home'}],
            //   }),
            // );
          },
          style: 'destructive',
        },
        {
          text: i18n._(t`Cancel`),
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
  };

  return (
    <>
      <FullScreenLoading visible={loading} />
      <Select
        items={sectionedData[0]?.data}
        uniqueKey="clubId"
        displayKey="name"
        onSelectedItemsChange={(item) =>
          setTimeout(() => {
            onConfirmClubSwap(swapClub, item[0]);
          }, 500)
        }
        ref={ref}
        single={true}
        showFooter={false}
        title={i18n._(t`New Requests`)}
      />
      <SectionList
        sections={sectionedData}
        keyExtractor={(item) => item.clubId}
        renderItem={({item}) => (
          <TwoLine
            title={item.name}
            sub={item.managerUsername}
            rightIcon={
              item.accepted
                ? scheduled
                  ? 'swap-horizontal-circle'
                  : 'minus-circle'
                : 'arrow-right-circle'
            }
            onIconPress={() =>
              !item.accepted ? onUnacceptedClub(item) : onAcceptedClub(item)
            }
            onPress={() =>
              navigation.navigate('Club Profile', {clubId: item.clubId})
            }
          />
        )}
        ItemSeparatorComponent={() => <ListSeparator />}
        renderSectionHeader={({section: {title}}) => (
          <ListHeading
            col1={title}
            col4={scheduled ? i18n._(t`Swap`) : i18n._(t`Manage`)}
          />
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title={i18n._(t`No Clubs in League`)}
            body={i18n._(t`You can invite clubs from league page`)}
          />
        )}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: sectionedData.length === 0 ? 'center' : undefined,
        }}
      />
    </>
  );
}
