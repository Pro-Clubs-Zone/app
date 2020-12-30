import {Text, View, TextInput, Pressable, Platform} from 'react-native';
import React, {useRef, useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {APP_COLORS, TEXT_STYLES} from '../utils/designSystem';
import {verticalScale, ScaledSheet} from 'react-native-size-matters';

type Props = React.ComponentProps<typeof TextInput> &
  React.ComponentProps<typeof Pressable> & {
    label: string;
    placeholder: string;
    error?: boolean;
    helper?: string;
    fieldIco?: string;
    maxHeight?: number;
    customStyles?: {};
    onPressIcon?: () => void;
  };

const TextField = (props: Props) => {
  const [style, setStyle] = useState<any>(styles.fieldNormal);
  const [height, setHeight] = useState(0);

  const inputRef = useRef(null);

  return (
    <Pressable
      onPress={
        props.onPress
          ? props.onPress
          : props.disabled
          ? null
          : () => {
              inputRef.current.focus();
            }
      }>
      <View
        style={{
          marginBottom: verticalScale(16),
        }}>
        <View
          style={[
            style,
            props.error && styles.fieldError,
            {
              height: props.multiline
                ? Math.max(verticalScale(128), height)
                : verticalScale(48),
              backgroundColor: props.disabled
                ? 'rgba(61, 62, 77, 0.4)'
                : APP_COLORS.Primary,
              maxHeight: props.maxHeight ? props.maxHeight : null,
              ...props.customStyles,
            },
          ]}>
          <View
            style={{
              flex: 1,
              position: 'absolute',
              paddingHorizontal: verticalScale(8),
              top: verticalScale(2),
            }}>
            <Text style={[TEXT_STYLES.small, styles.fieldLabel]}>
              {props.label}
            </Text>
          </View>
          <View style={{flex: 1}}>
            <View
              pointerEvents={
                props.onPress
                  ? Platform.OS === 'ios'
                    ? 'none'
                    : 'auto'
                  : 'auto'
              }
              style={{
                flex: 1,
                marginTop: verticalScale(24),
                marginBottom: Platform.OS === 'android' ? verticalScale(4) : 0,
              }}>
              <TextInput
                {...props}
                ref={inputRef}
                style={[
                  TEXT_STYLES.body,
                  {
                    height:
                      props.multiline && Platform.OS === 'ios'
                        ? Math.max(verticalScale(128), height)
                        : null,
                    padding: 0,
                    lineHeight: null,
                    maxHeight: props.maxHeight
                      ? props.maxHeight - verticalScale(40)
                      : null,
                  },
                ]}
                placeholderTextColor={APP_COLORS.Gray}
                onFocus={() =>
                  setStyle([styles.fieldNormal, styles.fieldFocus])
                }
                onEndEditing={() => setStyle(styles.fieldNormal)}
                underlineColorAndroid="transparent"
                onContentSizeChange={(event) => {
                  setHeight(
                    event.nativeEvent.contentSize.height + verticalScale(40),
                  );
                }}
                keyboardAppearance="dark"
              />
            </View>
          </View>
          {props.fieldIco && !props.disabled && (
            <View
              style={{
                width: verticalScale(32),
                justifyContent: 'center',
                alignItems: 'flex-end',
              }}>
              <Icon
                name={props.fieldIco}
                size={verticalScale(24)}
                color={APP_COLORS.Gray}
                onPress={props.onPressIcon}
              />
            </View>
          )}
        </View>
        {props.helper || props.error ? (
          <View
            style={{
              paddingHorizontal: verticalScale(8),
              height: verticalScale(20),
              justifyContent: 'flex-end',
            }}>
            {props.error ? (
              <Text
                style={[
                  TEXT_STYLES.small,
                  {
                    color: APP_COLORS.Red,
                  },
                ]}>
                {props.error}
              </Text>
            ) : (
              <Text style={[TEXT_STYLES.small, styles.fieldHelper]}>
                {props.helper}
              </Text>
            )}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
};

const styles = ScaledSheet.create({
  fieldNormal: {
    backgroundColor: APP_COLORS.Primary,
    height: '48@vs',
    borderWidth: 1,
    borderColor: APP_COLORS.Secondary,
    borderRadius: '2@vs',
    paddingHorizontal: '8@vs',
    flexDirection: 'row',
  },
  fieldFocus: {
    borderColor: APP_COLORS.Accent,
  },
  fieldError: {
    borderColor: APP_COLORS.Red,
  },
  fieldLabel: {
    color: APP_COLORS.Gray,
  },
  fieldHelper: {
    color: APP_COLORS.Gray,
  },
});

export default TextField;
