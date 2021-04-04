import React, {useContext, useEffect, useLayoutEffect, useState} from 'react';
import {
  View,
  Image,
  ScrollView,
  Pressable,
  useWindowDimensions,
  ImageURISource,
  SafeAreaView,
  Alert,
} from 'react-native';
import {IMatchNavData} from '../../utils/interface';
import ScoreBoard from '../../components/scoreboard';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
//import {LeagueContext} from '../../context/leagueContext';
import functions from '@react-native-firebase/functions';
import {StackNavigationProp} from '@react-navigation/stack';
import EmptyState from '../../components/emptyState';
import {t} from '@lingui/macro';
import i18n from '../../utils/i18n';
import {MatchContext} from '../../context/matchContext';
import storage, {firebase} from '@react-native-firebase/storage';
import FullScreenLoading from '../../components/loading';
import ImageView from 'react-native-image-viewing';
import {ListHeading} from '../../components/listItems';
import {ScaledSheet, verticalScale} from 'react-native-size-matters';
import {APP_COLORS} from '../../utils/designSystem';
import {AuthContext} from '../../context/authContext';
import {MatchStackType} from './match';
import getMatchImages from './actions/getMatchImages';
import {IconButton, MinButton} from '../../components/buttons';
import shareMatchDetails from './actions/shareMatchDetails';

// type ScreenRouteProp = RouteProp<MatchStackType, 'Finished Match'>;
type ScreenNavigationProp = StackNavigationProp<
  MatchStackType,
  'Finished Match'
>;

type Props = {
  navigation: ScreenNavigationProp;
  //route: ScreenRouteProp;
};

type FinishedMatchStack = {
  Result: undefined;
  'Match Stats': undefined;
  'Player Stats': undefined;
};

export type ImageProps = ImageURISource & {
  team: string;
  name: string;
  clubId: string;
};

const Tab = createMaterialTopTabNavigator<FinishedMatchStack>();

export default function FinishedMatch({navigation}: Props) {
  const matchContext = useContext(MatchContext);

  useLayoutEffect(() => {
    const matchData: IMatchNavData = matchContext.match;
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          name="message-alert-outline"
          onPress={() => shareMatchDetails(matchData)}
        />
      ),
    });
  }, [matchContext]);

  return (
    <Tab.Navigator lazy={true}>
      <Tab.Screen name="Result" component={MatchResult} />
      <Tab.Screen name="Match Stats" component={MatchScreenshots} />
      <Tab.Screen name="Player Stats" component={PlayerScreenshots} />
    </Tab.Navigator>
  );
}

function MatchResult({navigation}: Props) {
  const [isPlayer, setIsPlayer] = useState(false);

  const matchContext = useContext(MatchContext);
  const user = useContext(AuthContext);
  const matchData: IMatchNavData = matchContext.match;
  const uid = user.uid;

  useEffect(() => {
    if (
      matchData.players &&
      uid in matchData.players &&
      matchData.players[uid] === false
    ) {
      setIsPlayer(true);
    }
  }, [matchContext]);

  return (
    <View style={{flex: 1}}>
      <ScoreBoard
        data={matchData}
        editable={false}
        showSubmit={isPlayer}
        onSubmit={() => navigation.navigate('Submit Stats')}
        submitTitle={i18n._(t`Submit Stats`)}
      />
      <EmptyState
        title={i18n._(t`Match Stats & Info`)}
        body={i18n._(t`Coming Soon`)}
      />
    </View>
  );
}

function MatchScreenshots() {
  const [matchImages, setMatchImages] = useState<Array<ImageProps>>([]);
  const [loading, setLoading] = useState(true);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const matchContext = useContext(MatchContext);
  const matchData: IMatchNavData = matchContext.match;

  const windowWidth = useWindowDimensions().width;
  // const windowHeight = useWindowDimensions().height;

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
      const [homeImageUrls, awayImageUrls] = await getMatchImages(
        homeRef,
        awayRef,
        matchData.homeTeamId,
        matchData.awayTeamId,
      );
      setMatchImages([...homeImageUrls, ...awayImageUrls]);
      setLoading(false);
    };

    try {
      getImages();
    } catch (error) {
      console.log('error getting images');
    }
  }, [matchData]);

  const MatchImage = ({uri, index}: {uri: string; index: number}) => (
    <Pressable
      onPress={() => {
        setCurrentImage(index);
        setImageViewerVisible(true);
      }}>
      <Image
        source={{
          uri: uri,
        }}
        style={{
          height: verticalScale(100),
          width: windowWidth / 3,
          borderWidth: 3,
          borderColor: APP_COLORS.Dark,
        }}
      />
    </Pressable>
  );

  return (
    <ScrollView style={{flex: 1}}>
      <FullScreenLoading visible={loading} />
      <ImageView
        images={matchImages}
        imageIndex={currentImage}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
      />
      <ListHeading col1={matchData.homeTeamName} />
      <View style={styles.gallery}>
        {matchImages.some((image) => image.team === 'home') ? (
          matchImages.map(
            (image, index) =>
              image.team === 'home' && (
                <MatchImage uri={image.uri} index={index} key={index} />
              ),
          )
        ) : (
          <EmptyState
            body={i18n._(t`Manager uploaded no images`)}
            title={i18n._(t`No screenshots`)}
          />
        )}
      </View>
      <ListHeading col1={matchData.awayTeamName} />
      <View style={styles.gallery}>
        {matchImages.some((image) => image.team === 'away') ? (
          matchImages.map(
            (image, index) =>
              image.team === 'away' && (
                <MatchImage uri={image.uri} index={index} key={index} />
              ),
          )
        ) : (
          <EmptyState
            body={i18n._(t`Manager uploaded no images`)}
            title={i18n._(t`No screenshots`)}
          />
        )}
      </View>
    </ScrollView>
  );
}

