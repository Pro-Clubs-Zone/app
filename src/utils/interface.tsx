import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
export type CollectionReference = FirebaseFirestoreTypes.CollectionReference;
export type DocumentReference = FirebaseFirestoreTypes.DocumentReference;
export type DocumentData = FirebaseFirestoreTypes.DocumentData;
export type DocumentSnapshot = FirebaseFirestoreTypes.DocumentSnapshot;
export type Timestamp = FirebaseFirestoreTypes.Timestamp;

export interface SectionListInt {
  title: string;
  data: {}[];
}

export interface MyRequests extends SectionListInt {
  data: MyRequestData[];
}

export interface MyRequestData {
  clubId: string;
  clubName: string;
  accepted: boolean;
  leagueId: string;
  leagueName: string;
}

export interface ClubRequestInt extends SectionListInt {
  data: PlayerRequestData[];
}

export interface LeagueRequestInt extends SectionListInt {
  data: ClubRequestData[];
}

export interface PlayerRequestData extends ClubRosterMember {
  leagueId: string;
  username: string;
  playerId: string;
  clubId: string;
}

export interface ClubRequestData extends ClubInt {
  clubId: string;
  leagueId: string;
}

export interface LeagueInt {
  name: any;
  description: string;
  platform: string;
  teamNum: number;
  matchNum: number;
  adminId: string;
  private: boolean;
  scheduled: boolean;
  created: Timestamp;
  clubs?: {
    [club: string]: ClubInt;
  };
}

export interface ClubRosterMember {
  accepted: boolean;
  username: string;
}
export interface ClubInt {
  name: string;
  managerId: string;
  accepted: boolean;
  roster: {
    [uid: string]: ClubRosterMember;
  };
  created: Timestamp;
}

export interface UserLeague {
  clubId?: string;
  manager: boolean;
  admin?: boolean;
  accepted?: boolean;
}

export interface UserDataInt {
  username: string;
  leagues: {
    [league: string]: UserLeague;
  };
}

export interface AppContextInt {
  userData: UserDataInt;
  userLeagues: {
    [league: string]: LeagueInt;
  };
}
