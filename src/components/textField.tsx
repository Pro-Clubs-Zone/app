import {Text, View, TextInput, Pressable, Platform} from 'react-native';
import React, {useRef, useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {APP_COLORS, TEXT_STYLES} from '../utils/designSystem';
import {verticalScale, ScaledSheet} from 'react-native-size-matters';

type Props = React.ComponentProps<typeof TextInput> &
  React.ComponentProps<typeof Pressable> & {
    label: string;
    placeholder: string;
    error?: string;
    helper?: string;
    fieldIco?: string;
    maxHeight?: number;
    customStyles?: {};
    onPressIcon?: () => void;
  };

const TextField = ({
  label,
  helper,
  fieldIco,
  maxHeight,
  customStyles,
  onPress,
  onPressIcon,
  error,
  ...props
}: Props) => {
  const [style, setStyle] = useState<any>(styles.fieldNormal);
  const [height, setHeight] = useState(0);

  const inputRef = useRef(null);

  return (
    <Pressable
      onPress={
        onPress
          ? onPress
          : props.editable
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
            error && styles.fieldError,
            {
              height: props.multiline
                ? Math.max(verticalScale(128), height)
                : verticalScale(48),
              backgroundColor: props.editable
                ? 'rgba(61, 62, 77, 0.4)'
                : APP_COLORS.Primary,
              maxHeight: maxHeight ? maxHeight : null,
              ...customStyles,
            },
          ]}>
          <View
            style={{
              flex: 1,
              position: 'absolute',
              paddingHorizontal: verticalScale(8),
              top: verticalScale(2),
            }}>
            <Text style={[TEXT_STYLES.small, styles.fieldLabel]}>{label}</Text>
          </View>
          <View style={{flex: 1}}>
            <View
              pointerEvents={
                onPress ? (Platform.OS === 'ios' ? 'none' : 'auto') : 'auto'
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
                    maxHeight: maxHeight ? maxHeight - verticalScale(40) : null,
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
          {fieldIco && !props.editable && (
            <View
              style={{
                width: verticalScale(32),
                justifyContent: 'center',
                alignItems: 'flex-end',
              }}>
              <Icon
                name={fieldIco}
                size={verticalScale(24)}
                color={APP_COLORS.Gray}
                onPress={onPressIcon}
              />
            </View>
          )}
        </View>
        {helper || error ? (
          <View
            style={{
              paddingHorizontal: verticalScale(8),
              height: verticalScale(20),
              justifyContent: 'flex-end',
            }}>
            {error ? (
              <Text
                style={[
                  TEXT_STYLES.small,
                  {
                    color: APP_COLORS.Red,
                  },
                ]}>
                {error}
              </Text>
            ) : (
              <Text style={[TEXT_STYLES.small, styles.fieldHelper]}>
                {helper}
              </Text>
            )}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
};

export const MatchTextField = ({
  error,
  ...props
}: {error: boolean} & React.ComponentProps<typeof TextInput>) => {
  const [style, setStyle] = useState<any>(styles.fieldNormal);
  const inputRef = useRef(null);

  return (
    <Pressable
      onPress={
        props.editable
          ? null
          : () => {
              inputRef.current.focus();
            }
      }>
      <View style={[style, styles.matchField, error && styles.fieldError]}>
        <TextInput
          {...props}
          ref={inputRef}
          style={[
            TEXT_STYLES.body,
            {
              lineHeight: 0,
            },
          ]}
          placeholder="0"
          placeholderTextColor={APP_COLORS.Gray}
          onFocus={() => setStyle([styles.fieldNormal, styles.fieldFocus])}
          onEndEditing={() => setStyle(styles.fieldNormal)}
          underlineColorAndroid="transparent"
          autoCorrect={false}
          keyboardAppearance="dark"
          keyboardType={'number-pad'}
          maxLength={2}
        />
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
  matchField: {
    height: '40@vs',
    width: '36@vs',
    justifyContent: 'center',
    alignItems: 'center',
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
