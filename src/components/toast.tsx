import React, {useEffect, useRef} from 'react';
import {Animated, Text, View} from 'react-native';
import {ScaledSheet} from 'react-native-size-matters';
import {APP_COLORS, TEXT_STYLES} from '../utils/designSystem';

const Toast = ({message, visible}: {message: string; visible: boolean}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const toastAnimate = () => {
    const reset = () => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
          delay: 4000,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
          delay: 4000,
        }),
      ]).start();
    };

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start((finished) => {
      finished && reset();
    });
    // Will change fadeAnim value to 1 in 5 seconds
  };

  useEffect(() => {
    if (visible) {
      toastAnimate();
    }
  }, [visible]);

  return (
    <Animated.View
      style={[
        styles.modalContainer,
        {
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [200, 0],
              }),
            },
          ],
          opacity: fadeAnim, // Bind opacity to animated value
        },
      ]}>
      <Text style={TEXT_STYLES.small}>{message}</Text>
    </Animated.View>
  );
};

export default Toast;

const styles = ScaledSheet.create({
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: APP_COLORS.Red,
    position: 'absolute',
    padding: '16@vs',
    zIndex: 100,
    flex: 1,
    borderRadius: 3,
    bottom: '56@vs',
  },
});
