import React from 'react';
import {
  Pressable,
  ImageBackground,
  View,
  Text,
  Dimensions,
  Platform,
} from 'react-native';
import {
  verticalScale,
  ScaledSheet,
  moderateVerticalScale,
} from 'react-native-size-matters';
import {TEXT_STYLES, APP_COLORS, FONT_SIZES} from '../utils/designSystem';
import {Badge} from './elements';

const deviceWidth = Dimensions.get('window').width;
const isIos: boolean = Platform.OS === 'ios';

type CardProps = {
  onPress: () => void;
  title: string;
  subTitle?: string;
  badgeNumber?: number;
};

export const CardSmallContainer = ({children}: {children: JSX.Element[]}) => (
  <View style={{flexDirection: 'row', flex: 1}}>{children}</View>
);

export const CardSmall = ({onPress, title, badgeNumber}: CardProps) => {
  return (
    <Pressable onPress={onPress} style={{flex: 0.5}}>
      <ImageBackground
        style={[
          styles.card,
          {
            height: verticalScale(72),
          },
        ]}
        source={{uri: 'card_overlay'}}
        resizeMode="cover">
        {badgeNumber > 0 && <Badge number={badgeNumber} />}
        <View
          style={{
            justifyContent: 'center',
          }}>
          <Text
            style={[
              TEXT_STYLES.display5,
              {
                fontSize:
                  title.length > 20
                    ? moderateVerticalScale(FONT_SIZES.XXS, 0)
                    : moderateVerticalScale(FONT_SIZES.XS, 0.6),
                lineHeight:
                  title.length > 20 ? verticalScale(16) : verticalScale(20),
              },
            ]}>
            {title.toUpperCase()}
          </Text>
        </View>
      </ImageBackground>
    </Pressable>
  );
};

//---------- Medium Card ----------//

export const CardMedium = ({
  title,
  subTitle,
  onPress,
  badgeNumber,
}: CardProps) => (
  <Pressable
    onPress={onPress}
    style={{
      height: isIos ? verticalScale(128) : verticalScale(140),
    }}>
    <ImageBackground style={[styles.card]} source={{uri: 'card_overlay'}}>
      {badgeNumber > 0 && <Badge number={badgeNumber} />}
      <View>
        <Text style={TEXT_STYLES.display5}>
          {title.replace('<br>', '\n').toUpperCase()}
        </Text>
        {subTitle && (
          <View
            style={{
              marginTop: verticalScale(8),
            }}>
            <Text style={TEXT_STYLES.small}>
              {subTitle.replace('<br>', '\n')}
            </Text>
          </View>
        )}
      </View>
    </ImageBackground>
  </Pressable>
);

//---------- Stylesheet ----------//

const styles = ScaledSheet.create({
  card: {
    backgroundColor: APP_COLORS.Primary,
    padding: '16@vs',
    marginTop: '8@vs',
    marginHorizontal: '4@vs',
    borderRadius: 2,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowRadius: 3,
    shadowOpacity: 0.2,
    flex: 1,
  },
  cardShadow: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowRadius: 3,
    shadowOpacity: 0.2,
  },
  clubLogo: {
    width: '96@vs',
    height: '96@vs',
  },
  profileTags: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    marginTop: '8@vs',
  },
  flagRipple: {
    position: 'absolute',
    zIndex: 2,
    alignSelf: 'center',
    width: deviceWidth,
  },
  leagueFlag: {
    zIndex: 0,
    top: '-48@vs',
    left: '-12@vs',
    position: 'absolute',
    height: '256@vs',
    width: '120%',
    transform: [{rotate: '11deg'}],
  },
  flagmap: {
    zIndex: 0,
    position: 'absolute',
    height: '128@vs',
    width: '120%',
    left: '-24@vs',
  },
  joinLeagueOverlay: {
    position: 'absolute',
    zIndex: 1,
    flex: 1,
    height: '256@vs',
    width: deviceWidth,
  },
  badge: {
    position: 'absolute',
    right: '16@vs',
    top: '16@vs',
    height: '20@vs',
    width: '20@vs',
    borderRadius: '20@vs',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: APP_COLORS.Red,
  },
});
