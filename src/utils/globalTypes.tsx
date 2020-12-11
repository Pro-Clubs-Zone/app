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

export interface ClubRequestInt extends SectionListInt {
  data: PlayerRequestData[];
}

export interface LeagueRequestInt extends SectionListInt {
  data: ClubRequestData[];
}

export interface PlayerRequestData extends ClubRosterMember {
  league: string;
  username: string;
  player: string;
  club: string;
}

export interface ClubRequestData extends ClubInt {
  club: string;
  league: string;
}

export interface LeagueInt {
  name: any;
  description: string;
  platform: string;
  teamNum: number;
  matchNum: number;
  admin: string;
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
  club?: string;
  manager?: boolean;
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
