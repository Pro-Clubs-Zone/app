import React, {useContext, useState} from 'react';
import {ScrollView, View, Alert, ImageURISource} from 'react-native';
import {MatchStackType} from './match';
import ScoreBoard from '../../components/scoreboard';
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
import {BigButton} from '../../components/buttons';
import ScreenshotUploader from '../../components/screenshots';
import {launchImageLibrary} from 'react-native-image-picker';
import ImageView from 'react-native-image-viewing';
import storage, {firebase} from '@react-native-firebase/storage';
import Toast from '../../components/toast';
import SwitchLabel from '../../components/switch';
import {GoalkeeperStats, OutfieldPlayerStats} from '../../utils/interface';
import addPlayerStats from './functions/onAddPLayerStats';
import {AuthContext} from '../../context/authContext';

type ScreenNavigationProp = StackNavigationProp<MatchStackType, 'Submit Stats'>;

type Props = {
  navigation: ScreenNavigationProp;
};

let outfieldPlayerStats: OutfieldPlayerStats = {
  rating: 0,
  goals: 0,
  shotsOnTarget: 0,
  shotsOffTarget: 0,
  assists: 0,
  completedShortPasses: 0,
  completedMediumPasses: 0,
  completedLongPasses: 0,
  failedShortPasses: 0,
  failedMediumPasses: 0,
  failedLongPasses: 0,
  keyPasses: 0,
  successfulCrosses: 0,
  failedCrosses: 0,
  keyDribbles: 0,
  fouled: 0,
  successfulDribbles: 0,
  wonTackles: 0,
  lostTackles: 0,
  fouls: 0,
  penaltiesConceded: 0,
  interceptions: 0,
  blocks: 0,
  outOfPosition: 0,
  possessionWon: 0,
  possessionLost: 0,
  clearances: 0,
  headersWon: 0,
  heardersLost: 0,
};

let goalkeeperStats: GoalkeeperStats = {
  goalsConceded: 0,
  shotsCaught: 0,
  shotsParried: 0,
  crossesCaught: 0,
  ballsStriped: 0,
  assists: 0,
  completedShortPasses: 0,
  completedMediumPasses: 0,
  completedLongPasses: 0,
  failedShortPasses: 0,
  failedMediumPasses: 0,
  failedLongPasses: 0,
  keyPasses: 0,
  successfulCrosses: 0,
  failedCrosses: 0,
  interceptions: 0,
  blocks: 0,
  outOfPosition: 0,
  possessionWon: 0,
  possessionLost: 0,
  clearances: 0,
  headersWon: 0,
  heardersLost: 0,
};

//const db = firestore();

export default function SubmitStats({navigation}: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const [isGK, setIsGK] = useState(false);
  const [updateImage, setUpdateImage] = useState(false);

  const [imageNames, setImageNames] = useState<string[]>([]);
  const [images, setImages] = useState<ImageURISource[]>([]);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const matchContext = useContext(MatchContext);
  const auth = useContext(AuthContext);

  const matchData = matchContext.match;
  const uid = auth.uid;

  const showAlert = () => {
    Alert.alert(
      i18n._(t`Stats Submitted`),
      i18n._(t`All good`),
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

  const onShowToast = (message: string) => {
    setShowToast(true);
    setToastMessage(message);
    setTimeout(() => {
      setShowToast(false);
    }, 1000);
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

  const onRemoveThumb = (seletectedThumbIndex: number) => {
    const updatedImages = images.filter(
      (image, i) => i !== seletectedThumbIndex,
    );
    setImages(updatedImages);
  };

  const onSubmitStats = async () => {
    setLoading(true);
    await addPlayerStats(matchData, outfieldPlayerStats, uid, isGK).then(
      async () => {
        await analytics().logEvent('match_submit_stats');
        showAlert();
      },
    );
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
      <Toast message={toastMessage} visible={showToast} success={false} />

      <ScrollView
        bounces={false}
        contentContainerStyle={{
          flexGrow: 1,
        }}>
        <ScoreBoard data={matchData} editable={false} showSubmit={false} />

        <ScreenshotUploader
          thumbsCount={1}
          description={i18n._(t`Player Performance`)}
          images={images}
          multiple={false}
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
        <ListHeading col1={i18n._(t`Options`)} />
        <View style={styles.options}>
          <SwitchLabel
            title={i18n._(t`I played as a Goalkeeper`)}
            value={isGK}
            onValueChange={() => setIsGK(!isGK)}
          />
          <SwitchLabel
            title={i18n._(t`Update my player image`)}
            value={updateImage}
            onValueChange={() => setUpdateImage(!updateImage)}
          />
        </View>
        <BigButton title={i18n._(t`Submit Stats`)} onPress={onSubmitStats} />
      </ScrollView>
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
  options: {
    paddingVertical: '16@vs',
    paddingHorizontal: '8@vs',
    flex: 1,
  },
});
