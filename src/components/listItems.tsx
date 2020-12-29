import React from 'react';
import {Text, View, Pressable} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {verticalScale, ScaledSheet} from 'react-native-size-matters';
import {APP_COLORS, TEXT_STYLES} from '../utils/designSystem';

type ListItemProps = {
  title: string;
  key1?: string;
  key2?: string;
  // img,
  // flag,
  onPress: () => void;
  icon?: string;
  onIconPress?: () => void;
  iconColor?: APP_COLORS;
  keyColor?: APP_COLORS;
  highlighted?: boolean;
  large?: boolean;
};

type ListHeadingProps = {
  [col: string]: string;
};

//---------- List Heading ----------//

export const ListHeading = ({col1, col2, col3, col4}: ListHeadingProps) => (
  <View style={styles.listHeading}>
    <View
      style={{
        flexDirection: 'row',
      }}>
      <View
        style={{
          marginRight: verticalScale(16),
        }}>
        <Text style={TEXT_STYLES.caption}>{col1}</Text>
      </View>
      <Text style={TEXT_STYLES.caption}>{col2}</Text>
    </View>
    <View
      style={{
        flexDirection: 'row',
        marginRight: col4 ? null : verticalScale(40),
      }}>
      <Text
        style={[
          TEXT_STYLES.caption,
          {
            textAlign: 'right',
          },
        ]}>
        {col3}
      </Text>
      {col4 && (
        <View
          style={{
            marginLeft: verticalScale(16),
          }}>
          <Text
            style={[
              TEXT_STYLES.caption,
              {
                textAlign: 'right',
              },
            ]}>
            {col4}
          </Text>
        </View>
      )}
    </View>
  </View>
);

//---------- List Separator ----------//

export const ListSeparator = () => (
  <View
    style={{
      borderBottomWidth: verticalScale(1),
      borderBottomColor: APP_COLORS.Primary,
    }}
  />
);

//---------- One Line List Item ----------//

export const OneLine = ({
  title,
  key1,
  key2,
  // img,
  // flag,
  onPress,
  icon,
  onIconPress,
  iconColor,
  keyColor,
  highlighted,
  large,
}: ListItemProps) => (
  <Pressable onPress={onPress}>
    <View
      style={[
        styles.listBg,
        {
          height: !large ? verticalScale(56) : verticalScale(72),
        },
      ]}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        {icon && (
          <View style={styles.oneLineIcon}>
            <Icon
              name={icon}
              size={verticalScale(24)}
              color={iconColor ? iconColor : APP_COLORS.Gray}
              onPress={onIconPress}
            />
          </View>
        )}
        {/* img && (
          <View>
            <Image
              source={img}
              style={{
                width: !large ? verticalScale(24) : verticalScale(36),
                height: !large ? verticalScale(24) : verticalScale(36),
                marginRight: verticalScale(16),
              }}
            />
          </View>
            )*/}
        {/* flag && (
          <CountryFlag
            containerSize={verticalScale(24)}
            containerStyle={{
              marginRight: verticalScale(16),
            }}
            country={flag}
            ripple={false}
          />
        ) */}
        <Text
          style={[
            TEXT_STYLES.body,
            {
              color: highlighted ? APP_COLORS.Accent : APP_COLORS.Light,
            },
          ]}>
          {title}
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
        }}>
        <Text
          style={[
            TEXT_STYLES.body,
            {
              textAlign: 'right',
              fontWeight: 'bold',
            },
          ]}>
          {key1}
        </Text>
        {key2 && (
          <View
            style={{
              marginLeft: verticalScale(16),
            }}>
            <Text
              style={[
                TEXT_STYLES.body,
                {
                  textAlign: 'right',
                  fontWeight: 'bold',
                  color: keyColor ? keyColor : APP_COLORS.Accent,
                },
              ]}>
              {key2}
            </Text>
          </View>
        )}
        {/* icon && (
          <View style={styles.oneLineIcon}>
            <Icon
              name={icon}
              size={verticalScale(24)}
              color={iconColor ? iconColor : APP_COLORS.Gray}
              onPress={onIconPress}
            />
          </View>
        ) */}
      </View>
    </View>
  </Pressable>
);

//---------- Stylesheet ----------//

const styles = ScaledSheet.create({
  listBg: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '16@vs',
    backgroundColor: APP_COLORS.Dark,
    height: '72@vs',
    alignItems: 'center',
  },
  flagBig: {
    width: '36@vs',
    flex: 1,
  },
  image: {
    flex: 1,
    width: '100%',
  },
  listHeading: {
    height: '48@vs',
    padding: '16@vs',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: APP_COLORS.Primary,
  },
  listSeparator: {
    borderBottomWidth: 1,
    borderBottomColor: APP_COLORS.Primary,
  },
  twoLineIcon: {
    width: '24@vs',
    height: '48@vs',
    marginLeft: '16@vs',
    justifyContent: 'center',
    alignItems: 'center',
  },
  oneLineIcon: {
    marginRight: '16@vs',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
