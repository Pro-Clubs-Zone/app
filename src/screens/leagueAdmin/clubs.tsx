import React, {useContext, useEffect, useState} from 'react';
import {SectionList} from 'react-native';
import {IClubRequestData, ILeagueRequest} from '../../utils/interface';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {AppContext} from '../../context/appContext';
import {LeagueStackType} from '../league/league';
import {ListHeading, ListSeparator, TwoLine} from '../../components/listItems';
import FullScreenLoading from '../../components/loading';
import {useActionSheet} from '@expo/react-native-action-sheet';
import handleLeagueRequest from '../club/actions/handleLeagueRequest';
import {RequestContext} from '../../context/requestContext';

type ScreenNavigationProp = StackNavigationProp<LeagueStackType, 'Clubs'>;
type ScreenRouteProp = RouteProp<LeagueStackType, 'Clubs'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

export default function Clubs({route}: Props) {
  const [data, setData] = useState<IClubRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionedData, setSectionedData] = useState<ILeagueRequest[]>([]);

  const leagueId = route.params.leagueId;
  const context = useContext(AppContext);
  const requestContext = useContext(RequestContext);
  const {showActionSheetWithOptions} = useActionSheet();

  const requests: ILeagueRequest[] = requestContext.leagues;

  const acceptedClubList: ILeagueRequest = {
    title: 'Accepted',
    data: [],
  };

  const clubRequestList: ILeagueRequest = {
    title: 'New requests',
    data: [],
  };

  const sortClubs = (clubs: IClubRequestData[]) => {
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
      setData(updatedList);
      sortClubs(updatedList);
      setLoading(false);
    });
  };

  const onDeclineClub = async (selectedClub: IClubRequestData) => {
    // const declinedClub: IClubRequestData = data.find(
    //   (club) => club.clubId === selectedClub.clubId,
    // );
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

  const onOpenActionSheet = (club: IClubRequestData) => {
    const options = ['Accept', 'Decline', 'Cancel'];
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
            onPress={() => onOpenActionSheet(item)}
          />
        )}
        ItemSeparatorComponent={() => <ListSeparator />}
        renderSectionHeader={({section: {title}}) => (
          <ListHeading col1={title} />
        )}
      />
    </>
  );
}
