import React, {useContext, useEffect, useState, useLayoutEffect} from 'react';
import {ScrollView, View, Alert, ImageURISource} from 'react-native';
import {IMatchNavData} from '../../utils/interface';
import onConflictResolve from './actions/onConflictResolve';
import {AppContext} from '../../context/appContext';
import {MatchStackType} from './match';
import ScoreBoard from '../../components/scoreboard';
import {verticalScale} from 'react-native-size-matters';
//import firestore from '@react-native-firebase/firestore';
import EmptyState from '../../components/emptyState';
import i18n from '../../utils/i18n';
import {ListHeading} from '../../components/listItems';
import {t} from '@lingui/macro';
import FullScreenLoading from '../../components/loading';
import {StackNavigationProp} from '@react-navigation/stack';
//import useGetMatches from '../league/functions/useGetMatches';
import MatchConflictItem from '../../components/matchConflictItem';
import analytics from '@react-native-firebase/analytics';
import {MatchContext} from '../../context/matchContext';
import ImageView from 'react-native-image-viewing';
import storage, {firebase} from '@react-native-firebase/storage';
import {IconButton} from '../../components/buttons';
import {useActionSheet} from '@expo/react-native-action-sheet';
import getMatchImages from './actions/getMatchImages';
import shareMatchDetails from './actions/shareMatchDetails';

type ScreenNavigationProp = StackNavigationProp<
  MatchStackType,
  'Upcoming Match'
>;

type Props = {
  navigation: ScreenNavigationProp;
};

//const db = firestore();

export default function UpcomingMatch({navigation}: Props) {
  const [canSubmit, setCanSubmit] = useState<boolean>(false);
  const [loading, setLoading] = useState<string>();
  const [homeImages, setHomeImages] = useState<ImageURISource[]>([]);
  const [awayImages, setAwayImages] = useState<ImageURISource[]>([]);
  const [matchImages, setMatchImages] = useState<ImageURISource[]>([]);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);

  const context = useContext(AppContext);
  const matchContext = useContext(MatchContext);
  const {showActionSheetWithOptions} = useActionSheet();

  const matchData: IMatchNavData = matchContext.match;
  const leagueId = matchData.leagueId;

  // const leagueRef = db
  //   .collection('leagues')
  //   .doc(leagueId)
  //   .collection('matches');

  // const query = leagueRef
  //   .where('homeTeamId', 'in', matchData.teams)
  //   .where('teams', 'array-contains', '')
  //   .where('published', '==', true);

  // const getMatches = useGetMatches(leagueId, query);

  const showSuccessAlert = () => {
    const title = i18n._(t`Match Resolved`);
    const body = i18n._(t`Match was published with the selected result`);

    let foundUserMatch = context.userMatches.filter(
      (match) => match.id === matchData.matchId,
    );

    if (foundUserMatch.length !== 0) {
      let notPublishedMatches = context.userMatches.filter(
        (match) => match.id !== matchData.matchId,
      );

      context.setUserMatches(notPublishedMatches);
    }

    Alert.alert(
      title,
      body,
      [
        {
          text: i18n._(t`Close`),
          onPress: () => {
            setLoading(undefined);
            navigation.goBack();
          },
        },
      ],
      {cancelable: false},
    );
  };

  const onResolveMatch = () => {
    const resolveMatch = async (result: string) => {
      try {
        setLoading(i18n._(t`Submitting Match...`));
        await onConflictResolve(matchData, result, true);
        await analytics().logEvent('match_resolve_outcome');
        showSuccessAlert();
      } catch (error) {
        throw new Error(error);
      }
    };

    const showAlert = (result: string) => {
      Alert.alert(
        i18n._(t`Resolve Match`),
        i18n._(
          t`Are you sure you want to pick ${
            result === 'home'
              ? matchData.homeTeamName
              : result === 'away'
              ? matchData.awayTeamName
              : 'no team'
          } as a winner?`,
        ),
        [
          {
            text: i18n._(t`Confirm`),
            onPress: () => resolveMatch(result),
            style: 'default',
          },
          {
            text: i18n._(t`Cancel`),
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
    };

    const options = [
      i18n._(t`${matchData.homeTeamName} is winner`),
      i18n._(t`${matchData.awayTeamName} is winner`),
      i18n._(t`Match is a draw`),
      i18n._(t`Cancel`),
    ];
    const cancelButtonIndex = 3;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            showAlert('home');
            break;
          case 1:
            showAlert('away');
            break;
          case 2:
            showAlert('draw');
            break;
        }
      },
    );
  };

  useLayoutEffect(() => {
    const userClub = context.userData!.leagues![leagueId].clubId!;
    const isManager = matchData.teams!.includes(userClub) && matchData.manager;
    const hasSubmitted = !!matchData.submissions?.[userClub];
    const managerCanSubmit = isManager && !hasSubmitted;
    setCanSubmit(managerCanSubmit);

    navigation.setOptions({
      headerRight: () => (
        <View
          style={{
            flexDirection: 'row',
          }}>
          {matchData.admin && (
            <IconButton name="whistle" onPress={() => onResolveMatch()} />
          )}
          <IconButton
            name="message-alert-outline"
            onPress={() => shareMatchDetails(matchData)}
          />
        </View>
      ),
    });
  }, [leagueId]);

  useEffect(() => {
    const getImages = async () => {
      let screenshotBucket = firebase.app().storage('gs://prz-screen-shots');
      if (__DEV__) {
        screenshotBucket = storage();
      }

      const homeRef = screenshotBucket.ref(
        `/${matchData.leagueId}/${matchData.matchId}/${matchData.homeTeamId}/facts`,
      );
      const awayRef = screenshotBucket.ref(
        `/${matchData.leagueId}/${matchData.matchId}/${matchData.awayTeamId}/facts`,
      );

      if ((matchData.conflict || matchData.motmConflict) && matchData.admin) {
        setLoading(i18n._(t`Loading`));

        const [homeImageUrls, awayImageUrls] = await getMatchImages(
          homeRef,
          awayRef,
          matchData.homeTeamId,
          matchData.awayTeamId,
        );
        setHomeImages(homeImageUrls);
        setAwayImages(awayImageUrls);
        setLoading(undefined);
      }
    };
    try {
      getImages();
    } catch (error) {
      console.log('error getting images');
    }
  }, [matchContext]);

  const decrementConflictCounter = () => {
    const leagueData = {...context.userLeagues};
    const userData = {...context.userData};
    leagueData[matchData.leagueId].conflictMatchesCount -= 1;
    userData.adminConflictCounts -= 1;

    context.setUserLeagues(leagueData);
    context.setUserData(userData);
  };

  const onSelectResult = async (teamID: string) => {
    try {
      setLoading(i18n._(t`Submitting Match...`));
      await onConflictResolve(matchData, teamID);
      await analytics().logEvent('match_resolve_conflict');
      decrementConflictCounter();
      showSuccessAlert();
    } catch (error) {
      throw new Error(error);
    }
  };

  return (
    <View
      style={{
        flex: 1,
      }}>
      <FullScreenLoading visible={loading !== undefined} label={loading} />
      <ImageView
        images={matchImages}
        imageIndex={0}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
      />
      <ScoreBoard
        data={matchData}
        editable={false}
        showSubmit={canSubmit}
        onSubmit={() => {
          navigation.navigate('Submit Match');
        }}
      />
      {(matchData.conflict || matchData.motmConflict) && matchData.admin ? (
        <MatchConflict
          data={matchData}
          onSelectHome={() => {
            onSelectResult(matchData.homeTeamId);
          }}
          onShowProofHome={() => {
            setMatchImages(homeImages);
            setImageViewerVisible(true);
          }}
          homeProofDisabled={homeImages.length === 0}
          onSelectAway={() => {
            onSelectResult(matchData.awayTeamId);
          }}
          onShowProofAway={() => {
            setMatchImages(awayImages);
            setImageViewerVisible(true);
          }}
          awayProofDisabled={awayImages.length === 0}
        />
      ) : (
        // <FlatList
        //   data={getMatches.data}
        //   ListHeaderComponent={() => <ListHeading col1="Past Fixtures" />}
        //   renderItem={({item}) => (
        //     <FixtureItem
        //       matchId={item.data.id}
        //       homeTeamName={item.data.homeTeamName}
        //       awayTeamName={item.data.awayTeamName}
        //       homeTeamScore={item.data.result[item.data.homeTeamId]}
        //       awayTeamScore={item.data.result[item.data.awayTeamId]}
        //       conflict={false}
        //       onPress={() =>
        //         navigation.navigate('Finished Match', {
        //           matchData: item.data,
        //         })
        //       }
        //     />
        //   )}
        //   keyExtractor={(item) => item.data.matchId}
        //   ItemSeparatorComponent={() => <ListSeparator />}
        //   ListEmptyComponent={() => (
        //     <EmptyState title={i18n._(t`No Fixtures`)} />
        //   )}
        //   contentContainerStyle={{
        //     justifyContent: getMatches.data.length === 0 ? 'center' : null,
        //     flexGrow: 1,
        //   }}
        //   stickyHeaderIndices={[0]}
        // />
        <EmptyState
          title={i18n._(t`Past Fixtures`)}
          body={i18n._(t`Coming Soon`)}
        />
      )}
    </View>
  );
}

