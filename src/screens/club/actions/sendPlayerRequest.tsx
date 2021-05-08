import firestore from '@react-native-firebase/firestore';
import analytics from '@react-native-firebase/analytics';
import {IClubRosterMember, IUserLeague} from '../../../utils/interface';

const sendPlayerRequest = async (
  uid: string,
  username: string,
  leagueId: string,
  userInfo: IUserLeague,
) => {
  const db = firestore();
  const leagueRef = db.collection('leagues').doc(leagueId);
  const leagueClubs = leagueRef.collection('clubs');
  const userRef = db.collection('users').doc(uid);
  const batch = db.batch();
  const clubRef = leagueClubs.doc(userInfo.clubId);

  const rosterMember: {[uid: string]: IClubRosterMember} = {
    [uid as string]: {
      accepted: false,
      username: username,
    },
  };

  batch.set(
    clubRef,
    {
      roster: rosterMember,
    },
    {merge: true},
  );
  batch.set(
    userRef,
    {
      leagues: {
        [leagueId]: userInfo,
      },
    },
    {merge: true},
  );
  try {
    await Promise.all([
      batch.commit(),
      analytics().logJoinGroup({
        group_id: leagueId,
      }),
    ]);
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

export default sendPlayerRequest;
