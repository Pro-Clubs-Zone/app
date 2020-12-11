import React, {useContext, useEffect, useState} from 'react';
import {Text, View, Button, SectionList} from 'react-native';
import {AppContext, AuthContext, RequestContext} from '../../utils/context';
import firestore from '@react-native-firebase/firestore';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {
  ClubRequestInt,
  LeagueRequestInt,
  SectionListInt,
} from '../../utils/globalTypes';

const db = firestore();
const Tab = createMaterialTopTabNavigator();

export default function Requests({navigation}) {
  const requests = useContext(RequestContext);
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Club"
        component={ClubRequests}
        initialParams={[requests?.club]}
      />
      <Tab.Screen
        name="League"
        component={LeagueRequests}
        initialParams={[requests?.league]}
      />
      <Tab.Screen name="Sent" component={MyRequests} />
    </Tab.Navigator>
  );
}

function ClubRequests({navigation, route}) {
  const DATA: ClubRequestInt[] = route.params[0];
  return (
    <View>
      <SectionList
        sections={DATA}
        keyExtractor={(item, index) => item + index}
        renderItem={({item}) => <Item title={item.username} />}
        renderSectionHeader={({section: {title}}) => <Text>{title}</Text>}
      />
    </View>
  );
}

function LeagueRequests({navigation, route}) {
  const DATA: LeagueRequestInt[] = route.params[0];
  return (
    <View>
      <SectionList
        sections={DATA}
        keyExtractor={(item, index) => item + index}
        renderItem={({item}) => <Item title={item.name} />}
        renderSectionHeader={({section: {title}}) => <Text>{title}</Text>}
      />
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

const Item = ({title}) => (
  <View>
    <Text>{title}</Text>
  </View>
);
