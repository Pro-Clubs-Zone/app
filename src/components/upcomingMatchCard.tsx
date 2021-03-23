import React from 'react';
import {Pressable, View, Text} from 'react-native';
import {verticalScale, ScaledSheet} from 'react-native-size-matters';
import {TEXT_STYLES, APP_COLORS} from '../utils/designSystem';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const UpcomingMatchCard = ({
  rivalName,
  clubName,
  leagueName,
  onPress,
  submitted,
  conflict,
  published,
}: {
  rivalName: string;
  clubName: string;
  leagueName: string;
  onPress: () => void;
  submitted: boolean;
  conflict: boolean;
  published: boolean;
}) => (
  <Pressable onPress={onPress}>
    <View
      style={[
        styles.card,
        published
          ? styles.published
          : submitted
          ? conflict
            ? styles.conflict
            : styles.submitted
          : null,
      ]}>
      {submitted && (
        <View
          style={[
            styles.submittedCheck,
            {
              backgroundColor: published
                ? APP_COLORS.Green
                : submitted
                ? conflict
                  ? APP_COLORS.Red
                  : APP_COLORS.Accent
                : null,
            },
          ]}>
          <Icon
            name={conflict ? 'exclamation' : 'check'}
            size={verticalScale(12)}
            color="white"
          />
        </View>
      )}
      {/* <Image
        source={logo ? {uri: logo} : defaultLogo}
        style={styles.teamLogo}
      /> */}
      <View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            paddingBottom: verticalScale(4),
          }}>
          <Text style={TEXT_STYLES.small}>{clubName.slice(0, 7)}</Text>
          <Text style={TEXT_STYLES.small}> vs. </Text>
          <Text
            style={[
              TEXT_STYLES.small,
              {
                color: APP_COLORS.Accent,
                lineHeight: verticalScale(16),
                fontWeight: 'bold',
              },
            ]}>
            {rivalName.slice(0, 7)}
          </Text>
        </View>
        <Text style={TEXT_STYLES.small}>{leagueName}</Text>
      </View>
    </View>
  </Pressable>
);

const styles = ScaledSheet.create({
  card: {
    backgroundColor: APP_COLORS.Secondary,
    overflow: 'hidden',
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
  submitted: {
    borderWidth: 1,
    borderColor: APP_COLORS.Accent,
  },
  conflict: {
    borderWidth: 1,
    borderColor: APP_COLORS.Red,
  },
  published: {
    borderWidth: 1,
    borderColor: APP_COLORS.Green,
  },
  submittedCheck: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: '16@vs',
    height: '16@vs',
    borderTopLeftRadius: '16@vs',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default UpcomingMatchCard;
