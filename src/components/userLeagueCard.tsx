import React from 'react';
import {Pressable, View, Text} from 'react-native';
import {verticalScale, ScaledSheet} from 'react-native-size-matters';
import {TEXT_STYLES, APP_COLORS} from '../utils/designSystem';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Badge} from './elements';

const UserLeagueCard = ({
  teamName,
  leagueName,
  onPress,
  conflictsCount,
}: {
  teamName: string;
  leagueName: string;
  onPress: () => void;
  conflictsCount: number;
}) => (
  <Pressable onPress={onPress}>
    <View style={[styles.card]}>
      {conflictsCount > 0 && <Badge number={conflictsCount} />}
      <View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
          }}>
          <Text
            style={[
              TEXT_STYLES.small,
              {
                color: APP_COLORS.Accent,
                lineHeight: verticalScale(16),
                fontWeight: 'bold',
              },
            ]}>
            {leagueName}
          </Text>
        </View>
        <Text style={TEXT_STYLES.small}>{teamName ? teamName : 'No Club'}</Text>
      </View>
    </View>
  </Pressable>
);

const styles = ScaledSheet.create({
  card: {
    backgroundColor: APP_COLORS.Secondary,
    padding: '12@vs',
    borderRadius: '2@vs',
    width: '142@vs',
    height: '64@vs',
    flexDirection: 'row',
    marginHorizontal: '4@vs',
    elevation: 2,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowRadius: 2,
    shadowOpacity: 0.2,
  },
  scrollContainer: {
    paddingHorizontal: '8@vs',
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    padding: '16@vs',
  },
  teamLogo: {
    width: '40@vs',
    height: '40@vs',
    marginRight: '8@vs',
  },
});

export default UserLeagueCard;
