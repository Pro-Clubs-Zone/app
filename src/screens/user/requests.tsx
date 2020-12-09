import React, {useContext, useEffect, useState} from 'react';
import {Text, View, Button} from 'react-native';
import {AppContext, AuthContext, RequestContext} from '../../utils/context';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';

const db = firestore();
const Tab = createMaterialTopTabNavigator();

export default function Requests({navigation}) {
  const requests = useContext(RequestContext);
  //console.log(requests);
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Club"
        component={ClubRequests}
        initialParams={requests.club}
      />
      <Tab.Screen
        name="League"
        component={LeagueRequests}
        initialParams={requests.league}
      />
      <Tab.Screen name="Sent" component={MyRequests} />
    </Tab.Navigator>
  );
}

function ClubRequests({navigation, route}) {
  console.log(route.params);
  return (
    <View>
      <Text>Club Requests</Text>
    </View>
  );
}

function LeagueRequests({navigation, route}) {
  console.log(route.params);
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
