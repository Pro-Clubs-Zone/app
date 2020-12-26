import React from 'react';
import {Pressable, ImageBackground, View, Text, Dimensions} from 'react-native';
import {verticalScale, ScaledSheet} from 'react-native-size-matters';
import {FONTS, COLORS} from '../utils/designSystem';
import bgOverlay from '../assets/images/bg-overlay.png';

const deviceWidth = Dimensions.get('window').width;

type CardProps = {
  onPress: () => void;
  title: string;
  subTitle?: string;
};

export const CardSmall = ({onPress, title}: CardProps) => {
  return (
    <Pressable onPress={onPress} style={{flex: 0.5}}>
      <ImageBackground
        style={[
          styles.card,
          {
            height: verticalScale(64),
            paddingVertical: verticalScale(12),
          },
        ]}
        source={bgOverlay}
        resizeMode="cover">
        <View pointerEvents="none">
          <Text style={FONTS.display5}>
            {title.replace('<br>', '\n').toUpperCase()}
          </Text>
        </View>
      </ImageBackground>
    </Pressable>
  );
};

//---------- Medium Card ----------//

export const CardMedium = ({title, subTitle, onPress}: CardProps) => (
  <Pressable onPress={onPress} style={{flex: 0.5}}>
    <ImageBackground
      style={[
        styles.card,
        {
          height: verticalScale(104),
        },
      ]}
      source={bgOverlay}>
      <View pointerEvents="none">
        <Text style={FONTS.display5}>
          {title.replace('<br>', '\n').toUpperCase()}
        </Text>
        {subTitle && (
          <View
            style={{
              marginTop: verticalScale(8),
            }}>
            <Text style={FONTS.small}>{subTitle.replace('<br>', '\n')}</Text>
          </View>
        )}
      </View>
    </ImageBackground>
  </Pressable>
);

//---------- Stylesheet ----------//

const styles = ScaledSheet.create({
  card: {
    backgroundColor: COLORS.Primary,
    padding: '16@vs',
    marginTop: '8@vs',
    marginHorizontal: '4@vs',
    borderRadius: '2@vs',
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
});
