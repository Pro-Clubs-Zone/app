import React, {useContext, useEffect, useState, useRef} from 'react';
import {
  ScrollView,
  View,
  Alert,
  ImageURISource,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import submitMatch from './functions/onSubmitMatch';
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
import {PlayerStats} from '../../utils/interface';
import Select from '../../components/select';
import addMatchStats from './functions/onAddMatchStats';

type ScreenNavigationProp = StackNavigationProp<MatchStackType, 'Submit Match'>;

type Props = {
  navigation: ScreenNavigationProp;
};

interface SelectMenu {
  name: string;
  id: string;
}

//const db = firestore();

export default function SubmitMatch({navigation, route}: Props) {
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
  const [roster, setRoster] = useState<Array<SelectMenu & PlayerStats>>([]);
  const [tempSelectedPlayers, setTempSelectedPlayer] = useState<string[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<
    Array<SelectMenu & PlayerStats>
  >([]);
  const [expandedPlayer, setExpandedPlayer] = useState<string>();
  const [motm, setMotm] = useState<string>();

  const context = useContext(AppContext);
  const matchContext = useContext(MatchContext);

  const matchData = matchContext.match;
  const leagueId = matchData.leagueId;
  const clubId = matchData.clubId;

  const ref = useRef(null);

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
    let rosterItems: (SelectMenu & PlayerStats)[] = [];

    for (const [id, playerData] of Object.entries(currentRoster)) {
      const player: SelectMenu & PlayerStats = {
        id: id,
        name: playerData.username,
        goals: undefined,
        assists: undefined,
        matches: undefined,
        motm: undefined,
        club: context.userData.leagues[leagueId].clubName,
        clubId: clubId,
      };
      rosterItems.push(player);
    }

    setRoster(rosterItems);
  }, [context]);

  const showAlert = (submissionResult: string) => {
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

    if (foundUserMatch.length !== 0) {
      let notPublishedMatches = context.userMatches.filter(
        (match) => match.id !== matchData.matchId,
      );

      if (submissionResult === 'Success') {
        context.setUserMatches(notPublishedMatches);
      }
      if (
        submissionResult === 'First Submission' ||
        submissionResult === 'Conflict'
      ) {
        let userUpcomingMatch = {...foundUserMatch[0]};
        userUpcomingMatch.data.conflict = conflict;
        userUpcomingMatch.data.submissions = {
          [matchData.clubId]: {
            [matchData.homeTeamId]: Number(homeScore),
            [matchData.awayTeamId]: Number(awayScore),
          },
        };
        const updatedMatchList = [userUpcomingMatch, ...notPublishedMatches];
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
    const regex = new RegExp('^[0-9]*$');

    if (!regex.test(homeScore) || !regex.test(awayScore)) {
      setErrorStates({
        awayScore: !regex.test(awayScore),
        homeScore: !regex.test(homeScore),
      });
      return false;
    }

    if (!homeScore || !awayScore) {
      setErrorStates({awayScore: !awayScore, homeScore: !homeScore});
      return false;
    }

    return true;
  };

  const onChangeText = (text: string, field: 'homeScore' | 'awayScore') => {
    switch (field) {
      case 'homeScore':
        setHomeScore(text);
        break;
      case 'awayScore':
        setAwayScore(text);
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
      await task.then(() => console.log('image uploaded'));
    }
  };

  const onSubmitMatch = async () => {
    fieldValidation().then(async (noErrors) => {
      if (noErrors) {
        setLoading(true);
        await uploadScreenshots()
          .then(async () => {
            await submitMatch(homeScore, awayScore, matchData).then(
              async (result) => {
                await addMatchStats(matchData, selectedPlayers, motm);
                await analytics().logEvent('match_submit_score');
                showAlert(result);
              },
            );
          })
          .catch((err) => {
            console.log('something wrong with uploading', err);
            setLoading(false);
          });
      }
    });
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
  };

  const onRemoveSelection = (playerId: string) => {
    const removed = selectedPlayers.filter((item) => item.id !== playerId);
    const unselected = tempSelectedPlayers.filter((item) => item !== playerId);
    setTempSelectedPlayer(unselected);
    setSelectedPlayers(removed);
    if (motm === playerId) {
      setMotm(null);
    }

    if (expandedPlayer === playerId) {
      setExpandedPlayer(null);
    }
  };

  const onUpdatePlayerStats = (index: number, stat: string, value: string) => {
    let currentData = [...selectedPlayers];
    const updatedData = {...selectedPlayers[index], [stat]: value};
    currentData[index] = updatedData;
    console.log(currentData);

    setSelectedPlayers(currentData);
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
        subKey="players"
        items={roster}
        uniqueKey="id"
        selectedItems={tempSelectedPlayers}
        onSelectedItemsChange={(item) => setTempSelectedPlayer(item)}
        // onSelectedItemObjectsChange={(item) => console.log('obj', item)}
        onConfirm={onConfirmSeletion}
        // onClose={() => ref?.current?._toggleSelector()}
        ref={ref}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'position' : 'height'}
        style={{flexGrow: 1}}>
        <ScrollView
          bounces={false}
          contentContainerStyle={{
            flexGrow: 1,
          }}
          keyboardDismissMode="on-drag">
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
          <ListHeading col1="Participated Players" />
          <View
            style={{
              padding: verticalScale(8),
              paddingBottom: verticalScale(32),
              flexGrow: 1,
            }}>
            {selectedPlayers.map((player, index) => (
              <MatchPlayer
                username={player.name}
                key={player.id}
                motm={motm === player.id}
                onMotm={() =>
                  motm === player.id ? setMotm(null) : setMotm(player.id)
                }
                onExpand={() =>
                  expandedPlayer === player.id
                    ? setExpandedPlayer(null)
                    : setExpandedPlayer(player.id)
                }
                expanded={expandedPlayer === player.id}
                onRemove={() => onRemoveSelection(player.id)}
                goals={player.goals?.toString()}
                assists={player.assists?.toString()}
                onGoalsChange={(value) =>
                  onUpdatePlayerStats(index, 'goals', value)
                }
                onAssistsChange={(value) =>
                  onUpdatePlayerStats(index, 'assists', value)
                }
              />
            ))}
            <MinButton
              title="add players"
              onPress={() => ref?.current?._toggleSelector()}
            />
          </View>
          <BigButton title={i18n._(t`Submit Match`)} onPress={onSubmitMatch} />
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
