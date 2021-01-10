import React from 'react';
import {Text, View, Pressable} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {verticalScale, ScaledSheet} from 'react-native-size-matters';
import {APP_COLORS, TEXT_STYLES} from '../utils/designSystem';

interface OneLineProps {
  title: string;
  key1?: string;
  key2?: string;
  // img,
  // flag,
  onPress?: () => void;
  leftIcon?: string;
  rightIcon?: string;
  onIconPress?: () => void;
  iconColor?: APP_COLORS;
  keyColor?: APP_COLORS;
  highlighted?: boolean;
  large?: boolean;
}

interface TwoLineProps extends OneLineProps {
  value?: string;
  sub: string;
  iconCustomColor?: string;
  iconCustom?: string;
  disabled?: boolean;
  rightDefaultIcon?: boolean;
}

type ListHeadingProps = {
  col1?: string;
  col2?: string;
  col3?: string;
  col4?: string;
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
  leftIcon,
  rightIcon,
  onIconPress,
  iconColor,
  keyColor,
  highlighted,
  large,
}: OneLineProps) => (
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
        {leftIcon && (
          <View style={styles.leftIcon}>
            <Icon
              name={leftIcon}
              size={verticalScale(24)}
              color={iconColor ? iconColor : APP_COLORS.Gray}
              onPress={onIconPress}
            />
          </View>
        )}
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

      {rightIcon && (
        <View style={styles.rightIcon}>
          <Icon
            name={rightIcon}
            size={verticalScale(24)}
            color={iconColor ? iconColor : APP_COLORS.Gray}
            onPress={onIconPress}
          />
        </View>
      )}
    </View>
  </Pressable>
);

//---------- Two Line List Item ----------//

export const TwoLine = (props: TwoLineProps) => (
  <Pressable onPress={props.onPress} disabled={props.disabled}>
    <View style={styles.listBg}>
      <View
        style={{
          flexDirection: 'row',
          flex: 1,
        }}>
        {/*
          (props.flag || props.flagSource) && (
            <CountryFlag
              country={props.flag}
              flagSource={props.flagSource}
              ripple={false}
              containerSize={verticalScale(40)}
              containerStyle={{
                marginRight: verticalScale(24)
              }}
            />
            )*/}
        {/* props.img && (
            <View
              style={{
                width: verticalScale(36),
                marginRight: verticalScale(16)
              }}
            >
              <Image
                source={props.img}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
            ) */}
        <View
          style={{
            justifyContent: 'center',
            flex: 1,
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}>
            <Text
              style={[
                TEXT_STYLES.body,
                {
                  color: props.highlighted
                    ? APP_COLORS.Accent
                    : props.disabled
                    ? APP_COLORS.Gray
                    : APP_COLORS.Light,
                  fontWeight: 'bold',
                },
              ]}>
              {props.title}
            </Text>
            {/* props.time && (
                <View
                  style={
                    {
                      //   marginLeft: verticalScale(16),
                    }
                  }
                >
                  <Text
                    style={[
                      TEXT_STYLES.caption,
                      {
                        textAlign: "right"
                        //     flex: 1
                      }
                    ]}
                  >
                    {props.time}
                  </Text>
                </View>
              )
                */}
          </View>
          <Text
            numberOfLines={1}
            style={[
              TEXT_STYLES.caption,
              {
                color: props.highlighted ? APP_COLORS.Accent : APP_COLORS.Gray,
              },
            ]}>
            {props.sub}
          </Text>
        </View>
      </View>
      <View
        style={{
          justifyContent: 'flex-end',
        }}>
        <Text
          style={[
            TEXT_STYLES.body,
            {
              textAlign: 'right',
              fontWeight: 'bold',
              color: APP_COLORS.Accent,
            },
          ]}>
          {props.value}
        </Text>
      </View>
      {props.rightDefaultIcon || props.iconCustom ? (
        <View style={styles.twoLineIcon}>
          <Icon
            name={props.iconCustom ? props.iconCustom : 'chevron-right'}
            size={verticalScale(24)}
            color={
              props.iconCustomColor ? props.iconCustomColor : APP_COLORS.Light
            }
          />
        </View>
      ) : null}
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
  rightIcon: {
    marginLeft: '16@vs',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftIcon: {
    marginRight: '16@vs',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
