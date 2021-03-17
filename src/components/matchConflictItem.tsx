import React from 'react';
import {View} from 'react-native';
import {APP_COLORS} from '../utils/designSystem';
import {MinButton} from './buttons';
import {ListHeading, OneLine} from './listItems';
import {ScaledSheet} from 'react-native-size-matters';
import {t} from '@lingui/macro';
import i18n from '../utils/i18n';

type Props = {
  player?: string;
  playerRating?: number;
  motm?: boolean;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  onPickResult: () => void;
  onShowProof: () => void;
  header: string;
  proofDisabled: boolean;
};

//---------- Conflict Item ----------//

const MatchConflictItem = (props: Props) => (
  <View
    style={[
      styles.conflictContainer,
      {
        //   marginBottom: props.marginBottom ? verticalScale(32) : 0,
      },
    ]}>
    <View>
      <ListHeading col1={props.header} />
      {/* {props.motm ? (
        <View pointerEvents="none">
          <OneLine title={props.player} key2={props.playerRating} />
        </View>
      ) : ( */}
      <OneLine
        //img={props.homeLogo ? props.homeLogo : defaultLogo}

        title={props.homeTeam}
        key1={props.homeScore}
      />
      <OneLine
        //img={props.awayLogo ? props.awayLogo : defaultLogo}
        title={props.awayTeam}
        key1={props.awayScore}
      />
      {/* )} */}
    </View>
    <View style={styles.conflictButtons}>
      <MinButton
        secondary
        onPress={props.onShowProof}
        title={
          props.proofDisabled ? i18n._(t`No Proof`) : i18n._(t`View Proof`)
        }
        disabled={props.proofDisabled}
      />
      <MinButton
        onPress={props.onPickResult}
        title={props.motm ? i18n._(t`Pick Player`) : i18n._(t`Pick Result`)} // To-Do: show success confrimation
      />
    </View>
  </View>
);

//---------- Stylesheet ----------//

const styles = ScaledSheet.create({
  conflictContainer: {
    //  marginTop: '16@vs',
    marginVertical: '8@vs',
    borderColor: APP_COLORS.Primary,
    borderWidth: 1,
  },
  conflictButtons: {
    height: '48@vs',
    borderTopWidth: 1,
    borderColor: APP_COLORS.Primary,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '8@vs',
    flexDirection: 'row',
  },
});

export default MatchConflictItem;
