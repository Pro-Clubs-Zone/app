import React from 'react';
import {APP_COLORS} from '../utils/designSystem';
import RNPickerSelect, {PickerSelectProps} from 'react-native-picker-select';

const Picker = ({children, ...props}: Readonly<PickerSelectProps>) => (
  <RNPickerSelect
    placeholder={{}}
    doneText="Select"
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
