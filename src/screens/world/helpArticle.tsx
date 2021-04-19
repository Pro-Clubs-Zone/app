import React, {useContext} from 'react';
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  Pressable,
  StyleSheet,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AppNavStack} from '../index';
import {verticalScale} from 'react-native-size-matters';
import {RouteProp} from '@react-navigation/native';
import {ArticlesContext} from '../../context/articlesContext';
import {APP_COLORS, TEXT_STYLES} from '../../utils/designSystem';
import analytics from '@react-native-firebase/analytics';
import {documentToHtmlString} from '@contentful/rich-text-html-renderer';
import {Document} from '@contentful/rich-text-types';
import HTML from 'react-native-render-html';
import {ListHeading} from '../../components/listItems';

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
      contentContainerStyle={{
        paddingBottom: verticalScale(24),
      }}>
      <View
        style={{
          padding: verticalScale(16),
        }}>
        <Text
          style={[
            TEXT_STYLES.display4,
            {
              color: APP_COLORS.Accent,
              marginBottom: verticalScale(16),
            },
          ]}>
          {article.title}
        </Text>
        <HTML
          source={{html}}
          contentWidth={windowWidth - verticalScale(16)}
          baseFontStyle={TEXT_STYLES.body}
          tagsStyles={{
            p: {marginBottom: verticalScale(16)},
            ul: {paddingLeft: verticalScale(4)},
            hr: {
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: APP_COLORS.Secondary,
              marginBottom: verticalScale(12),
            },
            a: {
              color: APP_COLORS.Accent,
            },
          }}
          listsPrefixesRenderers={{
            ol: (_htmlAttribs, _children, _convertedCSSStyles, passProps) => (
              <Text
                style={[
                  TEXT_STYLES.body,
                  {
                    fontWeight: 'bold',
                    color: APP_COLORS.Accent,
                    marginRight: verticalScale(4),
                  },
                ]}>
                {passProps.index + 1}.
              </Text>
            ),
          }}
        />
      </View>
      {related && (
        <>
          <ListHeading col1="Related Articles" />
          <View
            style={{
              padding: verticalScale(16),
            }}>
            {related.map((relatedArticle) => (
              <RelatedArticle
                key={relatedArticle.sys.id}
                title={relatedArticle.fields.title}
                tags={relatedArticle.fields.tags.join(', ')}
                onPress={() => onSelectRelated(relatedArticle.sys.id)}
              />
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const RelatedArticle = ({
  title,
  tags,
  onPress,
}: {
  title: string;
  tags: string;
  onPress: () => void;
}) => (
  <Pressable onPress={onPress}>
    <View
      style={{
        padding: verticalScale(12),
        borderRadius: 3,
        borderColor: APP_COLORS.Secondary,
        borderWidth: 1,
      }}>
      <Text
        style={[
          TEXT_STYLES.display5,
          {
            marginBottom: verticalScale(4),
            color: APP_COLORS.Accent,
          },
        ]}>
        {title}
      </Text>
      <Text style={TEXT_STYLES.caption}>{tags}</Text>
    </View>
  </Pressable>
);