const MatchConflict = ({
  onSelectHome,
  onSelectAway,
  onShowProofHome,
  onShowProofAway,
  homeProofDisabled,
  awayProofDisabled,
  data,
}: {
  onSelectHome: () => void;
  onSelectAway: () => void;
  onShowProofHome: () => void;
  onShowProofAway: () => void;
  homeProofDisabled: boolean;
  awayProofDisabled: boolean;
  data: IMatchNavData;
}) => {
  return (
    <ScrollView
      stickyHeaderIndices={[0]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{paddingBottom: verticalScale(32)}}>
      <ListHeading col1={i18n._(t`Conflict Match`)} />
      <View
        style={{
          padding: verticalScale(16),
        }}>
        <MatchConflictItem
          header={i18n._(t`${data.homeTeamName} Submission`)}
          homeTeam={data.homeTeamName}
          awayTeam={data.awayTeamName}
          homeScore={data.submissions[data.homeTeamId][data.homeTeamId]}
          awayScore={data.submissions[data.homeTeamId][data.awayTeamId]}
          motm={data.motmSubmissions?.[data.homeTeamId]}
          onPickResult={onSelectHome}
          onShowProof={onShowProofHome}
          proofDisabled={homeProofDisabled}
          resultConflict={data.conflict}
          motmConflict={data.motmConflict}
        />
        <MatchConflictItem
          header={i18n._(t`${data.awayTeamName} Submission`)}
          homeTeam={data.homeTeamName}
          awayTeam={data.awayTeamName}
          homeScore={data.submissions[data.awayTeamId][data.homeTeamId]}
          awayScore={data.submissions[data.awayTeamId][data.awayTeamId]}
          motm={data.motmSubmissions?.[data.awayTeamId]}
          onPickResult={onSelectAway}
          onShowProof={onShowProofAway}
          proofDisabled={awayProofDisabled}
          resultConflict={data.conflict}
          motmConflict={data.motmConflict}
        />
      </View>
    </ScrollView>
  );
};
