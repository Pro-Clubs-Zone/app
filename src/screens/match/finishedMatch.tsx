import React, {useContext, useEffect, ImageURISource, useState} from 'react';
import {
  View,
  Image,
  ScrollView,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import {IMatchNavData} from '../../utils/interface';
import {RouteProp} from '@react-navigation/native';
import ScoreBoard from '../../components/scoreboard';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
//import {LeagueContext} from '../../context/leagueContext';
//import firestore from '@react-native-firebase/firestore';
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

// type ScreenRouteProp = RouteProp<MatchStackType, 'Finished Match'>;
// type ScreenNavigationProp = StackNavigationProp<
//   MatchStackType,
//   'Finished Match'
// >;

// type Props = {
//   navigation: ScreenNavigationProp;
//   route: ScreenRouteProp;
// };

type FinishedMatchStack = {
  Result: undefined;
  Screenshots: undefined;
};

const Tab = createMaterialTopTabNavigator<FinishedMatchStack>();

export default function FinishedMatch() {
  return (
    <Tab.Navigator lazy={true}>
      <Tab.Screen name="Result" component={MatchResult} />
      <Tab.Screen name="Screenshots" component={MatchScreenshots} />
    </Tab.Navigator>
  );
}

function MatchResult() {
  const matchContext = useContext(MatchContext);
  const matchData: IMatchNavData = matchContext.match;

  return (
    <View style={{flex: 1}}>
      <ScoreBoard data={matchData} editable={false} showSubmit={false} />
      <EmptyState
        title={i18n._(t`Match Stats & Info`)}
        body={i18n._(t`Coming Soon`)}
      />
    </View>
  );
}

function MatchScreenshots() {
  const [matchImages, setMatchImages] = useState<ImageURISource[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const matchContext = useContext(MatchContext);
  const matchData: IMatchNavData = matchContext.match;

  const windowWidth = useWindowDimensions().width;
  // const windowHeight = useWindowDimensions().height;

  useEffect(() => {
    let screenshotBucket = firebase.app().storage('gs://prz-screenshots');
    if (__DEV__) {
      screenshotBucket = storage();
    }
    const homeRef = screenshotBucket.ref(
      `/${matchData.leagueId}/${matchData.matchId}/${matchData.homeTeamId}/facts`,
    );
    const awayRef = screenshotBucket.ref(
      `/${matchData.leagueId}/${matchData.matchId}/${matchData.awayTeamId}/facts`,
    );
    let homeImageUrls: ImageURISource[] = [];
    let awayImageUrls: ImageURISource[] = [];
    homeRef
      .listAll()
      .then(async (res) => {
        for (const itemRef of res.items) {
          await itemRef.getDownloadURL().then((url) => {
            console.log(url);
            homeImageUrls = [...homeImageUrls, {uri: url, team: 'home'}];
          });
        }
      })
      .then(() =>
        awayRef
          .listAll()
          .then(async (res) => {
            for (const itemRef of res.items) {
              await itemRef.getDownloadURL().then((url) => {
                console.log(url);
                awayImageUrls = [...awayImageUrls, {uri: url, team: 'away'}];
              });
            }
          })
          .then(() => {
            setMatchImages([...homeImageUrls, ...awayImageUrls]);
            setLoading(false);
          }),
      );
  }, []);

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

const styles = ScaledSheet.create({
  gallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
