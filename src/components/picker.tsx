import React from 'react';
import {APP_COLORS} from '../utils/designSystem';
import RNPickerSelect, {PickerSelectProps} from 'react-native-picker-select';
import {t} from '@lingui/macro';
import i18n from '../utils/i18n';
const Picker = ({children, ...props}: Readonly<PickerSelectProps>) => (
  <RNPickerSelect
    placeholder={{}}
    fixAndroidTouchableBug={true}
    doneText={i18n._(t`Select`)}
    modalProps={{animationType: 'fade'}}
    style={{
      modalViewTop: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
      modalViewBottom: {
        backgroundColor: APP_COLORS.Secondary,
      },
      modalViewMiddle: {
        backgroundColor: APP_COLORS.Secondary,
      },
      done: {
        color: APP_COLORS.Accent,
      },
    }}
    {...props}>
    {children}
  </RNPickerSelect>
);

export default Picker;
