import React from 'react';
import {View} from 'react-native';
import {APP_COLORS} from '../utils/designSystem';
import {MinButton} from './buttons';
import {ListHeading, OneLine} from './listItems';
import {ScaledSheet} from 'react-native-size-matters';
import {t} from '@lingui/macro';
import i18n from '../utils/i18n';

type Props = {
  motm?: string;
  resultConflict: boolean;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  onPickResult: () => void;
  onShowProof: () => void;
  header: string;
  proofDisabled: boolean;
  motmConflict: boolean;
};

//---------- Conflict Item ----------//

const MatchConflictItem = (props: Props) => (
  <View style={styles.conflictContainer}>
    <View>
      <ListHeading col1={props.header} />
      {props.resultConflict && (
        <>
          <OneLine title={props.homeTeam} key1={props.homeScore} />
          <OneLine title={props.awayTeam} key1={props.awayScore} />
        </>
      )}
      {props.motmConflict && (
        <OneLine title={i18n._(t`MOTM`)} rightIcon="check" />
      )}
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
      <MinButton onPress={props.onPickResult} title={i18n._(t`Pick Result`)} />
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
