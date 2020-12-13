import React, {useContext, useEffect, useState} from 'react';
import {Text, View} from 'react-native';

export default function Match({navigation, route}) {
  console.log(route.params.matchInfo);

  return (
    <View>
      <Text>hello from matches</Text>
    </View>
  );
}
