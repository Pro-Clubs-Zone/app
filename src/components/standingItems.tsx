import React from 'react';
import {Text, View} from 'react-native';
import {APP_COLORS, TEXT_STYLES} from '../utils/designSystem';
import {verticalScale, ScaledSheet} from 'react-native-size-matters';
import {Trans} from '@lingui/macro';

//---------- Standings Table Row ----------//

export const TableRow = ({
  team = null,
  p = 0,
  w = 0,
  d = 0,
  l = 0,
  dif = 0,
  pts = 0,
  position = 1,
}) => (
  <View
    style={[
      styles.listBg,
      {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
      },
    ]}>
    <View
      style={{
        flexDirection: 'row',
        flex: 1,
      }}>
      <View
        style={{
          marginRight: verticalScale(8),
        }}>
        <Text style={TEXT_STYLES.small}>{position}.</Text>
      </View>
      <View>
        <Text style={TEXT_STYLES.small}>{team}</Text>
      </View>
    </View>
    <View style={styles.teamData}>
      <Text style={[TEXT_STYLES.small, styles.teamDataItem]}>{p}</Text>
      <Text style={[TEXT_STYLES.small, styles.teamDataItem]}>{w}</Text>
      <Text style={[TEXT_STYLES.small, styles.teamDataItem]}>{d}</Text>
      <Text style={[TEXT_STYLES.small, styles.teamDataItem]}>{l}</Text>
      <Text style={[TEXT_STYLES.small, styles.ptsDif]}>{dif}</Text>
      <Text
        style={[
          TEXT_STYLES.small,
          styles.ptsDif,
          {
            color: APP_COLORS.Accent,
          },
        ]}>
        {pts}
      </Text>
    </View>
  </View>
);

//---------- Standing Table Header ----------//

export const TableHeader = () => (
  <View
    style={[
      styles.listBg,
      {
        backgroundColor: APP_COLORS.Primary,
      },
    ]}>
    <View style={styles.tableContent}>
      <View
        style={{
          flexDirection: 'row',
          flex: 1,
        }}>
        <View
          style={{
            marginRight: verticalScale(8),
          }}>
          <Text style={TEXT_STYLES.caption}>#</Text>
        </View>
        <View>
          <Text style={TEXT_STYLES.caption}>
            <Trans>Team</Trans>
          </Text>
        </View>
      </View>
      <View style={styles.tableHeader}>
        <Text style={[TEXT_STYLES.caption, styles.teamDataItem]}>
          <Trans>PL</Trans>
        </Text>
        <Text style={[TEXT_STYLES.caption, styles.teamDataItem]}>
          <Trans>W</Trans>
        </Text>
        <Text style={[TEXT_STYLES.caption, styles.teamDataItem]}>
          <Trans>D</Trans>
        </Text>
        <Text style={[TEXT_STYLES.caption, styles.teamDataItem]}>
          <Trans>L</Trans>
        </Text>
        <Text style={[TEXT_STYLES.caption, styles.ptsDif]}>
          <Trans>GD</Trans>
        </Text>
        <Text
          style={[
            TEXT_STYLES.small,
            styles.ptsDif,
            {
              color: APP_COLORS.Accent,
            },
          ]}>
          <Trans>PTS</Trans>
        </Text>
      </View>
    </View>
  </View>
);

//---------- Stylesheet ----------//

const styles = ScaledSheet.create({
  listBg: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '16@vs',
    backgroundColor: APP_COLORS.Dark,
    height: '48@vs',
    alignItems: 'flex-start',
  },
  tableHeader: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
  },
  tableContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  teamData: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
  },
  teamDataItem: {
    textAlign: 'right',
    minWidth: '12@vs',
  },
  ptsDif: {
    minWidth: '26@vs',
    textAlign: 'right',
    fontWeight: 'bold',
  },
});
