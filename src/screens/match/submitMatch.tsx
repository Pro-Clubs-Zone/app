import React, {useContext, useEffect, useState, useRef} from 'react';
import {
  ScrollView,
  View,
  Alert,
  ImageURISource,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import submitMatch from './actions/onSubmitMatch';
import {AppContext} from '../../context/appContext';
import {MatchStackType} from './match';
import ScoreBoard from '../../components/scoreboard';
import {MatchTextField} from '../../components/textField';
import {ScaledSheet, verticalScale} from 'react-native-size-matters';
import {APP_COLORS} from '../../utils/designSystem';
//import firestore from '@react-native-firebase/firestore';
import i18n from '../../utils/i18n';
import {ListHeading} from '../../components/listItems';
import {t} from '@lingui/macro';
import FullScreenLoading from '../../components/loading';
import {StackNavigationProp} from '@react-navigation/stack';
//import useGetMatches from '../league/functions/useGetMatches';
import analytics from '@react-native-firebase/analytics';
import {MatchContext} from '../../context/matchContext';
import {BigButton, MinButton} from '../../components/buttons';
import ScreenshotUploader from '../../components/screenshots';
import {launchImageLibrary} from 'react-native-image-picker';
import ImageView from 'react-native-image-viewing';
import storage, {firebase} from '@react-native-firebase/storage';
import MatchPlayer from '../../components/matchPlayer';
import Select from '../../components/select';
import addMatchStats from './actions/onAddMatchStats';
import Toast from '../../components/toast';
import {PlayerStatsInfo} from '../../utils/interface';
import {AuthContext} from '../../context/authContext';

type ScreenNavigationProp = StackNavigationProp<MatchStackType, 'Submit Match'>;

type Props = {
  navigation: ScreenNavigationProp;
};

//const db = firestore();

export default function SubmitMatch({navigation}: Props) {
  const [homeScore, setHomeScore] = useState<string>('');
  const [awayScore, setAwayScore] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorStates, setErrorStates] = useState({
    homeScore: false,
    awayScore: false,
  });
  const [imageNames, setImageNames] = useState<string[]>([]);
  const [images, setImages] = useState<ImageURISource[]>([]);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [roster, setRoster] = useState<Array<PlayerStatsInfo>>([]);
  const [tempSelectedPlayers, setTempSelectedPlayer] = useState<string[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<
    Array<PlayerStatsInfo>
  >([]);
  const [motm, setMotm] = useState<string>();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const context = useContext(AppContext);
  const matchContext = useContext(MatchContext);
  const user = useContext(AuthContext);

  const matchData = matchContext.match;
  const leagueId = matchData.leagueId;
  const clubId = matchData.clubId;
  const uid = user.currentUser.uid;

  const ref = useRef(null);

  const windowHeight = useWindowDimensions().height;

  // const leagueRef = db
  //   .collection('leagues')
  //   .doc(leagueId)
  //   .collection('matches');

  // const query = leagueRef
  //   .where('homeTeamId', 'in', matchData.teams)
  //   .where('teams', 'array-contains', '')
  //   .where('published', '==', true);

  // const getMatches = useGetMatches(leagueId, query);

  useEffect(() => {
    const currentRoster = context.userLeagues[leagueId].clubs[clubId].roster;
    let rosterItems: PlayerStatsInfo[] = [];

    for (const [id, playerData] of Object.entries(currentRoster)) {
      const player: PlayerStatsInfo = {
        id: id,
        username: playerData.username,
        motm: undefined,
        club: context.userData.leagues[leagueId].clubName,
        clubId: clubId,
      };
      rosterItems.push(player);
    }

    setRoster(rosterItems);
  }, [leagueId, context.userData, context.userLeagues]);

  const onShowToast = (message: string) => {
    setShowToast(true);
    setToastMessage(message);
    setTimeout(() => {
      setShowToast(false);
    }, 1000);
  };

  const updateContextShowAlert = (submissionResult: string) => {
    let title: string;
    let body: string;

    let conflict: boolean = false;

    switch (submissionResult) {
      case 'Success':
        title = i18n._(t`Result Submitted`);
        body = i18n._(t`Match was published with the selected result`);
        break;
      case 'Conflict':
        title = i18n._(t`Match will be reviewed`);
        body = i18n._(t`Match cannot be published due to conflict.`);
        conflict = true;
        break;
      case 'First Submission':
        title = i18n._(t`Result Submitted`);
        body = i18n._(
          t`Match will be published once opponent submits their result`,
        );
        break;
    }

    let foundUserMatch = context.userMatches.filter(
      (match) => match.id === matchData.matchId,
    );

    const teamSubmission = {
      [matchData.clubId]: {
        [matchData.homeTeamId]: Number(homeScore),
        [matchData.awayTeamId]: Number(awayScore),
      },
    };

    if (foundUserMatch.length !== 0) {
      let updatedUserMatches = context.userMatches.filter(
        (match) => match.id !== matchData.matchId,
      );

      if (submissionResult === 'Success') {
        const userParticipated = selectedPlayers.some(
          (player) => player.id === uid,
        );

        if (userParticipated) {
          foundUserMatch[0].data.notSubmittedPlayers.push(uid);
          foundUserMatch[0].data.published = true;
          foundUserMatch[0].data.submissions = {
            ...foundUserMatch[0].data.submissions,
            ...teamSubmission,
          };
          updatedUserMatches.unshift(foundUserMatch[0]);
        }

        context.setUserMatches(updatedUserMatches);
      }
      if (
        submissionResult === 'First Submission' ||
        submissionResult === 'Conflict'
      ) {
        let userUpcomingMatch = {...foundUserMatch[0]};
        userUpcomingMatch.data.conflict = conflict;
        userUpcomingMatch.data.submissions = teamSubmission;
        const updatedMatchList = [userUpcomingMatch, ...updatedUserMatches];
        context.setUserMatches(updatedMatchList);
      }
    }

    // const popAction = StackActions.popToTop();

    Alert.alert(
      title,
      body,
      [
        {
          text: i18n._(t`Close`),
          onPress: () => {
            setLoading(false);
            navigation.popToTop();
            navigation.goBack();
          },
        },
      ],
      {cancelable: false},
    );
  };

  const fieldValidation = async (): Promise<boolean> => {
    const scoreRegex = new RegExp('^[0-9]*$');

    if (!scoreRegex.test(homeScore) || !scoreRegex.test(awayScore)) {
      setErrorStates({
        awayScore: !scoreRegex.test(awayScore),
        homeScore: !scoreRegex.test(homeScore),
      });
      return false;
    }

    if (!homeScore || !awayScore) {
      setErrorStates({awayScore: !awayScore, homeScore: !homeScore});

      onShowToast(i18n._(t`Match scores are missing`));
      return false;
    }

    if (selectedPlayers.length > 11) {
      onShowToast(
        i18n._(t`You have selected more than 11 players for this match`),
      );
      return false;
    }

    return true;
  };

  const onChangeText = (text: string, field: 'homeScore' | 'awayScore') => {
    switch (field) {
      case 'homeScore':
        setHomeScore(text.replace(/[^0-9]/g, ''));
        break;
      case 'awayScore':
        setAwayScore(text.replace(/[^0-9]/g, ''));
        break;
    }

    if (errorStates[field]) {
      setErrorStates({...errorStates, [field]: false});
    }
  };

  const uploadScreenshots = async () => {
    for (const [index, image] of images.entries()) {
      let screenshotBucket = firebase.app().storage('gs://prz-screen-shots');
      if (__DEV__) {
        screenshotBucket = storage();
      }
      const reference = screenshotBucket.ref(
        `/${matchData.leagueId}/${matchData.matchId}/${matchData.clubId}/facts/${imageNames[index]}`,
      );
      const pathToFile = image.uri;
      const task = reference.putFile(pathToFile);
      await task
        .then(() => console.log('image uploaded'))
        .catch((storageErr) => {
          Alert.alert(
            i18n._(t`Something went wrong`),
            i18n._(t`If this issue occurs often, please report to us.`),
            [
              {
                text: i18n._(t`Close`),
                style: 'cancel',
                onPress: () => {
                  setLoading(false);
                },
              },
            ],
            {cancelable: false},
          );
          throw new Error(storageErr);
        });
    }
  };

  const onSubmitMatch = async () => {
    try {
      const noFieldErrors = await fieldValidation();
      if (noFieldErrors) {
        if (selectedPlayers.length === 0) {
          return Alert.alert(
            i18n._(t`No players added`),
            i18n._(
              t`Please select all the participated players from your roster to submit the match.`,
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
        const [submissionResult] = await Promise.all([
          submitMatch(homeScore, awayScore, matchData, selectedPlayers, motm),
          addMatchStats(matchData, selectedPlayers),
          uploadScreenshots(),
          analytics().logEvent('match_submit_score'),
        ]);
        updateContextShowAlert(submissionResult);
      }
    } catch (error) {
      console.log('something wrong with uploading', error);
      Alert.alert(
        i18n._(t`Something went wrong`),
        i18n._(t`If this issue occurs often, please report to us.`),
        [
          {
            text: i18n._(t`Close`),
            style: 'cancel',
            onPress: () => {
              setLoading(false);
            },
          },
        ],
        {cancelable: false},
      );
      throw new Error(error);
    }
  };

  const onRemoveThumb = (seletectedThumbIndex: number) => {
    const updatedImages = images.filter(
      (image, i) => i !== seletectedThumbIndex,
    );
    setImages(updatedImages);
  };

  const onConfirmSeletion = () => {
    let selection = [...selectedPlayers];
    tempSelectedPlayers.forEach((playerId) => {
      const matchedPlayer = roster.filter((player) => player.id === playerId);
      // if selected players do not have temp selected player -> add temp to selected
      const isSelected = selectedPlayers.some(
        (player) => player.id === playerId,
      );
      if (!isSelected) {
        selection.push(matchedPlayer[0]);
      }
    });
    // If selected players have players not from temp selection => remove that player
    selection.forEach((selectedPlayer, index) => {
      const isSelected = tempSelectedPlayers.some(
        (playerId) => playerId === selectedPlayer.id,
      );
      if (!isSelected) {
        selection.splice(index, 1);
      }
    });

    setSelectedPlayers(selection);
    ref?.current?._toggleSelector();
  };

  const onRemoveSelection = (playerId: string) => {
    const removed = selectedPlayers.filter((item) => item.id !== playerId);
    const unselected = tempSelectedPlayers.filter((item) => item !== playerId);
    setTempSelectedPlayer(unselected);
    setSelectedPlayers(removed);
    if (motm === playerId) {
      setMotm(null);
    }
  };

  return (
    <>
      <FullScreenLoading
        visible={loading}
        label={i18n._(t`Submitting Match...`)}
      />
      <ImageView
        images={images}
        imageIndex={currentImage}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
      />
      <Select
        items={roster}
        uniqueKey="id"
        displayKey="username"
        selectedItems={tempSelectedPlayers}
        onSelectedItemsChange={(item) => setTempSelectedPlayer(item)}
        onConfirm={onConfirmSeletion}
        ref={ref}
        single={false}
        showFooter={true}
        title={i18n._(t`Roster`)}
        buttonTitle={i18n._(t`Confirm`)}
      />
      <Toast message={toastMessage} visible={showToast} success={false} />

      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={
          Platform.OS === 'android' ? verticalScale(-64) : 0
        }>
        <ScrollView
          bounces={false}
          contentContainerStyle={{
            flexGrow: 1,
            minHeight:
              Platform.OS === 'ios'
                ? windowHeight - verticalScale(80)
                : windowHeight - verticalScale(52),
          }}>
          <ScoreBoard data={matchData} editable={true} showSubmit={false}>
            <MatchTextField
              error={errorStates.homeScore}
              onChangeText={(score: string) => onChangeText(score, 'homeScore')}
              value={homeScore}
            />
            <View style={styles.divider} />
            <MatchTextField
              error={errorStates.awayScore}
              onChangeText={(score: string) => onChangeText(score, 'awayScore')}
              value={awayScore}
            />
          </ScoreBoard>

          <ScreenshotUploader
            thumbsCount={3}
            description={i18n._(
              t`1. Facts - 2. Events - 3. Online Player ID List`,
            )}
            images={images}
            multiple={true}
            onZoom={(i) => {
              setCurrentImage(i);
              setImageViewerVisible(true);
            }}
            onRemove={(i) => onRemoveThumb(i)}
            onUpload={() =>
              launchImageLibrary(
                {
                  mediaType: 'photo',
                  maxWidth: 1920,
                  maxHeight: 1280,
                },
                (res) => {
                  if (res.uri) {
                    setImages([...images, {uri: res.uri}]);
                    setImageNames([...imageNames, res.fileName!]);
                    console.log(res);
                  }
                },
              )
            }
          />
          <ListHeading
            col1={i18n._(t`Participated Players`)}
            col4={i18n._(t`MOTM`)}
          />
          <View
            style={{
              flex: 1,
              justifyContent: 'space-between',
            }}>
            <View
              style={{
                paddingHorizontal: verticalScale(8),
                paddingTop: verticalScale(16),
                paddingBottom: verticalScale(24),
              }}>
              {selectedPlayers.map((player, index) => (
                <MatchPlayer
                  username={player.username}
                  key={player.id}
                  motm={motm === player.id}
                  onMotm={() =>
                    motm === player.id ? setMotm(null) : setMotm(player.id)
                  }
                  onRemove={() => onRemoveSelection(player.id)}
                />
              ))}
              <MinButton
                title={i18n._(t`Add Players`)}
                onPress={() => ref?.current?._toggleSelector()}
              />
            </View>

            <BigButton
              title={i18n._(t`Submit Match`)}
              onPress={onSubmitMatch}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = ScaledSheet.create({
  divider: {
    height: '3@vs',
    width: '8@vs',
    backgroundColor: APP_COLORS.Accent,
    marginHorizontal: '8@vs',
  },
});
