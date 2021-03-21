import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
export type CollectionReference = FirebaseFirestoreTypes.CollectionReference;
export type DocumentReference = FirebaseFirestoreTypes.DocumentReference;
export type DocumentData = FirebaseFirestoreTypes.DocumentData;
export type DocumentSnapshot = FirebaseFirestoreTypes.DocumentSnapshot;
export type Timestamp = FirebaseFirestoreTypes.Timestamp;

export interface PlayerStats {
  goals: number;
  assists: number;
  motm: number;
  matches: number;
  club: string;
  clubId: string;
}

export interface FixtureList extends IFlatList {
  data: IMatchNavData;
}

export interface ILeagueProps {
  isAdmin: boolean;
  newLeague: boolean;
}

export interface IMatchNavData extends IMatch {
  matchId: string;
  leagueName: string;
  homeTeamName: string;
  clubId: string;
  leagueId: string;
  manager: boolean;
  awayTeamName: string;
  admin: boolean;
}

export interface IMatch {
  awayTeamId: string;
  homeTeamId: string;
  id: number;
  submissions?: {
    [team: string]: {
      [team: string]: number;
    };
  };
  teams?: [string, string];
  published: boolean;
  conflict: boolean;
  result?: {[team: string]: number};
}

export interface ISectionList {
  title: string;
  data: {}[];
}

export interface IFlatList {
  id: string;
  data: {};
}

export interface IMyRequests extends ISectionList {
  data: ISentRequest[];
}

export interface ISentRequest {
  clubId: string;
  clubName: string;
  accepted: boolean;
  leagueId: string;
  leagueName: string;
  playerId?: string;
}

export interface IClubRequest extends ISectionList {
  data: IPlayerRequestData[];
}

export interface ILeagueRequest extends ISectionList {
  data: IClubRequestData[];
}

export interface IPlayerRequestData extends IClubRosterMember {
  leagueId: string;
  playerId: string;
  clubId: string;
}

export interface IClubRequestData extends IClub {
  clubId: string;
  leagueId: string;
  managerId: string;
}

export interface ILeague {
  adminUsername: string;
  name: string;
  description?: string;
  discord?: string;
  twitter?: string;
  platform: 'ps' | 'xb';
  teamNum: number;
  acceptedClubs: number;
  matchNum: number;
  adminId: string;
  private: boolean;
  scheduled: boolean;
  created: Timestamp;
  clubs?: {
    [club: string]: IClub;
  };
  conflictMatchesCount: 0;
}

export interface IClubRosterMember {
  accepted: boolean;
  username: string;
}
export interface IClub {
  name: string;
  managerId: string;
  accepted: boolean;
  managerUsername: string;
  roster: {
    [uid: string]: IClubRosterMember;
  };
  created: Timestamp;
}

export interface IUserLeague {
  clubId?: string;
  manager: boolean;
  admin?: boolean;
  accepted?: boolean;
  clubName?: string;
}

export interface IUser {
  username: string;
  premium: boolean;
  adminConflictCounts?: number;
  leagues?: {
    [league: string]: IUserLeague;
  };
}

export interface IClubStanding {
  name: string;
  played: number;
  won: number;
  lost: number;
  draw: number;
  points: number;
  scored: number;
  conceded: number;
}

export interface UserInfo {
  email: string;
  password: string;
  username: string;
}
