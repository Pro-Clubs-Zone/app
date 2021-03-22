import firestore from '@react-native-firebase/firestore';
import {ILeague} from '../utils/interface';
import analytics from '@react-native-firebase/analytics';

const createLeague = async (data: ILeague, uid: string, username: string) => {
  const db = firestore();
  const batch = db.batch();
  const leagueRef = db.collection('leagues').doc();
  const userRef = db.collection('users').doc(uid);
  const dataWithTimestamp: ILeague = {
    ...data,
    name: data.name.trim(),
    adminId: uid,
    adminUsername: username,
    description: data.description.trim(),
    created: firestore.Timestamp.now(),
  };
  batch.set(leagueRef, dataWithTimestamp);
  batch.set(
    userRef,
    {
      leagues: {
        [leagueRef.id]: {
          admin: true,
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
