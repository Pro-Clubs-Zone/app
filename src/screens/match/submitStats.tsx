import React, {useContext, useEffect, useState} from 'react';
import {ScrollView, View, Alert, ImageURISource} from 'react-native';
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
import {BigButton} from '../../components/buttons';
import ScreenshotUploader from '../../components/screenshots';
import {launchImageLibrary} from 'react-native-image-picker';
import ImageView from 'react-native-image-viewing';
import storage, {firebase} from '@react-native-firebase/storage';
import {PlayerStats} from '../../utils/interface';
import Toast from '../../components/toast';
import SwitchLabel from '../../components/switch';

type ScreenNavigationProp = StackNavigationProp<MatchStackType, 'Submit Stats'>;

type Props = {
  navigation: ScreenNavigationProp;
};

interface SelectMenu {
  id: string;
}

//const db = firestore();

export default function SubmitStats({navigation}: Props) {
  const [loading, setLoading] = useState<boolean>(false);

  const [imageNames, setImageNames] = useState<string[]>([]);
  const [images, setImages] = useState<ImageURISource[]>([]);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const context = useContext(AppContext);
  const matchContext = useContext(MatchContext);

  const matchData = matchContext.match;
  const leagueId = matchData.leagueId;
  const clubId = matchData.clubId;

  // const leagueRef = db
  //   .collection('leagues')
  //   .doc(leagueId)
  //   .collection('matches');

  // const query = leagueRef
  //   .where('homeTeamId', 'in', matchData.teams)
  //   .where('teams', 'array-contains', '')
  //   .where('published', '==', true);

  // const getMatches = useGetMatches(leagueId, query);

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
        <View style={styles.options}>
          <SwitchLabel
            title={i18n._(t`I played as a Goalkeeper`)}
            value={false}
          />
          <SwitchLabel
            title={i18n._(t`Update my player image`)}
            value={false}
          />
        </View>
        <BigButton title={i18n._(t`Submit Match`)} />
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
