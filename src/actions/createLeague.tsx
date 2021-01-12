import firestore from '@react-native-firebase/firestore';
import {ILeague} from '../utils/interface';

const createLeague = async (data: ILeague, uid: string) => {
  const db = firestore();
  const batch = db.batch();
  const leagueRef = db.collection('leagues').doc();
  const userRef = db.collection('users').doc(uid);
  const dataWithTimestamp: ILeague = {
    ...data,
    adminId: uid,
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
  await batch.commit();
  return leagueRef.id;
};

export default createLeague;
