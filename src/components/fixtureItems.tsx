import React from 'react';
import {Text, View, Pressable} from 'react-native';
import {APP_COLORS, TEXT_STYLES} from '../utils/designSystem';
import {verticalScale, ScaledSheet} from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = {
  matchId: number;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamScore?: number | '-';
  awayTeamScore?: number | '-';
  conflict: boolean;
  hasSubmission: boolean;
  onPress: () => void;
};

const FixtureItem = ({
  matchId,
  homeTeamName,
  awayTeamName,
  homeTeamScore = '-',
  awayTeamScore = '-',
  conflict,
  hasSubmission,
  onPress,
}: Props) => (
  <Pressable onPress={onPress}>
    <View style={styles.fixture}>
      <View style={styles.id}>
        <Text numberOfLines={1} style={TEXT_STYLES.small}>
          {matchId}
        </Text>
      </View>
      <View style={styles.teams}>
        <View style={styles.teamCol}>
          <Text style={TEXT_STYLES.body}>{homeTeamName}</Text>
          <Text style={TEXT_STYLES.body}>{awayTeamName}</Text>
        </View>
        {conflict || hasSubmission ? (
          <View style={styles.status}>
            {conflict && (
              <Icon
                name="alert"
                size={verticalScale(24)}
                color={APP_COLORS.Red}
              />
            )}
            {hasSubmission && (
              <Icon
                name="account-check"
                size={verticalScale(24)}
                color={APP_COLORS.Accent}
              />
            )}
          </View>
        ) : (
          <View style={styles.resultCol}>
            <Text
              style={[
                TEXT_STYLES.body,
                {
                  textAlign: 'right',
                  color: APP_COLORS.Accent,
                  fontWeight: 'bold',
                },
              ]}>
              {homeTeamScore}
            </Text>
            <Text
              style={[
                TEXT_STYLES.body,
                {
                  textAlign: 'right',
                  color: APP_COLORS.Accent,
                  fontWeight: 'bold',
                },
              ]}>
              {awayTeamScore}
            </Text>
          </View>
        )}
      </View>
    </View>
  </Pressable>
);

//---------- Stylesheet ----------//

const styles = ScaledSheet.create({
  fixture: {
    paddingRight: '16@vs',
    backgroundColor: APP_COLORS.Dark,
    flexDirection: 'row',
    height: '64@vs',
    alignItems: 'center',
  },
  teamCol: {
    flex: 1,
    justifyContent: 'space-between',
  },
  resultCol: {
    flex: 1,
    justifyContent: 'space-between',
  },
  id: {
    borderRightWidth: 1,
    borderColor: APP_COLORS.Primary,
    marginRight: '16@vs',
    width: '40@vs',
    height: '48@vs',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: '8@vs',
    marginLeft: '8@vs',
    maxWidth: '56@vs',
    //   overflow: 'hidden',
  },

  status: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  teams: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: '100%',
    paddingVertical: verticalScale(8),
  },
});

export default FixtureItem;
