import firestore from '@react-native-firebase/firestore';
import {ILeague} from '../../../utils/interface';
import analytics from '@react-native-firebase/analytics';

const createLeague = async (data: ILeague, uid: string) => {
  const db = firestore();
  const batch = db.batch();
  const leagueRef = db.collection('leagues').doc();
  const userRef = db.collection('users').doc(uid);
  const dataWithTimestamp: ILeague = {
    ...data,
    name: data.name.trim(),
    description: data.description?.trim(),
    created: firestore.Timestamp.now(),
  };
  batch.set(leagueRef, dataWithTimestamp);
  batch.set(
    userRef,
    {
      leagues: {
        [leagueRef.id]: {
          admin: true,
          owner: true,
        },
      },
    },
    {merge: true},
  );
  await batch.commit().then(async () => {
    await analytics().logEvent('create_league', {
      platform: data.platform,
      private: data.private,
    });
  });
  return leagueRef.id;
};

export default createLeague;
