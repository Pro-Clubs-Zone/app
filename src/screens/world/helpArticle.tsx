import React, {useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AppNavStack} from '../index';
import {verticalScale, ScaledSheet} from 'react-native-size-matters';
import {TwoLine} from '../../components/listItems';
import FullScreenLoading from '../../components/loading';
const {createClient} = require('contentful/dist/contentful.browser.min.js');

type ScreenNavigationProp = StackNavigationProp<AppNavStack, 'Help Article'>;

type Props = {
  navigation: ScreenNavigationProp;
};

type Article = {
  fields: {
    title: string;
    body: string;
    tags: string[];
  };
  metadata: {};
  sys: {
    id: string;
  };
};

export default function HelpArticle({navigation}: Props) {
  return (
    <View>
      <Text>Article</Text>
    </View>
  );
}
