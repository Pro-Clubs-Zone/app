import React, {useContext, useLayoutEffect, useRef, useState} from 'react';
import {Alert, SectionList} from 'react-native';
import {IClub, IClubRequestData, ILeagueRequest} from '../../utils/interface';
import firestore from '@react-native-firebase/firestore';
import {RouteProp} from '@react-navigation/native';
import {ListHeading, ListSeparator, TwoLine} from '../../components/listItems';
import FullScreenLoading from '../../components/loading';
import {useActionSheet} from '@expo/react-native-action-sheet';
import handleLeagueRequest from '../club/actions/handleLeagueRequest';
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
import {IconButton} from '../../components/buttons';
import {AppContext} from '../../context/appContext';

type ScreenNavigationProp = StackNavigationProp<LeagueStackType, 'Clubs'>;
type ScreenRouteProp = RouteProp<LeagueStackType, 'Clubs'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

const db = firestore();

export default function Clubs({navigation, route}: Props) {
  const [loading, setLoading] = useState(true);
  const [sectionedData, setSectionedData] = useState<ILeagueRequest[]>([]);
  const [swapClub, setSwapClub] = useState<IClubRequestData>();

  const leagueContext = useContext(LeagueContext);
  const user = useContext(AuthContext);
  const context = useContext(AppContext);
  const uid = user.uid;
  const {showActionSheetWithOptions} = useActionSheet();

  const ref = useRef(null);

  const leagueId = leagueContext.leagueId;
  const leagueAdmins = leagueContext.league.admins;

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

  useLayoutEffect(() => {
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

      sortClubs(clubList);

      const admins = leagueContext.league.admins;
      const isAdmin = Object.keys(admins).some((adminUid) => adminUid === uid);
      const userClub = context.userData.leagues[leagueId].clubId;

      navigation.setOptions({
        headerRight: () =>
          isAdmin &&
          !userClub &&
          scheduled && (
            <IconButton
              name="shield-plus"
              onPress={() =>
                navigation.navigate('Create Club', {
                  isAdmin: true,
                  newLeague: false,
                  scheduled: scheduled,
                  acceptClub: false,
                })
              }
            />
          ),
      });

      setLoading(false);
    });

    return getData;
  }, [leagueId, context.userData]);

  const onRemoveClub = async (clubId: string) => {
    setLoading(true);
    await removeClub(leagueId, clubId, leagueAdmins);
    const userData = context.userData;
    let userDataCopy = {...userData};
    let userDataLeaguesCopy = {...userDataCopy.leagues};

    if (userData.leagues[leagueId].clubId === clubId) {
      delete userDataLeaguesCopy[leagueId].clubId;
      delete userDataLeaguesCopy[leagueId].accepted;
      delete userDataLeaguesCopy[leagueId].clubName;
      delete userDataLeaguesCopy[leagueId].manager;
      context.setUserData(userDataCopy);
    }

    let leagueDataCopy = {...leagueContext.league};

    delete leagueDataCopy.clubs[clubId];
    leagueDataCopy.acceptedClubs -= 1;
    leagueContext.setLeague(leagueDataCopy);
  };

  const onClubSwap = async (
    oldClub: IClubRequestData,
    newClub: IClubRequestData,
  ) => {
    setLoading(true);
    try {
      await swapClubs({oldClub, newClub, leagueAdmins});
      await user.currentUser.reload();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw new Error(error);
    }
  };

  const onConfirmClubSwap = (oldClub: IClubRequestData, swapClubId: string) => {
    // const isAdmin = Object.keys(leagueAdmins).some(
    //   (adminUid) => adminUid === oldClub.managerId,
    // );

    // if (isAdmin) {
    //   return Alert.alert(
    //     i18n._(t`Can't swap admin club`),
    //     i18n._(t`Currently admins can't swap their own club`),
    //     [
    //       {
    //         text: i18n._(t`Close`),
    //         style: 'cancel',
    //       },
    //     ],
    //     {cancelable: false},
    //   );
    // }
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

    try {
      await handleLeagueRequest(selectedClub, true);
      let leagueDataCopy = {...leagueContext.league};
      leagueDataCopy.acceptedClubs += 1;
      leagueContext.setLeague(leagueDataCopy);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
      throw new Error(err);
    }
  };

  const onDeclineClub = async (selectedClub: IClubRequestData) => {
    setLoading(true);
    try {
      await handleLeagueRequest(selectedClub, false);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
      throw new Error(err);
    }
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
          onPress: () => onRemoveClub(club.clubId),
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
        items={sectionedData[1]?.data}
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
