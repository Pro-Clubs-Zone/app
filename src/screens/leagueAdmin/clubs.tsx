import React, {useContext, useEffect, useState} from 'react';
import {Alert, SectionList} from 'react-native';
import {IClubRequestData, ILeagueRequest} from '../../utils/interface';
// import {StackNavigationProp} from '@react-navigation/stack';
// import {RouteProp} from '@react-navigation/native';
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
import RNRestart from 'react-native-restart';
import {t} from '@lingui/macro';
import i18n from '../../utils/i18n';

// type ScreenNavigationProp = StackNavigationProp<LeagueStackType, 'Clubs'>;
// type ScreenRouteProp = RouteProp<LeagueStackType, 'Clubs'>;

// type Props = {
//   navigation: ScreenNavigationProp;
//   route: ScreenRouteProp;
// };

export default function Clubs() {
  const [data, setData] = useState<IClubRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionedData, setSectionedData] = useState<ILeagueRequest[]>([]);

  const context = useContext(AppContext);
  const requestContext = useContext(RequestContext);
  const leagueContext = useContext(LeagueContext);
  const {showActionSheetWithOptions} = useActionSheet();

  const requests: ILeagueRequest[] = requestContext.leagues;
  const leagueId = leagueContext.leagueId;
  const adminId = leagueContext.league.adminId;

  const sortClubs = (clubs: IClubRequestData[]) => {
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
    const clubs = context.userLeagues[leagueId].clubs;

    let clubList: IClubRequestData[] = [];
    let clubInfo: IClubRequestData;
    if (clubs) {
      for (const [clubId, club] of Object.entries(clubs)) {
        clubInfo = {
          ...club,
          clubId: clubId,
          leagueId: leagueId,
          managerId: club.managerId,
        };
        clubList.push(clubInfo);
      }

      console.log(clubList, 'clublist');
      setData(clubList);
      sortClubs(clubList);
      setLoading(false);
    }
  }, [context]);

  const onHandleLeagueRequest = async (
    selectedClub: IClubRequestData,
    acceptRequest: boolean,
  ) => {
    await handleLeagueRequest(
      requests,
      selectedClub,
      context.userLeagues[leagueId].name,
      acceptRequest,
    )
      .then((newData) => {
        requestContext.setLeagues(newData);
        const currentCount = requestContext.requestCount;
        requestContext.setLeagueCount(
          currentCount === 1 ? 0 : currentCount - 1,
        );
      })
      .then(() => {
        const currentLeagueData = {...context.userLeagues};
        if (acceptRequest) {
          currentLeagueData[selectedClub.leagueId].clubs[
            selectedClub.clubId
          ].accepted = true;
        } else {
          delete currentLeagueData[selectedClub.leagueId].clubs[
            selectedClub.clubId
          ];
        }
        context.setUserLeagues(currentLeagueData);
      });
  };

  const onAcceptClub = async (selectedClub: IClubRequestData) => {
    setLoading(true);
    const updatedList: IClubRequestData[] = data.map((club) => {
      if (club.clubId === selectedClub.clubId) {
        club.accepted = true;
      }
      return club;
    });
    await onHandleLeagueRequest(selectedClub, true).then(() => {
      const leagueData = {...leagueContext.league};
      leagueData.acceptedClubs += 1;
      leagueContext.setLeague(leagueData);
      setData(updatedList);
      sortClubs(updatedList);
      setLoading(false);
    });
  };

  const onDeclineClub = async (selectedClub: IClubRequestData) => {
    setLoading(true);

    const updatedList: IClubRequestData[] = data.filter(
      (club) => club.clubId !== selectedClub.clubId,
    );
    await onHandleLeagueRequest(selectedClub, false).then(() => {
      setData(updatedList);
      sortClubs(updatedList);
      setLoading(false);
    });
  };

  const onUnacceptedClub = (club: IClubRequestData) => {
    const options = [i18n._(t`Accept`), i18n._(t`Decline`), i18n._(t`Cancel`)];
    const destructiveButtonIndex = 1;
    const cancelButtonIndex = 2;

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

  const onAcceptedClub = (club: IClubRequestData) => {
    const clubRoster = context.userLeagues[leagueId].clubs[club.clubId].roster;

    Alert.alert(
      i18n._(t`Remove Club`),
      i18n._(t`After removal, you will be to moved the home screen`),
      [
        {
          text: i18n._(t`Remove`),
          onPress: () => {
            setLoading(true);
            removeClub(leagueId, club.clubId, adminId, clubRoster).then(() => {
              RNRestart.Restart();
            });
          },
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
      <SectionList
        sections={sectionedData}
        keyExtractor={(item) => item.clubId}
        renderItem={({item}) => (
          <TwoLine
            title={item.name}
            sub={item.managerUsername}
            rightIcon={item.accepted ? 'minus-circle' : null}
            onIconPress={() => onAcceptedClub(item)}
            onPress={() => !item.accepted && onUnacceptedClub(item)}
          />
        )}
        ItemSeparatorComponent={() => <ListSeparator />}
        renderSectionHeader={({section: {title}}) => (
          <ListHeading col1={title} />
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title={i18n._(t`No Clubs in League`)}
            body={i18n._(t`You can invite clubs from league page`)}
          />
        )}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: sectionedData.length === 0 ? 'center' : null,
        }}
      />
    </>
  );
}
