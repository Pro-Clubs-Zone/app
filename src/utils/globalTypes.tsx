import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
export type CollectionReference = FirebaseFirestoreTypes.CollectionReference;
export type DocumentReference = FirebaseFirestoreTypes.DocumentReference;
export type DocumentData = FirebaseFirestoreTypes.DocumentData;
export type DocumentSnapshot = FirebaseFirestoreTypes.DocumentSnapshot;
export type Timestamp = FirebaseFirestoreTypes.Timestamp;

export interface RequestInt {
  title: string;
  data: {[key: string]: {}}[];
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

export interface ClubRosterMemberInt {
  accepted: boolean;
  username: string;
}
export interface ClubInt {
  name: string;
  managerId: string;
  accepted: boolean;
  roster: {
    [uid: string]: ClubRosterMemberInt;
  };
  created: Timestamp;
}

export interface UserLeagueInt {
  club?: string;
  manager?: boolean;
  admin?: boolean;
  accepted?: boolean;
}

export interface UserDataInt {
  username: string;
  leagues: {
    [league: string]: UserLeagueInt;
  };
}

export interface AppContextInt {
  userData: UserDataInt;
  userLeagues: {
    [league: string]: LeagueInt;
  };
}
