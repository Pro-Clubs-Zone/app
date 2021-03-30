import React, {useContext, useState} from 'react';
import {
  ScrollView,
  View,
  Alert,
  ImageURISource,
  PermissionsAndroid,
  Platform,
} from 'react-native';
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
import addPlayerStats from './functions/onAddPLayerStats';
import {AuthContext} from '../../context/authContext';
import readImage from './functions/readImage';
import ImageEditor from '@react-native-community/image-editor';

type ScreenNavigationProp = StackNavigationProp<MatchStackType, 'Submit Stats'>;

type Props = {
  navigation: ScreenNavigationProp;
};

// let outfieldPlayerStats: OutfieldPlayerStats = {
//   rating: 0,
//   goals: 0,
//   shotsOnTarget: 0,
//   shotsOffTarget: 0,
//   assists: 0,
//   completedShortPasses: 0,
//   completedMediumPasses: 0,
//   completedLongPasses: 0,
//   failedShortPasses: 0,
//   failedMediumPasses: 0,
//   failedLongPasses: 0,
//   keyPasses: 0,
//   successfulCrosses: 0,
//   failedCrosses: 0,
//   keyDribbles: 0,
//   fouled: 0,
//   successfulDribbles: 0,
//   wonTackles: 0,
//   lostTackles: 0,
//   fouls: 0,
//   penaltiesConceded: 0,
//   interceptions: 0,
//   blocks: 0,
//   outOfPosition: 0,
//   possessionWon: 0,
//   possessionLost: 0,
//   clearances: 0,
//   headersWon: 0,
//   heardersLost: 0,
// };

// let goalkeeperStats: GoalkeeperStats = {
//   goalsConceded: 0,
//   shotsCaught: 0,
//   shotsParried: 0,
//   crossesCaught: 0,
//   ballsStriped: 0,
//   assists: 0,
//   completedShortPasses: 0,
//   completedMediumPasses: 0,
//   completedLongPasses: 0,
//   failedShortPasses: 0,
//   failedMediumPasses: 0,
//   failedLongPasses: 0,
//   keyPasses: 0,
//   successfulCrosses: 0,
//   failedCrosses: 0,
//   interceptions: 0,
//   blocks: 0,
//   outOfPosition: 0,
//   possessionWon: 0,
//   possessionLost: 0,
//   clearances: 0,
//   headersWon: 0,
//   heardersLost: 0,
// };

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

  const showAlert = (title, body, success) => {
    Alert.alert(
      title,
      body,
      [
        {
          text: i18n._(t`Close`),
          onPress: () => {
            if (success) {
              setLoading(false);
              navigation.popToTop();
              navigation.goBack();
            }
          },
        },
      ],
      {cancelable: false},
    );
  };

  const requestAndroidPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const askPermission = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);
        const granted =
          askPermission['android.permission.READ_EXTERNAL_STORAGE'];
        if (granted === 'granted') {
          return true;
        }
        if (granted === 'never_ask_again') {
          showAlert(
            i18n._(t`Can't access storage`),
            i18n._(
              t`You have denied the app access to storage. To change, give the permission from the Android app info menu.`,
            ),
            false,
          );
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      return true;
    }
  };

  // const onShowToast = (message: string) => {
  //   setShowToast(true);
  //   setToastMessage(message);
  //   setTimeout(() => {
  //     setShowToast(false);
  //   }, 1000);
  // };

  const uploadScreenshots = async () => {
    for (const [index, image] of images.entries()) {
      let screenshotBucket = firebase.app().storage('gs://prz-screen-shots');
      if (__DEV__) {
        screenshotBucket = storage();
      }
      const reference = screenshotBucket.ref(
        `/${matchData.leagueId}/${matchData.matchId}/${matchData.clubId}/performance/${uid}`,
      );
      const pathToFile = image.uri;
      const task = reference.putFile(pathToFile);
      await task.then(() => console.log('image uploaded'));
    }
  };

  const updateProfilePic = async () => {
    const cropData = {
      offset: {x: 585, y: 235},
      size: {width: 166, height: 166},
    };

    const screenshotBucket = storage();
    const reference = screenshotBucket.ref(`/app/player-img/${uid}`);

    await ImageEditor.cropImage(images[0].uri, cropData)
      .then(async (successURI) => {
        const pathToFile = successURI;
        const task = reference.putFile(pathToFile);
        await task.then(() => console.log('profile pic uploaded'));
      })
      .catch((error) =>
        console.log('Error caught while cropping profile pic', error),
      );
  };

  const onRemoveThumb = (seletectedThumbIndex: number) => {
    const updatedImages = images.filter(
      (image, i) => i !== seletectedThumbIndex,
    );
    setImages(updatedImages);
  };

  const onSubmitStats = async () => {
    if (images[0].width === 1920 && images[0].height === 1080) {
      setLoading(true);
      await readImage(images[0].uri, isGK).then(async (playerStats) => {
        await addPlayerStats(matchData, playerStats, uid, isGK).then(
          async () => {
            await analytics().logEvent('match_submit_stats');
            await uploadScreenshots();
            if (updateImage) {
              await updateProfilePic();
            }
            showAlert(
              i18n._(t`Stats submitted`),
              i18n._(t`Your player performance stats are now published`),
              true,
            );
          },
        );
      });
    } else {
      showAlert(
        i18n._(t`Wrong image size`),
        i18n._(
          t`There is something wrong with your image size. Please send this image to your league admin or PRZ team`,
        ),
        false,
      );
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
          onUpload={() => {
            requestAndroidPermission().then(
              (permission) =>
                permission === true &&
                launchImageLibrary(
                  {
                    mediaType: 'photo',
                    maxWidth: 1920,
                    maxHeight: 1080,
                  },
                  (res) => {
                    if (res.uri) {
                      setImages([
                        ...images,
                        {uri: res.uri, width: res.width, height: res.height},
                      ]);
                      setImageNames([...imageNames, res.fileName!]);
                    }
                  },
                ),
            );
          }}
        />
        <ListHeading col1={i18n._(t`Options`)} />
        <View style={styles.options}>
          <SwitchLabel
            title={i18n._(t`I played as a Goalkeeper`)}
            value={isGK}
            onValueChange={() => setIsGK(!isGK)}
          />
          {/* <SwitchLabel
            title={i18n._(t`Update my player image`)}
            value={updateImage}
            onValueChange={() => setUpdateImage(!updateImage)}
          /> */}
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
