import React, {useEffect, useState} from 'react';
import {View, FlatList} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AppNavStack} from '../index';
import {verticalScale, ScaledSheet} from 'react-native-size-matters';
import {TwoLine} from '../../components/listItems';
import FullScreenLoading from '../../components/loading';
const {createClient} = require('contentful/dist/contentful.browser.min.js');

type ScreenNavigationProp = StackNavigationProp<AppNavStack, 'Help'>;

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

export default function Help({navigation}: Props) {
  const [data, setData] = useState<Article[]>();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const client = createClient({
      // This is the space ID. A space is like a project folder in Contentful terms
      space: 'wi1z1u1iwrjl',
      // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
      accessToken: 'glmyUCNVQfpdUe-pOpcNdbcn2nhllp-dNhAOu0o8ArY',
    });
    const getArticles = async () => {
      const articles = await client.getEntries();
      let articlesList: Article[] = [];

      for (const article of articles.items) {
        articlesList.push(article);
      }

      setData(articlesList);
      setLoading(false);
    };
    getArticles();
  }, [navigation]);
  return (
    <>
      <FullScreenLoading visible={loading} />
      <FlatList
        data={data}
        keyExtractor={(item) => item.sys.id}
        renderItem={({item}) => (
          <TwoLine
            title={item.fields.title}
            sub={item.fields.tags.join(', ')}
            onPress={() => navigation.navigate('Help Article')}
          />
        )}
      />
    </>
  );
}
