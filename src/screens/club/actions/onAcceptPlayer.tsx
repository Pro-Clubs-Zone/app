import firestore from '@react-native-firebase/firestore';
import {IClubRequest, IPlayerRequestData} from '../../../utils/interface';

const onAcceptPlayer = async (
  data: IClubRequest[],
  {playerId, clubId, leagueId}: IPlayerRequestData,
  sectionTitle: string,
) => {
  const db = firestore();
  const batch = db.batch();

  const playerRef = db.collection('users').doc(playerId);
  const clubRef = db
    .collection('leagues')
    .doc(leagueId)
    .collection('clubs')
    .doc(clubId);

  // Update Request Context

  const sectionIndex = data.findIndex(
    (section) => section.title === sectionTitle,
  );

  const unacceptedPlayers = data[sectionIndex].data.filter((player) => {
    return player.playerId !== playerId;
  });

  const newData = [...data];
  newData[sectionIndex].data = unacceptedPlayers;

  if (unacceptedPlayers.length === 0) {
    newData.splice(sectionIndex, 1);
  }

  // const currentCount = requestsContext.requestCount;
  // requestsContext.setClubs(newData);
  // requestsContext.setClubCount(currentCount === 1 ? 0 : currentCount - 1);

  // Update App Context

  // const currentLeagueData = {...context.userLeagues};
  // currentLeagueData[leagueId].clubs[clubId].roster[playerId].accepted = true;
  // context.setUserLeagues(currentLeagueData);

  // Update Firebase

  batch.update(clubRef, {
    ['roster.' + playerId + '.accepted']: true,
  });
  batch.update(playerRef, {
    ['leagues.' + leagueId + '.accepted']: true,
  });

  await batch.commit();

  return newData;
};

export default onAcceptPlayer;
