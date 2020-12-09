import React, {useContext, useEffect, useState} from 'react';
import {Text, View, Button} from 'react-native';
import {AppContext, AuthContext} from '../../utils/context';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';

const db = firestore();
const Tab = createMaterialTopTabNavigator();

export default function Requests({navigation}) {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Club" component={ClubRequests} />
      <Tab.Screen name="League" component={LeagueRequests} />
      <Tab.Screen name="Sent" component={MyRequests} />
    </Tab.Navigator>
  );
}

function ClubRequests() {
  return (
    <View>
      <Text>Club Requests</Text>
    </View>
  );
}

function LeagueRequests() {
  return (
    <View>
      <Text>League Requests</Text>
    </View>
  );
}

function MyRequests() {
  return (
    <View>
      <Text>My Requests</Text>
    </View>
  );
}
