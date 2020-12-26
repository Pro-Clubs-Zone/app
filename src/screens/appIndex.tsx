import React, {useContext} from 'react';
import HomeStack from './user/homeStack';
import LeaguesStack from './user/leaguesStack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {AuthContext} from '../context/authContext';

function AppIndex() {
  const Tab = createBottomTabNavigator();
  const user = useContext(AuthContext);
  if (user) {
    return (
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Leagues" component={LeaguesStack} />
      </Tab.Navigator>
    );
  } else {
    return <LeaguesStack />;
  }
}

export default AppIndex;
