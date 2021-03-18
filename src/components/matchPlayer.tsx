import React from 'react';
import {View, Text} from 'react-native';
import {ScaledSheet, verticalScale} from 'react-native-size-matters';
import {TEXT_STYLES, APP_COLORS} from '../utils/designSystem';
import {IconButton} from './buttons';
import {MatchTextField} from './textField';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function MatchPlayer({expanded = true}) {
  return (
    <View style={styles.container}>
      <View style={styles.username}>
        <Text style={TEXT_STYLES.body}>Username</Text>
        <IconButton
          name="arrow-down-drop-circle-outline"
          color={APP_COLORS.Gray}
        />
      </View>
      {expanded && (
        <View style={styles.expanded}>
          <View style={styles.control}>
            <Text style={TEXT_STYLES.caption}>Goals</Text>
            <MatchTextField />
          </View>
          <View style={styles.control}>
            <Text style={TEXT_STYLES.caption}>Assists</Text>
            <MatchTextField />
          </View>
          <View style={styles.control}>
            <Text style={TEXT_STYLES.caption}>MOTM</Text>
            <View
              style={{
                height: verticalScale(40),
                justifyContent: 'center',
              }}>
              <Icon
                name="star"
                size={verticalScale(32)}
                color={APP_COLORS.Accent}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

//---------- Stylesheet ----------//

const styles = ScaledSheet.create({
  container: {
    borderRadius: 3,
    backgroundColor: APP_COLORS.Primary,
    justifyContent: 'flex-start',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowRadius: 3,
    shadowOpacity: 0.2,
    marginBottom: '8@vs',
  },
  username: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: '12@vs',
    paddingVertical: '16@vs',
    flex: 1,
  },
  expanded: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: APP_COLORS.Secondary,
    padding: '8@vs',
    flex: 1,
  },
  control: {
    flexDirection: 'column',
    alignItems: 'center',
    height: '64@vs',
    justifyContent: 'space-around',
  },
});
