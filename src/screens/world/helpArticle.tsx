import React, {useContext} from 'react';
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  Pressable,
  StyleSheet,
  Image,
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

  const images = article.images;

  const related = article.related;
  const windowWidth = useWindowDimensions().width;

  console.log(html);

  const onSelectRelated = async (id: string) => {
    const selectedArticle = related.filter(
      (relatedArticle) => relatedArticle.sys.id === id,
    );

    const newArticleList = [...articlesContext.articles, ...selectedArticle];

    articlesContext.setArticles(newArticleList);
    await analytics().logEvent('help_article', {
      name: selectedArticle[0].fields.title,
      id: id,
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
          paddingHorizontal: verticalScale(16),
          paddingTop: verticalScale(16),
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
          containerStyle={{
            marginBottom: verticalScale(-16),
          }}
          baseFontStyle={TEXT_STYLES.body}
          tagsStyles={{
            h2: {
              ...TEXT_STYLES.display5,
              color: APP_COLORS.Accent,
              marginVertical: verticalScale(8),
            },
            p: {marginBottom: verticalScale(8)},
            ul: {
              paddingLeft: verticalScale(4),
            },
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
            ul: (_htmlAttribs, _children, _convertedCSSStyles, passProps) => {
              return (
                <View
                  style={{
                    marginRight: verticalScale(8),
                    width: verticalScale(4),
                    height: verticalScale(4),
                    marginTop: verticalScale(8),
                    backgroundColor: APP_COLORS.Accent,
                    borderRadius: 10,
                  }}
                />
              );
            },
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
        {images?.length && (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            {images.map((image) => (
              <Image
                source={{
                  uri: 'https:' + image.fields.file.url,
                  width: image.fields.file.details.image.width,
                  height: image.fields.file.details.image.height,
                }}
                height={image.fields.file.details.image.height}
                width={image.fields.file.details.image.width}
                key={image.sys.id}
                style={{
                  resizeMode: 'contain',
                  width: '100%',
                }}
              />
            ))}
          </View>
        )}
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
        marginBottom: verticalScale(16),
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
