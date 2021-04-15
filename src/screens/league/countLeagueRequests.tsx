import {IUserLeague, IClubRequest, ILeagueRequest} from '../../utils/interface';

const countLeagueRequests = (
  leagues: ILeagueRequest[],
  clubs: IClubRequest[],
  userLeague: IUserLeague,
  leagueName: string,
) => {
  let requestCount: [number, number] = [0, 0];

  const leagueRequests = leagues.filter(
    (league) => league.title === leagueName,
  );

  if (userLeague.manager) {
    const clubRequests = clubs.filter(
      (club) => club.title === `${userLeague.clubName} / ${leagueName}`,
    );

    if (clubRequests.length !== 0) {
      requestCount[0] = clubRequests[0].data.length;
    }
  }

  if (leagueRequests.length !== 0) {
    requestCount[1] = leagueRequests[0].data.length;
  }

  return requestCount;
};

export default countLeagueRequests;
