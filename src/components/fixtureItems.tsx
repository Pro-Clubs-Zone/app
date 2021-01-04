import React from 'react';
import {Text, View, Pressable} from 'react-native';
import {APP_COLORS, TEXT_STYLES} from '../utils/designSystem';
import {verticalScale, ScaledSheet} from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = {
  homeTeamName: string;
  awayTeamName: string;
  homeTeamScore?: number | '-';
  awayTeamScore?: number | '-';
  conflict: boolean;
  onPress: () => void;
};

const FixtureItem = ({
  homeTeamName,
  awayTeamName,
  homeTeamScore = '-',
  awayTeamScore = '-',
  conflict,
  onPress,
}: Props) => (
  <Pressable onPress={onPress}>
    <View style={styles.fixture}>
      <View
        style={[
          styles.status,
          {
            borderRightColor: conflict ? APP_COLORS.Red : APP_COLORS.Primary,
          },
        ]}>
        {conflict && (
          <Icon name="alert" size={verticalScale(20)} color={APP_COLORS.Red} />
        )}
      </View>
      <View style={styles.teams}>
        <View style={styles.teamRow}>
          <Text style={TEXT_STYLES.body}>{homeTeamName}</Text>
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
        </View>
        <View style={styles.teamRow}>
          <Text style={TEXT_STYLES.body}>{awayTeamName}</Text>
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
  teamRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  status: {
    borderRightWidth: 8,
    marginRight: '16@vs',
    //  width: '96@vs',
    height: '48@vs',
    flexDirection: 'row',
    alignItems: 'center',
    // paddingLeft: '8@vs',
    //   overflow: 'hidden',
  },
  dateTime: {
    marginLeft: '8@vs',
    maxWidth: '56@vs',
  },
  teams: {
    flex: 1,
    justifyContent: 'space-around',
    paddingVertical: '8@vs',
  },
});

export default FixtureItem;
