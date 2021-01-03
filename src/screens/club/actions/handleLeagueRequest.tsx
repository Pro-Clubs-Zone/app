import firestore from '@react-native-firebase/firestore';
import {IClubRequestData, ILeagueRequest} from '../../../utils/interface';

const db = firestore();
const batch = db.batch();

const handleLeagueRequest = async (
  data: ILeagueRequest[],
  {clubId, leagueId, managerId}: IClubRequestData,
  sectionTitle: string,
  acceptRequest: boolean,
) => {
  const leagueClubsRef = db
    .collection('leagues')
    .doc(leagueId)
    .collection('clubs');
  const clubRef = leagueClubsRef.doc(clubId);
  const managerRef = db.collection('users').doc(managerId);

  const sectionIndex = data.findIndex(
    (section) => section.title === sectionTitle,
  );

  const unacceptedClubs = data[sectionIndex].data.filter((club) => {
    return club.clubId !== clubId;
  });
  const newData = [...data];
  newData[sectionIndex].data = unacceptedClubs;

  if (unacceptedClubs.length === 0) {
    newData.splice(sectionIndex, 1);
  }

  if (acceptRequest) {
    batch.update(clubRef, {
      accepted: true,
    });

    batch.update(managerRef, {
      ['leagues.' + leagueId + '.accepted']: true,
    });
  }

  await batch.commit();

  return newData;
};

export default handleLeagueRequest;
