import React, {useContext, useEffect} from 'react';
import {View, Text} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AppNavStack} from '../index';
import {verticalScale, ScaledSheet} from 'react-native-size-matters';
import {RouteProp} from '@react-navigation/native';
import {ArticlesContext} from '../../context/articlesContext';
import {TEXT_STYLES} from '../../utils/designSystem';
import analytics from '@react-native-firebase/analytics';

type ScreenNavigationProp = StackNavigationProp<AppNavStack, 'Help Article'>;
type ScreenRouteProp = RouteProp<AppNavStack, 'Help Article'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
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

export default function HelpArticle({navigation, route}: Props) {
  const articleId = route.params.id;
  const articlesContext = useContext(ArticlesContext);
  const selectedArticle = articlesContext.articles.filter(
    (article) => article.sys.id === articleId,
  );
  const article = selectedArticle[0].fields;

  useEffect(() => {
    analytics().logSelectContent({
      content_type: 'help_article',
      item_id: articleId,
    });
  }, [articleId]);

  return (
    <View>
      <Text style={TEXT_STYLES.display4}>{article.title}</Text>
    </View>
  );
}
