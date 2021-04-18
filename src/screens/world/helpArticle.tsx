import React, {useContext} from 'react';
import {View, Text, ScrollView, useWindowDimensions} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AppNavStack} from '../index';
import {verticalScale, ScaledSheet} from 'react-native-size-matters';
import {RouteProp} from '@react-navigation/native';
import {ArticlesContext} from '../../context/articlesContext';
import {TEXT_STYLES} from '../../utils/designSystem';
import analytics from '@react-native-firebase/analytics';
import {documentToHtmlString} from '@contentful/rich-text-html-renderer';
import {Document} from '@contentful/rich-text-types';
import HTML from 'react-native-render-html';
import {TwoLine} from '../../components/listItems';

type ScreenNavigationProp = StackNavigationProp<AppNavStack, 'Help Article'>;
type ScreenRouteProp = RouteProp<AppNavStack, 'Help Article'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

export default function HelpArticle({navigation, route}: Props) {
  const articleId = route.params.id;
  const articlesContext = useContext(ArticlesContext);
  const viewedArticle = articlesContext.articles.filter(
    (article) => article.sys.id === articleId,
  );
  const article = viewedArticle[0].fields;
  const html = documentToHtmlString((article.body as unknown) as Document);
  console.log(html);

  const related = article.related;
  const windowWidth = useWindowDimensions().width;

  const onSelectRelated = async (id: string) => {
    const selectedArticle = related.filter(
      (relatedArticle) => relatedArticle.sys.id === id,
    );

    const newArticleList = [...articlesContext.articles, ...selectedArticle];

    articlesContext.setArticles(newArticleList);
    await analytics().logSelectContent({
      content_type: 'help_article',
      item_id: id,
    });
    navigation.push('Help Article', {
      id,
    });
  };

  return (
    <ScrollView
      style={{
        padding: verticalScale(16),
      }}>
      <Text style={TEXT_STYLES.display4}>{article.title}</Text>
      <HTML
        source={{html}}
        contentWidth={windowWidth}
        baseFontStyle={{fontSize: verticalScale(14), color: 'white'}}
      />
      <View>
        {related &&
          related.map((relatedArticle) => (
            <TwoLine
              key={relatedArticle.sys.id}
              title={relatedArticle.fields.title}
              sub={relatedArticle.fields.tags.join(', ')}
              onPress={() => onSelectRelated(relatedArticle.sys.id)}
            />
          ))}
      </View>
    </ScrollView>
  );
}
