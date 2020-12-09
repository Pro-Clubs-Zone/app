import React, {useContext, useEffect, useState} from 'react';
import {Text, View, Button} from 'react-native';
import {AppContext, AuthContext} from '../../utils/context';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const db = firestore();

export default function Requests({navigation, route}) {
  const clubRequests = route?.params.clubRequests;
  const leagueRequests = route?.params.leagueRequests;
  console.log(clubRequests, leagueRequests);
  return <View></View>;
}
