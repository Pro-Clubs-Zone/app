import {FirebaseStorageTypes} from '@react-native-firebase/storage';
import {ImageProps} from '../finishedMatch';

export default async function getMatchImages(
  homeRef: FirebaseStorageTypes.Reference,
  awayRef: FirebaseStorageTypes.Reference,
  homeTeamId: string,
  awayTeamId: string,
) {
  let homeImageUrls: Array<ImageProps> = [];
  let awayImageUrls: Array<ImageProps> = [];

  try {
    let [homeTeamImages, awayTeamImages] = await Promise.all([
      homeRef.listAll(),
      awayRef.listAll(),
    ]);

    for (const itemRef of homeTeamImages.items) {
      const url = await itemRef.getDownloadURL();
      const name = itemRef.name;
      homeImageUrls = [
        ...homeImageUrls,
        {uri: url, team: 'home', name: name, clubId: homeTeamId},
      ];
    }

    for (const itemRef of awayTeamImages.items) {
      const url = await itemRef.getDownloadURL();
      const name = itemRef.name;
      awayImageUrls = [
        ...awayImageUrls,
        {uri: url, team: 'away', name: name, clubId: awayTeamId},
      ];
    }
    return [homeImageUrls, awayImageUrls];
  } catch (error) {
    throw new Error(error.message);
  }
}
