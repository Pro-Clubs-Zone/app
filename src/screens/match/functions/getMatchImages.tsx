import {FirebaseStorageTypes} from '@react-native-firebase/storage';
import {ImageURISource} from 'react-native';

export default async function getMatchImages(
  homeRef: FirebaseStorageTypes.Reference,
  awayRef: FirebaseStorageTypes.Reference,
) {
  let homeImageUrls: Array<ImageURISource & {team: string; name: string}> = [];
  let awayImageUrls: Array<ImageURISource & {team: string; name: string}> = [];

  try {
    let [homeTeamImages, awayTeamImages] = await Promise.all([
      homeRef.listAll(),
      awayRef.listAll(),
    ]);

    for (const itemRef of homeTeamImages.items) {
      const url = await itemRef.getDownloadURL();
      const name = itemRef.name;
      homeImageUrls = [...homeImageUrls, {uri: url, team: 'home', name: name}];
    }

    for (const itemRef of awayTeamImages.items) {
      const url = await itemRef.getDownloadURL();
      const name = itemRef.name;
      awayImageUrls = [...awayImageUrls, {uri: url, team: 'away', name: name}];
    }
    return [homeImageUrls, awayImageUrls];
  } catch (error) {
    throw new Error(error.message);
  }
}
