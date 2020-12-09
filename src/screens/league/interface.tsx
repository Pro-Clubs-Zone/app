import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
export type CollectionReference = FirebaseFirestoreTypes.CollectionReference;
export type DocumentReference = FirebaseFirestoreTypes.DocumentReference;
export type DocumentData = FirebaseFirestoreTypes.DocumentData;
export type DocumentSnapshot = FirebaseFirestoreTypes.DocumentSnapshot;
export type Timestamp = FirebaseFirestoreTypes.Timestamp;

export interface League {
  name: any;
  description: string;
  platform: string;
  teamNum: number;
  matchNum: number;
  admin: string;
  private: boolean;
  scheduled: boolean;
  created: Timestamp;
}

export interface Club {
  name: string;
  managerId: string;
  accepted: boolean;
  roster: {
    [uid: string]: boolean;
  };
  created: Timestamp;
}

export interface UserLeague {
  club?: string;
  manager?: boolean;
  admin?: boolean;
  accepted?: boolean;
}