function PlayerScreenshots({navigation}: Props) {
  const [matchImages, setMatchImages] = useState<Array<ImageProps>>([]);
  const [loading, setLoading] = useState(true);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const matchContext = useContext(MatchContext);
  const matchData: IMatchNavData = matchContext.match;

  const windowWidth = useWindowDimensions().width;
  // const windowHeight = useWindowDimensions().height;

  const firFunc = functions();

  useEffect(() => {
    const getImages = async () => {
      let screenshotBucket = firebase.app().storage('gs://prz-screen-shots');
      if (__DEV__) {
        screenshotBucket = storage();
      }
      const homeRef = screenshotBucket.ref(
        `/${matchData.leagueId}/${matchData.matchId}/${matchData.homeTeamId}/performance`,
      );
      const awayRef = screenshotBucket.ref(
        `/${matchData.leagueId}/${matchData.matchId}/${matchData.awayTeamId}/performance`,
      );
      const [homeImageUrls, awayImageUrls] = await getMatchImages(
        homeRef,
        awayRef,
        matchData.homeTeamId,
        matchData.awayTeamId,
      );

      setMatchImages([...homeImageUrls, ...awayImageUrls]);
      setLoading(false);
    };

    try {
      getImages();
    } catch (error) {
      console.log('error getting images');
    }
  }, []);

  const showResultAlert = (title: any, body: any) => {
    console.log('alert shown');

    Alert.alert(
      title,
      body,
      [
        {
          text: i18n._(t`Close`),
          onPress: () => {
            setLoading(false);
            navigation.popToTop();
          },
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
  };

  const showConfirmationAlert = (matchImage: ImageProps) => {
    Alert.alert(
      i18n._(t`Removing player stats`),
      i18n._(
        t`Are you sure you want to remove player stats submission for this match?`,
      ),
      [
        {
          text: i18n._(t`Remove`),
          onPress: () =>
            onRemovePlayerSubmission(matchImage.name, matchImage.clubId),
        },
        {
          text: i18n._(t`Close`),
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
  };

  const onRemovePlayerSubmission = async (playerID: string, clubID: string) => {
    console.log('club id from image', clubID);
    setImageViewerVisible(false);
    // setLoading(true);
    try {
      // console.log('start removing');

      const removeSubmission = firFunc.httpsCallable('removeSubmission');
      await removeSubmission({
        leagueID: matchData.leagueId,
        matchID: matchData.matchId,
        clubID: clubID,
        playerID: playerID,
      });
      //   console.log('finished removing');

      showResultAlert(
        i18n._(t`Submission Removed`),
        i18n._(
          t`Player performance stats submission for this match was removed`,
        ),
      );
      //setLoading(false);
      // navigation.popToTop();
    } catch (error) {
      console.log(error);

      showResultAlert(i18n._(t`Something went wrong`), error);
    }
  };

  const MatchImage = ({uri, index}: {uri: string; index: number}) => (
    <Pressable
      onPress={() => {
        setCurrentImage(index);
        setImageViewerVisible(true);
      }}>
      <Image
        source={{
          uri: uri,
        }}
        style={{
          height: verticalScale(100),
          width: windowWidth / 3,
          borderWidth: 3,
          borderColor: APP_COLORS.Dark,
        }}
      />
    </Pressable>
  );

  const RemoveStatButton = ({image}: {image: {imageIndex: number}}) => (
    <SafeAreaView>
      <MinButton
        title={i18n._(t`Remove Player Stat`)}
        onPress={() => showConfirmationAlert(matchImages[image.imageIndex])}
      />
    </SafeAreaView>
  );

  return (
    <ScrollView style={{flex: 1}}>
      <FullScreenLoading visible={loading} />
      <ImageView
        images={matchImages}
        imageIndex={currentImage}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
        FooterComponent={(image) =>
          matchData.admin ? <RemoveStatButton image={image} /> : null
        }
      />
      <ListHeading col1={matchData.homeTeamName} />
      <View style={styles.gallery}>
        {matchImages.some((image) => image.team === 'home') ? (
          matchImages.map(
            (image, index) =>
              image.team === 'home' && (
                <MatchImage uri={image.uri} index={index} key={index} />
              ),
          )
        ) : (
          <EmptyState
            body={i18n._(t`Players uploaded no images`)}
            title={i18n._(t`No screenshots`)}
          />
        )}
      </View>
      <ListHeading col1={matchData.awayTeamName} />
      <View style={styles.gallery}>
        {matchImages.some((image) => image.team === 'away') ? (
          matchImages.map(
            (image, index) =>
              image.team === 'away' && (
                <MatchImage uri={image.uri} index={index} key={index} />
              ),
          )
        ) : (
          <EmptyState
            body={i18n._(t`Players uploaded no images`)}
            title={i18n._(t`No screenshots`)}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = ScaledSheet.create({
  gallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
