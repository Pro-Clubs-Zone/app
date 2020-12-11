import React, {useContext, useEffect, useState} from 'react';
import {Text, View, Button, SectionList} from 'react-native';
import {AppContext, AuthContext, RequestContext} from '../../utils/context';
import firestore from '@react-native-firebase/firestore';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {
  ClubRequestInt,
  LeagueRequestInt,
  MyRequests,
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
      <Tab.Screen
        name="Sent"
        component={MySentRequests}
        initialParams={[requests?.myRequests]}
      />
    </Tab.Navigator>
  );
}

function ClubRequests({navigation, route}) {
  const DATA: ClubRequestInt[] = route.params[0];
  console.log(DATA, 'clubs');
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
  console.log(DATA, 'leagues');

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

function MySentRequests({navigation, route}) {
  const DATA: MyRequests[] = route.params[0];
  console.log(DATA);
  return (
    <View>
      <SectionList
        sections={DATA}
        keyExtractor={(item, index) => item + index}
        renderItem={({item}) => <Item title={item.clubName} />}
        renderSectionHeader={({section: {title}}) => <Text>{title}</Text>}
      />
    </View>
  );
}

const Item = ({title}) => (
  <View>
    <Text>{title}</Text>
  </View>
);
