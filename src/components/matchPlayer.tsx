import React from 'react';
import {View, Text} from 'react-native';
import {ScaledSheet, verticalScale} from 'react-native-size-matters';
import {TEXT_STYLES, APP_COLORS} from '../utils/designSystem';
import {IconButton} from './buttons';
import {MatchTextField} from './textField';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function MatchPlayer({
  expanded,
  username,
  motm,
  onExpand,
  onRemove,
  onMotm,
  goals,
  goalsError,
  onGoalsChange,
  assists,
  assistsError,
  onAssistsChange,
}: {
  expanded: boolean;
  username: string;
  motm: boolean;
  onExpand: () => void;
  onRemove: () => void;
  onMotm: () => void;
  goals: string;
  goalsError: boolean;
  onGoalsChange: (value: string) => void;
  assists: string;
  assistsError: boolean;
  onAssistsChange: (value: string) => void;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.collapsed}>
        <Text style={TEXT_STYLES.body}>{username}</Text>
        <View style={styles.itemActions}>
          <IconButton
            name="close-circle-outline"
            color={APP_COLORS.Gray}
            onPress={onRemove}
          />
          <IconButton
            name={
              expanded
                ? 'arrow-up-drop-circle-outline'
                : 'arrow-down-drop-circle-outline'
            }
            color={expanded ? APP_COLORS.Accent : APP_COLORS.Gray}
            onPress={onExpand}
          />
        </View>
      </View>
      {expanded && (
        <View style={styles.expanded}>
          <View style={styles.control}>
            <Text style={TEXT_STYLES.caption}>Goals</Text>
            <MatchTextField
              value={goals}
              error={goalsError}
              onChangeText={onGoalsChange}
            />
          </View>
          <View style={styles.control}>
            <Text style={TEXT_STYLES.caption}>Assists</Text>
            <MatchTextField
              value={assists}
              error={assistsError}
              onChangeText={onAssistsChange}
            />
          </View>
          <View style={styles.control}>
            <Text style={TEXT_STYLES.caption}>MOTM</Text>
            <View
              style={{
                height: verticalScale(40),
                justifyContent: 'center',
              }}>
              <Icon
                name={motm ? 'star' : 'star-outline'}
                size={verticalScale(32)}
                color={motm ? APP_COLORS.Accent : APP_COLORS.Light}
                onPress={onMotm}
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
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collapsed: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: '16@vs',
    flex: 1,
    paddingLeft: '12@vs',
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
